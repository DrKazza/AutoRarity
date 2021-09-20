const utils = require('../shared/utils');
const {contractAddresses} = require('../shared/contractAddresses');

let contractGetOwnerOfToken;
let contractGetNextTokenId;
let contractGetTokenDetail;
let contractGetTokenAbility;
let contractGetTokenGoldCount;
let contractGetTokenMaterial1Count;
let contractGetNextItemId;
let contractGetOwnerOfItem;
let contractGetItemDetail;
//TOKEN RELATED
const getNextTokenId = async () => {
    if (typeof contractGetNextTokenId === 'undefined'){
        contractGetNextTokenId = new utils.web3.eth.Contract(contractAddresses.manifestABI, contractAddresses.rarityManifested);
    }
    return await contractGetNextTokenId.methods.next_summoner().call();
}

const getOwnerOfToken = async (tokenID) => {
    if (typeof contractGetOwnerOfToken === 'undefined'){
        contractGetOwnerOfToken = new utils.web3.eth.Contract(contractAddresses.manifestABI, contractAddresses.rarityManifested);
    }
    return await contractGetOwnerOfToken.methods.ownerOf(tokenID).call();
}

const getTokenDetail = async (tokenID) => {
    if (typeof contractGetTokenDetail === 'undefined') {
        contractGetTokenDetail = new utils.web3.eth.Contract(contractAddresses.manifestABI, contractAddresses.rarityManifested);
    }
    return await contractGetTokenDetail.methods.summoner(tokenID).call();
}

const getTokenAbility = async (tokenID) => {
    if (typeof contractGetTokenAbility === 'undefined') {
        contractGetTokenAbility = new utils.web3.eth.Contract(contractAddresses.attributesABI, contractAddresses.rarityAttributes);
    }
    return await contractGetTokenAbility.methods.ability_scores(tokenID).call();
}

const getTokenGoldCount = async (tokenID) => {
    if (typeof contractGetTokenGoldCount === 'undefined') {
        contractGetTokenGoldCount = new utils.web3.eth.Contract(contractAddresses.goldABI, contractAddresses.rarityGold);
    }
    return await contractGetTokenGoldCount.methods.balanceOf(tokenID).call();
}

const getTokenMaterial1Count = async (tokenID) => {
    if (typeof contractGetTokenMaterial1Count === 'undefined') {
        contractGetTokenMaterial1Count = new utils.web3.eth.Contract(contractAddresses.materials1ABI, contractAddresses.rarityMaterials1);
    }
    return await contractGetTokenMaterial1Count.methods.balanceOf(tokenID).call();
}


//ITEM RELATED
const getNextItemId = async () => {
    if (typeof contractGetNextItemId === 'undefined') {
        contractGetNextItemId = new utils.web3.eth.Contract(contractAddresses.crafting1ABI, contractAddresses.rarityCrafting1);
    }
    return await contractGetNextItemId.methods.next_item().call();
}

const getOwnerOfItem = async (itemID) => {
    if (typeof contractGetOwnerOfItem === 'undefined') {
        contractGetOwnerOfItem = new utils.web3.eth.Contract(contractAddresses.crafting1ABI, contractAddresses.rarityCrafting1);
    }
    return await contractGetOwnerOfItem.methods.ownerOf(itemID).call();
}

const getItemDetail = async (itemID) => {
    if (typeof contractGetItemDetail === 'undefined') {
        contractGetItemDetail = new utils.web3.eth.Contract(contractAddresses.crafting1ABI, contractAddresses.rarityCrafting1);
    }
    return await contractGetItemDetail.methods.items(itemID).call();
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