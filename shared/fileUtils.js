const fs = require("fs");
const readline = require("readline");
const constVal = require('../shared/const');

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
                lines.push(line);
            }
            return lines;
        } else {
            console.log(`error file not found [${file}]`);
            return false;
        }
    } catch (e) {
        console.log(`error while reading file [${file}]`)
        if (constVal.debug){
            console.log(e);
        }
        return false;
    }
}

module.exports = {
    getAllLineOfFile
}