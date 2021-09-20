const constVal = require("../shared/const");
const utils = require('../shared/utils');
const {contractAddresses} = require('../shared/contractAddresses');
const ethers = require("ethers");
const abi = contractAddresses.materials1ABI;
const address = contractAddresses.rarityMaterials1;

const getInventory = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    return await contract.methods.balanceOf(tokenID).call();
}

const transfer = async (tokenFrom, tokenTo, amount, nonce = undefined) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`${tokenFrom} > ${tokenTo} => transfer material1 => Gas Price too high: ${-thisGas}`)
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
                console.log(`${tokenFrom} > ${tokenTo} => transfer materials1 success`);
                return [true, 'success'];
            } catch (e){
                console.log(`${tokenFrom} > ${tokenTo} => transfer materials1 error`);
                console.log(`gas price => ${Math.floor(thisGas/(10**9))}`);
                console.log(e);
                return [false, 'ERROR'];
            }
        } else {
            console.log(`${tokenFrom} > ${tokenTo} Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const transferToMule = async (tokenID, amount, nonce = undefined) => {
    let mule = constVal.mule.materials1;
    if (typeof mule === 'undefined'){
        console.log(`${tokenID} => can't transfer materials1 no mule defined, you can disable by setting AUTO_TRANSFER_TO_MULE in .env`);
        return [false, 'no mule defined'];
    }
    if (tokenID === mule){
        return [false, 'same token as mule'];
    }
    return await transfer(tokenID, mule, amount, nonce);
}

module.exports = {
    getInventory,
    transfer,
    transferToMule
}