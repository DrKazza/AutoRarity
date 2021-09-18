const dungeons = require("../dungeons");
const constVal = require("../shared/const");
const utils = require('../shared/utils');

const displayAvailableDungeons = () => {
    console.log('Available dungeon:');
    let dgList = dungeons.getAvailableDungeons();
    for (let dg of dgList){
        console.log(` - ${dg}`);
    }
}

const scout = async (dungeonName, token) => {
    if (!dungeons.isDungeonAvailable(dungeonName)) {
        console.log(`This dungeon is not implemented yet [${dungeonName}]`);
        displayAvailableDungeons();
    } else {
        if (typeof token === 'undefined'){
            for (let token of constVal.myTokenIds){
                await dungeons.scoutDungeon(dungeonName, token);
            }
        } else {
            if (!constVal.myTokenIds.includes(token)){
                console.log(`The token [${token}] is not part of your token list.\nmaybe update the token list'`)
            } else {
                await dungeons.scoutDungeon(dungeonName, token);
            }
        }
    }
}

const doDungeon = async (dungeonName, token) => {
    if (!dungeons.isDungeonAvailable(dungeonName)) {
        console.log(`This dungeon is not implemented yet [${dungeonName}]`);
        displayAvailableDungeons();
    } else {
        if (typeof token === 'undefined'){
            let nonce = await utils.nonceVal();
            for (let token of constVal.myTokenIds){
                await dungeons.runDungeon(dungeonName, token, nonce);
                nonce++;
            }
        } else {
            if (!constVal.myTokenIds.includes(token)){
                console.log(`The token [${token}] is not part of your token list.\nmaybe update the token list'`)
            } else {
                await dungeons.runDungeon(dungeonName, token);
            }
        }
    }
}

module.exports = {
    displayAvailableDungeons,
    doDungeon,
    scout
}