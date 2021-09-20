const {contractAddresses} = require('../shared/contractAddresses');
const utils = require("../shared/utils");
const constVal = require("../shared/const");
const ethers = require("ethers");
const core = require('./core');
const fs = require("fs");
const dungeons = require("../dungeons");
const abi =contractAddresses.attributesABI;
const address = contractAddresses.rarityAttributes;

const get = async (tokenID) => {
    let contract = new utils.web3.eth.Contract(abi, address);
    return await contract.methods.ability_scores(tokenID).call();
}

const getAttributeTemplateList = () => {
    let templates = [];
    fs.readdirSync('./misc/templates/classes/').forEach(file => {
        templates.push(file.substring(0, file.length - 5));
    });
    return templates;
}

const displayAvailableAttributeTemplate = () => {
    console.log('Available template: ');
    let templateList = getAttributeTemplateList();
    templateList.forEach(name => {
        console.log(`    - ${name}`);
    });
}

const getAttributeTemplate = (templateName) => {
    if (fs.existsSync(`./misc/templates/classes/${templateName}.json`)){
        return JSON.parse(fs.readFileSync(`./misc/templates/classes/${templateName}.json`, 'utf-8'));
    } else {
        return false;
    }
}

const buyPoint = async (tokenID, point, nonce) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        console.log(`${tokenID} => buy point => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                let contract = new ethers.Contract(address, abi, constVal.account);
                let approveResponse = await contract.point_buy(
                    tokenID,
                    point['str'],
                    point['dex'],
                    point['const'],
                    point['int'],
                    point['wis'],
                    point['cha'],
                    {
                        gasLimit: constVal.totalGasLimit,
                        gasPrice: thisGas,
                        nonce: await utils.getNonce(nonce)
                    });
                console.log(`${tokenID} => point bought => Str: ${point['str']}, Dex: ${point['dex']}, Const: ${point['const']}, Int: ${point['int']}, Wisdom: ${point['wis']}, Charisma: ${point['cha']}`);
                return [true, 'success'];
            } catch (e){
                console.log(`${tokenID} => point error`);
                return [false, 'error'];
            }
        } else {
            console.log(`${tokenID} => Live trading disabled - point not submitted.`)
            return [false, 'not live'];
        }
    }
}

const checkStatsAndAssignPoint = async (tokenID, templateName, nonce = undefined) => {
    let attribs = await get(tokenID);
    let tokenStats = await core.getStats(tokenID);
    if (parseInt(attribs[0], 10) === 0) {
        let className = constVal.classes[tokenStats[2]];
        let template = getAttributeTemplate(templateName);
        let res = await buyPoint(tokenID, template[className].attributes, nonce);
        return res[0];
    } else {
        console.log(`${tokenID} => point already bought`);
        return false;
    }
}

const massAssignPoint = async (template, tokenID) => {
    if (!getAttributeTemplateList().includes(template))  {
        console.log(`This template does not exist [${template}]`);
        displayAvailableAttributeTemplate();
    } else {
        let latestNonce = await  utils.nonceVal();
        let transactionCount = await constVal.account.getTransactionCount();
        if (transactionCount < latestNonce){
            console.log(`nonce [${latestNonce}] val is higher than transaction count [${transactionCount}] wait before launch again`);
            return;
        }
        if (typeof tokenID === 'undefined') {
            for (let tokenID of constVal.myTokenIds) {
                let res = await checkStatsAndAssignPoint(tokenID, template, latestNonce);
                if (res){
                    latestNonce++;
                }
            }
        } else {
            await checkStatsAndAssignPoint(tokenID, template, latestNonce);
        }
    }
}

module.exports = {
    get,
    buyPoint,
    checkStatsAndAssignPoint,
    massAssignPoint,
    getAttributeTemplateList,
    displayAvailableAttributeTemplate
}