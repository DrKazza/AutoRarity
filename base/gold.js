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
    return [Math.floor(goldheld/(10**18)), Math.floor(claimable/(10**18)), goldheld]
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
                        nonce: await utils.getNonce(nonce)
                    });
                console.log(`${tokenID} => gold claimed`);
                return [true, 'success'];
            } catch (e){
                console.log(`${tokenID} => gold error`);
                return [false, 'error'];
            }
        } else {
            console.log(`${tokenID} => Live trading disabled - gold claim not submitted.`)
            return [false, 'not live'];
        }
    }
}

const transfer = async (tokenFrom, tokenTo, amount, nonce = undefined) => {
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
                    amount,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                console.log(`${tokenFrom} > ${tokenTo} => transfer gold success`);
                return [true, 'success'];
            } catch (e){
                console.log(`${tokenFrom} > ${tokenTo} => transfer gold error`);
                console.log(e);
                return [false, 'ERROR'];
            }
        } else {
            console.log(`${tokenFrom} > ${tokenTo} => Live trading disabled - transfer NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const transferToMule = async (tokenID, amount, nonce = undefined) => {
    let mule = constVal.mule.gold;
    if (typeof mule === 'undefined'){
        console.log(`${tokenID} => can't transfer gold no mule defined, you can disable by setting AUTO_TRANSFER_TO_MULE in .env`);
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