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
    db.exec(`INSERT INTO token (id, owner) VALUES ('${id}', '${owner}') ON CONFLICT DO NOTHING;`);
}

const getNumberOfTokenByAddress = () => {
    initDb();
    return db.prepare(`SELECT owner, count(*) as 'count' FROM token GROUP BY owner ORDER BY count(*)`).all();
}


module.exports = {
    insertAddress,
    insertToken,
    getNumberOfTokenByAddress
};