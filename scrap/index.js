const scrapUtil = require('./scrapUtils');
const jsonUtil = require('./JsonUtils');
const utils = require('../shared/utils');
const Account = require('./classes/account');
const Token = require("./classes/token");

const scrapData = async () => {
    let maxId = await scrapUtil.getNextTokenId();
    let tokenID = 0;
    let data = {
        accounts : []
    };
    let currentAccount;
    let request = 0;
    let lastId = tokenID;
    setTimeout(() => {
        request = ((tokenID-lastId)/10).toFixed(0);
        lastId = tokenID;
    }, 10000);
    while (tokenID < maxId){
        let ownerAddress = await scrapUtil.getOwnerOfToken(tokenID);
        currentAccount = data.accounts.find((value) => {return value.address === ownerAddress;});
        if (typeof currentAccount === 'undefined'){
            currentAccount = new Account(ownerAddress);
            data.accounts.push(currentAccount);
        }
        currentAccount.tokens.push(new Token(tokenID));
        if (tokenID%1000 === 0){
            jsonUtil.writeToFile(data);
            writePercentage(tokenID, maxId, request);
        }
        tokenID++;
    }
    jsonUtil.writeToFile(data);

}

const writePercentage = (current, max, request) => {
    let percentage = (current/max*100).toFixed(2);
    let eta = utils.secsToText((max-current)/request);

    console.log(`progress => ${percentage}% (${current}/${max}) ~${request}/s eta => ${eta[0]}h${eta[1]}m`);

}

module.exports = { scrapData };