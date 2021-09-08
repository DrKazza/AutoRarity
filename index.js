// YOU NEED TO CREATE A FILE CALLED .env
// it needs to have 3 variables
//
// WALLETADDRESS = '0xcABC123ABC123ABC123'
// SECRETKEY = 'house cards bakery muppet grizzly head tyre back face'
// TOKENIDS = '444,555,666'
//
// the first is obviously your wallet
// the secret key is your phrase for your wallet so you can pay for gas
// the third is the ids of your rarity tokens, do not put a space between the commas 
// and the numbers and make sure you have the quote marks

const liveTrading = false;
const maxGasPx = 250 // usually 50, sometimes this spikes to nearly 200
var dummyTokenIds = '111,222,333';


require("dotenv").config();
var myTokenIds = [];

const secretKey = process.env.SECRETKEY;
const walletAddress = process.env.WALLETADDRESS;
const importedTokenIds = process.env.TOKENIDS;

if (importedTokenIds === undefined) {
    // no imported TokenIds so use the default ones above
    // this just splits a text input into an array
    myTokenIds = dummyTokenIds.split(",");
} else {
    // this just splits a text input into an array
    myTokenIds = importedTokenIds.split(",");
}

const Web3 = require('web3');
const ethers = require('ethers');
var url = 'https://rpc.ftm.tools/'; 
var web3 = new Web3(url);
const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider(url);
const wallet = ethers.Wallet.fromMnemonic(secretKey);
const account = wallet.connect(provider);


const maxGasPrice = ethers.utils.parseUnits(maxGasPx.toString(), 9);
const totalGasLimit = 75000 // 65,000 seems sensible for general xping up

const calculateGasPrice = async () => {
    let spotPx = await web3.eth.getGasPrice();
    let spotPxBN = ethers.BigNumber.from(spotPx.toString())
    if (spotPxBN.gte(maxGasPrice)) {
        console.log(`Gas Price: ${spotPxBN}, Max Gas: ${maxGasPrice}`)
        return -1
    } else {
        return spotPxBN
    }
}

const nonceVal = async () => {
    baseNonce = await provider.getTransactionCount(walletAddress, "pending");
    console.log(`Nonce: ${baseNonce}`)
    return baseNonce
}



const rarityManifested = '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb';  // main contract to summon and level up
var manifestABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"}],"name":"leveled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"class","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"}],"name":"summoned","type":"event"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"adventure","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"adventurers_log","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"class","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"classes","outputs":[{"internalType":"string","name":"description","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"level","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"level_up","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"next_summoner","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"},{"internalType":"uint256","name":"_xp","type":"uint256"}],"name":"spend_xp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_class","type":"uint256"}],"name":"summon","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"summoner","outputs":[{"internalType":"uint256","name":"_xp","type":"uint256"},{"internalType":"uint256","name":"_log","type":"uint256"},{"internalType":"uint256","name":"_class","type":"uint256"},{"internalType":"uint256","name":"_level","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"xp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"curent_level","type":"uint256"}],"name":"xp_required","outputs":[{"internalType":"uint256","name":"xp_to_next_level","type":"uint256"}],"stateMutability":"pure","type":"function"}];

const rarityAttributes = '0xB5F5AF1087A8DA62A23b08C00C6ec9af21F397a1'; // the contract to increase attributes
var attributesABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"},{"indexed":false,"internalType":"uint32","name":"strength","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"dexterity","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"constitution","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"intelligence","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"wisdom","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"charisma","type":"uint32"}],"name":"Created","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"leveler","type":"address"},{"indexed":false,"internalType":"uint256","name":"summoner","type":"uint256"},{"indexed":false,"internalType":"uint32","name":"strength","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"dexterity","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"constitution","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"intelligence","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"wisdom","type":"uint32"},{"indexed":false,"internalType":"uint32","name":"charisma","type":"uint32"}],"name":"Leveled","type":"event"},{"inputs":[{"internalType":"uint256","name":"current_level","type":"uint256"}],"name":"abilities_by_level","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"ability_scores","outputs":[{"internalType":"uint32","name":"strength","type":"uint32"},{"internalType":"uint32","name":"dexterity","type":"uint32"},{"internalType":"uint32","name":"constitution","type":"uint32"},{"internalType":"uint32","name":"intelligence","type":"uint32"},{"internalType":"uint32","name":"wisdom","type":"uint32"},{"internalType":"uint32","name":"charisma","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"score","type":"uint256"}],"name":"calc","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_str","type":"uint256"},{"internalType":"uint256","name":"_dex","type":"uint256"},{"internalType":"uint256","name":"_const","type":"uint256"},{"internalType":"uint256","name":"_int","type":"uint256"},{"internalType":"uint256","name":"_wis","type":"uint256"},{"internalType":"uint256","name":"_cha","type":"uint256"}],"name":"calculate_point_buy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"character_created","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_charisma","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_constitution","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_dexterity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_intelligence","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_strength","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"increase_wisdom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"level_points_spent","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"},{"internalType":"uint32","name":"_str","type":"uint32"},{"internalType":"uint32","name":"_dex","type":"uint32"},{"internalType":"uint32","name":"_const","type":"uint32"},{"internalType":"uint32","name":"_int","type":"uint32"},{"internalType":"uint32","name":"_wis","type":"uint32"},{"internalType":"uint32","name":"_cha","type":"uint32"}],"name":"point_buy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_summoner","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];

var classes = ['noClass', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rouge', 'Sorcerer', 'Wizard']; // yes I know I spelled it Rouge - GFY

// READING FUNCTIONS: summoner(tokenid) just returns the current experience the log_id the character class and the level
// READING FUNCTIONS: id(classnumber) returns the class of the rarity - same as the array above.
// READING FUNCTIONS: xp_required(current level) returns the total xp needed to level up (=curlvl*1000).
// READING FUNCTIONS: tokenURI(tokenID) returns a load of stuff... loads of it!

// WRITING FUNCTIONS: adventure(tokenid) gain XP per day
// WRITING FUNCTIONS: spend_xp(tokenid, xp) spend xp (remember to multiply by 10e18)
// WRITING FUNCTIONS: level_up(tokenid) lose XP to gain a level
// WRITING FUNCTIONS: summon(class) mint a token


const getXP = async (tokenIDvalue) => {
    let contract = new web3.eth.Contract(manifestABI, rarityManifested);
    summoner = await contract.methods.summoner(tokenIDvalue).call();
    cur_xp = summoner[0]
    log_id = summoner[1]
    charclass = summoner[2]
    level = summoner[3]
    xp_req = await contract.methods.xp_required(level).call()
    cur_xp = cur_xp / (10**18);
    xp_req = xp_req / (10**18);
    return [level, cur_xp, xp_req, charclass, log_id];
} 

const readyForAdventuring = async (tokenIDvalue) => {
    readytime = await getXP(tokenIDvalue)
    if ((Date.now()/1000) > readytime[4]) {
        return (true)
    } else {return (false)}

}

const earnXP = async (tokenIDvalue, nonceToUse)  => {
    let contract = new ethers.Contract(rarityManifested, manifestABI, account);
    let thisGas = await calculateGasPrice()
    if (thisGas === -1) {
        console.log(`Gas Price too high`)
        return [false, tokenIDvalue, 'gas']
    } else {
//        console.log(`Gas Price = ${thisGas}`)
        if (await readyForAdventuring(tokenIDvalue)) {
            if (liveTrading) {
                let approveResponse = await contract.adventure(
                    tokenIDvalue,
                    {
                        gasLimit: totalGasLimit, 
                        gasPrice: thisGas,
                        nonce: nonceToUse
                    });
                console.log(approveResponse);
                return [true, tokenIDvalue, 0];
            } else {
                console.log(`Live trading disabled - adventuring NOT submitted.`)
                return [true, tokenIDvalue, 0];
            }
        } else {
//            console.log(`Too early for this one to level up`)
            return [false, tokenIDvalue, 'timing']
        }
    }
}

const sayTime = (timestamp) => {
    let rightNow = Date.now()/1000
    let timeleft = timestamp - rightNow
    if (timeleft < 0) {
        return [-1,0]
    } else {
        hrs = Math.floor(timeleft / 60 / 60)
        mins = Math.floor((timeleft / 60 - hrs * 60))
        return [hrs,mins]
    }
}

const init = async () => {
    for (const tokenID of myTokenIds) {
        result = await getXP(tokenID)
        let timeleft = sayTime(result[4])
        if (timeleft[0] < 0 ) {
            console.log(`${classes[result[3]]} (Token:${tokenID}) is Level ${result[0]} and has ${result[1]}XP, ${result[2]}XP needed to next level, READY TO GAIN XP`);
        } else {
            console.log(`${classes[result[3]]} (Token:${tokenID}) is Level ${result[0]} and has ${result[1]}XP, ${result[2]}XP needed to next level, Time before next xp ${timeleft[0]}h${timeleft[1]}m`);
        }
    }
    var successTokens = [];
    var failTokens = [];
    var tooEarlyTokens = [];
    let latestNonce = await nonceVal();

    for (var tokenID of myTokenIds) {
        var tmp = await earnXP(tokenID, latestNonce);
        if (tmp[0]) {
            successTokens.push(tokenID);
            latestNonce++;
        } else if (tmp[2] === 'timing') {
            tooEarlyTokens.push(tokenID);            
        } else {
            failTokens.push(tokenID);
        }
    }
    if (successTokens.length != 0) {
        console.log(`Successfully adventured:`)
        for (var thistok of successTokens) {console.log(thistok)}
        console.log(`\n`)
    }
    if (tooEarlyTokens.length != 0) {
        console.log(`Too Early to Level:`)
        for (var thistok of tooEarlyTokens) {console.log(thistok)}
        console.log(`\n`)
    }
    
    if (failTokens.length != 0) {
        console.log(`Failed to adventure:`)
        let textstring = ''
        for (var i in failTokens) {
            if (i>0) {
                textstring += ','
            }
            textstring += failTokens[i].toString()
            console.log(failTokens[i])
        }
        console.log(textstring)
        console.log(`\n`)
    }
}

init();