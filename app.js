/*
 * Telegram Bot for NodeJS
 * Author: @cincauhangus (cincau.hangus@gmail.com)
 * Enlightened rules!
 * 
 * Props to @mast (Author of https://github.com/mast/telegram-bot-api (Node.js module for Telegram Bot API))
 * Notes: Params must follow telegram-bot-api parameters
 */

var TelegramBot = new require('./telegram-bot.js');

var bot = new TelegramBot({
    token:process.env.TELEGRAM_TOKEN,
    updates: {
        enabled: true
    }
});

bot.on('bot-started', function () {
    console.log('TelegramBot started.');
});

bot.on('bot-starting', function () {
    console.log('TelegramBot starting.');
});

bot.on('plugins-loaded', function (plugins) {
    console.log('TelegramBot plugins loaded:', plugins)
})

bot.start();

