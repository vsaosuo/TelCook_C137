const {tel_token} = require('./env.json');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(tel_token);

/* ---------- Telegram Section ---------- */
const MAX_GREETING_STATE = 3;
const greeting_conversation ={
    0: "First, how should I call you?",
    1: "Now, can I know your university name in full form?",
    2: "Okay lastely, please choose the food preference below",
    3: "It's nice meeting you, "
}
var userGreetingState = {};
// Event: user first contact to bot
bot.start(function(context){
    var chatid = context.update.message.chat.id;
    context.reply("Hello there!! \nThis is Glip Glop, your personal chef. I am happy to help you. Okay first, let's get to know each other better.");
    // bot.telegram.sendPoll(chatid, "First, how should I call you?", ["a", "b"], {allows_multiple_answers: false, type: "regular"});
    bot.telegram.sendMessage(chatid, greeting_conversation[0], {
        reply_markup: {
            force_reply: true
        }
    });
    userGreetingState[context.update.message.chat.username] = {
        state: 0,   /* 0: get name; 1: get university; 2: get food preference; 3: final word*/
        0: "",
        1: "",
        2: ""
    }
});

bot.on('message', (context) =>{
    console.log("Message: ", context.update.message);
    console.log("Forward: ", context.update.message.reply_to_message);

    // Computing user's geeting information
    if(userGreetingState[context.update.message.chat.username].state < MAX_GREETING_STATE){
        var state = userGreetingState[context.update.message.chat.username].state;

        // Update userGreetingState object, adding response and change state
        userGreetingState[context.update.message.chat.username][state] = context.update.message.text;
        state++;
        userGreetingState[context.update.message.chat.username].state = state;

        if(state < MAX_GREETING_STATE){
            // Send another message
            bot.telegram.sendMessage(context.update.message.chat.id, greeting_conversation[state],{
                reply_markup: {
                    force_reply: true
                }
            });

        } else {
            // Send another message
            var outputString = greeting_conversation[state] + userGreetingState[context.update.message.chat.username][0];
            bot.telegram.sendMessage(context.update.message.chat.id, outputString);
        }
    }
    console.log("userGreetingState: ", userGreetingState[context.update.message.chat.username]);
})



// Deploy Telegram bot
bot.launch();

/* ---------- Applicaiton Section ---------- */