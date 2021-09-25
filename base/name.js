const constVal = require("../shared/const");
const utils = require('../shared/utils');
const logUtils = require("../shared/logUtils");
const fileUtils = require('../shared/fileUtils');
const {contractAddresses} = require('../shared/contractAddresses');
const ethers = require("ethers");
const txUtils = require("../shared/txUtils");

const abi = contractAddresses.nameABI;
const address = contractAddresses.rarityName;

let contractRead;
let contractWrite;

const isAvailable = async (name) => {
    if (typeof contractRead === 'undefined') {
        contractRead = new utils.web3.eth.Contract(abi, address);
    }
    return await contractRead.methods.is_name_claimed(name).call();
}

const get = async (tokenID) => {
    if (typeof contractRead === 'undefined') {
        contractRead = new utils.web3.eth.Contract(abi, address);
    }
    return await contractRead.methods.summoner_name(tokenID).call();
}

const validate = async (name) => {
    if (typeof contractRead === 'undefined') {
        contractRead = new utils.web3.eth.Contract(abi, address);
    }
    return await contractRead.methods.validate_name(name).call();
}

const getNameIDFromTokenID = async (tokenID) => {
    if (typeof contractRead === 'undefined') {
        contractRead = new utils.web3.eth.Contract(abi, address);
    }
    return await contractRead.methods.summoner_to_name_id(tokenID).call();
}

const hasName = async (tokenID) => {
    return (await get(tokenID)).length > 0;
}

const claim = async (tokenID, name) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenID} => claim gold => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractWrite === 'undefined') {
                    contractWrite = new ethers.Contract(address, abi, constVal.nonceManager);
                }
                let approveResponse = await contractWrite.claim(
                    name,
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        //nonce: await utils.getNonce(nonce)
                    });
                let receipt = await txUtils.waitForTx(tokenID, approveResponse, 'claim name');
                logUtils.log(`${tokenID} => name claimed => ${name}`);
                if (constVal.debug){
                    logUtils.log(approveResponse);
                }
                return [receipt.status === 1, 'success'];
            } catch (e){
                logUtils.log(`${tokenID} => name error`);
                fileUtils.logToFile(`name error\n${e.toString()}`);
                if (constVal.debug){

                    logUtils.log(e);
                }
                return [false, 'error'];
            }
        } else {
            logUtils.log(`${tokenID} => Live trading disabled - name claim not submitted.`)
            return [false, 'not live'];
        }
    }
}

const massValidate = async (file) => {
    let lines = await fileUtils.getAllLineOfFile(file);
    if (!lines){
        return;
    }
    for (let name of lines) {
        name = formatName(name);
        let validated = await validate(name);
        if (!validated){
            logUtils.log(`[${name}] is not valid`);
            continue;
        }
        let available = await isAvailable(name);
        if (available){
            logUtils.log(`[${name}] is not available`);
        } else {
            logUtils.log(`[${name}] is available`);
        }
    }
}

const formatName = (name) => {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u2013|\u2014|-/g, " ").replace(/'/g, " ").replace(/\s\s+/g, ' ');
}

module.exports = {
    get,
    isAvailable,
    hasName,
    getNameIDFromTokenID,
    claim,
    validate,
    massValidate,
    formatName
}