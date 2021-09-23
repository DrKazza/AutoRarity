const constVal = require("../shared/const");
const scrapUtil = require("../scrap/scrapUtils");
const getGlobalStats = async () => {
    let totalGold = 0;
    let totalGoldClaimable = 0;
    let totalMaterials1 = 0;
    let typeCount = [];
    let tokenToScrap = []
    for (let tokenID of constVal.myTokenIds) {
        tokenToScrap.push(tokenID);
        if (tokenToScrap.length > 0 && tokenToScrap.length%50 === 0){
            let data = await scrapUtil.getTokensData(tokenToScrap);
            for (let tokenIndex in tokenToScrap) {
                totalMaterials1 += parseInt(data[tokenIndex].materials[0].balance, 10);
                totalGold += parseInt(data[tokenIndex].gold.balance, 10)/10**18;
                totalGoldClaimable += parseInt(data[tokenIndex].gold.claimable, 10)/10**18;

                if (typeof typeCount[data[tokenIndex].base.class] === "undefined"){
                    typeCount[data[tokenIndex].base.class] = 1;
                } else {
                    typeCount[data[tokenIndex].base.class]++;
                }
            }
            tokenToScrap = [];
        }
    }
    return {
        totalGold: totalGold,
        totalGoldClaimable: totalGoldClaimable,
        totalMaterials1: totalMaterials1,
        typeCount: typeCount
    };
}

const formatGlobalStats = (data) => {
    let text = "";
    text +=`Global Stats:
  - gold => ${(data.totalGold).toLocaleString()}
  - goldClaimable => ${(data.totalGoldClaimable).toLocaleString()}
  - materials1 => ${(data.totalMaterials1).toLocaleString()}
Summoner Count:\n`;
    for (let type in data.typeCount){
        text +=`  - ${constVal.classes[type]} => ${(data.typeCount[type]).toLocaleString()}\n`;
    }
    return text;
}

module.exports = {
    getGlobalStats,
    formatGlobalStats
}