const {contractAddresses} = require('../shared/contractAddresses');
const utils = require("../shared/utils");
const constVal = require("../shared/const");
const ethers = require("ethers");
const tokenGetter = require("../shared/tokenIdGetter.js");
const abi =contractAddresses.manifestABI;
const address = contractAddresses.rarityManifested;

const getStats = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    let tokenStats = await contract.methods.summoner(tokenID).call();
    tokenStats[4] = await contract.methods.xp_required(tokenStats[3]).call();
    // tokenStats will return [currentxp, time of next xpgain, char class, level, xp to next level]
    return tokenStats;
}

const getNonce = (nonce) => {
    if (typeof nonce === 'undefined'){
        nonce = utils.nonceVal();
    }
    return nonce;
}

const claimXp = async (tokenID, nonce)  => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`${tokenID} => xp => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                let contract = new ethers.Contract(address, abi, constVal.account);
                let approveResponse = await contract.adventure(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: getNonce(nonce)
                    });
                console.log(`${tokenID} => xp claimed`);
                return [true, 'success'];
            } catch (e) {
                console.log(`${tokenID} => xp error`);
                return [false, 'error'];
            }
        } else {
            console.log(`Live trading disabled - adventuring NOT submitted.`)
            return [false, 'not live'];
        }
    }
}

const levelUp = async (tokenID, nonce)  => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`${tokenID} => levelUp => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                let contract = new ethers.Contract(address, abi, constVal.account);
                let approveResponse = await contract.level_up(
                    tokenID,
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: getNonce(nonce)
                    });
                console.log(`${tokenID} => levelUp done`);
                return [true, 'success'];
            } catch (e) {
                console.log(`${tokenID} => levelUp error`);
                return [false, 'error'];
            }
        } else {
            console.log(`Live trading disabled - levelling NOT submitted.`)
            return [false, 'not live'];
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
                let contract = new ethers.Contract(address,abi, constVal.account);
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
                console.log(`summon error`);
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
    let originalTokenCount = await tokenGetter.getTokenCount(constVal.walletAddress);
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
            currentCount = await tokenGetter.getTokenCount(constVal.walletAddress);
            console.log(`CurrentCount => ${currentCount} of ${newTotal}`)
        } while (currentCount < newTotal)

        console.log("Updating token list...")
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