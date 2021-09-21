const {JsonRpcProvider} = require("@ethersproject/providers");
const ethers = require("ethers");

const parseBool = (val) => {return val === true || val === 'true'}


const fantomRpcUrl = 'https://rpc.ftm.tools/';
const totalGasLimit = 125000 // 50,000 seems sensible for general xping up and 30,000 seems right for levelling, claim gold is ~100k
const defaultMaxGasPx = 250 // usually 50-100, sometimes this spikes to nearly 200
const xpRetryDelay = 24 * 60 * 60 // 1 day in seconds - try to level up every 24hrs
const gasRetryDelay = 5 * 60 // if gas is too expensive then try again in 5 mins
const xpPendingDelay = 2 * 60 // if you're waiting for xp to be earned before levelling up then try again in 2 mins
const minimumDelay = 60 // don't repeat too often
const nonceDelay = 6 * 60 * 60 // wait 6 hour to see if all transaction have passed a percentage of this time will be use
// Don't set the delays too short or you'll keep trying to XP up and just burn gas for no reason

const classes = ['noClass', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Wizard'];

const rawArgs = require('minimist')(process.argv.slice(2));

const debug = rawArgs.debug === undefined ? false : parseBool(rawArgs.debug);

let myTokenIds = [];
const importedTokenIds = process.env.TOKENIDS;
if (importedTokenIds === undefined) {
    console.log(`Did you forget to specify your tokens in the .env file?`)
    process.exit(0)
} else {
    myTokenIds = importedTokenIds.split(",");
}

const secretKey = process.env.SECRETKEY;
const walletAddress = process.env.WALLETADDRESS;
const jsonRpcProvider = new JsonRpcProvider(fantomRpcUrl);
const wallet = ethers.Wallet.fromMnemonic(secretKey);
const account = wallet.connect(jsonRpcProvider);

const liveTradingVar = process.env.LIVETRADING;
const liveTrading = liveTradingVar === undefined ? false : parseBool(liveTradingVar);

const mule = {
    gold:process.env.GOLD_MULE,
    materials1:process.env.MATERIALS_1_MULE
}
const autoLevelUpVar = process.env.AUTO_LEVEL_UP;
const autoLevelUp = autoLevelUpVar === undefined ? true : parseBool(autoLevelUpVar); // you may not want to automatically level up your char
const autoTransferToMuleVar = process.env.AUTO_TRANSFER_TO_MULE;
const autoTransferToMule = autoTransferToMuleVar === undefined ? false : parseBool(autoTransferToMuleVar); // you may want to automatically transfer to mule

const maxGasPxVar = process.env.MAXGAS;
if (maxGasPxVar === undefined){maxGasPx = defaultMaxGasPx} else {maxGasPx = Number(maxGasPxVar)}
const maxGasPrice = ethers.utils.parseUnits(maxGasPx.toString(), 9);

module.exports = {
    fantomRpcUrl,
    totalGasLimit,
    xpRetryDelay,
    gasRetryDelay,
    xpPendingDelay,
    minimumDelay,
    nonceDelay,
    maxGasPrice,
    jsonRpcProvider,
    walletAddress,
    myTokenIds,
    account,
    classes,
    liveTrading,
    mule,
    autoLevelUp,
    autoTransferToMule,
    debug
}