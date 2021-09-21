const constVal = require("../shared/const");
const utils = require('../shared/utils');
const fileUtils = require('../shared/fileUtils');
const {contractAddresses} = require('../shared/contractAddresses');
const ethers = require("ethers");

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

const claim = async (tokenID, name, nonce) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        utils.log(`${tokenID} => claim gold => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractWrite === 'undefined') {
                    contractWrite = new ethers.Contract(address, abi, constVal.account);
                }
                let approveResponse = await contractWrite.claim(
                    name,
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                utils.log(`${tokenID} => name claimed => ${name}`);
                return [true, 'success'];
            } catch (e){
                utils.log(`${tokenID} => name error`);
                if (constVal.debug){
                    utils.log(e);
                }
                return [false, 'error'];
            }
        } else {
            utils.log(`${tokenID} => Live trading disabled - name claim not submitted.`)
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
            utils.log(`[${name}] is not valid`);
            continue;
        }
        let available = await isAvailable(name);
        if (available){
            utils.log(`[${name}] is not available`);
        } else {
            utils.log(`[${name}] is available`);
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