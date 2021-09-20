const ethers = require('ethers');
const {contractAddresses} = require('../shared/contractAddresses');
const utils = require('../shared/utils');
const constVal = require('../shared/const');

const abi = contractAddresses.materials1ABI;
const address = contractAddresses.rarityMaterials1;
const dungeonName = 'cellar';

const run = async (tokenID, nonce = undefined) => {
    let thisGas = await utils.calculateGasPrice()
    let loot;
    if ((loot = await getLoot(tokenID)) < 1){
        console.log(`${tokenID} => [${dungeonName}] no loot`);
        return [false, 'no loot']
    }
    let time = await getTimeUntilAvailable(tokenID);
    let timeLeft = utils.timeLeft(time);
    if (timeLeft[0] !== -1){
        console.log(`${tokenID} => [${dungeonName}] not available => ${timeLeft[0]}h${timeLeft[1]}m`);
        return [false, 'time', timeLeft[2]]
    }
    if (thisGas < 0) {
        console.log(`${tokenID} => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                let contract = new ethers.Contract(address, abi, constVal.account);
                let approveResponse = await contract.adventure(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                //console.log(approveResponse);
                console.log(`${tokenID} => [${dungeonName}] success, loot => ${loot}`);
                return [true, `success, loot => ${loot}`];
            } catch (e) {
                console.log(`${tokenID} => [${dungeonName}] error`);
                console.log(e);
                return [false, 'ERROR'];
            }
        } else {
            console.log(`Live trading disabled - [${dungeonName}]  dungeoning NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const scout = async (tokenID) => {
    let loot = await getLoot(tokenID);
    if (loot > 0){
        let time = await getTimeUntilAvailable(tokenID);
        let textTimeleft = utils.timeLeft(time);
        if (textTimeleft[0] !== -1){
            console.log(`${tokenID} => ${loot} => time left ${textTimeleft[0]}h${textTimeleft[1]}m`);
        } else {
            console.log(`${tokenID} => ${loot} => ready`);

        }
    } else {
        console.log(`${tokenID} => ${loot}`);
    }
}

const getLoot = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    return await contract.methods.scout(tokenID).call();
}

const getTimeUntilAvailable = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    return await contract.methods.adventurers_log(tokenID).call();
}

module.exports = {
    dungeonName,
    run,
    scout
}