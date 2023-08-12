const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const fs = require('fs');
const { S15summary } = require('./summary');

let inviteLogs   = [3429937,3434537,3439428,3444003,3451747,3453159,3429957,3434528,3439481,3443979,3453180,3457650,3434510,3439491,3448650,3457626
    ,3430002,3439556,3443974,3444057,3448591,3453186,3434540,3448663,3457549,3429944];

let advancedLogs = [3429935, 3434543, 3439495, 3444023, 3453231, 3457643, 3429979, 3434508, 3439498, 3444050, 3451112, 
                    3453193, 3434518, 3439509, 3444025, 3448704, 3429944, 3434556, 3439471, 3457670, 3457622, 3429972, 
                    3448665, 3457663, 3429952, 3453234];

let mainLogs = [3429950, 3434511, 3439513, 3444012, 3448601, 3453217, 3457657, 3434561, 3439497, 3448662, 3453224, 3448624, 
                3438838, 3468551, 3439529, 3444033, 3444041, 3429956, 3434529, 3439490, 3448620, 3453233, 3429971, 3444029, 
                3439488, 3448634, 3453229, 3457612, 3430214, 3434569, 3439518, 3444013, 3429942, 3448661, 3453195, 3457682, 
                3429972, 3434497, 3453171, 3457670, 3429982, 3439541, 3444032, 3468532, 3457616, 3429931, 3434596, 3453203,
                 3457649, 3457661, 3439504, 3444067, 3468551];

let intermediateLogs = [3429959,3434506,3439483,3443997,3453207,3457653,3429976,3439586,3444015,3453334,3453205,
                        3429954,3434499,3439429,3448714,3457662,3467769,3429956,3434549,3439504,3443985,3467763];

let amateurLogs = [3429932, 3458245, 3439489, 3443973, 3448652, 3453225, 3457630, 3472781, 3472782, 3440553, 3472784, 3472786, 3472788, 
                    3472778, 3472780, 3444051, 3453239, 3457689, 3472789, 3434570, 3439485, 3444018, 3448633, 3453221, 3472795, 3472798, 
                    3472802, 3472830, 3434576, 3448699, 3453420, 3472820, 3472826, 3439511, 3444017, 3472837, 3449003, 3472840, 3472855, 
                    3472851, 3448669, 3453655, 3472847, 3429961, 3472866, 3444297, 3455045, 3434450, 3472880, 3472881, 3444002, 3439453];
   

let newcomerLogs = [3472887, 3434531, 3472888, 3472891, 3448666, 3472892, 3472893, 3472895, 3472896, 3444048, 3472898, 3472902, 3430044, 3439482, 3453941, 
                    3453230, 3457609, 3472922, 3472918, 3439555, 3472916, 3472930, 3439587, 3444020, 3472926, 3441893, 3472935, 3460077, 3431176, 3472934, 
                    3472937, 3444049, 3449365, 3453175, 3472948, 3472952, 3434645, 3472940];


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
    let summaryFinalObject = {
        invite: {},
        advanced: {},
        main: {},
        im: {},
        am:{},
        nc:{}
    };
    let currentObjectInv = {};
    let currentObjectAdv = {};
    let currentObjectMain = {};
    let currentObjectIm = {};
    let currentObjectAm = {};
    let currentObjectNc = {};
    let count = 1;

    const forLoop = async _ => {
        console.log('Start')
        for (let index = 0; index < inviteLogs.length; index++) {
            let gameId = inviteLogs[index];
            console.log(count + "/" + (inviteLogs.length+advancedLogs.length+mainLogs.length+intermediateLogs.length))
            let apiResponse = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
            let playersArray = Object.entries(apiResponse.players);
            await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "placeholder", 
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
                    
                if(currentObjectInv[playerStats[0]] == undefined){
                    currentObjectInv[playerStats[0]]= {...currentObjectInv[playerStats], ...playerObject}
                }
                
                if(currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] === undefined){
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] = playerClassPlayedOject;
                }

                else {
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].kills += playerClassPlayedOject.kills;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].classPlayed = playerClassPlayedOject.classPlayed;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].assists += playerClassPlayedOject.assists;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].deaths += playerClassPlayedOject.deaths;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damage += playerClassPlayedOject.damage;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].dpm += playerClassPlayedOject.dpm;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damageTaken += playerClassPlayedOject.damageTaken;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].ubers += playerClassPlayedOject.ubers;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].drops += playerClassPlayedOject.drops;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].medkits += playerClassPlayedOject.medkits;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].backstabs += playerClassPlayedOject.backstabs;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshots += playerClassPlayedOject.headshots;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshotsHit += playerClassPlayedOject.headshotsHit;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].heal += playerClassPlayedOject.heal;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].pointsCapped += playerClassPlayedOject.pointsCapped;
                    currentObjectInv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].totalTime += playerClassPlayedOject.totalTime;
                } 
            });
            summaryFinalObject.invite = currentObjectInv;
            count++;
        }
        for (let index = 0; index < advancedLogs.length; index++) {
            let gameId = advancedLogs[index];
            console.log(count + "/" + (inviteLogs.length+advancedLogs.length+mainLogs.length+intermediateLogs.length))
            let apiResponse = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
            let playersArray = Object.entries(apiResponse.players);
            await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "placeholder", 
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
                    
                if(currentObjectAdv[playerStats[0]] == undefined){
                    currentObjectAdv[playerStats[0]]= {...currentObjectAdv[playerStats], ...playerObject}
                }
                
                if(currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] === undefined){
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] = playerClassPlayedOject;
                }

                else {
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].kills += playerClassPlayedOject.kills;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].classPlayed = playerClassPlayedOject.classPlayed;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].assists += playerClassPlayedOject.assists;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].deaths += playerClassPlayedOject.deaths;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damage += playerClassPlayedOject.damage;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].dpm += playerClassPlayedOject.dpm;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damageTaken += playerClassPlayedOject.damageTaken;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].ubers += playerClassPlayedOject.ubers;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].drops += playerClassPlayedOject.drops;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].medkits += playerClassPlayedOject.medkits;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].backstabs += playerClassPlayedOject.backstabs;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshots += playerClassPlayedOject.headshots;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshotsHit += playerClassPlayedOject.headshotsHit;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].heal += playerClassPlayedOject.heal;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].pointsCapped += playerClassPlayedOject.pointsCapped;
                    currentObjectAdv[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].totalTime += playerClassPlayedOject.totalTime;
                } 
            });
            summaryFinalObject.advanced = currentObjectAdv;
            count++;
        }
        for (let index = 0; index < mainLogs.length; index++) {
            let gameId = mainLogs[index];
            console.log(count + "/" + (inviteLogs.length+advancedLogs.length+mainLogs.length+intermediateLogs.length))
            let apiResponse = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
            let playersArray = Object.entries(apiResponse.players);
            await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "placeholder", 
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
                    
                if(currentObjectMain[playerStats[0]] == undefined){
                    currentObjectMain[playerStats[0]]= {...currentObjectMain[playerStats], ...playerObject}
                }
                
                if(currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] === undefined){
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] = playerClassPlayedOject;
                }

                else {
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].kills += playerClassPlayedOject.kills;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].classPlayed = playerClassPlayedOject.classPlayed;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].assists += playerClassPlayedOject.assists;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].deaths += playerClassPlayedOject.deaths;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damage += playerClassPlayedOject.damage;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].dpm += playerClassPlayedOject.dpm;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damageTaken += playerClassPlayedOject.damageTaken;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].ubers += playerClassPlayedOject.ubers;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].drops += playerClassPlayedOject.drops;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].medkits += playerClassPlayedOject.medkits;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].backstabs += playerClassPlayedOject.backstabs;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshots += playerClassPlayedOject.headshots;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshotsHit += playerClassPlayedOject.headshotsHit;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].heal += playerClassPlayedOject.heal;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].pointsCapped += playerClassPlayedOject.pointsCapped;
                    currentObjectMain[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].totalTime += playerClassPlayedOject.totalTime;
                } 
            });
            summaryFinalObject.main = currentObjectMain;
            count++;
        }
        for (let index = 0; index < intermediateLogs.length; index++) {
            let gameId = intermediateLogs[index];
            console.log(count + "/" + (inviteLogs.length+advancedLogs.length+mainLogs.length+intermediateLogs.length))
            let apiResponse = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
            let playersArray = Object.entries(apiResponse.players);
            await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "placeholder", 
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
                    
                if(currentObjectIm[playerStats[0]] == undefined){
                    currentObjectIm[playerStats[0]]= {...currentObjectIm[playerStats], ...playerObject}
                }
                
                if(currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] === undefined){
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] = playerClassPlayedOject;
                }

                else {
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].kills += playerClassPlayedOject.kills;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].classPlayed = playerClassPlayedOject.classPlayed;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].assists += playerClassPlayedOject.assists;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].deaths += playerClassPlayedOject.deaths;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damage += playerClassPlayedOject.damage;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].dpm += playerClassPlayedOject.dpm;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damageTaken += playerClassPlayedOject.damageTaken;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].ubers += playerClassPlayedOject.ubers;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].drops += playerClassPlayedOject.drops;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].medkits += playerClassPlayedOject.medkits;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].backstabs += playerClassPlayedOject.backstabs;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshots += playerClassPlayedOject.headshots;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshotsHit += playerClassPlayedOject.headshotsHit;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].heal += playerClassPlayedOject.heal;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].pointsCapped += playerClassPlayedOject.pointsCapped;
                    currentObjectIm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].totalTime += playerClassPlayedOject.totalTime;
                } 
            });
            summaryFinalObject.im = currentObjectIm;
            count++;
        }
        for (let index = 0; index < amateurLogs.length; index++) {
            let gameId = amateurLogs[index];
            console.log(count + "/" + (inviteLogs.length+advancedLogs.length+mainLogs.length+intermediateLogs.length+amateurLogs.length));
            let apiResponse = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
            let playersArray = Object.entries(apiResponse.players);
            await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "placeholder", 
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
                    
                if(currentObjectAm[playerStats[0]] == undefined){
                    currentObjectAm[playerStats[0]]= {...currentObjectAm[playerStats], ...playerObject}
                }
                
                if(currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] === undefined){
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] = playerClassPlayedOject;
                }

                else {
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].kills += playerClassPlayedOject.kills;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].classPlayed = playerClassPlayedOject.classPlayed;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].assists += playerClassPlayedOject.assists;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].deaths += playerClassPlayedOject.deaths;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damage += playerClassPlayedOject.damage;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].dpm += playerClassPlayedOject.dpm;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damageTaken += playerClassPlayedOject.damageTaken;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].ubers += playerClassPlayedOject.ubers;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].drops += playerClassPlayedOject.drops;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].medkits += playerClassPlayedOject.medkits;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].backstabs += playerClassPlayedOject.backstabs;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshots += playerClassPlayedOject.headshots;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshotsHit += playerClassPlayedOject.headshotsHit;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].heal += playerClassPlayedOject.heal;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].pointsCapped += playerClassPlayedOject.pointsCapped;
                    currentObjectAm[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].totalTime += playerClassPlayedOject.totalTime;
                } 
            });
            summaryFinalObject.am = currentObjectAm;
            count++;
        }
        for (let index = 0; index < newcomerLogs.length; index++) {
            let gameId = newcomerLogs[index];
            console.log(count + "/" + (inviteLogs.length+advancedLogs.length+mainLogs.length+intermediateLogs.length+amateurLogs.length+newcomerLogs.length));
            let apiResponse = await fetch(`https://logs.tf/api/v1/log/${gameId}`, FetchResultTypes.JSON);
            let playersArray = Object.entries(apiResponse.players);
            await new Promise(resolve => setTimeout(resolve, 100));
            playersArray.map((playerStats) => {
                let playerObject = {
                    "playerID64" : id3toid64(playerStats[0]), 
                    playerUserName : apiResponse.names[playerStats[0]], 
                    division : "placeholder", 
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
                    
                if(currentObjectNc[playerStats[0]] == undefined){
                    currentObjectNc[playerStats[0]]= {...currentObjectNc[playerStats], ...playerObject}
                }
                
                if(currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] === undefined){
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type] = playerClassPlayedOject;
                }

                else {
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].kills += playerClassPlayedOject.kills;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].classPlayed = playerClassPlayedOject.classPlayed;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].assists += playerClassPlayedOject.assists;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].deaths += playerClassPlayedOject.deaths;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damage += playerClassPlayedOject.damage;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].dpm += playerClassPlayedOject.dpm;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].damageTaken += playerClassPlayedOject.damageTaken;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].ubers += playerClassPlayedOject.ubers;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].drops += playerClassPlayedOject.drops;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].medkits += playerClassPlayedOject.medkits;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].backstabs += playerClassPlayedOject.backstabs;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshots += playerClassPlayedOject.headshots;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].headshotsHit += playerClassPlayedOject.headshotsHit;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].heal += playerClassPlayedOject.heal;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].pointsCapped += playerClassPlayedOject.pointsCapped;
                    currentObjectNc[playerStats[0]].classPlayed[playerStats[1].class_stats[0].type].totalTime += playerClassPlayedOject.totalTime;
                } 
            });
            summaryFinalObject.nc = currentObjectNc;
            count++;
        }
        summaryFinalObject.nc = currentObjectNc;
        console.log('End');
        rglAPIcalls(summaryFinalObject);
    }
    forLoop();
}

function rglAPIcalls(currentLog){
    let oldSummary = Object.entries(currentLog);
    let newSummary = currentLog;
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