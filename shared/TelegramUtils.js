const constVal = require('./const');
const utils = require("./utils");
const { Bot } = require("grammy");

let bot;

const init = () => {
    if (typeof constVal.telegramBotToken === 'undefined' || constVal.telegramBotToken.length === 0){
        utils.log(`You need to provide a bot token in ${constVal.envFile}, telegramBotToken`);
        return;
    }
    bot = new Bot(constVal.telegramBotToken);

// React to /init command
    bot.command("init", async (ctx) => {
        constVal.chatId = ctx.chat.id;
        await utils.saveTelegramChatId();
        ctx.reply("Welcome! Up and running.")
    });

// Start your bot
    console.log("Bot started");
    bot.start();

}

const sendMessage = (message) => {
    if (typeof bot === 'undefined'){
        utils.log("Telegram bot is not ready");
        return;
    }
    if (constVal.chatId.length === 0){
        utils.log("Telegram bot not initialized, pls send /init to init the bot");
        return;
    }
    bot.api.sendMessage(constVal.chatId, message);
}



module.exports = {
    init,
    sendMessage,
}