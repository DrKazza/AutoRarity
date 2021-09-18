const constVal = require("../shared/const");
const utils = require('../shared/utils');
const {contractAddresses} = require('../shared/contractAddresses');
const ethers = require("ethers");

const abi = contractAddresses.goldABI;
const address = contractAddresses.rarityGold;

const getStats = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    let goldheld = await contract.methods.balanceOf(tokenID).call();
    let claimable = await contract.methods.claimable(tokenID).call();
    return [Math.floor(goldheld/(10**18)), Math.floor(claimable/(10**18))]
}

const getNonce = (nonce) => {
    if (typeof nonce === 'undefined'){
        nonce = utils.nonceVal();
    }
    return nonce;
}

const claim = async (tokenID, nonce = undefined) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`${tokenID} => claim gold => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                let contract = new ethers.Contract(address, abi, constVal.account);
                let approveResponse = await contract.claim(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: getNonce(nonce)
                    });
                console.log(`${tokenID} => gold claimed`);
                return [true, 'success'];
            } catch (e){
                console.log(`${tokenID} => gold error`);
                return [false, 'error'];
            }
        } else {
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const transfer = async (tokenFrom, tokenTo, nonce = undefined) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`${tokenFrom} > ${tokenTo} => transfer gold => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                let contract = new ethers.Contract(address, abi, constVal.account);
                let approveResponse = await contract.transfer(
                    tokenFrom,
                    tokenTo,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: getNonce(nonce)
                    });
                return [true, 'success'];
            } catch (e){
                return [false, 'ERROR'];
            }
        } else {
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

module.exports = {
    getStats,
    claim,
    transfer
}