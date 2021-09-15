const utils = require('../shared/utils');
const {contractAddresses} = require('../shared/contractAddresses');

//TOKEN RELATED
const getNextTokenId = async () => {
    let contract = new utils.web3.eth.Contract(contractAddresses.manifestABI, contractAddresses.rarityManifested);
    return await contract.methods.next_summoner().call();
}

const getOwnerOfToken = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(contractAddresses.manifestABI, contractAddresses.rarityManifested);
    return await contract.methods.ownerOf(tokenID).call();
}

const getTokenDetail = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(contractAddresses.manifestABI, contractAddresses.rarityManifested);
    return await contract.methods.summoner(tokenID).call();
}

const getTokenAbility = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(contractAddresses.attributesABI, contractAddresses.rarityAttributes);
    return await contract.methods.ability_scores(tokenID).call();
}

const getTokenGoldCount = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(contractAddresses.goldABI, contractAddresses.rarityGold);
    return await contract.methods.balanceOf(tokenID).call();
}

const getTokenMaterial1Count = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(contractAddresses.materials1ABI, contractAddresses.rarityMaterials1);
    return await contract.methods.balanceOf(tokenID).call();
}


//ITEM RELATED
const getNextItemId = async () => {
    let contract = new utils.web3.eth.Contract(contractAddresses.crafting1ABI, contractAddresses.rarityCrafting1);
    return await contract.methods.next_item().call();
}

const getOwnerOfItem = async (itemID) => {
    let contract = new utils.web3.eth.Contract(contractAddresses.crafting1ABI, contractAddresses.rarityCrafting1);
    return await contract.methods.ownerOf(itemID).call();
}

const getItemDetail = async (itemID) => {
    let contract = new utils.web3.eth.Contract(contractAddresses.crafting1ABI, contractAddresses.rarityCrafting1);
    return await contract.methods.items(itemID).call();
}

module.exports = {
    getNextTokenId,
    getOwnerOfToken,
    getTokenDetail,
    getTokenAbility,
    getTokenGoldCount,
    getTokenMaterial1Count,
    getNextItemId,
    getOwnerOfItem,
    getItemDetail,
};