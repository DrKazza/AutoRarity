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
const defaultMaxGasPx = 250 // usually 50-100, sometimes this spikes to nearly 200
var dummyTokenIds = '111,222,333'; // just in case you forget to specify
const xpRetryDelay = 24 * 60 * 60 // 1 day in seconds - try to level up every 24hrs
const gasRetryDelay = 5 * 60 // if gas is too expenive then try again in 5 mins
const xpPendingDelay = 2 * 60 // if you're waiting for xp to be earned before levelling up then try again in 2 mins
const minimumDelay = 60 // don't repeat too often
// Don't set the delays too short or you'll keep tryingt to XP up and just burn gas for no reason
const totalGasLimit = 125000 // 50,000 seems sensible for general xping up and 30,000 seems right for levelling, claim gold is ~100k
const parseBool = (val) => {return val === true || val === 'true'}


require("dotenv").config();
var myTokenIds = [];
const secretKey = process.env.SECRETKEY;
const walletAddress = process.env.WALLETADDRESS;

const importedTokenIds = process.env.TOKENIDS;
if (importedTokenIds === undefined) {
    myTokenIds = dummyTokenIds.split(",");
    console.log(`Did you forget to specify your tokens in the .env file?`)
    process.exit(0)
} else {myTokenIds = importedTokenIds.split(",");}

const liveTradingVar = process.env.LIVETRADING;
if (liveTradingVar === undefined){liveTrading = false} else {liveTrading = parseBool(liveTradingVar)}

const maxGasPxVar = process.env.MAXGAS;
if (maxGasPxVar === undefined){maxGasPx = defaultMaxGasPx} else {maxGasPx = Number(maxGasPxVar)}

const Web3 = require('web3');
const ethers = require('ethers');
var url = 'https://rpc.ftm.tools/'; 
var web3 = new Web3(url);
const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider(url);
const wallet = ethers.Wallet.fromMnemonic(secretKey);
const account = wallet.connect(provider);
const maxGasPrice = ethers.utils.parseUnits(maxGasPx.toString(), 9);
const delay = ms => new Promise(res => setTimeout(res, ms));
const summary = require('./summary.js');
const {contractAddresses} = require('./contractAddresses.js');

const calculateGasPrice = async () => {
    let spotPx = await web3.eth.getGasPrice();
    let spotPxBN = ethers.BigNumber.from(spotPx.toString())
    if (spotPxBN.gte(maxGasPrice)) {
        return -(Math.floor(spotPx/(10**9)))
    } else {
        return spotPxBN
    }
}

const nonceVal = async () => {
    baseNonce = await provider.getTransactionCount(walletAddress, "pending");
    return baseNonce
}

const earnXP = async (tokenIDvalue, nonceToUse)  => {
    let thisGas = await calculateGasPrice()
    if (thisGas < 0) {
        console.log(`Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (liveTrading) {
            let contract = new ethers.Contract(contractAddresses.rarityManifested, contractAddresses.manifestABI, account);
            let approveResponse = await contract.adventure(
                tokenIDvalue,
                {
                    gasLimit: totalGasLimit, 
                    gasPrice: thisGas,
                    nonce: nonceToUse
                });
            console.log(approveResponse);
            return [true, 'success'];
        } else {
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const earnLevel = async (tokenIDvalue, nonceToUse)  => {
    let thisGas = await calculateGasPrice()
    if (thisGas < 0) {
        console.log(`Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (liveTrading) {
            let contract = new ethers.Contract(contractAddresses.rarityManifested, contractAddresses.manifestABI, account);
            let approveResponse = await contract.level_up(
                tokenIDvalue,
                {
                    gasLimit: totalGasLimit, 
                    gasPrice: thisGas,
                    nonce: nonceToUse
                });
            console.log(approveResponse);
            return [true, 'success'];
        } else {
            console.log(`Live trading disabled - levelling NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const earnGold = async (tokenIDvalue, nonceToUse)  => {
    let thisGas = await calculateGasPrice()
    if (thisGas < 0) {
        console.log(`Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (liveTrading) {
            let contract = new ethers.Contract(contractAddresses.rarityGold, contractAddresses.goldABI, account);
            let approveResponse = await contract.claim(
                tokenIDvalue,
                {
                    gasLimit: totalGasLimit, 
                    gasPrice: thisGas,
                    nonce: nonceToUse
                });
            console.log(approveResponse);
            return [true, 'success'];
        } else {
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const scoutDungeon = async (tokenIDvalue, dungeonABI, dungeonAddress) => {
    let contract = new web3.eth.Contract(dungeonABI, dungeonAddress);
    let lootgained = await contract.methods.scout(tokenIDvalue).call();
    return lootgained
}

const runDungeon = async (tokenIDvalue, dungeonABI, dungeonAddress) => {
    let thisGas = await calculateGasPrice()
    if (thisGas < 0) {
        console.log(`Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (liveTrading) {
            let contract = new ethers.Contract(dungeonAddress, dungeonABI, account);
            let approveResponse = await contract.adventure(
                tokenIDvalue,
                {
                    gasLimit: totalGasLimit, 
                    gasPrice: thisGas,
                    nonce: nonceToUse
                });
            console.log(approveResponse);
            return [true, 'success'];
        } else {
            console.log(`Live trading disabled - dungeoneering NOT submitted.`)
            return [false, 'not live'];
        }
    }
    




}

const checkAndRunDungeon = async (dungeon) => {
    dungeon = dungeon.toLowerCase();
    let dungeonABI = contractAddresses[(dungeon+'ABI')];
    let dungeonAddress = contractAddresses[('rarity'+ dungeon[0].toUpperCase() + dungeon.substring(1))];
    let lootgained = await scoutDungeon(tokenID, dungeonABI, dungeonAddress)
    if (lootgained > 0) {

    } else {
        //not strong enough to run the dungeon
    }








}




const checkTokens = async () => {
    let latestNonce = await nonceVal();
    let delayToUse = xpRetryDelay;
    var xpGains = [];
    var levelGains = [];
    var goldGains = [];
    for (var tokenID of myTokenIds) {
        tokenStats = await summary.getStats(tokenID, contractAddresses.manifestABI, contractAddresses.rarityManifested);
        xpCountdown = Math.floor(tokenStats[1] - Date.now() / 1000)
        xpPending = 0
        if (xpCountdown < 0) {
            let xpEarnAttempt = await earnXP(tokenID, latestNonce)
            if (xpEarnAttempt[0]) {
                // success
                xpPending = 250;
                latestNonce++;
                xpGains.push(tokenID)
            } else if (xpEarnAttempt[1] === 'high gas') {
                // fail due to high gas price
                delayToUse = Math.max(Math.min(gasRetryDelay, delayToUse), minimumDelay)
            } else {
                console.log(`Live trading off - token ${tokenID} was not adventured`)
            }
        } else {
            delayToUse = Math.max(Math.min(xpCountdown, delayToUse), minimumDelay)
        }
        if (autoLevelUp) {
            if (tokenStats[4] <= (xpPending + tokenStats[0])) {
                if (tokenStats[0] < tokenStats[4]) {
                    // so we can level up but only when the last adventuring has been registered
                    // don't do anything but set a short delay to try again when xpPending is 0
                    delayToUse = Math.max(Math.min(xpPendingDelay, delayToUse), minimumDelay)
                } else {
                    // try to levelup
                    let lvlEarnAttempt = await earnLevel(tokenID, latestNonce)
                    if (lvlEarnAttempt[0]) {
                        levelGains.push(tokenID);
                        latestNonce++;
                    } else if (lvlEarnAttempt[1] === 'high gas') {
                        // fail due to high gas price
                        delayToUse = Math.max(Math.min(gasRetryDelay, delayToUse), minimumDelay)
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
                delayToUse = Math.max(Math.min(gasRetryDelay, delayToUse), minimumDelay)
            } else {
                console.log(`Live trading off - token ${tokenID} did not claim gold`)
            }    
        }
    }
    return [delayToUse, xpGains, levelGains, goldGains];
}

const autoRun = async (repeater) => {
    while (true) {
        transactionPerformed = false;
        tokenCheck = await checkTokens()
        if (tokenCheck[1].length != 0) {
            transactionPerformed = true;
            console.log(`Successfully adventured:`)
            for (let thistok of tokenCheck[1]) {console.log(thistok)}
        }
        if (tokenCheck[2].length != 0) {
            transactionPerformed = true;
            console.log(`Successfully Levelled:`)
            for (let thistok of tokenCheck[2]) {console.log(thistok)}
        }
        if (tokenCheck[3].length != 0) {
            transactionPerformed = true;
            console.log(`Successfully Claimed Gold:`)
            for (let thistok of tokenCheck[3]) {console.log(thistok)}
        }
        if (!transactionPerformed){console.log(`Nothing to do...`)}
        textTimeleft = summary.secsToText(tokenCheck[0])
        if (repeater) {
            console.log(`retrying in = ${textTimeleft[0]}h${textTimeleft[1]}m`);
            await delay(tokenCheck[0]*1000);
        } else {
            break;
        }
    }
}

const init = async () => {
    if (process.argv[2] == undefined || process.argv[2] == 'help') {
        console.log(`Rarity Autolevelling commands are:
        node index.js summary    - gives a summary of your characters
        node index.js xp         - claim xp/level up/gold collection/dungeoneering - one off
        node index.js auto       - automatic repeating xp/levelling/gold collection/[dungeoneering]
        node index.js cellar     - run the cellar dungeon only. (not working yet!)`)
    } else {
        switch (process.argv[2]) {
            case 'summary':
                summary.charSummary(myTokenIds, contractAddresses);
                break;
            case 'xp':
                autoRun(false);
                break;
            case 'auto':
                autoRun(true);
                break;
            case 'cellar':
                scout('cellar')
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




