const {dungeonName} = require("./materials1");

const dungeons = {
    cellar: require('./materials1')
};

const getAvailableDungeons = () => {
    let dungeonList = [];
    for (const dungeonName in dungeons) {
        dungeonList.push(dungeonName);
    }
    return dungeonList;
}

const isDungeonAvailable  = (dungeonName) => {
    return typeof dungeons[dungeonName] !== 'undefined';
}

const runDungeon = async (dungeonName, token) => {
    return await dungeons[dungeonName].run(token);
}

const getTimeUntilAvailable = async (dungeonName, token) =>{
    return await dungeons[dungeonName].getTimeUntilAvailable(token);
}

const scoutDungeon = async (dungeonName, token) => {
    await dungeons[dungeonName].scout(token);
}

module.exports = {
    getAvailableDungeons,
    runDungeon,
    scoutDungeon,
    isDungeonAvailable,
    getTimeUntilAvailable
}