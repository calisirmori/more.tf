const { fetch, FetchResultTypes } = require("@sapphire/fetch");



async function organize(logsApiInput,textInput,gameId){
  let idObject = { id: gameId }
  let namesObject = {names: logsApiInput.names}
  let teamsObject = {teams : logsApiInput.teams};
  let roundsObject = {rounds : logsApiInput.rounds};
  let sortedHealSpread = {}
  Object.entries(logsApiInput.healspread).map((healer)=>{
    let currentHealingSpread = Object.entries(healer[1])
    .sort(([,b],[,a]) => a-b)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    let currentObject = { [healer[0]] : currentHealingSpread}
    sortedHealSpread = {...sortedHealSpread, ...currentObject}
  })
  let healSpreadsObject = {healSpread : sortedHealSpread};
  let killSpreadObject = {killSpread : logsApiInput.classkills};
  let chatObject = {chat : logsApiInput.chat};
  let playerObject = playerInfo(logsApiInput,textInput)
  let matchInfoObject = await matchInfo(logsApiInput,gameId,playerObject.combined,playerObject.pause)  
  let finalObject = {...idObject, ...matchInfoObject,...teamsObject, ...{players: playerObject.players}, ...namesObject, ...roundsObject, ...healSpreadsObject, ...killSpreadObject, ...chatObject}
  return finalObject;
}

async function matchInfo(logsApiInput,gameId,combinedStatus, pauseLentgh){
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
    "combined": combinedStatus,
    "pause": pauseLentgh
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
          "damage_from": events.recievedSpread[playerID3],
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
          "medicStats": player.medicstats,
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
  return ({players: playerObject, combined: events.combined, pause: events.pause})
}

function eventsHandler(textInput,logsApiInput,outputObject){
  let gameIsCombined = 0;
  let totalPauseLength = 0;
  let gameIsActive = false;
  let stringArray = textInput.split(/\r?\n/);
  let killsArray = [], damageValues = [], damageObject = {}, recievedDamage = {};
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
    else if (eventLog.includes("damage") && gameIsActive) damageSpreadParser(eventLog, damageValues, logsApiInput, damageObject, recievedDamage);
    else if (eventLog.includes("extinguished")) smallStats("extinguished",eventLog, smallEvents);
    else if (eventLog.includes("killedobject")) smallStats("killedobject",eventLog, smallEvents);
    else if (eventLog.includes("player_builtobject")) smallStats("player_builtobject",eventLog, smallEvents);
    else if (eventLog.includes("domination")) smallStats("domination",eventLog, smallEvents);
    else if (eventLog.includes("picked")) smallStats("picked",eventLog, smallEvents);
    else if (eventLog.includes("Game_Over")) gameIsCombined++;
    else if (eventLog.includes("Pause_Length"))  {
      totalPauseLength += parseInt(eventLog.split('"')[3]);
    };
  })
  return({kills: killsArray, damageSpread: damageObject , recievedSpread: recievedDamage, smallEvents: smallEvents, pause: totalPauseLength, combined: gameIsCombined > 1 ? true : false});
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
  } else {
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

let sum =0;
let realsum =0;
function damageSpreadParser(eventLog, damageValues, logsApiInput, damageObject, recievedDamage) {
  let damageDealerId = eventLog.slice(eventLog.indexOf('[U:1:'), eventLog.indexOf(']>') + 1);
  let damageRecieverId = eventLog.slice(eventLog.lastIndexOf('[U:1:'), eventLog.lastIndexOf(']>') + 1);
  let damageDealt = eventLog.slice(eventLog.indexOf('(damage "') + 9, eventLog.lastIndexOf('") (weapon'));
  let currentReal = damageDealt;
  if (eventLog.includes("realdamage")) {
    damageDealt = eventLog.slice(eventLog.indexOf('(damage "') + 9, eventLog.lastIndexOf('") (realdamage'));
    currentReal = eventLog.slice(eventLog.lastIndexOf('") (realdamage') + 16, eventLog.lastIndexOf('") (weapon'));
  }
  damageValues.push([damageDealerId, damageRecieverId, damageDealt, currentReal, damageRecieverId]);
  let damage;
  let damageRecieved;
  try {
    let damageNow = (damageObject[damageDealerId][damageRecieverId]);
    let damageRecievedNow = (recievedDamage[damageRecieverId][damageDealerId]);
    damageNow = damageNow === undefined ? 0 : damageNow;
    damageRecievedNow = damageRecievedNow === undefined ? 0 : damageRecievedNow;
    damage = { [damageRecieverId]: damageNow + parseInt(damageDealt > 450 ? 450 : damageDealt) };
    damageRecieved = { [damageDealerId]: damageRecievedNow + parseInt(damageDealt > 450 ? 450 : damageDealt) };
  } catch (error) {
    damage = { [damageRecieverId]: parseInt(damageDealt > 450 ? 450 : damageDealt) };
    damageRecieved = { [damageRecieverId]: parseInt(damageDealt > 450 ? 450 : damageDealt) };
  }
  recievedDamage[damageRecieverId] = {...recievedDamage[damageRecieverId], ...damageRecieved}
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
  let demostfApiResponse = await fetch(`${URL_DEMOS_API}/profiles/${playerId}?after=${logTime}`, FetchResultTypes.JSON);
  if(demostfApiResponse.length == 0 ){
    return("")
  } else{
    return (demostfApiResponse[demostfApiResponse.length-1].id);
  } 
}

function id3toid64(userid3) {
  let steamid64ent1 = 7656, steamid64ent2 = 1197960265728, cleanid3 = userid3.replace(/\]/g, '').split(":")[2]
  return(steamid64ent1 + String(parseInt(cleanid3)+steamid64ent2))
}

function DamageIconMaker(input,team) {
  switch (input) {
    case "scout":
     return ["https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png", team == "Red" ? "https://i.imgur.com/MrgFGiQ.png" :"https://i.imgur.com/a5edNsb.png"];

    case "soldier":
     return ["https://wiki.teamfortress.com/w/images/9/96/Leaderboard_class_soldier.png", team == "Red" ? "https://i.imgur.com/B8lOMdg.png" :"https://i.imgur.com/TBKqtpS.png"];

    case "pyro":
     return ["https://wiki.teamfortress.com/w/images/8/80/Leaderboard_class_pyro.png", team == "Red" ? "https://i.imgur.com/R64iq2P.png" :"https://i.imgur.com/0hzpADm.png"];

    case "demoman":
     return ["https://wiki.teamfortress.com/w/images/4/47/Leaderboard_class_demoman.png", team == "Red" ? "https://i.imgur.com/cdmUpXS.png" :"https://i.imgur.com/CdaXozC.png"];

    case "heavyweapons":
     return ["https://wiki.teamfortress.com/w/images/5/5a/Leaderboard_class_heavy.png", team == "Red" ? "https://i.imgur.com/1BEKUf1.png" :"https://i.imgur.com/vZDsPNS.png"];

    case "engineer":
     return ["https://wiki.teamfortress.com/w/images/1/12/Leaderboard_class_engineer.png", team == "Red" ? "https://i.imgur.com/xsghB77.png" :"https://i.imgur.com/uFGR01S.png"];

    case "medic":
     return ["https://wiki.teamfortress.com/w/images/e/e5/Leaderboard_class_medic.png", team == "Red" ? "https://i.imgur.com/49i0zGE.png" :"https://i.imgur.com/zPLKIvS.png"];

    case "sniper":
      return ["https://wiki.teamfortress.com/w/images/f/fe/Leaderboard_class_sniper.png", team == "Red" ? "https://i.imgur.com/d4G69R5.png" :"https://i.imgur.com/y2ZhbXI.png"];

    case "spy":
      return ["https://wiki.teamfortress.com/w/images/3/33/Leaderboard_class_spy.png", team == "Red" ? "https://i.imgur.com/S949eCG.png" :"https://i.imgur.com/LHmKp72.png"];
  };
};

function mapStats(map){
    let outputObject = {
      URL : "https://i.imgur.com/kFvrhXW.png",
      xOffset : 255,
      yOffset : -43,
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
    } else if (map.includes("sunshine")) {
      outputObject.URL = "https://i.imgur.com/NLFt2qZ.png"
      outputObject.xOffset = 255;
      outputObject.yOffset = -43;
    } else if (map.includes("snake")) {
      outputObject.URL = "https://i.imgur.com/Pq5OgYF.png"
      outputObject.xOffset = 230;
      outputObject.yOffset = -43;
      outputObject.scale = 24;
    } else if (map.includes("metal")) {
      outputObject.URL = "https://i.imgur.com/p9oXMvy.png"
      outputObject.xOffset = 255;
      outputObject.yOffset = -43;
    } else if (map.includes("gully")) {
      outputObject.URL = "https://i.imgur.com/4mH3BYJ.png"
      outputObject.xOffset = 225;
      outputObject.yOffset = -43;
      outputObject.scale = 21;
    } else if (map.includes("process")) {
      outputObject.URL = "https://i.imgur.com/04uFy10.png"
      outputObject.xOffset = 260;
      outputObject.yOffset = -65;
      outputObject.scale = 21;
    } else if (map.includes("bagel")) {
      outputObject.URL = "https://i.imgur.com/2qbaVMG.png"
      outputObject.xOffset = 270;
      outputObject.yOffset = -57;
      outputObject.scale = 23;
    } else if (map.includes("steel")) {
      outputObject.URL = "https://i.imgur.com/GBbqE7I.png"
      outputObject.xOffset = 255;
      outputObject.yOffset = -43;
    }
    return outputObject;
}

module.exports= {organize};