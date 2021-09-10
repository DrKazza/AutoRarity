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
const totalGasLimit = 75000 // 50,000 seems sensible for general xping up and 30,000 seems right for levelling
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
if (maxGasPxVar === undefined){maxGasPx = defaultMaxGasPx} else {maxGasPx = number(maxGasPxVar)}


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

const calculateGasPrice = async () => {
    let spotPx = await web3.eth.getGasPrice();
    let spotPxBN = ethers.BigNumber.from(spotPx.toString())
    if (spotPxBN.gte(maxGasPrice)) {
        return -1
    } else {
        return spotPxBN
    }
}

const nonceVal = async () => {
    baseNonce = await provider.getTransactionCount(walletAddress, "pending");
    return baseNonce
}

const rarityManifested = '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb';  // main contract to summon and level up
const manifestABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"}],"name":"leveled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"class","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"}],"name":"summoned","type":"event"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"adventure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"adventurers_log","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"class","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"classes","outputs":[{"internalType":"string","name":"description","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"level","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"level_up","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"next_summoner","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"},{"internalType":"uint256","name":"_xp","type":"uint256"}],"name":"spend_xp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_class","type":"uint256"}],"name":"summon","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"summoner","outputs":[{"internalType":"uint256","name":"_xp","type":"uint256"},{"internalType":"uint256","name":"_log","type":"uint256"},{"internalType":"uint256","name":"_class","type":"uint256"},{"internalType":"uint256","name":"_level","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"xp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"curent_level","type":"uint256"}],"name":"xp_required","outputs":[{"internalType":"uint256","name":"xp_to_next_level","type":"uint256"}],"stateMutability":"pure","type":"function"}];

const rarityAttributes = '0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1'; // the contract to increase attributes
const attributesABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"},{"indexed":false,"internalType":"uint32","name":"strength","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"dexterity","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"constitution","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"intelligence","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"wisdom","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"charisma","type":"uint32"}],"name":"Created","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"leveler","type":"address"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"},{"indexed":false,"internalType":"uint32","name":"strength","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"dexterity","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"constitution","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"intelligence","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"wisdom","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"charisma","type":"uint32"}],"name":"Leveled","type":"event"},{"inputs":[{"internalType":"uint256","name":"current_level","type":"uint256"}],"name":"abilities_by_level","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"ability_scores","outputs":[{"internalType":"uint32","name":"strength","type":"uint32"},{"internalType":"uint32","name":"dexterity","type":"uint32"},{"internalType":"uint32","name":"constitution","type":"uint32"},{"internalType":"uint32","name":"intelligence","type":"uint32"},{"internalType":"uint32","name":"wisdom","type":"uint32"},{"internalType":"uint32","name":"charisma","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"score","type":"uint256"}],"name":"calc","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_str","type":"uint256"},{"internalType":"uint256","name":"_dex","type":"uint256"},{"internalType":"uint256","name":"_const","type":"uint256"},{"internalType":"uint256","name":"_int","type":"uint256"},{"internalType":"uint256","name":"_wis","type":"uint256"},{"internalType":"uint256","name":"_cha","type":"uint256"}],"name":"calculate_point_buy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"character_created","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_charisma","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_constitution","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_dexterity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_intelligence","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_strength","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_wisdom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"level_points_spent","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"},{"internalType":"uint32","name":"_str","type":"uint32"},{"internalType":"uint32","name":"_dex","type":"uint32"},{"internalType":"uint32","name":"_const","type":"uint32"},{"internalType":"uint32","name":"_int","type":"uint32"},{"internalType":"uint32","name":"_wis","type":"uint32"},{"internalType":"uint32","name":"_cha","type":"uint32"}],"name":"point_buy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];

const classes = ['noClass', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rouge', 'Sorcerer', 'Wizard']; // yes I know I spelled it Rouge - GFY

// Function descriptions at the bottom

const getStats = async (tokenIDvalue) => {
    let contract = new web3.eth.Contract(manifestABI, rarityManifested);
    let tokenStats = await contract.methods.summoner(tokenIDvalue).call();
    tokenStats[4] = await contract.methods.xp_required(tokenStats[3]).call();
    // tokenStats will return [currentxp, time of next xpgain, char class, level, xp to next level]
    return tokenStats;
} 

const timeLeft = (timestamp) => {
    let rightNow = Date.now()/1000
    let timeleft = timestamp - rightNow
    if (timeleft < 0) {
        return [-1,0]
    } else {
        [hrs, mins] = secsToText(timeleft)
        return [hrs, mins, timeleft]
    }
}

const secsToText = (secs) => {
    hrs = Math.floor(secs / 60 / 60)
    mins = Math.floor((secs / 60 - hrs * 60))
    return [hrs, mins]
}

const earnXP = async (tokenIDvalue, nonceToUse)  => {
    let thisGas = await calculateGasPrice()
    if (thisGas === -1) {
        console.log(`Gas Price too high`)
        return [false, 'high gas']
    } else {
        if (liveTrading) {
            let contract = new ethers.Contract(rarityManifested, manifestABI, account);
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
    if (thisGas === -1) {
        console.log(`Gas Price too high`)
        return [false, 'high gas']
    } else {
        if (liveTrading) {
            let contract = new ethers.Contract(rarityManifested, manifestABI, account);
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
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const checkTokens = async () => {
    let latestNonce = await nonceVal();
    let delayToUse = xpRetryDelay;
    var xpGains = [];
    var levelGains = [];
    for (var tokenID of myTokenIds) {
        tokenStats = await getStats(tokenID);
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
                    } else if (xpEarnAttempt[1] === 'high gas') {
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
    }
    return [delayToUse, xpGains, levelGains];
}

const tokenStatus = async () => {
    for (var tokenID of myTokenIds) {
        let tokenStats = await getStats(tokenID)
        let timeleft = timeLeft(tokenStats[1])
        if (timeleft[0] < 0) {
            console.log(`Token: ${tokenID}, Lvl ${tokenStats[3]}, currentXP ${Math.floor(tokenStats[0]/10**18)}/${Math.floor(tokenStats[4]/10**18)} - Ready to get XP`)
        } else {
            console.log(`Token: ${tokenID}, Lvl ${tokenStats[3]}, currentXP ${Math.floor(tokenStats[0]/10**18)}/${Math.floor(tokenStats[4]/10**18)}, next XP in ${timeleft[0]}h${timeleft[1]}m`)
        }
    }
}

const init = async () => {
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
        if (!transactionPerformed){console.log(`Nothing to do...`)}
        textTimeleft = secsToText(tokenCheck[0])
        console.log(`retrying in = ${textTimeleft[0]}h${textTimeleft[1]}m`)
        await delay(tokenCheck[0]*1000);
    }
}

//tokenStatus(); 
// uncomment this to get a summary of your tokens - remember to comment the init funciton below
init();


// Manifested READING FUNCTIONS: summoner(tokenid) just returns the currentxp, time of next xpgain, char class, level xp to next level
// Manifested READING FUNCTIONS: id(classnumber) returns the class of the rarity - same as the array above.
// Manifested READING FUNCTIONS: xp_required(current level) returns the total xp needed to level up (=curlvl*1000).
// Manifested READING FUNCTIONS: tokenURI(tokenID) returns a load of stuff... loads of it!

// Manifested WRITING FUNCTIONS: adventure(tokenid) gain XP per day
// Manifested WRITING FUNCTIONS: spend_xp(tokenid, xp) spend xp (remember to multiply by 10e18) - not sure this gains anything though! BE CAREFUL
// Manifested WRITING FUNCTIONS: level_up(tokenid) lose XP to gain a level
// Manifested WRITING FUNCTIONS: summon(class) mint a token

