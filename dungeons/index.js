
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

const runDungeon = async (dungeonName, token, nonce = undefined) => {
    await dungeons[dungeonName].run(token);
}

const scoutDungeon = async (dungeonName, token) => {
    await dungeons[dungeonName].scout(token);
}

module.exports = {
    getAvailableDungeons,
    runDungeon,
    scoutDungeon,
    isDungeonAvailable
}