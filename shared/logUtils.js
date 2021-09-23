const constVal = require("./const");
const telegramUtils = require("./TelegramUtils");
const log = (message, toTelegram = false) => {
    console.log(message);
    if (constVal.enableTelegramBot && toTelegram){
        telegramUtils.sendMessage(message);
    }
}

module.exports = {
    log,
}