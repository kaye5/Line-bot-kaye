require('dotenv').config()
var OAuth = require('oauth');
var header = {
    "X-Yahoo-App-Id": process.env.YAHOO_APPID
};


async function getYahooWeather(response){

    var request = new OAuth.OAuth(
        null,
        null,
        process.env.YAHOO_CONSUMER_KEY,
        process.env.YAHOO_CONSUMER_SECRET,
        '1.0',
        null,
        'HMAC-SHA1',
        null,
        null,
    );
    //Yahoo woeid https://developer.yahoo.com/weather/documentation.html#woeid
    let query = {
        woeid : 1047908,
        format : 'json'
    }
    let url = `https://weather-ydn-yql.media.yahoo.com/forecastrss?woeid=${query.woeid}&format=${query.format}`
    request.get(url,null,null,
        (err, data, result)=> {
            if (err) {
                console.log(err);
                return -1
            } else {
                response(data)
            }
        }
    );
}
module.exports = {getYahooWeather}
