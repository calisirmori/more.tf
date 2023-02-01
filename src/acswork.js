const { fetch, FetchResultTypes } = require("@sapphire/fetch");
const fs = require('fs');
const { rglSeasonsData } = require("../rgldata/seasons.js");


async function getData() {
    let sumChart = {
        dpm : [],
        dtm : [],
        kpm : [],
        apm : [],
        deathpm: [],
    };

    let apiCall = await fetch("http://logs.tf/api/v1/log?map=koth_product_final&limit=200&players=18", FetchResultTypes.JSON);

    let logsArray = Object.entries(apiCall.logs);
    console.log(logsArray.length);

    for (let index = 0; index < logsArray.length; index++) {
        console.log(Math.ceil((index / logsArray.length)*100) + "%");
        let logData = await fetch(`http://logs.tf/api/v1/log/${logsArray[index][1].id}`, FetchResultTypes.JSON);
        for (let y = 0; y < 18; y++) {
            if(Object.entries(logData.players)[y] !== undefined) {
                if(Object.entries(logData.players)[y][1].class_stats[0].type === "demoman"){
                    playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    sumChart.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    sumChart.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    sumChart.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    sumChart.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    sumChart.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                }
            }
        }
    }

    fs.writeFile('sums.txt', JSON.stringify(sumChart,null,2), err => {
        if (err) {
          console.error(err);
        }
        console.log("wrote new file")
    });
}

module.exports = { getData };