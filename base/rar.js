const constVal = require("../shared/const");
const utils = require('../shared/utils');
const logUtils = require("../shared/logUtils");
const {contractAddresses} = require('../shared/contractAddresses');
const ethers = require("ethers");
const fileUtils = require("../shared/fileUtils");
const txUtils = require("../shared/txUtils");
const {getOwnerOfToken} = require("./core");

const abi = contractAddresses.rarABI;
const address = contractAddresses.rarityRAR;

let contractGetStats;
let contractClaim;
let contractTransfer;

const getStats = async (tokenID) => {
    if (typeof contractGetStats === 'undefined') {
        contractGetStats = new utils.web3.eth.Contract(abi, address);
    }
    let goldheld = await contractGetStats.methods.balanceOf(tokenID).call();
    let claimable = 0;
    try {
        claimable = await contractGetStats.methods.claimable(tokenID).call();
    } catch (e) {

    }
    return [Math.floor(goldheld/(10**18)), Math.floor(claimable/(10**18)), goldheld]
}

const claim = async (tokenID) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenID} => claim rar => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractClaim === 'undefined') {
                    contractClaim = new ethers.Contract(address, abi, constVal.nonceManager);
                }
                logUtils.log(`${tokenID} => start rar claim`);
                let approveResponse = await contractClaim.claim(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        //nonce: await utils.getNonce(nonce)
                    });
                let receipt = await txUtils.waitForTx(tokenID, approveResponse, 'claim rar');
                logUtils.log(`${tokenID} => rar claimed`);
                if (constVal.debug){
                    logUtils.log(approveResponse);
                }
                return [receipt.status === 1, 'success'];
            } catch (e){
                logUtils.log(`${tokenID} => rar error`);
                fileUtils.logToFile(`rar error\n${e.toString()}`);
                if (constVal.debug){

                    logUtils.log(e);
                }
                return [false, 'error'];
            }
        } else {
            logUtils.log(`${tokenID} => Live trading disabled - rar claim not submitted.`)
            return [false, 'not live'];
        }
    }
}

const transfer = async (tokenFrom, tokenTo, amount) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenFrom} > ${tokenTo} => transfer rar => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractTransfer === 'undefined') {
                    contractTransfer = new ethers.Contract(address, abi, constVal.nonceManager);
                }
                logUtils.log(`${tokenFrom} > ${tokenTo} => start transfer rar`);
                let approveResponse = await contractTransfer.transfer(
                    tokenFrom,
                    tokenTo,
                    amount,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        //nonce: await utils.getNonce(nonce)
                    });
                let receipt = await txUtils.waitForTx(`${tokenFrom} > ${tokenTo}`, approveResponse, 'transfer rar');
                logUtils.log(`${tokenFrom} > ${tokenTo} => transfer rar success`);
                if (constVal.debug){
                    logUtils.log(approveResponse);
                }
                return [receipt.status === 1, 'success'];
            } catch (e){
                logUtils.log(`${tokenFrom} > ${tokenTo} => transfer rar error`);
                fileUtils.logToFile(`transfer rar error\n${e.toString()}`);
                if (constVal.debug){

                    logUtils.log(e);
                }
                return [false, 'error'];
            }
        } else {
            logUtils.log(`${tokenFrom} > ${tokenTo} => Live trading disabled - transfer NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const transferToMule = async (tokenID, amount) => {
    let mule = constVal.mule.rar;
    if (typeof mule === 'undefined' || mule.length === 0){
        logUtils.log(`${tokenID} => can't transfer rar no mule defined, define RAR_MULE to make it work, you can disable by setting AUTO_TRANSFER_TO_MULE in .env`);
        return [false, 'no mule defined'];
    }
    if (tokenID === mule){
        return [false, 'same token as mule'];
    }
    if (constVal.mule.rarAddress.length > 0){
        try {
            let owner = await getOwnerOfToken(tokenID);
            if (owner !== constVal.mule.rarAddress){
                logUtils.log(`${tokenID} => can't transfer rar to mule, owner of mule does not match`);
                return [false, 'owner of mule does not match'];
            }
        } catch (e) {
            logUtils.log(`${tokenID} => can't transfer rar to mule, mule does not exist`);
            return [false, 'token does not exist'];
        }
    }
    return await transfer(tokenID, mule, amount);
}

module.exports = {
    getStats,
    claim,
    transfer,
    transferToMule
}