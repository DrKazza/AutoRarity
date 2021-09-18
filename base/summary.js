const constVal = require('../shared/const');
const utils = require('../shared/utils');
const gold = require('./gold');
const attribute = require('./attribute');
const material1 = require('./material_1');
const core = require('./core');

const charSummary = async () => {
    for (let tokenID of constVal.myTokenIds) {
        let tokenStats = await core.getStats(tokenID)
        let timeleft = utils.timeLeft(tokenStats[1])
        console.log(`*****************`)
        if (timeleft[0] < 0) {
            console.log(`Token: ${tokenID}, ${constVal.classes[tokenStats[2]]} Lvl ${tokenStats[3]}, currentXP ${Math.floor(tokenStats[0]/10**18)}/${Math.floor(tokenStats[4]/10**18)} - Ready to get XP`)
        } else {
            console.log(`Token: ${tokenID}, ${constVal.classes[tokenStats[2]]} Lvl ${tokenStats[3]}, currentXP ${Math.floor(tokenStats[0]/10**18)}/${Math.floor(tokenStats[4]/10**18)}, next XP in ${timeleft[0]}h${timeleft[1]}m`)
        }
        let attribs = await attribute.get(tokenID);
        console.log(`Str: ${attribs[0]}, Dex: ${attribs[1]}, Const: ${attribs[2]}, Int: ${attribs[3]}, Wisdom: ${attribs[4]}, Charisma: ${attribs[5]}`)
        let goldStats = await gold.getStats(tokenID);
        let goldtext = ''
        if (goldStats[0] > 0) {goldtext +=`Gold owned: ${goldStats[0]}`}
        if (goldStats[1] > 0) {goldtext +=`Gold to be claimed: ${goldStats[1]}`}
        if (goldtext !== '') {console.log(goldtext)}
        let inventory = await material1.getInventory(tokenID);
        if (inventory > 0) {console.log(`${inventory} Crafting Materials (I)`)}
    }
    console.log(`*****************`)
}


module.exports = {
    charSummary
};


