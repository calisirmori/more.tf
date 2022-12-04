
//this page is used to produce 1 object to save and will not be used after that making 200api calls on each load would be insane
//this will be used at end of each season to produce a summary object
539
const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const fs = require('fs');

let inviteLogs   = ["3280749","3280753","3280813","3280830","3284610","3284707","3284680","3284708","3288567","3288537","3288556","3288581","3292425","3292480",
                    "3292458","3292488","3296366","3295902","3296343","3295889","3300486","3300529","3300533","3300558","3304444","3304396","3304455"];

let advancedLogs = ["3280745","3284689","3288548","3292402","3296405","3300499","3304473","3280799","3288614","3300548","3304460","3284676","3288528","3292452",
                    "3296374","3300567","3280785","3284704","3288552","3292464","3296409","3280809","3284638","3304454","3296380","3296380","3300496"];

let mainLogs = ["3280798","3284635","3288518","3292435","3295877","3300501","3304443","3280741","3284651","3288523","3296401","3300539","3304439","3280783",
                "3288571","3292418","3300536","3304427","3284698","3296359","3284661","3288550","3292466","3296383","3304457","3280788","3308748",
                "3292417","3288642","3280795","3284693","3292421","3304530"];

let intermediateLogs = ["3280748","3284662","3292443","3296342","3300504","3304406","3284670","3292489","3296377","3300535","3304480","3280721","3298682","3304413",
                        "3280769","3284639","3288586","3292461","3280790","3288562","3304438","3280784","3284686","3288641","3296361","3300532","3284714","3292416",
                        "3296390","3300563","3280720","3292455","3300500"];

let playerObject = { ["id3"] : {
                "playerID64" : 0, 
                playerUserName : 0, 
                division : 0, 
                team : 0, 
                teamPlacement : 0,
                classPlayed : 0,
                gamesPlayed : 0,
                kills : 0,
                deaths : 0,
                assists : 0,
                damage : 0,
                dpm: 0,
                damageTaken : 0,
                ubers : 0,
                drops : 0,
                medkits : 0,
                backstabs : 0,
                headshots : 0,
                headshotsHit : 0,
                heal : 0,
                pointsCapped : 0,
    }
}

function id3toid64(userid3) {
    let steamid64ent1 = 7656, steamid64ent2 = 1197960265728, cleanid3 = userid3.replace(/\]/g, '').split(":")[2]
    return(steamid64ent1 + String(parseInt(cleanid3)+steamid64ent2))
}

function makeSummary(){
    let summaryFinalObject = {};
    let currentObject = {};
    let count = 1;

    const forLoop = async _ => {
        console.log('Start')
        for (let index = 0; index < intermediateLogs.length; index++) {
            let gameId = intermediateLogs[index];
          console.log(count + "/" + intermediateLogs.length)
          let apiCall = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
          let playersArray = Object.entries(apiResponse.players);
          await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "intermediate", 
                    team : apiResponse.info.title, 
                    teamPlacement : 0,
                    classPlayed : playerStats[1].class_stats[0].type,
                    gamesPlayed : 1,
                    kills : playerStats[1].kills,
                    deaths : playerStats[1].deaths,
                    assists : playerStats[1].assists,
                    damage : playerStats[1].dmg,
                    dpm: playerStats[1].dapm,
                    damageTaken : playerStats[1].dt,
                    ubers : playerStats[1].ubers,
                    drops : playerStats[1].drops,
                    medkits : playerStats[1].medkits,
                    backstabs : playerStats[1].backstabs,
                    headshots : playerStats[1].headshots,
                    headshotsHit : playerStats[1].headshots_hit,
                    heal : playerStats[1].heal,
                    pointsCapped : playerStats[1].cpc,
                    totalTime: playerStats[1].class_stats[0].total_time
                }

                if(currentObject[playerStats[0]] == undefined){
                    currentObject[playerStats[0]]= {...currentObject[playerStats], ...playerObject}
                    
                } else {
                    currentObject[playerStats[0]].gamesPlayed += playerObject.gamesPlayed;
                    currentObject[playerStats[0]].kills += playerObject.kills;
                    currentObject[playerStats[0]].team += (", " + playerObject.team) ;
                    currentObject[playerStats[0]].classPlayed = playerObject.classPlayed;
                    currentObject[playerStats[0]].assists += playerObject.assists;
                    currentObject[playerStats[0]].deaths += playerObject.deaths;
                    currentObject[playerStats[0]].damage += playerObject.damage;
                    currentObject[playerStats[0]].dpm += playerObject.dpm;
                    currentObject[playerStats[0]].damageTaken += playerObject.damageTaken;
                    currentObject[playerStats[0]].ubers += playerObject.ubers;
                    currentObject[playerStats[0]].drops += playerObject.drops;
                    currentObject[playerStats[0]].medkits += playerObject.medkits;
                    currentObject[playerStats[0]].backstabs += playerObject.backstabs;
                    currentObject[playerStats[0]].headshots += playerObject.headshots;
                    currentObject[playerStats[0]].headshotsHit += playerObject.headshotsHit;
                    currentObject[playerStats[0]].heal += playerObject.heal;
                    currentObject[playerStats[0]].pointsCapped += playerObject.pointsCapped;
                    currentObject[playerStats[0]].totalTime += playerObject.totalTime;
                } 
            });
            if(count == intermediateLogs.length){
                fs.writeFile('im2.txt', JSON.stringify(currentObject,null,2), err => {
                    if (err) {
                      console.error(err);
                    }
                    console.log("wrote new file")
                   });
             }
            count++;
        }
        console.log('End')
    }
    forLoop();
}
module.exports = { makeSummary };