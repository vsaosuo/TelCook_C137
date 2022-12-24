const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const {dis_token} = require("./config.json");
// const express = require('express');
// const app = express();
// const port = 3000;

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
  })
  
client.on("message", msg => {
    console.log("message event: ", msg.content);
    if (msg.content === "ping") {
        
        msg.reply("pong");
    }
})

client.login(dis_token);
// app.listen(port, () => {
// 	console.log(`${new Date()}  App Started. Listening on localhost:${port}`);
// });