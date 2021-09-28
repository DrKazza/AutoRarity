const db = require('better-sqlite3')('data.db', []);

const initDb = () => {
    db.exec("CREATE TABLE IF NOT EXISTS `address` ( `id` VARCHAR(255) NOT NULL , PRIMARY KEY (`id`));");
    db.exec("CREATE TABLE IF NOT EXISTS `token` ( `id` INT NOT NULL , `owner` VARCHAR(255) NOT NULL , `xp` BIGINT UNSIGNED NOT NULL DEFAULT '0' , `class` TINYINT UNSIGNED NOT NULL DEFAULT '0' , `level` TINYINT UNSIGNED NOT NULL DEFAULT '1' , `gold` BIGINT UNSIGNED NOT NULL DEFAULT '0' , `material_1` BIGINT UNSIGNED NOT NULL DEFAULT '0' , `strength` INT UNSIGNED NOT NULL DEFAULT '0' , `dexterity` INT UNSIGNED NOT NULL DEFAULT '0' , `constitution` INT UNSIGNED NOT NULL DEFAULT '0' , `intelligence` INT UNSIGNED NOT NULL DEFAULT '0' , `wisdom` INT UNSIGNED NOT NULL DEFAULT '0' , `charisma` INT UNSIGNED NOT NULL DEFAULT '0' , PRIMARY KEY (`id`));");
    try {db.exec("ALTER TABLE `token` ADD COLUMN gold_claimable BIGINT UNSIGNED NOT NULL DEFAULT '0'")} catch (e) {}
}

const insertAddress = (address) => {
    initDb();
    db.exec(`INSERT INTO address (id) VALUES ('${address}') ON CONFLICT DO NOTHING;`);
}

const insertToken = (id, owner, materials1Count, goldCount, claimableGoldCount, level, classType) => {
    initDb();
    db.exec(`INSERT INTO token (id, owner, material_1, gold, gold_claimable, level, class) VALUES ('${id}', '${owner}', ${materials1Count}, ${goldCount}, ${claimableGoldCount}, ${level}, ${classType}) ON CONFLICT DO UPDATE SET owner=excluded.owner, material_1=excluded.material_1, gold=excluded.gold, gold_claimable=excluded.gold_claimable, level=excluded.level, class=excluded.class;`);
}

const getNumberOfTokenByAddress = (minCount = -1) => {
    initDb();
    if (minCount !== -1){
        return db.prepare(`SELECT owner, SUM(gold)/POWER(10, 18) as 'gold', SUM(gold_claimable)/POWER(10, 18) as 'gold_claimable', SUM(material_1) as 'material_1', count(*) as 'token' FROM token GROUP BY owner HAVING token >= ${minCount} ORDER BY count(*)`).all();
    }else {
        return db.prepare(`SELECT owner, SUM(gold)/POWER(10, 18) as 'gold', SUM(gold_claimable)/POWER(10, 18) as 'gold_claimable', SUM(material_1) as 'material_1', count(*) as 'token' FROM token GROUP BY owner ORDER BY count(*)`).all();
    }
}

const getTokenCountByLevelAndAddress =(address) => {
    initDb();
    return db.prepare(`SELECT level, count(*) as 'token' FROM token WHERE owner = '${address}' GROUP BY level`).all();
}

const getTokenCountByClassAndAddress =(address) => {
    initDb();
    return db.prepare(`SELECT class, count(*) as 'token' FROM token WHERE owner = '${address}' GROUP BY class`).all();
}

const getNumberOfTokenFromAddress = (address) => {
    initDb();
    return db.prepare(`SELECT owner, SUM(gold)/POWER(10, 18) as 'gold', SUM(gold_claimable)/POWER(10, 18) as 'gold_claimable', SUM(material_1) as 'material_1', count(*) as 'token' FROM token WHERE owner = '${address}' GROUP BY owner ORDER BY count(*)`).all()[0];

}

const getTokenListFromAddress = (address) => {
    initDb();
    return db.prepare(`SELECT id as 'token' FROM token WHERE owner = '${address}'`).all();
}

const getMaxTokenId = () => {
    initDb();
    let res = db.prepare(`SELECT max(id) as 'id' FROM token`).get();
    return res.id;
}


module.exports = {
    insertAddress,
    insertToken,
    getNumberOfTokenByAddress,
    getMaxTokenId,
    getTokenListFromAddress,
    getNumberOfTokenFromAddress,
    getTokenCountByLevelAndAddress,
    getTokenCountByClassAndAddress
};