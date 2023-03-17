const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const fs = require('fs');
let inviteLogs   = [3348206,3353114,3357706,3362169,3367016,3371130,3376625,3348236,3353008,3362162,3367018,3371887,3376610,3348168,3357719,3362200,3367037,
    3376588,3353101,3357681,3362220,3371829,3348281,3353019,3371885,3367006,3376632,3357696];

let advancedLogs = [3348271,3353044,3362230,3371846,3376596,3353048,3367036,3371834,3348225,3353087,3357668,3348222,3353085,3357728,3362223,3371868,3376591
    ,3348274,3367028,3376659,3367014,3357686,3362240,3357667,3362224,3367009];

let mainLogs = [3348305,3353102,3357735,3362239,3367030,3371900,3376584,3348208,3353035,3357699,3367077,3353090,3362233,3376628,3348216,3367024,3371873,3376600,3353094,3357720,3362252,3366987,3376592
    ,3348289,3353063,3357718,3362214,3367040,3371881,3353076,3357727,3367123,3371816,3348295,3357762,3376605,3348224,3364729,3348312,3360092,3362226,3371869,3376560];

let intermediateLogs = [3348268,3353025,3357723,3362175,3367000 ,3366943,3371825,3376567 ,3376542 ,3348176,3353173,3357804,3366912,3366954,3371865 ,3371822 ,3371788,3376619,3357639 ,3357692,3376639
,3353053,3362202,3367061,3376566,3348209,3362246,3353081,3357677,3367069,3376638,3348228,3353139,3362161,3367073,3371949,3362227,3371810,3348257,3371901,3357715];

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
                fs.writeFile('im.txt', JSON.stringify(currentObject,null,2), err => {
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

    let oldSummary = Object.entries(S14summary);
    let newSummary = S14summary;
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
    const response = await fetch(`http://localhost:3000/api/rgl-profile/${currentPlayerId}`, FetchResultTypes.JSON);
    newSummary[division][id3].playerUserName = response.name;
    newSummary[division][id3].division = response.currentTeams.highlander !== null ? response.currentTeams.highlander.divisionName : "none";
    newSummary[division][id3].team = response.currentTeams.highlander !== null ? response.currentTeams.highlander.name : "none";
    newSummary[division][id3].teamId = response.currentTeams.highlander !== null ? response.currentTeams.highlander.id : "none";
}

module.exports = { makeSummary, rglAPIcalls };