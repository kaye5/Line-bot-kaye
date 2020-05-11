require('dotenv').config()
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta')
const axios = require('axios')
const cron = require('node-cron')
const MongoClient = require("mongodb").MongoClient;
const URI =
    process.env.MONGO;
var database, collChat, collReq;
MongoClient.connect(
    URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    async function (err, client) {
        if (!err) {
            database = await client.db("Line");
            collChat = await database.collection("chats");
            collReq = await database.collection("requests")
            console.log("CONNECTED TO DATABASE");
        }
    }
);
const LineClient = require("@line/bot-sdk").Client;
const config = {
    channelAccessToken: process.env.CAT,
    channelSecret: process.env.CSK,
};
const lineClient = new LineClient(config);

function getChat() {
    return collChat.find({
        type: 'group'
    })
}

function saveReq(res) {
    collReq.insertOne({
        request: res,
        date: new Date()
    })
}

/**
 * @description CRON SCHEDULE
 * @description * * * * * *
 * @description s m h d M dow
 */
const CronOption = {
    timezone: "Asia/Jakarta"
}

const unplashAPI = `https://api.unsplash.com/photos/random/?client_id=${process.env.UNPLASH}&count=1&query=nature-green`

//Morning Greeting
async function goodMorning() {
    let chats = await getChat()
    let res = await axios.get('https://quotes.rest/qod?language=en')
    let image = await axios.get(unplashAPI);
    let QOD = res.data.contents.quotes[0];
    chats.forEach(async chat => {
        let res = await lineClient.pushMessage(chat.groupId, [{
            type: 'text',
            text: `Good morning, it's ${moment().format('dddd, MMMM Do YYYY, h:mm a')}.\nI hope you have a nice day :) and don't forget to eat your breakfast.\n${QOD.quote}\n-${QOD.author}`
        }, {
            type: 'image',
            originalContentUrl: image[0].urls.regular,
            previewImageUrl: image[0].urls.thumb
        }])
        saveReq(res);
    });
}
cron.schedule('0 0 7 * * *', () => {
    goodMorning();
}, CronOption)

//Send Weather 
const Yahoo = require('./yahoo_api')
function sendWeather(){
    Yahoo.getYahooWeather(async (data)=>{
        var data = JSON.parse(data)
        let chats = await getChat();
        let curW = data.current_observation
        chats.forEach(async chat => {
            let res = await lineClient.pushMessage(chat.groupId, [{
                type: 'text',
                text: `Whatsup, it's ${moment().format('dddd, MMMM Do YYYY, h:mm a')}. Current weather.\n${data.location.region}, ${data.location.city}.\nTemperature :${curW.condition.temperature} F.\nCondition : ${curW.condition.text}.`
            }])
            saveReq(res);
        });
    });
}
cron.schedule('0 0 8,6 * * *',()=>{
    sendWeather();
})

//News 
async function sendNews(){
    const newsAPI = `https://newsapi.org/v2/top-headlines?country=id&apiKey=${process.env.NEWSAPI}`
    let chats = await getChat();
    let news = await axios.get(newsAPI);
    let article = news.data.articles[0]
    chats.forEach(async chat => {
        let res = await lineClient.pushMessage(chat.groupId, [{
            type : 'image',
            originalContentUrl : article.urlToImage,
            previewImageUrl : article.urlToImage
        },{
            type : 'text',
            text : `${article.title}\n${article.url}`
        }])
        saveReq(res);
    });
}
cron.schedule('0 0 9 * * *',()=>{
    sendNews();
},CronOption)

//Afternoon Geeting
async function goodAfternnoon() {
    let chats = await getChat();
    chats.forEach(async chat => {
        let res = await lineClient.pushMessage(chat.groupId, [{
            type: 'text',
            text: `Good afternoon everyone, it's ${moment().format('h:mm a')}.\nHave you wake up yet ? cause the real me haven't.\nMake sure you have eaten your lunch and stay safe at home if possible.`
        }])
        saveReq(res);
    });
}
cron.schedule('0 0 12 * * *', () => {
    goodAfternnoon()
}, CronOption)

//Evening Greeting 
async function eveningGreeting() {
    let chats = await getChat();
    chats.forEach(async chat => {
        let res = await lineClient.pushMessage(chat.groupId, [{
            type: 'text',
            text: `Evening everyone !, it's ${moment().format('h:mm a')}.\nIt's almost night, have you had your dinner yet? cause of this i guess it's not a tiring day.`
        }])
        saveReq(res);
    });
}
cron.schedule('0 30 18 * * *', () => {
    eveningGreeting()
}, CronOption)

//Goodnight Greeting
async function goodNight() {
    let chats = await getChat();
    chats.forEach(async chat => {
        let res = await lineClient.pushMessage(chat.groupId, [{
            type: 'text',
            text: `Nite nite, it's ${moment().format('h:mm a')}.\nI'm sure some of you must be gibah lol.\nWell it's night already so that's it for today. Go sleep already lah stay healthy dont staying up late lol.`
        }])
        saveReq(res);
    });
}
cron.schedule('0 30 22 * * *', () => {
    goodNight()
}, CronOption)
