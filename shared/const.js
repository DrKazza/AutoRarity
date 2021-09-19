const {JsonRpcProvider} = require("@ethersproject/providers");
const ethers = require("ethers");

const fantomRpcUrl = 'https://rpc.ftm.tools/';
const totalGasLimit = 125000 // 50,000 seems sensible for general xping up and 30,000 seems right for levelling, claim gold is ~100k
const defaultMaxGasPx = 250 // usually 50-100, sometimes this spikes to nearly 200
const xpRetryDelay = 24 * 60 * 60 // 1 day in seconds - try to level up every 24hrs
const gasRetryDelay = 5 * 60 // if gas is too expensive then try again in 5 mins
const xpPendingDelay = 2 * 60 // if you're waiting for xp to be earned before levelling up then try again in 2 mins
const minimumDelay = 60 // don't repeat too often
// Don't set the delays too short or you'll keep trying to XP up and just burn gas for no reason

const classes = ['noClass', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Wizard'];


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

const parseBool = (val) => {return val === true || val === 'true'}
const liveTradingVar = process.env.LIVETRADING;
const liveTrading = liveTradingVar === undefined ? false : parseBool(liveTradingVar);

const mule = {
    gold:process.env.GOLD_MULE,
    materials1:process.env.MATERIALS_1_MULE
}
const autoLevelUpVar = process.env.AUTO_LEVEL_UP;
const autoLevelUp = autoLevelUpVar === undefined ? true : parseBool(autoLevelUpVar); // you may not want to automatically level up your char
const autoTransferToMuleVar = process.env.AUTO_TRANSFER_TO_MULE;
const autoTransferToMule = autoTransferToMuleVar === undefined ? true : parseBool(autoTransferToMuleVar); // you may not want to automatically transfer to mule

module.exports = {
    fantomRpcUrl,
    totalGasLimit,
    defaultMaxGasPx,
    xpRetryDelay,
    gasRetryDelay,
    xpPendingDelay,
    minimumDelay,
    jsonRpcProvider,
    walletAddress,
    myTokenIds,
    account,
    classes,
    liveTrading,
    mule,
    autoLevelUp,
    autoTransferToMule
}