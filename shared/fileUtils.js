const fs = require("fs");
const readline = require("readline");
const constVal = require('../shared/const');
const logUtils = require("../shared/logUtils");

const getAllLineOfFile = async (file) => {
    try {
        if (fs.existsSync(file)) {
            const fileStream = fs.createReadStream(file);

            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            let lines = [];
            for await (const line of rl) {
                lines.push(line.trim());
            }
            return lines;
        } else {
            logUtils.log(`error file not found [${file}]`);
            return false;
        }
    } catch (e) {
        logUtils.log(`error while reading file [${file}]`)
        if (constVal.debug){
            logUtils.log(e);
        }
        return false;
    }
}

const logToFile = (message) => {
    let formattedMessage = `************************** ${new Date()}
${message}
**************************`;
    fs.appendFileSync('error.log', formattedMessage);
}

module.exports = {
    getAllLineOfFile,
    logToFile
}