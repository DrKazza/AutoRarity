const fs = require("fs");
const readline = require("readline");
const constVal = require('../shared/const');
const utils = require('../shared/utils');

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
            utils.log(`error file not found [${file}]`);
            return false;
        }
    } catch (e) {
        utils.log(`error while reading file [${file}]`)
        if (constVal.debug){
            utils.log(e);
        }
        return false;
    }
}

module.exports = {
    getAllLineOfFile
}