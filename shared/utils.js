const ethers = require("ethers");
const Web3 = require('web3');
const constVal = require('./const');
const fs = require("fs");
const readline = require("readline");
const stream = require("stream");
const util = require("util");
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const logUtils = require("../shared/logUtils");

let web3 = new Web3(constVal.fantomRpcUrl);

const timeLeft = (timestamp) => {
    let rightNow = Date.now()/1000
    let timeleft = timestamp - rightNow
    if (timeleft < 0) {
        return [-1,0]
    } else {
        let [hrs, mins] = secsToText(timeleft)
        return [hrs, mins, timeleft]
    }
}

const secsToText = (secs) => {
    let hrs = Math.floor(secs / 60 / 60)
    let mins = Math.floor((secs / 60 - hrs * 60))
    return [hrs, mins]
}

const calculateGasPrice = async () => {
    let spotPx = await web3.eth.getGasPrice();
    let spotPxBN = ethers.BigNumber.from(spotPx.toString())
    if (spotPxBN.gte(constVal.maxGasPrice)) {
        return -(Math.floor(spotPx/(10**9)))
    } else {
        return spotPxBN
    }
}

const nonceVal = async () => {
    return await constVal.jsonRpcProvider.getTransactionCount(constVal.walletAddress, "pending")
}

const getNonce = async (nonce) => {
    if (typeof nonce === 'undefined'){
        nonce = await nonceVal();
    }
    let latestNonceTemp = await nonceVal();
    if (latestNonceTemp > nonce){
        nonce = latestNonceTemp;
    }
    return nonce;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

let telegramChatIdLineReplaced;
const saveTelegramChatId = async () => {
    const telegramChatIdLine = `TELEGRAM_CHAT_ID = '${constVal.chatId}'`;
    const file = constVal.envFile;
    const readStream = fs.createReadStream(file)
    const tempFile = `${file}.tmp`
    const writeStream = fs.createWriteStream(tempFile)
    const rl = readline.createInterface(readStream, stream)
    telegramChatIdLineReplaced = false;
    await rl.on('line', (originalLine) => {
        // Replace.
        if ((/^TELEGRAM_CHAT_ID/.exec(originalLine)) !== null) {
            telegramChatIdLineReplaced = true;
            return writeStream.write(`${telegramChatIdLine}\n`)
        }
        // Save original line.
        writeStream.write(`${originalLine}\n`)
    });

    await rl.on('close', () => {
        // Finish writing to temp file and replace files.
        // Replace original file with fixed file (the temp file).
        if (!telegramChatIdLineReplaced){
            let res = writeStream.write( `${telegramChatIdLine}\n`);
        }
        writeStream.end(async () => {
            try {
                await unlink(file) // Delete original file.

                await rename(tempFile, file) // Rename temp file with original file name.
                logUtils.log(`telegramChatId has been saved to [${file}]`);
            } catch (e) {
                logUtils.log(`error while saving telegramChatId to [${file}]`);
                if (constVal.debug){
                    logUtils.log(e);
                }
            }
        });
    });
}

const getFTMBalance = async () => {
    return await constVal.account.getBalance();
}

const waitForTx = async (tokenID, approveResponse) => {
    let transactionReceipt = await approveResponse.wait();
    if (transactionReceipt.status === 1){
        let actual_cost = (transactionReceipt.gasUsed * (approveResponse.gasPrice / 10**18)).toFixed(5);
        logUtils.log(`${tokenID} => Tx success, actual cost ${actual_cost} FTM, id: ${approveResponse.hash}`);
    } else {
        logUtils.log(`${tokenID} => Tx failed, id: ${approveResponse.hash}`);
    }
    return transactionReceipt;
}

module.exports = {
    secsToText,
    timeLeft,
    calculateGasPrice,
    nonceVal,
    getNonce,
    delay,
    saveTelegramChatId,
    getFTMBalance,
    waitForTx,
    web3
}