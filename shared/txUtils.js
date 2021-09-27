const logUtils = require("../shared/logUtils");
const dataUtils = require('../data');
const utils = require("./utils");

const waitForTx = async (tokenID, approveResponse, type) => {
    let transactionReceipt = await approveResponse.wait();
    let actual_cost = (transactionReceipt.gasUsed * (approveResponse.gasPrice / 10**18));
    if (transactionReceipt.status === 1){
        logUtils.log(`${tokenID} => Tx success, actual cost ${actual_cost.toFixed(5)} FTM, id: ${approveResponse.hash}`);
    } else {
        logUtils.log(`${tokenID} => Tx failed, id: ${approveResponse.hash}`);
    }

    switch (type) {
        case 'transfer gold':
        case 'transfer rar':
        case 'transfer materials1':
            const regex = /^[^\s>]+/;
            let m;
            if ((m = regex.exec(tokenID)) !== null) {
                dataUtils.insertTokenTx(m[0], approveResponse.hash, actual_cost.toFixed(18), type, transactionReceipt.status);
            }
            break;
        case 'summon':
            if (transactionReceipt.status === 1){
                tokenID = extractTokenIdFromSummon(transactionReceipt);
                dataUtils.insertToken(tokenID);
                dataUtils.insertTokenTx(tokenID, approveResponse.hash, actual_cost.toFixed(18), type, transactionReceipt.status);
            }
            break;
        default:
            dataUtils.insertTokenTx(tokenID, approveResponse.hash, actual_cost.toFixed(18), type, transactionReceipt.status);
    }

    return transactionReceipt;
}

const extractTokenIdFromSummon = (txReceipt) => {
    let tokenHex = utils.sliceDataTo32Bytes(txReceipt.logs[1].data, 1);
    return parseInt(tokenHex, 16);
}

module.exports = {
    waitForTx,
}