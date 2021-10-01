const scrapUtil = require('./scrapUtils');
const sqliteUtils = require('./sqliteUtils');
const utils = require('../shared/utils');
const logUtils = require("../shared/logUtils");

const scrapData = async (start = 0) => {
    let startDate = new Date();
    logUtils.log(`Start Scrap => ${startDate}`);
    let maxId = await scrapUtil.getNextTokenId();
    let tokenID = start;
    let tokenToScrap = [];
    while (tokenID < maxId){
        tokenToScrap.push(tokenID);
        if (tokenID%50 === 0 && tokenID > 0) {
            await getDataAndInsert(tokenToScrap);
            tokenToScrap = [];
        }
        if (tokenID%500 === 0){
            writePercentage(tokenID, maxId, start, startDate);
        }
        tokenID++;
    }
    await getDataAndInsert(tokenToScrap);
    logUtils.log(`Scrap finished => ${new Date()}`);
}

const scrapDataFromList = async (tokenList)=> {
    let startDate = new Date();
    logUtils.log(`Start Scrap => ${startDate}`);
    let i = 0;
    let total = tokenList.length;
    let tokenToScrap = [];
    for (let tokenID of tokenList){
        tokenToScrap.push(tokenID);
        if (i%50 === 0 && i > 0){
            await getDataAndInsert(tokenToScrap);
            tokenToScrap = [];
            writePercentage(i, total, 0, startDate);
        }
        i++;
    }
    await getDataAndInsert(tokenToScrap);
    logUtils.log(`Scrap finished => ${new Date()}`);
}

const getDataAndInsert = async (tokenToScrap) => {
    let data = await scrapUtil.getTokensData(tokenToScrap);
    for (let tokenIndex in tokenToScrap){
        let ownerAddress = await scrapUtil.getOwnerOfToken(tokenToScrap[tokenIndex]);
        sqliteUtils.insertAddress(ownerAddress);
        let materials1Count = data[tokenIndex].materials[0].balance;
        let goldCount = data[tokenIndex].gold.balance;
        let goldClaimableCount = data[tokenIndex].gold.claimable;
        let level = data[tokenIndex].base.level;
        let classType = data[tokenIndex].base.class;
        sqliteUtils.insertToken(tokenToScrap[tokenIndex], ownerAddress, materials1Count, goldCount, goldClaimableCount, level, classType);
    }
}

const scrapDataFromAddress = async (address) => {
    logUtils.log(`Start update token of ${address}`);
    let rawTokenList = sqliteUtils.getTokenListFromAddress(address);
    let tokenList = [];
    for (let token of rawTokenList){
        tokenList.push(token.id);
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