const {contractAddresses} = require('../shared/contractAddresses');
const utils = require("../shared/utils");
const logUtils = require("../shared/logUtils");
const constVal = require("../shared/const");
const ethers = require("ethers");
const core = require('./core');
const fs = require("fs");
const abi =contractAddresses.attributesABI;
const address = contractAddresses.rarityAttributes;

let contractGet;
let contractBuyPoint;

const get = async (tokenID) => {
    if (typeof contractGet === 'undefined') {
        contractGet = new utils.web3.eth.Contract(abi, address);
    }
    return await contractGet.methods.ability_scores(tokenID).call();
}

const getAttributeTemplateList = () => {
    let templates = [];
    fs.readdirSync('./misc/templates/classes/').forEach(file => {
        templates.push(file.substring(0, file.length - 5));
    });
    return templates;
}

const displayAvailableAttributeTemplate = () => {
    logUtils.log('Available template: ');
    let templateList = getAttributeTemplateList();
    templateList.forEach(name => {
        logUtils.log(`    - ${name}`);
    });
}

const getAttributeTemplate = (templateName) => {
    if (fs.existsSync(`./misc/templates/classes/${templateName}.json`)){
        return JSON.parse(fs.readFileSync(`./misc/templates/classes/${templateName}.json`, 'utf-8'));
    } else {
        return false;
    }
}

const buyPoint = async (tokenID, point) => {
    let thisGas = await utils.calculateGasPrice()
    if (thisGas < 0) {
        logUtils.log(`${tokenID} => buy point => Gas Price too high: ${-thisGas}`)
        return [false, 'high gas']
    } else {
        if (constVal.liveTrading) {
            try {
                if (typeof contractBuyPoint === 'undefined') {
                    contractBuyPoint = new ethers.Contract(address, abi, constVal.nonceManager);
                }
                logUtils.log(`${tokenID} => start buy point`);
                let approveResponse = await contractBuyPoint.point_buy(
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
                        //nonce: await utils.getNonce(nonce)
                    });
                let receipt = await utils.waitForTx(tokenID, approveResponse);
                logUtils.log(`${tokenID} => point bought => Str: ${point['str']}, Dex: ${point['dex']}, Const: ${point['const']}, Int: ${point['int']}, Wisdom: ${point['wis']}, Charisma: ${point['cha']}`);
                if (constVal.debug){
                    logUtils.log(approveResponse);
                }
                return [receipt.status === 1, 'success'];
            } catch (e){
                logUtils.log(`${tokenID} => point error`);
                if (constVal.debug){

                    logUtils.log(e);
                }
                return [false, 'error'];
            }
        } else {
            logUtils.log(`${tokenID} => Live trading disabled - point not submitted.`)
            return [false, 'not live'];
        }
    }
}

const checkStatsAndAssignPoint = async (tokenID, templateName) => {
    let attribs = await get(tokenID);
    let tokenStats = await core.getStats(tokenID);
    if (parseInt(attribs[0], 10) === 0) {
        let className = constVal.classes[tokenStats[2]];
        let template = getAttributeTemplate(templateName);
        if (typeof template[className] === 'undefined'){
            logUtils.log(`The class [${className}] is missing in template [${templateName}]`);
            return false;
        }
        let res = await buyPoint(tokenID, template[className].attributes);
        return res[0];
    } else {
        logUtils.log(`${tokenID} => point already bought`);
        return false;
    }
}

const massAssignPoint = async (template, tokenID) => {
    if (!getAttributeTemplateList().includes(template))  {
        logUtils.log(`This template does not exist [${template}]`);
        displayAvailableAttributeTemplate();
    } else {
        if (typeof tokenID === 'undefined') {
            for (let tokenID of constVal.myTokenIds) {
                let res = await checkStatsAndAssignPoint(tokenID, template);
            }
        } else {
            await checkStatsAndAssignPoint(tokenID, template);
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