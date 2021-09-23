const {contractAddresses} = require('../shared/contractAddresses');
const utils = require("../shared/utils");
const logUtils = require("../shared/logUtils");
const constVal = require("../shared/const");
const ethers = require("ethers");
const tokenGetter = require("../shared/tokenIdGetter.js");
const abi =contractAddresses.manifestABI;
const address = contractAddresses.rarityManifested;

let contractGetStats;
let contractClaimXp;
let contractLevelUp;
let contractSummon;

const getStats = async (tokenID) => {
    if (typeof contractGetStats === 'undefined') {
        contractGetStats = new utils.web3.eth.Contract(abi, address);
    }
    let tokenStats = await contractGetStats.methods.summoner(tokenID).call();
    tokenStats[4] = await contractGetStats.methods.xp_required(tokenStats[3]).call();
    // tokenStats will return [currentxp, time of next xpgain, char class, level, xp to next level]
    return tokenStats;
}

const claimXp = async (tokenID, nonce)  => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenID} => xp => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractClaimXp === 'undefined') {
                    contractClaimXp = new ethers.Contract(address, abi, constVal.account);
                }
                let approveResponse = await contractClaimXp.adventure(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                logUtils.log(`${tokenID} => xp claimed`);
                return [true, 'success'];
            } catch (e) {
                logUtils.log(`${tokenID} => xp error`);
                if (constVal.debug){
                    logUtils.log(e);
                }
                return [false, 'error'];
            }
        } else {
            logUtils.log(`${tokenID} => Live trading disabled - claimXp NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const levelUp = async (tokenID, nonce)  => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenID} => levelUp => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractLevelUp === 'undefined') {
                    contractLevelUp = new ethers.Contract(address, abi, constVal.account);
                }
                let approveResponse = await contractLevelUp.level_up(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                logUtils.log(`${tokenID} => levelUp done`);
                return [true, 'success'];
            } catch (e) {
                logUtils.log(`${tokenID} => levelUp error`);
                if (constVal.debug){
                    logUtils.log(e);
                }
                return [false, 'error'];
            }
        } else {
            logUtils.log(`${tokenID} => Live trading disabled - levelUp NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const summon = async (classToSummon, nonceVal, i = 0) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`#${i+1} => Gas Price too high: ${-thisGas}`)
        return false;
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractSummon === 'undefined') {
                    contractSummon = new ethers.Contract(address, abi, constVal.account);
                }
                let approveResponse = await contractSummon.summon(
                    classToSummon,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: utils.calculateGasPrice(),
                        nonce: await utils.getNonce(nonceVal)
                    });
                logUtils.log(`#${i+1} => transaction hash => ${approveResponse.hash}`);
                return true;
            } catch (e) {
                logUtils.log(`summon error`);
                if (constVal.debug){
                    logUtils.log(e);
                }
                return false;
            }
        }else {
            logUtils.log(`#${i+1} => Live trading disabled - summoning NOT submitted.`)
            return true;
        }
    }
}

const massSummon = async (classToSummon = "all", quantity = 1, isMass = false, nonce) => {
    let result;
    let newToken = 0;
    let originalTokenCount = await tokenGetter.getTokenCount(constVal.walletAddress);
    if (classToSummon !== "all"){
        let classId = constVal.classes.indexOf(classToSummon);
        if (classId === -1 || classId === 0){
            logUtils.log(`Unknown class [${classToSummon}]`);
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
        logUtils.log(`Start summoning of ${quantity} ${classToSummon}`);
        while (i < quantity) {
            logUtils.log(`#${i+1} => summoning...`);
            let res = await summon(classId, nonce.value, i);
            if (res){
                result.success++;
                logUtils.log(`#${i+1} => summon success`);
            } else {
                result.fail++;
                logUtils.log(`#${i+1} => summon fail`);
            }
            await utils.delay(1000);
            nonce.value++;
            i++;
        }
    } else {
        logUtils.log(`Start summoning ${quantity} of each classes`)
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
        logUtils.log(`Result Class [${classToSummon}] | Quantity [${quantity}]:`)
        logUtils.log(` - success : ${result.success}`)
        logUtils.log(` - fail : ${result.fail}`)
    }

    if (!isMass){
        let newTotal = classToSummon === "all" ? (originalTokenCount + newToken) : (originalTokenCount + result.success);
        let currentCount = 0;
        do {
            if (currentCount !== 0){
                logUtils.log("Waiting a bit to let the transaction spread...")
                await utils.delay(10000);
            }
            logUtils.log("Fetching token count...")
            currentCount = await tokenGetter.getTokenCount(constVal.walletAddress);
            logUtils.log(`CurrentCount => ${currentCount} of ${newTotal}`)
        } while (currentCount < newTotal)

        logUtils.log("Updating token list...")
        await updateTokenList();
    } else {
        return result.success;
    }
}

const updateTokenList = async () => {
    let tokens = await tokenGetter.getTokenList(constVal.walletAddress);
    await tokenGetter.updateDotEnvFile(tokens);
}

module.exports = {
    getStats,
    claimXp,
    levelUp,
    massSummon,
    updateTokenList
}