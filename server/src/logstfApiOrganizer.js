const axios = require('axios');

async function organize(logsApiInput,textInput,gameId){
  
  let idObject = { id: gameId }
  let teamsObject = {teams : logsApiInput.data.teams};
  let matchInfoObject = await matchInfo(logsApiInput.data,gameId)
  let playerObject = playerInfo(logsApiInput.data,textInput)
  
  let finalObject = {...idObject, ...matchInfoObject,...teamsObject, ...playerObject}
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
  let events = eventsHandler(textInput,logsApiInput);
  let playerObject;
  for(let playerIndex = 0; playerIndex < Object.entries(logsApiInput.players).length; playerIndex++){
    let player = Object.entries(logsApiInput.players)[playerIndex][1];
    let playerEventsList =[]
    for(let eventIndex = 0; eventIndex < events.kills.length; eventIndex++){
      if(events.kills[eventIndex].killer == Object.entries(logsApiInput.players)[playerIndex][0]){
        playerEventsList.push(events.kills[eventIndex])
      }
    }
    let playerID3 = Object.entries(logsApiInput.players)[playerIndex][0];
    playerObject = {...playerObject,
      [playerID3]: {
          "userName" : logsApiInput.names[playerID3],
          "team": player.team,
          "class": player.class_stats[0].type,
          "classImageURL": DamageIconMaker(player.class_stats[0].type,player.team)[1],
          "classIconURL": DamageIconMaker(player.class_stats[0].type,player.team)[0],
          "steamID64": id3toid64(playerID3),
          "classStats": player.class_stats,
          "kills": player.kills,
          "deaths": player.deaths,
          "assists": player.assists,
          "suicides": player.suicides,
          "kapd": player.kapd,
          "kpd": player.kpd,
          "damage_towards": events.damageSpread[playerID3],
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
          "ubertypes": player.ubertypes,
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
          "extinguished": events.smallEvents.extinguished[playerID3] == undefined ? 0 : events.smallEvents.extinguished[playerID3],
          "domination": events.smallEvents.domination[playerID3] == undefined ? 0 : events.smallEvents.domination[playerID3],
          "objectkills": events.smallEvents.killedobject[playerID3] == undefined ? 0 : events.smallEvents.killedobject[playerID3],
          "objectbuilds": events.smallEvents.player_builtobject[playerID3] == undefined ? 0 : events.smallEvents.player_builtobject[playerID3],
          "ammopickup": events.smallEvents.ammopickup[playerID3] == undefined ? 0 : events.smallEvents.ammopickup[playerID3],
      }
    }
  }
  // console.log(Object.entries(Object.entries(playerObject)[8])[1][1].events)
  return ({players: playerObject})
}

function eventsHandler(textInput,logsApiInput,outputObject){

  let gameIsActive = false;
  let stringArray = textInput.split(/\r?\n/);
  let killsArray = [], damageValues = [], damageObject = {}
  let smallEvents = {
    "extinguished": {},
    "domination": {},
    "killedobject": {},
    "player_builtobject": {},
    "ammopickup": {},
  }

  stringArray.map((eventLog) =>{
    if(eventLog.includes("Round_Start")) gameIsActive = true;
    else if (eventLog.includes("Round_Win")) gameIsActive = false;
    else if (eventLog.includes(" killed ") && gameIsActive) killEventParser(eventLog, killsArray);
    else if (eventLog.includes("damage") && gameIsActive) damageSpreadParser(eventLog, damageValues, logsApiInput, damageObject);
    else if (eventLog.includes("extinguished")) smallStats("extinguished",eventLog, smallEvents)
    else if (eventLog.includes("killedobject")) smallStats("killedobject",eventLog, smallEvents)
    else if (eventLog.includes("player_builtobject")) smallStats("player_builtobject",eventLog, smallEvents)
    else if (eventLog.includes("domination")) smallStats("domination",eventLog, smallEvents)
    else if (eventLog.includes("picked")) smallStats("picked",eventLog, smallEvents)
  })
  return({kills: killsArray, damageSpread: damageObject , smallEvents: smallEvents});
}

function smallStats(eventSearched, eventInput, smallEvents){
  currentPlayerId = eventInput.slice(eventInput.indexOf('[U:1:'),eventInput.indexOf(']>')+1);
  if(eventSearched === "picked"){
    if( eventInput.includes("ammopack_small")){
      smallEvents.ammopickup[currentPlayerId] == undefined ? smallEvents.ammopickup[currentPlayerId] = 1 : smallEvents.ammopickup[currentPlayerId]++;
    } else if (eventInput.includes("tf_ammo_pack") || eventInput.includes("ammopack_medium") ){
      smallEvents.ammopickup[currentPlayerId] == undefined ? smallEvents.ammopickup[currentPlayerId] = 1 : smallEvents.ammopickup[currentPlayerId]+=2;
    } else if( eventInput.includes("ammopack_large")){
      smallEvents.ammopickup[currentPlayerId] == undefined ? smallEvents.ammopickup[currentPlayerId] = 1 : smallEvents.ammopickup[currentPlayerId]+=4;
    }
  }else {
    smallEvents[eventSearched][currentPlayerId] == undefined ? smallEvents[eventSearched][currentPlayerId] = 1 : smallEvents[eventSearched][currentPlayerId]++;
  }
}

function killEventParser(eventLog, killsArray) {
  dateToSeconds(eventLog);
  let currentKillerId = eventLog.slice(eventLog.indexOf('[U:1:'), eventLog.indexOf(']>') + 1);
  let currentVictimId = eventLog.slice(eventLog.lastIndexOf('[U:1:'), eventLog.lastIndexOf(']>') + 1);
  let currentKillerLocation = eventLog.slice(eventLog.indexOf('attacker_position') + 19, eventLog.lastIndexOf(') (victim_position') - 1);
  let currentVictimLocation = eventLog.slice(eventLog.indexOf('victim_position') + 17, eventLog.lastIndexOf('")'));
  let killerWeapon = eventLog.slice(eventLog.indexOf('with "') + 6, eventLog.lastIndexOf('" ('));
  killsArray.push({
    "type": "kill",
    "killer": currentKillerId,
    "killer_location": {
      x: currentKillerLocation.split(" ")[0],
      y: currentKillerLocation.split(" ")[1]
    },
    "victim": currentVictimId,
    "victim_location": {
      x: currentVictimLocation.split(" ")[0],
      y: currentVictimLocation.split(" ")[1]
    },
    "weapon": killerWeapon,
    "time": dateToSeconds(eventLog),
  });
}

function damageSpreadParser(eventLog, damageValues, logsApiInput, damageObject) {
  let damageDealerId = eventLog.slice(eventLog.indexOf('[U:1:'), eventLog.indexOf(']>') + 1);
  let damageRecieverId = eventLog.slice(eventLog.lastIndexOf('[U:1:'), eventLog.lastIndexOf(']>') + 1);
  let damageDealt = eventLog.slice(eventLog.indexOf('(damage "') + 9, eventLog.lastIndexOf('") (weapon'));
  let currentReal = damageDealt;
  if (eventLog.includes("realdamage")) {
    damageDealt = eventLog.slice(eventLog.indexOf('(damage "') + 9, eventLog.lastIndexOf('") (realdamage'));
    currentReal = eventLog.slice(eventLog.lastIndexOf('") (realdamage') + 16, eventLog.lastIndexOf('") (weapon'));
  }
  damageValues.push([damageDealerId, damageRecieverId, damageDealt, currentReal, classFinder(damageRecieverId, logsApiInput)]);
  let damage;
  try {
    // console.log(parseInt(currentReal))
    let damageNow = (damageObject[damageDealerId][classFinder(damageRecieverId, logsApiInput)]);
    damageNow = damageNow == undefined ? 0 : damageNow;
    damage = { [classFinder(damageRecieverId, logsApiInput)]: damageNow + parseInt(damageDealt) };
  } catch (error) {
    damage = { [classFinder(damageRecieverId, logsApiInput)]: parseInt(damageDealt) };
  }
  damageObject[damageDealerId] = { ...damageObject[damageDealerId], ...damage };
}

function classFinder(userId,logsApiInput){
  return (logsApiInput.players[userId].class_stats[0].type);
}

function dateToSeconds(eventLog){
  let eventArray = eventLog.split(" "),setupDate = eventArray[1].split("/"),setupTime = eventArray[3].split(":");
  return (new Date(setupDate[2] + "-" + setupDate[0] + "-" + setupDate[1] + "T" + setupTime[0] + ":" + setupTime[1] + ":" + setupTime[2]).getTime() / 1000)
}

async function demostfLinkIdFinder(logTime,playerId){
  const URL_DEMOS_API = "https://api.demos.tf"
  let demostfApiResponse = await axios.get(`${URL_DEMOS_API}/profiles/${playerId}?after=${logTime}`);
  console.log(demostfApiResponse.data.length)
  if(demostfApiResponse.data.length == 0 ){
    return("")
  } else{
    return (demostfApiResponse.data[demostfApiResponse.data.length-1].id);
  } 
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
      return ["https://wiki.teamfortress.com/w/images/3/33/Leaderboard_class_spy.png", team == "Red" ? "https://i.imgur.com/TaPGIUR.png" :"https://i.imgur.com/QbP4znS.png"];
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