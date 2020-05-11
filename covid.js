const axios = require('axios')
async function getCovidData(countryID){
    let res = await axios.get(`https://api.covid19api.com/dayone/country/${countryID}`)
    if(res.data.length > 0){
        let latestInfo = res.data[res.data.length-1]
        return latestInfo
    }
}

module.exports = {getCovidData}