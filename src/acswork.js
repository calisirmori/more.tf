const { fetch, FetchResultTypes } = require("@sapphire/fetch");
const fs = require('fs');
const { rglSeasonsData } = require("../rgldata/seasons.js");


async function getData() {
    
    let combatScores = {
        scout:[],
        soldier:[],
        pyro:[],
        demoman:[],
        heavy:[],
        engineer:[],
        medic:[],
        sniper:[],
        spy:[],
    };

    let apiCall = await fetch("http://logs.tf/api/v1/log", FetchResultTypes.JSON);
    let logsArray = Object.entries(apiCall.logs);
    searchAmount = 10;

    for (let index = 0; index < searchAmount; index++) {
        if(logsArray[index] !== undefined && logsArray[index][1].players === 18 && (logsArray[index][1].map === ("koth_product_final1") || logsArray[index][1].map === ("koth_proot_b4b") || logsArray[index][1].map === ("koth_ashville_final"))){
            console.log("#"+ count++ + " | " + Math.ceil((index / searchAmount)*100) + "%");
            let logData = await fetch(`http://logs.tf/api/v1/log/3354778`, FetchResultTypes.JSON);
            for (let y = 0; y < 18; y++) {
                if(Object.entries(logData.players)[y] !== undefined && Object.entries(logData.healspread).length === 2) {
                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "soldier"  && Object.entries(logData.players)[y][1].class_stats[0].total_time === logData.length ){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
                        let currentDpm = Math.round(playerObject.dmg / (playerObject.total_time/60));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentDpm > percentiles[dpmIndex].dpm){
                                dpmPerc = dpmIndex*weights.dpm;
                            }
                        }
                        let currentDtm = Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentDtm > percentiles[dpmIndex].dtm){
                                dtmPerc = dpmIndex*weights.dtm;
                            }
                        }
                        let currentKpm = parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentKpm > percentiles[dpmIndex].kpm){
                                kpmPerc = dpmIndex*weights.kpm;
                            }
                        }
                        let currentApm = parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentApm > percentiles[dpmIndex].apm){
                                apmPerc = dpmIndex*weights.apm/2;
                            }
                        }
                        let currentDeaths = parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentDeaths > percentiles[dpmIndex].deathpm){
                                deathpmPerc = dpmIndex*weights.deathpm;
                            }
                        }
                        // let constat = ((Math.round(dpmPerc*10))/10)+((Math.round(dtmPerc*10))/10)+((Math.round(kpmPerc*10))/10)+((Math.round(apmPerc*10))/10)+((Math.round(deathpmPerc*10))/10);
                        Math.round((dpmPerc+dtmPerc+kpmPerc+apmPerc+deathpmPerc+43)/0.107) !== null && sumChart.soldier.push(Math.round((dpmPerc+dtmPerc+kpmPerc+apmPerc+deathpmPerc+43)/0.107))
                        console.log(Math.round((dpmPerc+dtmPerc+kpmPerc+apmPerc+deathpmPerc+43)/0.107))
                        // sumChart.soldier.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        // sumChart.soldier.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        // sumChart.soldier.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        // sumChart.soldier.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        // sumChart.soldier.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    }
                }
            }
        }
    }

    fs.writeFile('combatscores.txt', JSON.stringify(combatScores,null,2), err => {
        if (err) {
          console.error(err);
        }
        console.log("wrote new file")
    });
}

module.exports = { getData };