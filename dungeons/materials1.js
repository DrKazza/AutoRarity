const ethers = require('ethers');
const {contractAddresses} = require('../contractAddresses');
const utils = require('../utils');

const abi = contractAddresses.materials1ABI;
const address = contractAddresses.rarityMaterials1;
const recommendedClass = [1,5,7];

const doIt = async (tokenID, account, totalGasLimit, thisGas, nonceToUse) => {
    console.log('Not Implemented');
    /*
    let contract = new ethers.Contract(address, abi, account);
    let approveResponse = await contract.adventure(
        tokenID,
        {
            gasLimit: totalGasLimit,
            gasPrice: thisGas,
            nonce: nonceToUse
        });
    console.log(approveResponse);
     */
}

const scout = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    let approveResponse = await contract.methods.scout(tokenID).call();
    if (approveResponse > 0){
        let time = await getTimeUntilAvailable(tokenID);
        let textTimeleft = utils.timeLeft(time);
        console.log(`${tokenID} => ${approveResponse} => time left ${textTimeleft[0]}h${textTimeleft[1]}m`);
    } else {
        console.log(`${tokenID} => ${approveResponse}`);
    }
}

const getTimeUntilAvailable = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    return await contract.methods.adventurers_log(tokenID).call();
}

module.exports = {
    recommendedClass,
    doIt,
    scout
}