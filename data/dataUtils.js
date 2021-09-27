const utils = require('../shared/utils');

const dateToIsoDateTime = (date) =>{
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

const extractTokenIdFromSummon = (txReceipt) => {
    let tokenHex = utils.sliceDataTo32Bytes(txReceipt.logs[1].data, 1);
    return parseInt(tokenHex, 16);
}


module.exports = {
    dateToIsoDateTime,
    extractTokenIdFromSummon
}