require('dotenv').config()
const express = require("express");
const app = express();
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
const middleware = require("@line/bot-sdk").middleware;
const LineClient = require("@line/bot-sdk").Client;
const config = {
    channelAccessToken: process.env.CAT,
    channelSecret: process.env.CSK,
};
const lineClient = new LineClient(config);
/**
 * @description Testing
 */
// app.post("/webhook", (req, res) => {
//     try {
//         let coll = database.collection('logs')
//         coll.insertOne({
//             events: req.body.events,
//             destination: req.body.destination,
//         })
//         if (req.body.events[0].type == 'join') {
//             let type = req.body.events[0].source.type
//             if (type == 'group') {
//                 getGroupID(req.body.events[0])
//             }
//         }
//         res.sendStatus(200)
//     } catch (err) {
//         console.log(err)
//         res.sendStatus(500)
//     }
// });

/**
 * @description Production
 */
app.post("/webhook", middleware(config), (req, res) => {
    try {
        if (req.body.events[0].type == 'join') {
            let type = req.body.events[0].source.type
            if (type == 'group') {
                getGroupID(req.body.events[0])
            }
            saveLog(req.body)
        }
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());

/**
 * @description save group id
 * @param {JSON} data body data
 */
async function getGroupID(data) {
    collChat.insertOne(data.source)
    let res = await lineClient.pushMessage(String(data.source.groupId), [{
            type: 'text',
            text: `Hey there,this is kaye's companion $.\nI'll help make your daily life better.`,
            emojis: [{
                index: 35,
                productId: "5ac1bfd5040ab15980c9b435",
                emojiId: "011"
            }]
        },
        {
            type: 'sticker',
            packageId: "11538",
            stickerId: "51626494"
        }
    ])
    collReq.insertOne({
        request: res,
        date: new Date()
    })
}

function saveLog(body) {
    let coll = database.collection('logs')
    coll.insertOne({
        events: body.events,
        destination: body.destination,
    })
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("CONNECT TO " + PORT);
});