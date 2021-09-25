const logUtils = require("../shared/logUtils");
const dataUtils = require('../data');
const utils = require("./utils");
const {contractAddresses} = require("./contractAddresses");

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

const sliceDataTo32Bytes = (data, index = 0) => {
    return '0x'+data.slice(2+64*index, 2+64*(index+1));
}

const getContractFunctionHashList = () => {
    let contracts = [[contractAddresses.manifestABI,contractAddresses.rarityManifested],
        [contractAddresses.attributesABI,contractAddresses.rarityAttributes],
        [contractAddresses.goldABI,contractAddresses.rarityGold],
        [contractAddresses.materials1ABI,contractAddresses.rarityMaterials1],
        [contractAddresses.crafting1ABI,contractAddresses.rarityCrafting1],
        [contractAddresses.classSkillsABI,contractAddresses.rarityClassSkills],
        [contractAddresses.nameABI,contractAddresses.rarityName],
        [contractAddresses.rarABI,contractAddresses.rarityRAR],
    ];
    let contractFunctionList = []

    for (let contract of contracts){
        let contractInstance = new utils.web3.eth.Contract(contractAddresses.manifestABI, contractAddresses.rarityManifested);
        let entries = Object.entries(contractInstance.methods);
        let i = 0;
        while (i < entries.length){
            if (entries[i][0].substring(0,2) === "0x"){
                contractFunctionList[entries[i][0]] = entries[i-1][0];
            }
            i++;
        }
    }

    return contractFunctionList;
}

const extractTokenIdFromSummon = (txReceipt) => {
    let tokenHex = sliceDataTo32Bytes(txReceipt.logs[1].data, 1);
    return parseInt(tokenHex, 16);
}

module.exports = {
    waitForTx,
    getContractFunctionHashList
}