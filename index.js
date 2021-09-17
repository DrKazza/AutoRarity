// YOU NEED TO CREATE A FILE CALLED .env
// it needs to have 5 variables
//
// WALLETADDRESS = '0xcABC123ABC123ABC123'
// SECRETKEY = 'house cards bakery muppet grizzly head tyre back face'
// TOKENIDS = '444,555,666'
// LIVETRADING = 'false'   change this to LIVETRADING = 'true' when you're ready to run
// MAXGAS = '250'  this defaults to 250 if you've not specified it
//
// the first is obviously your wallet
// the secret key is your phrase for your wallet so you can pay for gas
// the third is the ids of your rarity tokens, do not put a space between the commas 
// and the numbers and make sure you have the quote marks

const autoLevelUp = true; // you may not want to automatically level up your char

require("dotenv").config();




const ethers = require('ethers');
const constVal = require('./shared/const');
const delay = ms => new Promise(res => setTimeout(res, ms));
const summary = require('./base/summary.js');
const {contractAddresses} = require('./shared/contractAddresses.js');
const {getTokenList, updateDotEnvFile, getTokenCount} = require('./shared/tokenIdGetter.js');
const dungeons = require('./dungeons');
const utils = require('./shared/utils');

const earnXP = async (tokenID, nonceToUse)  => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            let contract = new ethers.Contract(contractAddresses.rarityManifested, contractAddresses.manifestABI, constVal.account);
            let approveResponse = await contract.adventure(
                tokenID,
                {
                    gasLimit: constVal.totalGasLimit,
                    gasPrice: thisGas,
                    nonce: nonceToUse
                });
            //console.log(approveResponse);
            return [true, 'success'];
        } else {
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const earnLevel = async (tokenID, nonceToUse)  => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            let contract = new ethers.Contract(contractAddresses.rarityManifested, contractAddresses.manifestABI, constVal.account);
            let approveResponse = await contract.level_up(
                tokenID,
                {
                    gasLimit: constVal.totalGasLimit,
                    gasPrice: thisGas,
                    nonce: nonceToUse
                });
            //console.log(approveResponse);
            return [true, 'success'];
        } else {
            console.log(`Live trading disabled - levelling NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const earnGold = async (tokenIDvalue, nonceToUse)  => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            let contract = new ethers.Contract(contractAddresses.rarityGold, contractAddresses.goldABI, constVal.account);
            let approveResponse = await contract.claim(
                tokenIDvalue,
                {
                    gasLimit: constVal.totalGasLimit,
                    gasPrice: thisGas,
                    nonce: nonceToUse
                });
            //console.log(approveResponse);
            return [true, 'success'];
        } else {
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const checkTokens = async () => {
    let latestNonce = await utils.nonceVal();
    let delayToUse = constVal.xpRetryDelay;
    let xpGains = [];
    let levelGains = [];
    let goldGains = [];
    for (let tokenID of constVal.myTokenIds) {
        let tokenStats = await summary.getStats(tokenID, contractAddresses.manifestABI, contractAddresses.rarityManifested);
        let xpCountdown = Math.floor(tokenStats[1] - Date.now() / 1000)
        let xpPending = 0
        if (xpCountdown < 0) {
            let xpEarnAttempt = await earnXP(tokenID, latestNonce)
            if (xpEarnAttempt[0]) {
                // success
                xpPending = 250;
                latestNonce++;
                xpGains.push(tokenID)
            } else if (xpEarnAttempt[1] === 'high gas') {
                // fail due to high gas price
                delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
            } else {
                console.log(`Live trading off - token ${tokenID} was not adventured`)
            }
        } else {
            delayToUse = Math.max(Math.min(xpCountdown, delayToUse), constVal.minimumDelay)
        }
        if (autoLevelUp) {
            if (tokenStats[4] <= (xpPending + tokenStats[0])) {
                if (tokenStats[0] < tokenStats[4]) {
                    // so we can level up but only when the last adventuring has been registered
                    // don't do anything but set a short delay to try again when xpPending is 0
                    delayToUse = Math.max(Math.min(constVal.xpPendingDelay, delayToUse), constVal.minimumDelay)
                } else {
                    // try to levelup
                    let lvlEarnAttempt = await earnLevel(tokenID, latestNonce)
                    if (lvlEarnAttempt[0]) {
                        levelGains.push(tokenID);
                        latestNonce++;
                    } else if (lvlEarnAttempt[1] === 'high gas') {
                        // fail due to high gas price
                        delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
                    } else {
                        console.log(`Live trading off - token ${tokenID} was not levelled up`)
                    }
                }
            } else {
                // not ready to level up - do nothing
            }
        }
        if ((await summary.getGoldStats(tokenID, contractAddresses.goldABI, contractAddresses.rarityGold)[1] ) > 0) {
            let goldEarnAttempt = await earnGold(tokenID, latestNonce)
            if (goldEarnAttempt[0]) {
                goldGains.push(tokenID);
                latestNonce++;
            } else if (goldEarnAttempt[1] === 'high gas') {
                // fail due to high gas price
                delayToUse = Math.max(Math.min(constVal.gasRetryDelay, delayToUse), constVal.minimumDelay)
            } else {
                console.log(`Live trading off - token ${tokenID} did not claim gold`)
            }
        }
    }
    return [delayToUse, xpGains, levelGains, goldGains];
}

const autoRun = async (repeater) => {
    while (true) {
        let transactionPerformed = false;
        let tokenCheck = await checkTokens()
        if (tokenCheck[1].length !== 0) {
            transactionPerformed = true;
            console.log(`Successfully adventured:`)
            for (let thistok of tokenCheck[1]) {console.log(thistok)}
        }
        if (tokenCheck[2].length !== 0) {
            transactionPerformed = true;
            console.log(`Successfully Levelled:`)
            for (let thistok of tokenCheck[2]) {console.log(thistok)}
        }
        if (tokenCheck[3].length !== 0) {
            transactionPerformed = true;
            console.log(`Successfully Claimed Gold:`)
            for (let thistok of tokenCheck[3]) {console.log(thistok)}
        }
        if (!transactionPerformed){console.log(`Nothing to do...`)}
        let textTimeleft = utils.secsToText(tokenCheck[0])
        if (repeater) {
            console.log(`retrying in = ${textTimeleft[0]}h${textTimeleft[1]}m`);
            await delay(tokenCheck[0]*1000);
        } else {
            break;
        }
    }
}

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

const dungeon = async (dungeonName, token) => {
    if (!dungeons.isDungeonAvailable(dungeonName)) {
        console.log(`This dungeon is not implemented yet [${dungeonName}]`);
        displayAvailableDungeons();
    } else {
        if (typeof token === 'undefined'){
            for (let token of constVal.myTokenIds){
                await dungeons.runDungeon(dungeonName, token);
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

const summon = async (classToSummon, nonceVal, i = 0) => {
    if (typeof nonceVal === 'undefined'){
        nonceVal = utils.nonceVal()
    }
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`#${i+1} => Gas Price too high: ${-thisGas}`)
        return false;
    } else {
        if (constVal.liveTrading) {
            try {

                let contract = new ethers.Contract(contractAddresses.rarityManifested, contractAddresses.manifestABI, constVal.account);
                let approveResponse = await contract.summon(
                    classToSummon,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: utils.calculateGasPrice(),
                        nonce: nonceVal
                    });
                console.log(`#${i+1} => transaction hash => ${approveResponse.hash}`);
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        }else {
            console.log(`#${i+1} => Live trading disabled - summoning NOT submitted.`)
            return true;
        }
    }
}

const massSummon = async (classToSummon = "all", quantity = 1, isMass = false, nonce) => {
    let result;
    let newToken = 0;
    let originalTokenCount = await getTokenCount(constVal.walletAddress);
    if (classToSummon !== "all"){
        let classId = constVal.classes.indexOf(classToSummon);
        if (classId === -1 || classId === 0){
            console.log(`Unknown class [${classToSummon}]`);
            return;
        }
        if (typeof nonce === 'undefined'){
            nonce = {
                value : await utils.nonceVal()
            };
        }
        result = {
            success: 0,
            fail: 0
        };
        let i = 0;
        console.log(`Start summoning of ${quantity} ${classToSummon}`);
        while (i < quantity) {
            console.log(`#${i+1} => summoning...`);
            let res = await summon(classId, nonce.value, i);
            if (res){
                result.success++;
                console.log(`#${i+1} => summon success`);
            } else {
                result.fail++;
                console.log(`#${i+1} => summon fail`);
            }
            await utils.sleep(1000);
            nonce.value++;
            i++;
        }
    } else {
        console.log(`Start summoning ${quantity} of each classes`)
        nonce = {
            value : await utils.nonceVal()
        };
        for (let cl of constVal.classes){
            if (cl !== 'noClass'){
                newToken += await massSummon(cl, quantity, true, nonce);
            }
        }
    }
    if (typeof result !== "undefined"){
        console.log(`Result Class [${classToSummon}] | Quantity [${quantity}]:`)
        console.log(` - success : ${result.success}`)
        console.log(` - fail : ${result.fail}`)
    }

    if (!isMass){
        let newTotal = classToSummon === "all" ? (originalTokenCount + newToken) : (originalTokenCount + result.success);
        let currentCount = 0;
        do {
            if (currentCount !== 0){
                console.log("Waiting a bit to let the transaction spread...")
                await utils.sleep(10000);
            }
            console.log("Fetching token count...")
            currentCount = await getTokenCount(constVal.walletAddress);
            console.log(`CurrentCount => ${currentCount} of ${newTotal}`)
        } while (currentCount < newTotal)

        console.log("Updating token list...")
        await updateTokenList();
    } else {
        return result.success;
    }
}

const displayAvailableClasses = () => {
    console.log('Available classes:');
    for (let cl of constVal.classes){
        if (cl !== 'noClass')
            console.log(` - ${cl}`);
    }
}

const updateTokenList = async () => {
    let tokens = await getTokenList(constVal.walletAddress);
    await updateDotEnvFile(tokens);
}

const init = async () => {
    if (typeof process.argv[2] === 'undefined' || process.argv[2] === 'help') {
        console.log(`Rarity Autolevelling commands are:
    node index.js sum/summary           - gives a summary of your characters
    node index.js xp                    - claim xp/level up/gold collection/dungeoneering - one off
    node index.js auto                  - automatic repeating xp/levelling/gold collection/[dungeoneering]
    node index.js utl/updateTokenList   - update the token id list in .env file
    node index.js dgl/dgList            - get list of available dungeon
    node index.js cl/classList          - get list of available class
    node index.js scout <name> [token]  - scout <name> dungeon with all characters or with a specific [token]
    node index.js dg <name> [token]     - go in <name> dungeon with all characters or with a specific [token]
    node index.js sm [class] [quantity] - summon [quantity=1] of [class=all]`)
    } else {
        switch (process.argv[2]) {
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
                await updateTokenList();
                break;
            case 'dgList':
            case 'dgl':
                displayAvailableDungeons();
                break;
            case 'scout':
                if (typeof process.argv[3] === 'undefined'){
                    console.log('You have to select a dungeon to scout');
                    displayAvailableDungeons();
                } else {
                    let dungeonName = process.argv[3];
                    let token = process.argv[4];
                    await scout(dungeonName, token);
                }
                break;
            case 'dg':
                if (typeof process.argv[3] === 'undefined'){
                    console.log('You have to select a dungeon to go');
                    displayAvailableDungeons();
                } else {
                    let dungeonName = process.argv[3];
                    let token = process.argv[4];
                    await dungeon(dungeonName, token);
                }
                break;
            case 'classList':
            case 'cl':
                displayAvailableClasses();
                break;
            case 'sm':
                let className = typeof process.argv[3] === 'undefined' ? "all" : process.argv[3];
                let quantity = typeof process.argv[4] === 'undefined' ? 1 : process.argv[4];
                await massSummon(className, quantity);
                break;
            case 'testScrap':
                await require('./scrap').scrapData();
                break;
            case 'testData':
                let data = require('./scrap/JsonUtils').getDataFromFile();
                let acc = []
                data.accounts.forEach(value => {
                    acc.push({addr : value.address, count:value.tokens.length});
                });
                acc.sort((a,b) => a.count - b.count );
                for (let ac of acc){
                    console.log(ac);
                }
                break;
            default:
                console.log(`${process.argv[2]} is not a valid command`)
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




