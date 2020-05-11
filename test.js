require('dotenv').config()
const LineClient = require("@line/bot-sdk").Client;
const config = {
    channelAccessToken: process.env.CAT,
    channelSecret: process.env.CSK,
};
const lineClient = new LineClient(config);

const cron = require('node-cron')

cron.schedule('0 29 8,22 * * * *',()=>{
    console.log(1)
})