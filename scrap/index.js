const scrapUtil = require('./scrapUtils');
const sqliteUtils = require('./sqliteUtils');
const utils = require('../shared/utils');
const logUtils = require("../shared/logUtils");

const scrapAndInsert = async (tokenID) => {

    let ownerAddress = await scrapUtil.getOwnerOfToken(tokenID);
    let data = await scrapUtil.getTokenData(tokenID);
    let materials1Count = data.materials[0].balance;
    let goldCount = data.gold.balance;
    let goldClaimableCount = data.gold.claimable;
    /*
    let materials1Count = await scrapUtil.getTokenMaterial1Count(tokenID);
    let goldCount = await scrapUtil.getTokenGoldCount(tokenID);
    let goldClaimableCount = 0;
    try {
        goldClaimableCount = await scrapUtil.getTokenGoldClaimableCount(tokenID);
    } catch (e) {
    }
     */
    sqliteUtils.insertAddress(ownerAddress);
    sqliteUtils.insertToken(tokenID, ownerAddress, materials1Count, goldCount, goldClaimableCount);
}

const scrapData = async (start = 0) => {
    let startDate = new Date();
    let maxId = await scrapUtil.getNextTokenId();
    let tokenID = start;
    let tokenToScrap = [];
    while (tokenID < maxId){
        //await scrapAndInsert(tokenID);
        tokenToScrap.push(tokenID);
        if (tokenID%50 === 0 && tokenID > 0) {
            let data = await scrapUtil.getTokensData(tokenToScrap);
            for (let tokenIndex in tokenToScrap){
                let ownerAddress = await scrapUtil.getOwnerOfToken(tokenToScrap[tokenIndex]);
                sqliteUtils.insertAddress(ownerAddress);
                let materials1Count = data[tokenIndex].materials[0].balance;
                let goldCount = data[tokenIndex].gold.balance;
                let goldClaimableCount = data[tokenIndex].gold.claimable;
                sqliteUtils.insertToken(tokenToScrap[tokenIndex], ownerAddress, materials1Count, goldCount, goldClaimableCount);
            }
            tokenToScrap = [];
        }
        if (tokenID%500 === 0){
            writePercentage(tokenID, maxId, start, startDate);
        }
        tokenID++;
    }
    let data = await scrapUtil.getTokensData(tokenToScrap);
    for (let tokenIndex in tokenToScrap){
        let ownerAddress = await scrapUtil.getOwnerOfToken(tokenToScrap[tokenIndex]);
        sqliteUtils.insertAddress(ownerAddress);
        let materials1Count = data[tokenIndex].materials[0].balance;
        let goldCount = data[tokenIndex].gold.balance;
        let goldClaimableCount = data[tokenIndex].gold.claimable;
        sqliteUtils.insertToken(tokenToScrap[tokenIndex], ownerAddress, materials1Count, goldCount, goldClaimableCount);
    }
    logUtils.log("Scrap finished");
}

const scrapDataFromList = async (tokenList)=> {
    let startDate = new Date();
    let i = 0;
    let total = tokenList.length;
    let lastId = i;
    let request = 0;
    let interval = setInterval(() => {
        request = ((i-lastId)).toFixed(0);
        lastId = i;
    }, 1000);
    let tokenToScrap = [];
    for (let tokenID of tokenList){
        tokenToScrap.push(tokenID);
        //await scrapAndInsert(tokenID);
        if (i%50 === 0 && i > 0){
            let data = await scrapUtil.getTokensData(tokenToScrap);
            for (let tokenIndex in tokenToScrap){
                let ownerAddress = await scrapUtil.getOwnerOfToken(tokenToScrap[tokenIndex]);
                sqliteUtils.insertAddress(ownerAddress);
                let materials1Count = data[tokenIndex].materials[0].balance;
                let goldCount = data[tokenIndex].gold.balance;
                let goldClaimableCount = data[tokenIndex].gold.claimable;
                sqliteUtils.insertToken(tokenToScrap[tokenIndex], ownerAddress, materials1Count, goldCount, goldClaimableCount);
            }
            tokenToScrap = [];
            writePercentage(i, total, 0, startDate);
        }
        i++;
    }
    let data = await scrapUtil.getTokensData(tokenToScrap);
    for (let tokenIndex in tokenToScrap){
        let ownerAddress = await scrapUtil.getOwnerOfToken(tokenToScrap[tokenIndex]);
        sqliteUtils.insertAddress(ownerAddress);
        let materials1Count = data[tokenIndex].materials[0].balance;
        let goldCount = data[tokenIndex].gold.balance;
        let goldClaimableCount = data[tokenIndex].gold.claimable;
        sqliteUtils.insertToken(tokenToScrap[tokenIndex], ownerAddress, materials1Count, goldCount, goldClaimableCount);
    }
    clearInterval(interval);
    logUtils.log("Scrap finished");
}

const scrapDataFromAddress = async (address) => {
    logUtils.log(`Start update token of ${address}`);
    let rawTokenList = sqliteUtils.getTokenListFromAddress(address);
    let tokenList = [];
    for (let token of rawTokenList){
        tokenList.push(token.token);
    }
    await scrapDataFromList(tokenList);
}

const writePercentage = (current, max, start, startDate) => {
    let percentage = (current/max*100).toFixed(2);
    let diff = current - start;
    let maxDiff = max - start;
    let diffTime = Math.floor(((new Date()).getTime() - startDate.getTime())/1000);
    let perSecond = Math.floor(diff/diffTime);
    let res = (diffTime/diff*maxDiff) - diffTime;
    let eta = utils.secsToText(res);
    let sec = Math.floor(res - (eta[0] * 60 * 60) - (eta[1]*60));
    logUtils.log(`progress => ${percentage}% (${current}/${max}) ~${perSecond}/s eta => ${eta[0]}h${eta[1]}m${sec}`);
}

module.exports = {
    scrapData,
    scrapDataFromAddress
};