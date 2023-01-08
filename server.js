// Environment Data
// const {tel_token, db_username, db_pass} = require('./env.json');
require('dotenv').config();
const tel_token = process.env.tel_token;
const db_url = process.env.db_url;

// Telegram setup
const { Telegraf } = require('telegraf');
const bot = new Telegraf(tel_token);

// Database setup
const Database = require('./Database.js');
const { keyboard } = require('telegraf');
/** 
 * MongoDB setup
 *  Default url: mongodb://localhost:27017
 *  Database name: glipglopfood
 *  On success: [MongoClient] Connected to mongodb://localhost:27017/glipglopfood
 */
// var db = Database("mongodb://localhost:27017", "glipglopfood");
var db = Database(db_url, "glipglopfood");


/* ---------- Telegram Section ---------- */
// List of university
const MAX_GREETING_STATE = 3;
const conversations ={
    0: "First, how should I call you?",
    1: "Now, can I know your university name in full form?",
    2: "Okay lastely, please choose the food preference below",
    3: "It's nice meeting you, ",
    userNotFound: "Hmm...\nLooks like we haven't know each other yet. Try typing '/start' if you want me to know you.",
    greeting: "Hello there!! \nThis is Glip Glop, your personal chef. I am happy to help you. To use the bot type /help."
}
var getFoodConvers = {
    0: "Okay cool!\nPlease provide me the main ingredients you want to use in your food. Only use one of a semicolon (';'), comma (','), or a new line to seperate between ingredients.",
    opps: "Sorry, I can't read your input. Try again, /getFood.",
    foundResult: "This is that I found to the request of this reply message.",
    noResult: "I'm sorry, I cannot find a matched food from the given ingredients.\nMaybe try simpler ingredients."
}
var usersData = {};

// Start Event: user first contact to bot
bot.start(function(context){
    var chatid = context.update.message.chat.id;
    context.reply(conversations.greeting);
    // bot.telegram.sendPoll(chatid, "First, how should I call you?", ["a", "b"], {allows_multiple_answers: false, type: "regular"});
    // bot.telegram.sendMessage(chatid, conversations[0], {
    //     reply_markup: {
    //         force_reply: true
    //     }
    // });

    // context.update.message.from.chatid = context.update.message.chat.id;

    // Setup data type
    // usersData[context.update.message.chat.username] = {
    //     state: 0,   /* 0: get name; 1: get university; 2: get food preference; 3: final word*/
    //     userTelInfo: context.update.message.from,   /* field info { id, is_bot, first_name, last_name, username, language_code } */
    //     prefName: "",
    //     institution: "",
    //     foodPref: ""
    // }

    // Upload data to database
    db.addUser(context.update.message.from).then((data) =>{
        console.log("upload user data: ", data);
    }, (err) => console.log(err));
});

bot.command("/help", (context) => {
    var message = "I'm here to help!\n";
    message += "It's Pickle Bot here. I'm here to assist you with food management to help cook cheaper, healthier, and faster. I'm not the creator of those foods, instead, I'm more of a manager. Currently, I have two functions:\n";
    message += "\n 1. /getfood - this will give you up to 5 suggested foods that best match the list of ingredients you provided. To differentiate between ingredients, make sure to only use a semicolon (';'), comma (','), or a new line (do not mix it).\n";
    message += "\n 2. /createmenu - this will give you 14 meals for only lunch and dinner Monday to Sunday. I will give you a shopping list at the end which you could take to buy at your local groceries store.";

    bot.telegram.sendMessage(context.update.message.chat.id, message);
})

bot.command("/getfood", (context) => {
    var chatid = context.update.message.chat.id;
    bot.telegram.sendMessage(chatid, getFoodConvers[0], {
        reply_markup: {
            force_reply: true
        }
    });
})

bot.command("/createmenu", (context) => {
    menuCreator(context);
})

// Message Event: trigger when there's a new message
bot.on('message', (context) =>{
    var chatid = context.update.message.chat.id;
    // Computing user's geeting information
    // if(usersData[context.update.message.chat.username].state < MAX_GREETING_STATE){
    //     var state = usersData[context.update.message.chat.username].state;

    //     // Update usersData object, adding response and change state
    //     switch(state){
    //         case 0: usersData[context.update.message.chat.username].prefName = context.update.message.text;    break;
    //         case 1: usersData[context.update.message.chat.username].institution = context.update.message.text; break;
    //         case 2: usersData[context.update.message.chat.username].foodPref = context.update.message.text;    break;
    //         default: 
    //     }
    //     state++;
    //     usersData[context.update.message.chat.username].state = state;

    //     // Response to users
    //     if(state < MAX_GREETING_STATE){
    //         // Send another message
    //         bot.telegram.sendMessage(context.update.message.chat.id, conversations[state],{
    //             reply_markup: {
    //                 force_reply: true
    //             }
    //         });
    //     } else {
    //         // Send another message
    //         var outputString = conversations[state] + usersData[context.update.message.chat.username].prefName;
    //         bot.telegram.sendMessage(context.update.message.chat.id, outputString);

    //         // Upload data to database
    //         var userInfoDatabase = {};
    //         userInfoDatabase.userTelInfo = usersData[context.update.message.chat.username].userTelInfo;
    //         userInfoDatabase.prefName = usersData[context.update.message.chat.username].prefName;
    //         userInfoDatabase.institution = usersData[context.update.message.chat.username].institution;
    //         userInfoDatabase.foodPref = usersData[context.update.message.chat.username].foodPref;

    //         db.addUser(userInfoDatabase).then((data) =>{
    //             console.log("upload user data: ", data);
    //         }, (err) => console.log(err));
    //     }
    // }

    // if(context.update.message.text == "me!"){
    //     db.getUser(context.update.message.chat.username).then((data)=>{
    //         console.log("Get user data: ", data);
    //         bot.telegram.sendMessage(data.userTelInfo.chatid, JSON.stringify(data));
    //     }, (err)=> console.log(err))
    // }

    // COMMAND: Message check for '/getFood' command
    if(context.update.message.reply_to_message && context.update.message.reply_to_message.text == getFoodConvers[0]){
        // Convert to lower case
        var response = context.update.message.text.toLowerCase();

        // Break message into array of ingredients
        var ingredSeperator = [',', '\n', ';'];
        var ingredList = [];
        if((response.includes(ingredSeperator[0]) && response.includes(ingredSeperator[1])) || 
           (response.includes(ingredSeperator[0]) && response.includes(ingredSeperator[2])) ||
           (response.includes(ingredSeperator[1]) && response.includes(ingredSeperator[2])))
            sendText(chatid, getFoodConvers.opps);
        else{
            if(response.includes(ingredSeperator[0])) ingredList = response.split(ingredSeperator[0]);
            else if(response.includes(ingredSeperator[1])) ingredList = response.split(ingredSeperator[1]);
            else ingredList = response.split(ingredSeperator[2]);
        }

        // Invoke findMatchFood() function
        findMatchFood(context, ingredList);
    }
})

//** Helper Functions **//
var sendText = function(chatID, text){
    if(chatID){
        bot.telegram.sendMessage(chatID, text);
    }
}

var menuCreator = async function(context){
    var NUM_MEALS = 14;
    var menu_of_2meals_7days = [];

    var chatid = context.update.message.chat.id;

    await db.getBatchRandomFood(NUM_MEALS).then((data)=>{
        menu_of_2meals_7days = data;
    }, (err)=> console.error(err));

    // Send result to users
    for(var i = 0; i < NUM_MEALS; i++){
        var text = "Meal " + (i + 1) + ": " + menu_of_2meals_7days[i].title + ", \nSource: " + menu_of_2meals_7days[i].source;

        // Send text in order
        await bot.telegram.sendMessage(chatid, text);
    }
}

var findMatchFood = async function(context, ingredList){
    var chatid = context.update.message.chat.id;
    var replyMessageID = context.update.message.message_id;
    var NUM_MEALS = 5;
    var mealFound;

    // Query to database
    if(!ingredList){ 
        bot.telegram.sendMessage(chatid, getFoodConvers.noResult, {reply_to_message_id: replyMessageID});
        return ;
    }

    await db.get5FoodsMatched(ingredList, NUM_MEALS).then((foodsMatched)=>{
        // Print out result
        if(Array.isArray(foodsMatched) && foodsMatched.length != 0 ){
            mealFound = foodsMatched;
        }else{
            bot.telegram.sendMessage(chatid, getFoodConvers.noResult, {reply_to_message_id: replyMessageID});
        }
        
    }, (err) => console.error(err));
    
    // Print results to user
    if(Array.isArray(mealFound) && mealFound.length != 0){
        await bot.telegram.sendMessage(chatid, getFoodConvers.foundResult, {reply_to_message_id: replyMessageID});

        for(var i = 0; i < mealFound.length; i++){
            var text = "Recommendation " + (i + 1) + ": " + mealFound[i].title + " \nSource: " + mealFound[i].source;

            // Send text in order
            await bot.telegram.sendMessage(chatid, text);
        }
    }
}

// Deploy Telegram bot
bot.launch();

/* ---------- Applicaiton Section ---------- */