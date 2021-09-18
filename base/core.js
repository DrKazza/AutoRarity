const {contractAddresses} = require('../shared/contractAddresses');
const utils = require("../shared/utils");
const abi =contractAddresses.manifestABI;
const address = contractAddresses.rarityManifested;

const getStats = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    let tokenStats = await contract.methods.summoner(tokenID).call();
    tokenStats[4] = await contract.methods.xp_required(tokenStats[3]).call();
    // tokenStats will return [currentxp, time of next xpgain, char class, level, xp to next level]
    return tokenStats;
}

module.exports = {
    getStats,
}