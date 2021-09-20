const fs = require("fs");

const writeToFile = (data) => {
    fs.writeFileSync('./data.json', JSON.stringify(data) , 'utf-8');
}

const getDataFromFile = () => {
    if (fs.existsSync('./data.json')){
        return JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
    } else {
        return {
            accounts: []
        };
    }
}

module.exports = {
    writeToFile,
    getDataFromFile
};