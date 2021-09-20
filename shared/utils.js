const ethers = require("ethers");
const Web3 = require('web3');
const constVal = require('./const');


let web3 = new Web3(constVal.fantomRpcUrl);

const timeLeft = (timestamp) => {
    let rightNow = Date.now()/1000
    let timeleft = timestamp - rightNow
    if (timeleft < 0) {
        return [-1,0]
    } else {
        let [hrs, mins] = secsToText(timeleft)
        return [hrs, mins, timeleft]
    }
}

const secsToText = (secs) => {
    let hrs = Math.floor(secs / 60 / 60)
    let mins = Math.floor((secs / 60 - hrs * 60))
    return [hrs, mins]
}

const calculateGasPrice = async () => {
    let spotPx = await web3.eth.getGasPrice();
    let spotPxBN = ethers.BigNumber.from(spotPx.toString())
    if (spotPxBN.gte(constVal.maxGasPrice)) {
        return -(Math.floor(spotPx/(10**9)))
    } else {
        return spotPxBN
    }
}

const nonceVal = async () => {
    return await constVal.jsonRpcProvider.getTransactionCount(constVal.walletAddress, "pending")
}

const getNonce = async (nonce) => {
    if (typeof nonce === 'undefined'){
        nonce = await nonceVal();
    }
    return nonce;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
    secsToText,
    timeLeft,
    calculateGasPrice,
    nonceVal,
    getNonce,
    delay,
    web3
}