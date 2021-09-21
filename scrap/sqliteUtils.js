const db = require('better-sqlite3')('data.db', []);

const initDb = () =>{
    db.exec("CREATE TABLE IF NOT EXISTS `address` ( `id` VARCHAR(255) NOT NULL , PRIMARY KEY (`id`));");
    db.exec("CREATE TABLE IF NOT EXISTS `token` ( `id` INT NOT NULL , `owner` VARCHAR(255) NOT NULL , `xp` BIGINT UNSIGNED NOT NULL DEFAULT '0' , `class` TINYINT UNSIGNED NOT NULL DEFAULT '0' , `level` TINYINT UNSIGNED NOT NULL DEFAULT '1' , `gold` BIGINT UNSIGNED NOT NULL DEFAULT '0' , `material_1` BIGINT UNSIGNED NOT NULL DEFAULT '0' , `strength` INT UNSIGNED NOT NULL DEFAULT '0' , `dexterity` INT UNSIGNED NOT NULL DEFAULT '0' , `constitution` INT UNSIGNED NOT NULL DEFAULT '0' , `intelligence` INT UNSIGNED NOT NULL DEFAULT '0' , `wisdom` INT UNSIGNED NOT NULL DEFAULT '0' , `charisma` INT UNSIGNED NOT NULL DEFAULT '0' , PRIMARY KEY (`id`));");
}

const insertAddress = (address) => {
    initDb();
    db.exec(`INSERT INTO address (id) VALUES ('${address}') ON CONFLICT DO NOTHING;`);
}

const insertToken = (id, owner) => {
    initDb();
    db.exec(`INSERT INTO token (id, owner) VALUES ('${id}', '${owner}') ON CONFLICT DO UPDATE SET owner=excluded.owner;`);
}

const getNumberOfTokenByAddress = (minCount = -1) => {
    initDb();
    if (minCount !== -1){
        return db.prepare(`SELECT owner, count(*) as 'token' FROM token GROUP BY owner HAVING token >= ${minCount} ORDER BY count(*)`).all();
    }else {
        return db.prepare(`SELECT owner, count(*) as 'token' FROM token GROUP BY owner ORDER BY count(*)`).all();
    }
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
    getMaxTokenId
};