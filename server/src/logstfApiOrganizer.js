const axios = require('axios');

async function organize(logsApiInput,textInput,gameId){
  
  let idObject = { id: gameId }
  let matchInfoObject = await matchInfo(logsApiInput.data,gameId)
  let playerObject = playerInfo(logsApiInput.data,textInput)
  
  let finalObject = {...idObject, ...matchInfoObject, ...playerObject}
  return finalObject;
}

async function matchInfo(logsApiInput,gameId){
  let randomPlayerID = id3toid64(Object.keys(logsApiInput.players)[0]);
  let matchInfoObject = {
    "matchInfo" : {
    "logsID" : gameId,
    "demosID" : await demostfLinkIdFinder(logsApiInput.info.date,randomPlayerID),
    "uniqueID" : Math.floor(Math.random() * 90000000 + 10000000),
    "map": logsApiInput.info.map,
    "mapImageURL": mapStats(logsApiInput.info.map).URL,
    "offsets":{
        "x": mapStats(logsApiInput.info.map).xOffset,
        "y": mapStats(logsApiInput.info.map).yOffset,
        "scale": mapStats(logsApiInput.info.map).scale,
    },
    "totalLength": logsApiInput.info.total_length,
    "title": logsApiInput.info.title,
    "date": logsApiInput.info.date,
    }
  }
  return(matchInfoObject);
}

function playerInfo(logsApiInput,textInput){
  let killsList = eventsHandler(textInput);
  let playerObject;
  for(let playerIndex = 0; playerIndex < Object.entries(logsApiInput.players).length; playerIndex++){
    let player = Object.entries(logsApiInput.players)[playerIndex][1];
    let playerEventsList =[]
    for(let eventIndex = 0; eventIndex < killsList.length; eventIndex++){
      if(killsList[eventIndex].killer == Object.entries(logsApiInput.players)[playerIndex][0]){
        playerEventsList.push(killsList[eventIndex])
      }
    }
    playerObject = {...playerObject,
      [Object.entries(logsApiInput.players)[playerIndex][0]]: {
          "userName" : logsApiInput.names[Object.entries(logsApiInput.players)[playerIndex][0]],
          "team": player.team,
          "class": player.class_stats[0].type,
          "classImageURL": DamageIconMaker(player.class_stats[0].type,player.team)[1],
          "classIconURL": DamageIconMaker(player.class_stats[0].type,player.team)[0],
          "steamID64": id3toid64(Object.entries(logsApiInput.players)[playerIndex][0]),
          "classStats": player.class_stats,
          "kills": player.kills,
          "deaths": player.deaths,
          "assists": player.assists,
          "suicides": player.suicides,
          "kapd": player.kapd,
          "kpd": player.kpd,
          "damage_towards": {
              "scout": 0,
              "soldier": 0,
              "pyro": 0,
              "demoman": 0,
              "heavyweapons": 0,
              "engineer": 0,
              "medic": 0,
              "sniper": 0,
              "spy": 0
          },
          "events": playerEventsList,
          "damage": player.dmg,
          "damageTaken": player.dt,
          "damageTakenReal": player.dt_real,//?
          "hr": player.hr,//?
          "lks": player.lks,//?
          "airShot": player.as,
          "DamagePerDeath": player.dapd,
          "DamagePM": player.dapm,
          "ubers": player.ubers,
          "ubertypes": {},
          "drops": player.drops,
          "medkits": player.medkits,
          "medkitsHP": player.medkits_hp,
          "backstabs": player.backstabs,
          "headshots": player.headshots,
          "headshots_hit": player.headshots_hit,
          "sentries": player.sentries,//?
          "heal": player.heal,
          "pointCaps": player.cpc,
          "ic": player.ic, //?
          "extinguished": 2,
          "domination": 0,
          "objectkills": 1,
          "objectbuilds": 0,
          "ammopickup": 12,
      }
    }
  }
  // console.log(Object.entries(Object.entries(playerObject)[8])[1][1].events)
  return ({players: playerObject})
}

function eventsHandler(textInput){
  let gameIsActive = false;
  let stringArray = textInput.split(/\r?\n/);
  let killsArray = []
  stringArray.map((eventLog) =>{
    if(eventLog.includes("Round_Start")) gameIsActive = true;
    if(eventLog.includes("Round_Win")) gameIsActive = false;
    if(eventLog.includes(" killed ") && gameIsActive){
      dateToSeconds(eventLog);
      currentKillerId = eventLog.slice(eventLog.indexOf('[U:1:'),eventLog.indexOf(']>')+1);
      currentVictimId = eventLog.slice(eventLog.lastIndexOf('[U:1:'),eventLog.lastIndexOf(']>')+1);
      currentKillerLocation = eventLog.slice(eventLog.indexOf('attacker_position') + 19 , eventLog.lastIndexOf(') (victim_position')-1 )
      currentVictimLocation = eventLog.slice(eventLog.indexOf('victim_position') + 17 , eventLog.lastIndexOf('")'))
      killerWeapon = eventLog.slice(eventLog.indexOf('with "')+6, eventLog.lastIndexOf('" ('))
      killsArray.push({
        "type": "kill",
        "killer": currentKillerId,
        "killer_location": { 
          x : currentKillerLocation.split(" ")[0],
          y : currentKillerLocation.split(" ")[1]
        },
        "victim": currentVictimId,
        "victim_location": { 
          x : currentVictimLocation.split(" ")[0],
          y : currentVictimLocation.split(" ")[1]
        },
        "weapon": killerWeapon,
        "time": dateToSeconds(eventLog),
      })
    }
  })
  return(killsArray);
}

function dateToSeconds(eventLog){
  let eventArray = eventLog.split(" "),setupDate = eventArray[1].split("/"),setupTime = eventArray[3].split(":");
  return (new Date(setupDate[2] + "-" + setupDate[0] + "-" + setupDate[1] + "T" + setupTime[0] + ":" + setupTime[1] + ":" + setupTime[2]).getTime() / 1000)
}

async function demostfLinkIdFinder(logTime,playerId){
  const URL_DEMOS_API = "https://api.demos.tf"
  let demostfApiResponse = await axios.get(`${URL_DEMOS_API}/profiles/${playerId}?after=${logTime}`);
  return (demostfApiResponse.data[demostfApiResponse.data.length-1].id)
}

function id3toid64(userid3) {
  let steamid64ent1 = 7656, steamid64ent2 = 1197960265728, cleanid3 = userid3.replace(/\]/g, '').split(":")[2]
  return(steamid64ent1 + String(parseInt(cleanid3)+steamid64ent2))
}

function DamageIconMaker(input,team) {
  switch (input) {
    case "scout":
     return ["https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png", team == "Red" ? "https://i.imgur.com/Uce0Bdj.png" :"https://i.imgur.com/oh8HBK1.png"];

    case "soldier":
     return ["https://wiki.teamfortress.com/w/images/9/96/Leaderboard_class_soldier.png", team == "Red" ? "https://i.imgur.com/CiyuvEw.png" :"https://i.imgur.com/nneilnw.png"];

    case "pyro":
     return ["https://wiki.teamfortress.com/w/images/8/80/Leaderboard_class_pyro.png", team == "Red" ? "https://i.imgur.com/qS8EwB4.png" :"https://i.imgur.com/QTNO5VK.png"];

    case "demoman":
     return ["https://wiki.teamfortress.com/w/images/4/47/Leaderboard_class_demoman.png", team == "Red" ? "https://i.imgur.com/ZDabng6.png" :"https://i.imgur.com/ju7WRcV.png"];

    case "heavyweapons":
     return ["https://wiki.teamfortress.com/w/images/5/5a/Leaderboard_class_heavy.png", team == "Red" ? "https://i.imgur.com/d3hRlNO.png" :"https://i.imgur.com/iLTdXY8.png"];

    case "engineer":
     return ["https://wiki.teamfortress.com/w/images/1/12/Leaderboard_class_engineer.png", team == "Red" ? "https://i.imgur.com/mBF07Qk.png" :"https://i.imgur.com/yP4PRkq.png"];

    case "medic":
     return ["https://wiki.teamfortress.com/w/images/e/e5/Leaderboard_class_medic.png", team == "Red" ? "https://i.imgur.com/zKWSg1d.png" :"https://i.imgur.com/BaskmeI.png"];

    case "sniper":
      return ["https://wiki.teamfortress.com/w/images/f/fe/Leaderboard_class_sniper.png", team == "Red" ? "https://i.imgur.com/cf0N6qe.png" :"https://i.imgur.com/0nGnxsH.png"];

    case "spy":
      return ["https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png", team == "Red" ? "https://i.imgur.com/TaPGIUR.png" :"https://i.imgur.com/QbP4znS.png"];
  };
};

function mapStats(map){
    let outputObject = {
      URL : "",
      xOffset : 0,
      yOffset : 0,
      scale: 17.8,
    }
    if(map.includes("swift")) {
      outputObject.URL = "https://i.imgur.com/EtCcpOA.png";
      outputObject.xOffset = 78;
      outputObject.yOffset = 16;
    } else if (map.includes("product")) {
      outputObject.URL = "https://i.imgur.com/YoSSGDd.png";
      outputObject.xOffset = 352;
      outputObject.yOffset = -82;
    } else if (map.includes("vigil")) {
      outputObject.URL = "https://i.imgur.com/g6NzUn1.png";
      outputObject.xOffset = 180;
      outputObject.yOffset = -160;
    } else if (map.includes("upward")) {
      outputObject.URL = "https://i.imgur.com/z8JJgT8.png";
      outputObject.xOffset = 262;
      outputObject.yOffset = -55;
    } else if (map.includes("proot")) {
      outputObject.URL = "https://i.imgur.com/hRWgf6O.png";
      outputObject.xOffset = 270;
      outputObject.yOffset = -72;
    } else if (map.includes("ashville")) {
      outputObject.URL = "https://i.imgur.com/1RW16HF.png";
      outputObject.xOffset = 258;
      outputObject.yOffset = -68;
    } else if (map.includes("steel")) {
      outputObject.URL = "https://i.imgur.com/GBbqE7I.png"
      outputObject.xOffset = 255;
      outputObject.yOffset = -43;
    }
    return outputObject;
}

module.exports= {organize};