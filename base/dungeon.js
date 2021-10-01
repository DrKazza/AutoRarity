const dungeons = require("../dungeons");
const logUtils = require("../shared/logUtils");
const constVal = require("../shared/const");

const displayAvailableDungeons = () => {
    logUtils.log('Available dungeon:');
    let dgList = dungeons.getAvailableDungeons();
    for (let dg of dgList){
        logUtils.log(` - ${dg}`);
    }
}

const scout = async (dungeonName, token) => {
    if (!dungeons.isDungeonAvailable(dungeonName)) {
        logUtils.log(`This dungeon is not implemented yet [${dungeonName}]`);
        displayAvailableDungeons();
    } else {
        if (typeof token === 'undefined'){
            for (let token of constVal.myTokenIds){
                await dungeons.scoutDungeon(dungeonName, token);
            }
        } else {
            if (!constVal.myTokenIds.includes(token)){
                logUtils.log(`The token [${token}] is not part of your token list.\nmaybe update the token list'`)
            } else {
                await dungeons.scoutDungeon(dungeonName, token);
            }
        }
    }
}

const doDungeon = async (dungeonName, token, isAuto = false) => {
    if (!dungeons.isDungeonAvailable(dungeonName) && !isAuto) {
        logUtils.log(`This dungeon is not implemented yet [${dungeonName}]`);
        displayAvailableDungeons();
    } else {
        if (typeof token === 'undefined'){
            for (let token of constVal.myTokenIds){
                await dungeons.runDungeon(dungeonName, token);
            }
        } else {
            if (!constVal.myTokenIds.includes(token)){
                logUtils.log(`The token [${token}] is not part of your token list.\nmaybe update the token list'`)
                return false;
            } else {
                return await dungeons.runDungeon(dungeonName, token);
            }
        }
    }
}

module.exports = {
    displayAvailableDungeons,
    doDungeon,
    scout,
    getAvailableDungeons: dungeons.getAvailableDungeons
}