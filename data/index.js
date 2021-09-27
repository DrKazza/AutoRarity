const constVal = require('../shared/const');
const utils = require('../shared/utils');
const dataUtils = require('./dataUtils');
const logUtils = require("../shared/logUtils");


const filename = `summoners${utils.slugify(constVal.envFile.replace(/^.*[\\\/]/, ''))}.db`;
const sqlitePath = `./data/${filename}`;
const db = require('better-sqlite3')(sqlitePath, []);

const initDb = () => {
    db.exec("CREATE TABLE IF NOT EXISTS `token` ( `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY, `next_available` DATETIME NULL);");
    db.exec("CREATE TABLE IF NOT EXISTS `token_tx` ( `hash` VARCHAR(255) NOT NULL PRIMARY KEY, `token` BIGINT UNSIGNED NOT NULL , `fees` DOUBLE NOT NULL , `type` VARCHAR(255) NOT NULL, `status` BOOLEAN NOT NULL, `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);");
}

const insertTokenTx = (tokenID, hash, fees, type, status, createdAt = undefined) => {
    initDb();
    if (typeof createdAt !== 'undefined'){
        let createdAtDateTime = dataUtils.dateToIsoDateTime(createdAt);
        db.exec(`INSERT INTO token_tx (hash, token, fees, type, status, created_at) VALUES ('${hash}', ${tokenID}, ${fees}, '${type}', ${status}, '${createdAtDateTime}') ON CONFLICT DO NOTHING;`);

    } else {

        db.exec(`INSERT INTO token_tx (hash, token, fees, type, status) VALUES ('${hash}', ${tokenID}, ${fees}, '${type}', ${status}) ON CONFLICT DO NOTHING;`);
    }
}

const insertToken = (tokenID) => {
    initDb();
    db.exec(`INSERT INTO token (id) VALUES (${tokenID}) ON CONFLICT DO NOTHING;`);
}

const updateToken = (tokenID, nextAvailable) => {
    initDb();
    let nextAvailableDateTime = dataUtils.dateToIsoDateTime(nextAvailable);
    db.exec(`UPDATE token SET next_available='${nextAvailableDateTime}' WHERE id = ${tokenID} AND (next_available > '${nextAvailableDateTime}' OR next_available IS NULL);`);
}

const getAllToken = () =>{
    initDb();
    let res = db.prepare(`SELECT id from token;`).all();
    let tokenList = []
    for (let data of res){
        tokenList.push(data.id);
    }
    return tokenList;
}

const getAvailableToken = () => {
    initDb();
    for (let token of constVal.myTokenIds){
        insertToken(token);
    }
    let res = db.prepare(`SELECT id from token where next_available <= CURRENT_TIMESTAMP OR next_available IS NULL;`).all();
    let tokenList = []
    for (let data of res){
        tokenList.push(data.id);
    }
    return tokenList;
}

const getTotalFeesForToken = (tokenID) => {
    initDb();
    return db.prepare(`SELECT SUM(fees) as 'fees', count(hash) as 'tx' from token_tx WHERE token = ${tokenID};`).get();
}

const getTotalFees = () => {
    initDb();
    return db.prepare(`SELECT SUM(fees) as 'fees', COUNT(DISTINCT(t.id)) as 'tokens', count(tt.hash) as 'tx' from token_tx tt INNER JOIN token t ON tt.token = t.id`).get();
}

const getNextAvailableTime = () => {
    initDb();
    let res = db.prepare(`SELECT next_available from token WHERE next_available > CURRENT_TIMESTAMP ORDER BY next_available ASC LIMIT 1`).get();
    if (typeof res.next_available !== 'string'){
        return constVal.minimumDelay;
    }
    let date = (new Date(res.next_available + ' GMT'));
    return date.getTime() - Date.now();
}

const updateAccountTransaction = async (startBlockNumber, endBlockNumber) =>  {
    let eth = utils.web3.eth;
    if (endBlockNumber == null) {
        endBlockNumber = await eth.getBlockNumber();
        console.log("Using endBlockNumber: " + endBlockNumber);
    }
    if (startBlockNumber == null) {
        startBlockNumber = endBlockNumber - 1000;
        console.log("Using startBlockNumber: " + startBlockNumber);
    }
    let myAccount = constVal.walletAddress.toLowerCase();
    console.log(`Searching for transactions to/from account "${myAccount}" within blocks ${startBlockNumber} and ${endBlockNumber}`);
    let dateStart = Date.now();
    let functionList = utils.getContractFunctionHashList();
    for (let i = startBlockNumber; i <= endBlockNumber; i++) {
        if (i%500 === 0) {
            writePercentage(i, endBlockNumber, startBlockNumber, dateStart);
        }
        let block = await eth.getBlock(i, true);
        if (block != null && block.transactions != null) {
            for (let tx of block.transactions ){
                if (tx.from !== null && myAccount === tx.from.toLowerCase()){
                    let method = tx.input.substring(0,10);
                    let summoner;
                    let methodName = functionList[method];
                    if (typeof methodName === 'undefined'){
                        continue;
                    }
                    let receipt = null;
                    let actual_cost = null;
                    switch (methodName){
                        case "summon":
                            receipt = await eth.getTransactionReceipt(tx.hash);
                            summoner = dataUtils.extractTokenIdFromSummon(receipt);
                            actual_cost = (receipt.gasUsed * (tx.gasPrice / 10**18));
                            break;
                        case 'claim':
                        case 'xp':
                        case 'transfer':
                        case 'adventure':
                        case 'level_up':
                        case 'point_buy':
                            //remove the method id from input
                            let input = `0x${tx.input.substring(10,tx.input.length)}`;
                            // extract the first param
                            let dat = utils.sliceDataTo32Bytes(input, 0);
                            summoner = parseInt(dat, 16);
                            receipt = await eth.getTransactionReceipt(tx.hash);
                            actual_cost = (receipt.gasUsed * (tx.gasPrice / 10**18));
                            break;
                        default:
                            console.log(`${methodName} => ${tx.hash}`);
                    }
                    if (summoner !== null && actual_cost !== null){
                        insertTokenTx(summoner, tx.hash, actual_cost.toFixed(18), methodName, receipt.status, new Date(block.timestamp*1000));
                        console.log(`insert/update ${actual_cost.toFixed(5)} FTM ${methodName} => ${summoner} => ${tx.hash}`);
                    }
                }
            }
            /*
            block.transactions.forEach( function(e) {
                if (myaccount == e.from || myaccount == e.to) {
                    console.log("  tx hash          : " + e.hash + "\n"
                        + "   nonce           : " + e.nonce + "\n"
                        + "   blockHash       : " + e.blockHash + "\n"
                        + "   blockNumber     : " + e.blockNumber + "\n"
                        + "   transactionIndex: " + e.transactionIndex + "\n"
                        + "   from            : " + e.from + "\n"
                        + "   to              : " + e.to + "\n"
                        + "   value           : " + e.value + "\n"
                        + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
                        + "   gasPrice        : " + e.gasPrice + "\n"
                        + "   gas             : " + e.gas + "\n"
                        + "   input           : " + e.input);
                }
            })
             */
        }
    }
}

const writePercentage = (current, max, start, startDate) => {
    let percentage = (current/max*100).toFixed(2);
    let diff = current - start;
    let maxDiff = max - start;
    let diffTime = Math.floor(((new Date()).getTime() - startDate)/1000);
    let perSecond = Math.floor(diff/diffTime);
    let res = (diffTime/diff*maxDiff) - diffTime;
    let eta = utils.secsToText(res);
    let sec = Math.floor(res - (eta[0] * 60 * 60) - (eta[1]*60));
    logUtils.log(`progress => ${percentage}% (${current}/${max}) ~${perSecond}/s eta => ${eta[0]}h${eta[1]}m${sec}`);
}

module.exports = {
    insertTokenTx,
    insertToken,
    updateToken,
    getAllToken,
    getAvailableToken,
    getTotalFeesForToken,
    getTotalFees,
    getNextAvailableTime,
    updateAccountTransaction
}