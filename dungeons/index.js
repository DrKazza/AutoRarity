
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

const doDungeons = () => {
    for (const dungeonName in dungeons) {
        dungeons[dungeonName].doIt();
    }
}

const doDungeon = (dungeonName, token, config) => {
}

const scoutDungeon = async (dungeonName, token) => {
    await dungeons[dungeonName].scout(token);
}

module.exports = {
    getAvailableDungeons,
    doDungeons,
    doDungeon,
    scoutDungeon,
    isDungeonAvailable
}