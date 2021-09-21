require("dotenv").config();
const parseArgs = require('mri');
const constVal = require('./shared/const');
const utils = require('./shared/utils');
const summary = require('./base/summary');
const dungeon = require('./base/dungeon');
const core = require('./base/core');
const gold = require('./base/gold');
const materials1 = require('./base/material_1');
const attribute = require('./base/attribute');
const name = require('./base/name');
const telegramUtils = require('./shared/TelegramUtils');
const scrap = require('./scrap');
const scrapSqliteUtils = require('./scrap/sqliteUtils');
const rar = require('./base/rar');

let lastAutoNonce = 0;

const checkTokens = async () => {
    let latestNonce = await utils.nonceVal();
    if (lastAutoNonce > latestNonce){
        latestNonce = lastAutoNonce;
    } else {
        lastAutoNonce = latestNonce;
    }
    let delayToUse = constVal.xpRetryDelay;
    let dungeonList = dungeon.getAvailableDungeons();
    let transactionCount = await constVal.account.getTransactionCount();
    if (transactionCount < latestNonce){
        utils.log(`nonce val [${latestNonce}] is higher than transaction count [${transactionCount}] waiting before launch again`);
        let waitPercentage = Math.abs(Math.floor(transactionCount / latestNonce * 100) - 100);
        delayToUse = constVal.nonceDelay * waitPercentage / 100;
        return [delayToUse];
    }
    let checkGas = await utils.calculateGasPrice()
    if (checkGas < 0) {
        utils.log(`Gas Price too high: ${-checkGas} max: ${constVal.maxGasPrice/(10**9)}`)
        delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)

        return [delayToUse]
    }
    for (let tokenID of constVal.myTokenIds) {
        let somethingDone = false;
        let tokenStats = await core.getStats(tokenID);
        let xpCountdown = Math.floor(tokenStats[1] - Date.now() / 1000)
        let xpPending = 0
        if (xpCountdown < 0) {
            somethingDone = true;
            let xpEarnAttempt = await core.claimXp(tokenID, latestNonce)
            if (xpEarnAttempt[0]) {
                // success
                xpPending = 250*10**18;
                latestNonce++;
            } else if (xpEarnAttempt[1] === 'high gas') {
                // fail due to high gas price
                delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
            }
        } else {
            delayToUse = Math.max(Math.min(xpCountdown, delayToUse), constVal.minimumDelay)
        }
        let levelUpDone = false;
        if (constVal.autoLevelUp) {
            if (tokenStats[4] <= (xpPending + parseInt(tokenStats[0], 10))) {
                somethingDone = true;
                if (tokenStats[0] < tokenStats[4]) {
                    delayToUse = Math.max(Math.min(constVal.xpPendingDelay, delayToUse), constVal.minimumDelay)
                } else {
                    // try to levelup
                    let lvlEarnAttempt = await core.levelUp(tokenID, latestNonce)
                    if (lvlEarnAttempt[0]) {
                        latestNonce++;
                        levelUpDone = true;
                    } else if (lvlEarnAttempt[1] === 'high gas') {
                        // fail due to high gas price
                        delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
                    }
                }
            }
        }
        if (levelUpDone){
            delayToUse = Math.max(Math.min(constVal.xpPendingDelay, delayToUse), constVal.minimumDelay)
        } else {
            let  goldStats = await gold.getStats(tokenID);
            if (goldStats[1] > 0) {
                somethingDone = true;
                let goldEarnAttempt = await gold.claim(tokenID, latestNonce)
                if (goldEarnAttempt[0]) {
                    if (constVal.autoTransferToMule){
                        delayToUse = Math.max(Math.min(constVal.xpPendingDelay, delayToUse), constVal.minimumDelay)
                    }
                    latestNonce++;
                } else if (goldEarnAttempt[1] === 'high gas') {
                    // fail due to high gas price
                    delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
                }
            }
            if (constVal.autoTransferToMule) {
                if (goldStats[2] > 0) {
                    somethingDone = true;
                    let transferAttempt = await gold.transferToMule(tokenID, goldStats[2], latestNonce);
                    if (transferAttempt[0]) {
                        latestNonce++;
                    } else if (transferAttempt[1] === 'high gas') {
                        // fail due to high gas price
                        delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
                    }
                }
            }
            let  rarStats = await rar.getStats(tokenID);
            if (rarStats[1] > 0) {
                somethingDone = true;
                let rarEarnAttempt = await rar.claim(tokenID, latestNonce)
                if (rarEarnAttempt[0]) {
                    if (constVal.autoTransferToMule){
                        delayToUse = Math.max(Math.min(constVal.xpPendingDelay, delayToUse), constVal.minimumDelay)
                    }
                    latestNonce++;
                } else if (rarEarnAttempt[1] === 'high gas') {
                    // fail due to high gas price
                    delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
                }
            }
            if (constVal.autoTransferToMule) {
                if (rarStats[2] > 0) {
                    somethingDone = true;
                    let transferAttempt = await rar.transferToMule(tokenID, rarStats[2], latestNonce);
                    if (transferAttempt[0]) {
                        latestNonce++;
                    } else if (transferAttempt[1] === 'high gas') {
                        // fail due to high gas price
                        delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
                    }
                }
            }
        }
        if (constVal.autoTransferToMule){
            let materials1Inventory = await materials1.getInventory(tokenID);
            if (materials1Inventory > 0){
                somethingDone = true;
                let transferAttempt = await materials1.transferToMule(tokenID, materials1Inventory, latestNonce);
                if (transferAttempt[0]) {
                    latestNonce++;
                } else if (transferAttempt[1] === 'high gas') {
                    // fail due to high gas price
                    delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
                }
            }
        }
        for (let dungeonName of dungeonList){
            let dungeonAttempt = await dungeon.doDungeon(dungeonName, tokenID, latestNonce, true);
            if (dungeonAttempt[0]) {
                latestNonce++;
                delayToUse = Math.max(Math.min(constVal.xpPendingDelay, delayToUse), constVal.minimumDelay)
            } else if (dungeonAttempt[1] === 'high gas') {
                // fail due to high gas price
                delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
            } else if (dungeonAttempt[1] === 'time') {
                // fail due to not time not available
                delayToUse = Math.max(Math.min(dungeonAttempt[2], delayToUse), constVal.minimumDelay)
            }
        }

        if (!somethingDone){
            utils.log(`${tokenID} => nothing to do...`);
        }
    }
    lastAutoNonce = latestNonce;
    return [delayToUse];
}

const autoRun = async (repeater) => {
    if (repeater && constVal.enableTelegramBot){
        telegramUtils.init();
    }
    while (true) {
        let tokenCheck = await checkTokens()
        let textTimeleft = utils.secsToText(tokenCheck[0])
        if (repeater) {
            let retryDateTime = new Date((new Date()).getTime() + tokenCheck[0]*1000);
            let ftmBalance = (await utils.getFTMBalance())/10**18;
            if (ftmBalance <= constVal.lowFTM) {
                utils.log(`WARNING - Fantom Balance getting low : ${ftmBalance.toPrecision(4)}FTM`, true);
            }
            utils.log(`retrying in => ${textTimeleft[0]}h${textTimeleft[1]}m => ${retryDateTime}`);
            await utils.delay(tokenCheck[0]*1000);
        } else {
            break;
        }
    }
}

const displayAvailableClasses = () => {
    utils.log('Available classes:');
    for (let cl of constVal.classes){
        if (cl !== 'noClass')
            utils.log(` - ${cl}`);
    }
}

const dropTransaction = async (nonce, count = 1) => {
    if (typeof nonce === 'undefined'){
        utils.log('need nonce');
        return;
    }
    nonce = parseInt(nonce, 10);
    let i = 0;
    while (i < count) {
        let thisGas = await utils.calculateGasPrice()
        if (thisGas < 0) {
            utils.log(`Gas Price too high: ${-thisGas}`)
            return;
        }
        try {
            utils.log(`current nonce => ${nonce} ${i+1}/${count}`)
            await constVal.account.sendTransaction({
                from: constVal.walletAddress,
                to: constVal.walletAddress,
                value: 0,
                gasPrice: thisGas,
                nonce: nonce
            });
            nonce++;
            i++;
        } catch (e) {
            utils.log(e);
            return;
        }
    }
}

const getGlobalStats = async () => {
    let totalGold = 0;
    let totalMaterials1 = 0;
    let typeCount = [];
    utils.log(`/!\\it may take a long time if you have a lot of token/!\\`)
    for (let tokenID of constVal.myTokenIds) {
        totalMaterials1 += parseInt(await materials1.getInventory(tokenID), 10);
        let goldStats = await gold.getStats(tokenID);
        totalGold += goldStats[0];
        let stats = await core.getStats(tokenID);
        if (typeof typeCount[stats[2]] === "undefined"){
            typeCount[stats[2]] = 1;
        } else {
            typeCount[stats[2]]++;
        }
    }
    utils.log(`Global Stats:
     - gold => ${totalGold}
     - materials1 => ${totalMaterials1}`);
    for (let type in typeCount){
        utils.log(`     - ${constVal.classes[type]} => ${typeCount[type]}`);
    }
}

const init = async () => {
    const rawArgs = parseArgs(process.argv.slice(2));
    const args = rawArgs['_'].filter((value) => {
        let dotenvReg = /dotenv_config_path=(.*)/
        let dotenvRegVal = dotenvReg.exec(value);
        if (dotenvRegVal){
            constVal.envFile = dotenvRegVal[1];
        }
        return !dotenvRegVal;
    });
    if (typeof args[0] === 'undefined' || args[0] === 'help') {
        utils.log(`Rarity Autolevelling commands are:
    node index.js sum/summary                   - gives a summary of your characters
    node index.js gl/globalStats                - gives global stats (gold/materials1/number of token of each classes)
    node index.js xp                            - claim xp/level up/gold collection/dungeon/transferToMule - one off
    node index.js auto                          - automatic repeating xp/levelling/gold collection/dungeon/transferToMule
    node index.js utl/updateTokenList           - update the token id list in .env file
    node index.js dgl/dgList                    - get list of available dungeon
    node index.js cl/classList                  - get list of available class
    node index.js tl/templateList               - get list of available template
    node index.js ap/assignPoint <name> [token] - apply template <name> to all characters or to a specific [token]
    node index.js scout <name> [token]          - scout <name> dungeon with all characters or with a specific [token]
    node index.js dg <name> [token]             - go in <name> dungeon with all characters or with a specific [token]
    node index.js sm [class] [quantity]         - summon [quantity=1] of [class=all]
    node index.js tn/testNames <file>           - validate and check for availability of names in <file>  
    node index.js gp                            - get current gas price
    node index.js cn                            - get current nonce`)
    } else {
        if (constVal.debug){
            utils.log(`/!\\DEBUG ON/!\\`);
        }
        switch (args[0]) {
            case 'summary':
            case 'sum':
                await summary.charSummary();
                break;
            case 'xp':
                await autoRun(false);
                break;
            case 'auto':
                await autoRun(true);
                break;
            case 'updateTokenList':
            case 'utl':
                await core.updateTokenList();
                break;
            case 'dgList':
            case 'dgl':
                dungeon.displayAvailableDungeons();
                break;
            case 'scout':
                if (typeof args[1] === 'undefined'){
                    utils.log('You have to select a dungeon to scout');
                    dungeon.displayAvailableDungeons();
                } else {
                    let dungeonName = args[1];
                    let token = args[2];
                    await dungeon.scout(dungeonName, token);
                }
                break;
            case 'dg':
                if (typeof args[1] === 'undefined'){
                    utils.log('You have to select a dungeon to go');
                    dungeon.displayAvailableDungeons();
                } else {
                    let dungeonName = args[1];
                    let token = args[2];
                    await dungeon.doDungeon(dungeonName, token);
                }
                break;
            case 'classList':
            case 'cl':
                displayAvailableClasses();
                break;
            case 'sm':
                let className = typeof args[1] === 'undefined' ? "all" : args[1];
                let quantity = typeof args[2] === 'undefined' ? 1 : args[2];
                await core.massSummon(className, quantity);
                break;
            case 'testScrap':
            case 'ts':
                let resume = typeof args[1] !== 'undefined';
                await scrap.scrapData( resume ? scrapSqliteUtils.getMaxTokenId() : 0);
                break;
            case 'testScrapAddress':
            case 'tsa':
                if (typeof args[1] === 'undefined'){
                    utils.log("You must provide an address");
                } else {
                    await scrap.scrapDataFromAddress(args[1]);
                }
                break;
            case 'testData':
            case 'td':
                let minCount = typeof args[1] === 'undefined' ? -1 : args[1];
                let data = scrapSqliteUtils.getNumberOfTokenByAddress(minCount);
                for (let dat of data){
                    utils.log(dat);
                }
                break;
            case 'testDataAddress':
            case 'tda':
                if (typeof args[1] === 'undefined'){
                    utils.log("You must provide an address");
                } else {
                    console.log(await scrapSqliteUtils.getNumberOfTokenFromAddress(args[1]));
                }
                break;
            case 'globalStats':
            case 'gs':
                await getGlobalStats();
                break;
            case 'templateList':
            case 'tl':
                attribute.displayAvailableAttributeTemplate();
                break;
            case 'assignPoint':
            case 'ap':
                let template = args[1];
                let token = args[2];
                if (typeof template === 'undefined'){
                    utils.log('You have to select a template');
                    attribute.displayAvailableAttributeTemplate();
                } else {
                    await attribute.massAssignPoint(template, token);
                }
                break;
            case 'drop':
                let nonce = args[1];
                let count = args[2];
                await dropTransaction(nonce, count)
                break;
            case 'gp':
                let gas = await utils.calculateGasPrice();
                if (gas > 0){
                    gas = Math.floor(gas/(10**9));
                } else {
                    gas = Math.abs(gas);
                }
                utils.log(`current gasPrice => ${gas}`);
                utils.log(`current maxGasPrice => ${constVal.maxGasPrice/(10**9)}`);
                break;
            case 'cn':
                utils.log(`current nonce => ${await utils.nonceVal()}`);
                utils.log(`current transaction count => ${await constVal.account.getTransactionCount()}`);
                break;
            case 'testNames':
            case 'tn':
                if (typeof args[1] === 'undefined'){
                    utils.log('you need to pass a file');
                } else {
                    await name.massValidate(args[1]);
                }
                break;
            default:
                utils.log(`${args[0]} is not a valid command`)
                break;
        }
    }
}

init();


// Manifested READING FUNCTIONS: summoner(tokenid) just returns the currentxp, time of next xpgain, char class, level xp to next level
// Manifested READING FUNCTIONS: id(classnumber) returns the class of the rarity - same as the array above.
// Manifested READING FUNCTIONS: xp_required(current level) returns the total xp needed to level up (=curlvl*1000).
// Manifested READING FUNCTIONS: tokenURI(tokenID) returns a load of stuff... loads of it!

// Manifested WRITING FUNCTIONS: adventure(tokenid) gain XP per day - ~50k gas
// Manifested WRITING FUNCTIONS: spend_xp(tokenid, xp) spend xp (remember to multiply by 10e18) - not sure this gains anything though! BE CAREFUL
// Manifested WRITING FUNCTIONS: level_up(tokenid) lose XP to gain a level - ~30k gas
// Manifested WRITING FUNCTIONS: summon(class) mint a token

// Abilities READING FUNCTIONS: abilities_by_level(current level) just current level / 4
// Abilities READING FUNCTIONS: ability_scores(tokenid) returns all the stats: str, dex, const, int, wis, char
// Abilities READING FUNCTIONS: calc(score) some kind of increasing value starting from score 9 = 1 and increasing 
// Abilities READING FUNCTIONS: calculate_point_buy(str, dex, const, int, wis, char) sum of these calc() needs to be 32 - i.e. attributes get more expensive
// Abilities READING FUNCTIONS: character_created(tokenid) have you created the character or not

// Abilities WRITING FUNCTIONS: increase_strength(tokenid)... ditto dex, const, int, wis, char
// Abilities WRITING FUNCTIONS: point_buy(tokenid) mint a token




