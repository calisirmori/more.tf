

function nonTriggeredEvent(unparsedEvent, finalObject, playerIDFinder){
    if(unparsedEvent.includes('" killed "')){
        killEvent(unparsedEvent, finalObject, playerIDFinder);
    }
}

function killEvent(unparsedEvent, finalObject, playerIDFinder){
    let killerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let victimId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);
    let killerCordinates = (unparsedEvent.slice(unparsedEvent.indexOf('attacker_position') + 19, unparsedEvent.lastIndexOf(') (victim_position') - 1)).split(" ");
    let victimCordinates = (unparsedEvent.slice(unparsedEvent.indexOf('victim_position') + 17, unparsedEvent.lastIndexOf('")'))).split(" ");
    let killerWeapon = unparsedEvent.slice(unparsedEvent.indexOf('with "') + 6, unparsedEvent.lastIndexOf('" ('));
    let eventObject = {
        type: "kill",
        killerId: playerIDFinder[killerId3] !== undefined ? playerIDFinder[killerId3] : ID3toID64Converter(playerIDFinder, killerId3),
        victimId: playerIDFinder[victimId3] !== undefined ? playerIDFinder[victimId3] : ID3toID64Converter(playerIDFinder, victimId3),
        time: eventDateToSeconds(unparsedEvent),
        elapsedTime: eventDateToSeconds(unparsedEvent) - finalObject.info.date,
        killer:{
            class: 00000000000000000000000000000000000000,
            position:{
                x: killerCordinates[0],
                y: killerCordinates[1],
                z: killerCordinates[2],
            },
            damageDealt: 00000000000000000000000000000000000000,
        },
        victim:{
            class: 00000000000000000000000000000000000000,
            position:{
                x: victimCordinates[0],
                y: victimCordinates[1],
                z: victimCordinates[2],
            },
            damageDealt: 00000000000000000000000000000000000000,
        },
        weapon: killerWeapon,
        customkill: unparsedEvent.includes("custom") ? unparsedEvent.slice(unparsedEvent.indexOf('customkill "') + 12, unparsedEvent.lastIndexOf(') (attacker_position') - 1) : false,
        distance: Math.round(Math.hypot(parseInt(killerCordinates[0])+parseInt(victimCordinates[0]), parseInt(killerCordinates[1])+parseInt(victimCordinates[1]), parseInt(killerCordinates[2])+parseInt(victimCordinates[2])))
    };
    console.log(eventObject);
}

function ID3toID64Converter(playerIDFinder, userId3){
    let steamid64ent1 = 7656, steamid64ent2 = 1197960265728, cleanId3 = userId3.replace(/\]/g, '').split(":")[2];
    let userid64 = steamid64ent1 + String(parseInt(cleanId3)+steamid64ent2);
    playerIDFinder[userId3] = userid64;
    return(userid64);
}

function eventDateToSeconds(unparsedEvent){
    dateArray = unparsedEvent.split(' ')[1].split('/');
    finalDate= dateArray[2]+ "-" + dateArray[0]+ "-" + dateArray[1] + "T" + unparsedEvent.split(' ')[3].slice(0,-1) + "Z";
    return( new Date(finalDate).getTime()/1000);
}

module.exports = {nonTriggeredEvent};