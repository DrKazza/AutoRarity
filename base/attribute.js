const {contractAddresses} = require('../shared/contractAddresses');
const utils = require("../shared/utils");
const abi =contractAddresses.attributesABI;
const address = contractAddresses.rarityAttributes;

const get = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    return await contract.methods.ability_scores(tokenID).call();
}
module.exports = {
    get
}