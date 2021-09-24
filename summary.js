const Web3 = require('web3');
var url = 'https://rpc.ftm.tools/'; 
var web3 = new Web3(url);

const classes = ['noClass', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rouge', 'Sorcerer', 'Wizard']; // yes I know I spelled it Rouge - GFY

const getStats = async (tokenIDvalue, abi, address) => {
    let contract = new web3.eth.Contract(abi, address);
    let tokenStats = await contract.methods.summoner(tokenIDvalue).call();
    tokenStats[4] = await contract.methods.xp_required(tokenStats[3]).call();
    return tokenStats;
}

const getAttributes = async (tokenIDvalue, abi, address) => {
    let contract = new web3.eth.Contract(abi, address);
    let tokenAttribs = await contract.methods.ability_scores(tokenIDvalue).call();
    return tokenAttribs;
}

const getGoldStats = async (tokenIDvalue, abi, address) => {
    let contract = new web3.eth.Contract(abi, address);
    let goldheld = await contract.methods.balanceOf(tokenIDvalue).call();
    let claimable = await contract.methods.claimable(tokenIDvalue).call();
    return [Math.floor(goldheld/(10**18)), Math.floor(claimable/(10**18))]
}

const getInventory = async (tokenIDvalue, abi, address) => {
    let contract = new web3.eth.Contract(abi, address);
    let materialsHeld = await contract.methods.balanceOf(tokenIDvalue).call();
    return (materialsHeld)
}

const getNames = async (tokenIDvalue, abi, address) => {
    let contract = new web3.eth.Contract(abi, address);
    let characterName = await contract.methods.summoner_name(tokenIDvalue).call();    
    return (characterName)
}

const timeLeft = (timestamp) => {
    let rightNow = Date.now()/1000
    let timeleft = timestamp - rightNow
    if (timeleft < 0) {
        return [-1,0]
    } else {
        [hrs, mins] = secsToText(timeleft)
        return [hrs, mins, timeleft]
    }
}

const secsToText = (secs) => {
    hrs = Math.floor(secs / 60 / 60)
    mins = Math.floor((secs / 60 - hrs * 60))
    return [hrs, mins]
}

const charSummary = async (tokenArray, contractAddresses) => {
    for (var tokenID of tokenArray) {
        let tokenStats = await getStats(tokenID, contractAddresses.manifestABI, contractAddresses.rarityManifested)
        let timeleft = timeLeft(tokenStats[1])
        console.log(`*****************`)
        let charName = await getNames(tokenID, contractAddresses.namesABI, contractAddresses.rarityNames);
        if (charName != '') {
            console.log(`${classes[tokenStats[2]]}: ${charName}`)
        } else {
            console.log(`Unnamed ${classes[tokenStats[2]]}.`)
        }
        if (timeleft[0] < 0) {
            console.log(`Token: ${tokenID}, ${classes[tokenStats[2]]} Lvl ${tokenStats[3]}, currentXP ${Math.floor(tokenStats[0]/10**18)}/${Math.floor(tokenStats[4]/10**18)} - Ready to get XP`)
        } else {    
            console.log(`TokenID: ${tokenID}, Lvl ${tokenStats[3]}, currentXP ${Math.floor(tokenStats[0]/10**18)}/${Math.floor(tokenStats[4]/10**18)}, next XP in ${timeleft[0]}h${timeleft[1]}m`)
        }
        let attribs = await getAttributes(tokenID, contractAddresses.attributesABI, contractAddresses.rarityAttributes);
        console.log(`Str: ${attribs[0]}, Dex: ${attribs[1]}, Const: ${attribs[2]}, Int: ${attribs[3]}, Wisdom: ${attribs[4]}, Charisma: ${attribs[5]}`)        
        let goldStats = await getGoldStats(tokenID, contractAddresses.goldABI, contractAddresses.rarityGold);
        let goldtext = ''
        if (goldStats[0] > 0 || goldStats[1] > 0) {goldtext +=`Gold owned: ${goldStats[0]}`}
        if (goldStats[1] > 0) {goldtext +=` Gold to be claimed: ${goldStats[1]}`}
        if (goldtext != '') {console.log(goldtext)}
        let inventory = await getInventory(tokenID, contractAddresses.materials1ABI, contractAddresses.rarityMaterials1);
        if (inventory > 0) {console.log(`${inventory} Crafting Materials (I)`)}
    }
    console.log(`******* end of tokens ******`)
    return
}

module.exports = {charSummary, getStats, getGoldStats, secsToText, getNames};