const constVal = require("../shared/const");
const utils = require('../shared/utils');
const logUtils = require("../shared/logUtils");
const {contractAddresses} = require('../shared/contractAddresses');
const ethers = require("ethers");

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

const claim = async (tokenID, nonce = undefined) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenID} => claim rar => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractClaim === 'undefined') {
                    contractClaim = new ethers.Contract(address, abi, constVal.account);
                }
                let approveResponse = await contractClaim.claim(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                logUtils.log(`${tokenID} => rar claimed`);
                return [true, 'success'];
            } catch (e){
                logUtils.log(`${tokenID} => rar error`);
                if (constVal.debug){
                    logUtils.log(`nonce => ${nonce}`);
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

const transfer = async (tokenFrom, tokenTo, amount, nonce = undefined) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenFrom} > ${tokenTo} => transfer rar => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractTransfer === 'undefined') {
                    contractTransfer = new ethers.Contract(address, abi, constVal.account);
                }
                let approveResponse = await contractTransfer.transfer(
                    tokenFrom,
                    tokenTo,
                    amount,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                logUtils.log(`${tokenFrom} > ${tokenTo} => transfer rar success`);
                return [true, 'success'];
            } catch (e){
                logUtils.log(`${tokenFrom} > ${tokenTo} => transfer rar error`);
                if (constVal.debug){
                    logUtils.log(`nonce => ${nonce}`);
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

const transferToMule = async (tokenID, amount, nonce = undefined) => {
    let mule = constVal.mule.rar;
    if (typeof mule === 'undefined' || mule.length === 0){
        logUtils.log(`${tokenID} => can't transfer rar no mule defined, define RAR_MULE to make it work, you can disable by setting AUTO_TRANSFER_TO_MULE in .env`);
        return [false, 'no mule defined'];
    }
    if (tokenID === mule){
        return [false, 'same token as mule'];
    }
    return await transfer(tokenID, mule, amount, nonce);
}

module.exports = {
    getStats,
    claim,
    transfer,
    transferToMule
}