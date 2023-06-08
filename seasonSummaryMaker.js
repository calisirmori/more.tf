const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const fs = require('fs');
const { S15summary } = require('./summary');

let inviteLogs   = [3429957,3429937,3430002];

let advancedLogs = [3429952,3429944,3429979,3429935];

let mainLogs = [3429972,3429956,3429931,3429942,3430214,3429982,3429950,3429971];

let intermediateLogs = [3429864,3429833,3429908,3429959,3429976];

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
          let apiResponse = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
          let playersArray = Object.entries(apiResponse.players);
          await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                // if(playerStats[1].class_stats[0].type === "pyro" ){
                //     console.log(playerStats[1].class_stats[0].type,apiResponse.names[playerStats[0]],gameId )
                // }
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "intermediate", 
                    team : apiResponse.info.title, 
                    teamPlacement : 0,
                    classPlayed : {},
                }

                let playerClassPlayedOject = {
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
                }
                
                if(currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] === undefined){
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] = playerClassPlayedOject;
                }

                else {
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].kills += playerClassPlayedOject.kills;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].classPlayed = playerClassPlayedOject.classPlayed;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].assists += playerClassPlayedOject.assists;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].deaths += playerClassPlayedOject.deaths;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damage += playerClassPlayedOject.damage;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].dpm += playerClassPlayedOject.dpm;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damageTaken += playerClassPlayedOject.damageTaken;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].ubers += playerClassPlayedOject.ubers;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].drops += playerClassPlayedOject.drops;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].medkits += playerClassPlayedOject.medkits;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].backstabs += playerClassPlayedOject.backstabs;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshots += playerClassPlayedOject.headshots;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshotsHit += playerClassPlayedOject.headshotsHit;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].heal += playerClassPlayedOject.heal;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].pointsCapped += playerClassPlayedOject.pointsCapped;
                    currentObject[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].totalTime += playerClassPlayedOject.totalTime;
                } 
            });
            if(count == intermediateLogs.length){
                fs.writeFile('intermediateLogs.txt', JSON.stringify(currentObject,null,2), err => {
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

function rglAPIcalls(){

    let oldSummary = Object.entries(S15summary);
    let newSummary = S15summary;
    const forLoop = async _ => {
    for (let divisionIndex = 0; divisionIndex < oldSummary.length; divisionIndex++) {
        let playerArray = Object.entries(oldSummary[divisionIndex][1]);
        for (let playerIndex = 0; playerIndex < playerArray.length; playerIndex++) {
            console.log( playerIndex + "|" + playerArray.length + "|" + oldSummary[divisionIndex][0])
            await new Promise(resolve => setTimeout(resolve, 700));       
            rglCall(playerArray[playerIndex][1].playerID64,playerArray[playerIndex][0],oldSummary[divisionIndex][0], newSummary)
            fs.writeFile('newSummary.txt', JSON.stringify(newSummary,null,2), err => {
                if (err) {
                  console.error(err);
                }
                console.log("wrote new file")
            });
        }
        await new Promise(resolve => setTimeout(resolve, 100));       
        }
    }
    forLoop();
}


async function rglCall(currentPlayerId, id3, division, newSummary){
    try {
        const response = await fetch(`http://localhost:3000/api/rgl-profile/${currentPlayerId}`, FetchResultTypes.JSON);
        newSummary[division][id3].playerUserName = response.name;
        newSummary[division][id3].division = response.currentTeams.highlander !== null ? response.currentTeams.highlander.divisionName : "none";
        newSummary[division][id3].team = response.currentTeams.highlander !== null ? response.currentTeams.highlander.name : "none";
        newSummary[division][id3].teamId = response.currentTeams.highlander !== null ? response.currentTeams.highlander.id : "none";
    } catch (error) {
        
    }
}

module.exports = { makeSummary, rglAPIcalls };