// Telegram setup
const {tel_token} = require('./env.json');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(tel_token);

// Database setup
const Database = require('./Database.js');
/** 
 * MongoDB setup
 *  Default url: mongodb://localhost:27017
 *  Database name: glipglopfood
 *  On success: [MongoClient] Connected to mongodb://localhost:27017/glipglopfood
 */
var db = Database("mongodb://localhost:27017", "glipglopfood");


/* ---------- Telegram Section ---------- */
// List of university
const MAX_GREETING_STATE = 3;
const conversations ={
    0: "First, how should I call you?",
    1: "Now, can I know your university name in full form?",
    2: "Okay lastely, please choose the food preference below",
    3: "It's nice meeting you, ",
    userNotFound: "Hmm...\nLooks like we haven't know each other yet. Try typing '/start' if you want me to know you.",
    greeting: "Hello there!! \nThis is Glip Glop, your personal chef. I am happy to help you. Okay first, let's get to know each other better."
}
var usersData = {};

// Start Event: user first contact to bot
bot.start(function(context){
    var chatid = context.update.message.chat.id;
    context.reply(conversations.greeting);
    // bot.telegram.sendPoll(chatid, "First, how should I call you?", ["a", "b"], {allows_multiple_answers: false, type: "regular"});
    bot.telegram.sendMessage(chatid, conversations[0], {
        reply_markup: {
            force_reply: true
        }
    });

    context.update.message.from.chatid = context.update.message.chat.id;
    // Setup data type
    usersData[context.update.message.chat.username] = {
        state: 0,   /* 0: get name; 1: get university; 2: get food preference; 3: final word*/
        userTelInfo: context.update.message.from,   /* field info { id, is_bot, first_name, last_name, username, language_code } */
        prefName: "",
        institution: "",
        foodPref: ""
    }
});

// Message Event: trigger when there's a new message
bot.on('message', (context) =>{
    console.log("Message: ", context.update.message);
    console.log("Forward: ", context.update.message.reply_to_message);

    // Computing user's geeting information
    if(!usersData[context.update.message.chat.username]){
        bot.telegram.sendMessage(context.update.message.chat.id, conversations.userNotFound);
    }
    else if(usersData[context.update.message.chat.username].state < MAX_GREETING_STATE){
        var state = usersData[context.update.message.chat.username].state;

        // Update usersData object, adding response and change state
        switch(state){
            case 0: usersData[context.update.message.chat.username].prefName = context.update.message.text;    break;
            case 1: usersData[context.update.message.chat.username].institution = context.update.message.text; break;
            case 2: usersData[context.update.message.chat.username].foodPref = context.update.message.text;    break;
            default: 
        }
        state++;
        usersData[context.update.message.chat.username].state = state;

        // Response to users
        if(state < MAX_GREETING_STATE){
            // Send another message
            bot.telegram.sendMessage(context.update.message.chat.id, conversations[state],{
                reply_markup: {
                    force_reply: true
                }
            });
        } else {
            // Send another message
            var outputString = conversations[state] + usersData[context.update.message.chat.username].prefName;
            bot.telegram.sendMessage(context.update.message.chat.id, outputString);

            // Upload data to database
            var userInfoDatabase = {};
            userInfoDatabase.userTelInfo = usersData[context.update.message.chat.username].userTelInfo;
            userInfoDatabase.prefName = usersData[context.update.message.chat.username].prefName;
            userInfoDatabase.institution = usersData[context.update.message.chat.username].institution;
            userInfoDatabase.foodPref = usersData[context.update.message.chat.username].foodPref;

            db.addUser(userInfoDatabase).then((data) =>{
                console.log("upload user data: ", data);
            }, (err) => console.log(err));
        }
    }

    if(context.update.message.text == "me!"){
        db.getUser(context.update.message.chat.username).then((data)=>{
            console.log("Get user data: ", data);
            bot.telegram.sendMessage(data.userTelInfo.chatid, JSON.stringify(data));
        }, (err)=> console.log(err))
    }
    console.log("usersData: ", usersData);
})

//** Helper Functions **//
var sendText = function(chatID, text){
    if(chatID){
        bot.telegram.sendMessage(chatID, text);
    }
}

// setInterval(function(){
//     // if(chatid){
//     //     console.log("Interval ON", chatid);
//     //     bot.telegram.sendMessage(chatid, "Time Interval 2");
//     // }
//     sendText(chatid, "sendText() function");
// }, 5000);

// Deploy Telegram bot
bot.launch();

/* ---------- Applicaiton Section ---------- */