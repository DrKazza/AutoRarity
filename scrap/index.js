const scrapUtil = require('./scrapUtils');
const sqliteUtils = require('./sqliteUtils');
const utils = require('../shared/utils');
const constVal = require('../shared/const');

const scrapAndInsert = async (tokenID) => {

    let ownerAddress = await scrapUtil.getOwnerOfToken(tokenID);
    let materials1Count = await scrapUtil.getTokenMaterial1Count(tokenID);
    let goldCount = await scrapUtil.getTokenGoldCount(tokenID);
    let goldClaimableCount = 0;
    try {
        goldClaimableCount = await scrapUtil.getTokenGoldClaimableCount(tokenID);
    } catch (e) {
    }
    sqliteUtils.insertAddress(ownerAddress);
    sqliteUtils.insertToken(tokenID, ownerAddress, materials1Count, goldCount, goldClaimableCount);


}

const scrapData = async (start = 0) => {
    let maxId = await scrapUtil.getNextTokenId();
    let tokenID = start;
    let request = 0;
    let lastId = tokenID;
    let interval = setInterval(() => {
        request = ((tokenID-lastId)/10).toFixed(0);
        lastId = tokenID;
    }, 10000);
    while (tokenID < maxId){
        await scrapAndInsert(tokenID);
        if (tokenID%1000 === 0){
            writePercentage(tokenID, maxId, request);
        }
        tokenID++;
    }
    clearInterval(interval);
    utils.log("Scrap finished");
}

const scrapDataFromList = async (tokenList)=> {
    let i = 0;
    let total = tokenList.length;
    let lastId = i;
    let request = 0;
    let interval = setInterval(() => {
        request = ((i-lastId)/10).toFixed(0);
        lastId = i;
    }, 10000);
    for (let tokenID of tokenList){
        await scrapAndInsert(tokenID);
        if (i%50 === 0){
            writePercentage(i, total, request);
        }
        i++;
    }
    clearInterval(interval);
    utils.log("Scrap finished");
}

const scrapDataFromAddress = async (address) => {
    utils.log(`Start update token of ${address}`);
    let rawTokenList = sqliteUtils.getTokenListFromAddress(address);
    let tokenList = [];
    for (let token of rawTokenList){
        tokenList.push(token.token);
    }
    await scrapDataFromList(tokenList);
}

const writePercentage = (current, max, request) => {
    let percentage = (current/max*100).toFixed(2);
    let eta = utils.secsToText((max-current)/request);

    utils.log(`progress => ${percentage}% (${current}/${max}) ~${request}/s eta => ${eta[0]}h${eta[1]}m`);

}

module.exports = {
    scrapData,
    scrapDataFromAddress
};