const constVal = require('../shared/const');
const utils = require('../shared/utils');
const dataUtils = require('./dataUtils');
const filename = `summoners${utils.slugify(constVal.envFile.replace(/^.*[\\\/]/, ''))}.db`;

const sqlitePath = `./data/${filename}`;

const db = require('better-sqlite3')(sqlitePath, []);

const initDb = () => {
    db.exec("CREATE TABLE IF NOT EXISTS `token` ( `id` BIGINT UNSIGNED NOT NULL PRIMARY KEY, `next_available` DATETIME NULL);");
    db.exec("CREATE TABLE IF NOT EXISTS `token_tx` ( `hash` VARCHAR(255) NOT NULL PRIMARY KEY, `token` BIGINT UNSIGNED NOT NULL , `fees` DOUBLE NOT NULL , `type` VARCHAR(255) NOT NULL, `status` BOOLEAN NOT NULL, `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);");
}

const insertTokenTx = (tokenID, hash, fees, type, status) => {
    initDb();
    db.exec(`INSERT INTO token_tx (hash, token, fees, type, status) VALUES ('${hash}', ${tokenID}, ${fees}, '${type}', ${status}) ON CONFLICT DO NOTHING;`);
}

const insertToken = (tokenID) => {
    initDb();
    db.exec(`INSERT INTO token (id) VALUES (${tokenID}) ON CONFLICT DO NOTHING;`);
}

const updateToken = (tokenID, nextAvailable) => {
    initDb();
    let nextAvailableDateTime = dataUtils.dateToIsoDateTime(nextAvailable);
    db.exec(`UPDATE token SET next_available='${nextAvailableDateTime}' WHERE id = ${tokenID} AND (next_available > '${nextAvailableDateTime}' OR next_available IS NULL);`);
}

const getAllToken = () =>{
    initDb();
    let res = db.prepare(`SELECT id from token;`).all();
    let tokenList = []
    for (let data of res){
        tokenList.push(data.id);
    }
    return tokenList;
}

const getAvailableToken = () => {
    initDb();
    for (let token of constVal.myTokenIds){
        insertToken(token);
    }
    let res = db.prepare(`SELECT id from token where next_available <= CURRENT_TIMESTAMP OR next_available IS NULL;`).all();
    let tokenList = []
    for (let data of res){
        tokenList.push(data.id);
    }
    return tokenList;
}

const getTotalFeesForToken = (tokenID) => {
    initDb();
    let res = db.prepare(`SELECT SUM(fees) as 'fees' from token_tx WHERE token = ${tokenID};`).get();
    return res.fees;
}

module.exports = {
    insertTokenTx,
    insertToken,
    updateToken,
    getAllToken,
    getAvailableToken,
    getTotalFeesForToken
}