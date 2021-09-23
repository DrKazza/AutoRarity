const constVal = require('./const');
const utils = require("./utils");
const statsUtils = require('./statsUtils');
const { Bot } = require("grammy");

let bot;

const init = async () => {
    if (typeof constVal.telegramBotToken === 'undefined' || constVal.telegramBotToken.length === 0){
        console.log(`You need to provide a bot token in ${constVal.envFile}, telegramBotToken`);
        return;
    }
    bot = new Bot(constVal.telegramBotToken);

// React to /init command
    bot.command("init", async (ctx) => {
        constVal.chatId = ctx.chat.id;
        await utils.saveTelegramChatId();
        ctx.reply("Welcome! Up and running.")
    });
    bot.command("getStats", sendStats);
    bot.command("getstats", sendStats);
    await bot.api.setMyCommands([
        { command: "getstats", description: "Display global stats" },
    ]);
// Start your bot
    console.log("Bot started");
    bot.start();
}

const sendStats = async (ctx) => {
    ctx.reply(`Preparing stats (it may take a long time)`);
    //ctx.reply(`/!\\it may take a long time if you have a lot of token/!\\`);
    let data = await statsUtils.getGlobalStats();
    let text = statsUtils.formatGlobalStats(data);
    ctx.reply(text);
}

const sendMessage = (message) => {
    if (typeof bot === 'undefined'){
        console.log("Telegram bot is not ready");
        return;
    }
    if (constVal.chatId.length === 0){
        console.log("Telegram bot not initialized, pls send /init to init the bot");
        return;
    }
    bot.api.sendMessage(constVal.chatId, message);
}


module.exports = {
    init,
    sendMessage
}