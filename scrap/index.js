const scrapUtil = require('./scrapUtils');
const sqliteUtils = require('./sqliteUtils');
const utils = require('../shared/utils');

const scrapData = async () => {
    let maxId = await scrapUtil.getNextTokenId();
    let tokenID = 0;
    let request = 0;
    let lastId = tokenID;
    setTimeout(() => {
        request = ((tokenID-lastId)/10).toFixed(0);
        lastId = tokenID;
    }, 10000);
    while (tokenID < maxId){
        let ownerAddress = await scrapUtil.getOwnerOfToken(tokenID);
        sqliteUtils.insertAddress(ownerAddress);
        sqliteUtils.insertToken(tokenID, ownerAddress);
        if (tokenID%1000 === 0){
            writePercentage(tokenID, maxId, request);
        }
        tokenID++;
    }
}

const writePercentage = (current, max, request) => {
    let percentage = (current/max*100).toFixed(2);
    let eta = utils.secsToText((max-current)/request);

    console.log(`progress => ${percentage}% (${current}/${max}) ~${request}/s eta => ${eta[0]}h${eta[1]}m`);

}

module.exports = { scrapData };