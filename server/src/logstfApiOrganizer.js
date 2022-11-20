const axios = require('axios');

function organize(logsApiInput,textInput,gameId){
    // console.log(textInput)
    // console.log(logsApiInput.data.info)
    matchInfo(logsApiInput.data,gameId);
}

async function matchInfo(logsApiInput,gameId){
    let randomPlayerID = id3toid64(Object.keys(logsApiInput.players)[0]);
    let matchInfoObject = {
        "matchInfo" : {
        "logs_id" : gameId,
        "demos_id" : await demostfLinkIdFinder(logsApiInput.info.date,randomPlayerID),
        "uniqueID" : Math.floor(Math.random() * 90000000 + 10000000),
        "map": logsApiInput.info.map,
        "map_image_url": mapStats(logsApiInput.info.map).URL,
        "offsets":{
            "x": mapStats(logsApiInput.info.map).xOffset,
            "y": mapStats(logsApiInput.info.map).yOffset,
            "scale": mapStats(logsApiInput.info.map).scale,
        },
        "total_length": logsApiInput.info.total_length,
        "title": logsApiInput.info.title,
        "date": logsApiInput.info.date,
        }
    }
    console.log(matchInfoObject)
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
      //
      outputObject.URL = "https://i.imgur.com/YoSSGDd.png";
      outputObject.xOffset = 352;
      outputObject.yOffset = -82;
    } else if (map.includes("vigil")) {
      //
      outputObject.URL = "https://i.imgur.com/g6NzUn1.png";
      outputObject.xOffset = 180;
      outputObject.yOffset = -160;
    } else if (map.includes("upward")) {
      //?
      outputObject.URL = "https://i.imgur.com/z8JJgT8.png";
      outputObject.xOffset = 262;
      outputObject.yOffset = -55;
    } else if (map.includes("proot")) {
      //
      outputObject.URL = "https://i.imgur.com/hRWgf6O.png";
      outputObject.xOffset = 270;
      outputObject.yOffset = -72;
    } else if (map.includes("ashville")) {
      //
      outputObject.URL = "https://i.imgur.com/1RW16HF.png";
      outputObject.xOffset = 258;
      outputObject.yOffset = -68;
    } else if (map.includes("steel")) {
      //
      outputObject.URL = "https://i.imgur.com/GBbqE7I.png"
      outputObject.xOffset = 255;
      outputObject.yOffset = -43;
    }
    return outputObject;
}

module.exports= {organize};