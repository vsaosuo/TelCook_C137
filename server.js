const {tel_token} = require('./config.json');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(tel_token);

/* ---------- Telegram Section ---------- */
bot.start(function(context){
    context.reply("Hello there!! \nThis is Glip Glop, your personal chef. How can I help you today?");
});
// Deploy Telegram bot
bot.launch();

/* ---------- Applicaiton Section ---------- */