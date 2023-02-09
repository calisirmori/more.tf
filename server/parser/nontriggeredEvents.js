

function nonTriggeredEvent(unparsedEvent, finalObject, playerIDFinder){
    if(unparsedEvent.includes('" killed "')){
        killEvent(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes('say')){
        chatMessage(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes('changed role to')){
        playerConnected(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes('picked up item')){
        resupEvents(unparsedEvent, finalObject, playerIDFinder)
    }
    // else {
    //     console.log(unparsedEvent);
    // }
}

function chatMessage(unparsedEvent, finalObject, playerIDFinder){
    if (unparsedEvent.includes('" say "')){
        let chatterId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
        let chatObject = {
            userId : playerIDFinder[chatterId3],
            time: eventDateToSeconds(unparsedEvent),
            message: unparsedEvent.slice(unparsedEvent.indexOf('" say "') + 7, unparsedEvent.lastIndexOf('"'))
        };
       finalObject.chat.push(chatObject);
    }
}

function killEvent(unparsedEvent, finalObject, playerIDFinder){
    let killerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let victimId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);
    let killerCordinates = (unparsedEvent.slice(unparsedEvent.indexOf('attacker_position') + 19, unparsedEvent.lastIndexOf(') (victim_position') - 1)).split(" ");
    let victimCordinates = (unparsedEvent.slice(unparsedEvent.indexOf('victim_position') + 17, unparsedEvent.lastIndexOf('")'))).split(" ");
    let killerWeapon = unparsedEvent.slice(unparsedEvent.indexOf('with "') + 6, unparsedEvent.lastIndexOf('" ('));

    // Kill event is made here
    let eventObject = {
        type: "kill",
        killerId: playerIDFinder[killerId3],
        victimId: playerIDFinder[victimId3],
        time: eventDateToSeconds(unparsedEvent),
        elapsedTime: eventDateToSeconds(unparsedEvent) - finalObject.info.date,
        killer:{
            class: 00000000000000000000000000000000000000,
            position:{
                x: killerCordinates[0],
                y: killerCordinates[1],
                z: killerCordinates[2],
            },
        },
        victim:{
            class: 00000000000000000000000000000000000000,
            position:{
                x: victimCordinates[0],
                y: victimCordinates[1],
                z: victimCordinates[2],
            },
        },
        weapon: killerWeapon,
        customkill: unparsedEvent.includes("custom") ? unparsedEvent.slice(unparsedEvent.indexOf('customkill "') + 12, unparsedEvent.lastIndexOf(') (attacker_position') - 1) : false,
        distance: Math.round(Math.hypot(parseInt(killerCordinates[0])+parseInt(victimCordinates[0]), parseInt(killerCordinates[1])+parseInt(victimCordinates[1]), parseInt(killerCordinates[2])+parseInt(victimCordinates[2])))
    };

    //Kill Spread object is made here
    if (finalObject.killSpread[playerIDFinder[killerId3]] === undefined){
        finalObject.killSpread[playerIDFinder[killerId3]] = {};
        finalObject.killSpread[playerIDFinder[killerId3]][playerIDFinder[victimId3]] = 1;
    } else {
        finalObject.killSpread[playerIDFinder[killerId3]][playerIDFinder[victimId3]] === undefined ? (finalObject.killSpread[playerIDFinder[killerId3]][playerIDFinder[victimId3]] = 1) : (finalObject.killSpread[playerIDFinder[killerId3]][playerIDFinder[victimId3]]++);
    }

    finalObject.events.push(eventObject);
}

function resupEvents(unparsedEvent, finalObject, playerIDFinder){
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);

    if(unparsedEvent.includes('tf_ammo_pack')){
        finalObject.players[playerIDFinder[userId3]].resup.ammo += 2;
    } else if (unparsedEvent.includes('ammopack_medium')){
        finalObject.players[playerIDFinder[userId3]].resup.ammo += 2;
    } else if (unparsedEvent.includes('ammopack_small')){
        finalObject.players[playerIDFinder[userId3]].resup.ammo += 1;
    } else if (unparsedEvent.includes('ammopack_large')){
        finalObject.players[playerIDFinder[userId3]].resup.ammo += 4;
    } else if (unparsedEvent.includes('medkit_medium')){
        finalObject.players[playerIDFinder[userId3]].resup.medkit += 2;
        finalObject.players[playerIDFinder[userId3]].resup.medkitsHealingDone += parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(healing "') + 10, unparsedEvent.lastIndexOf('"')));
    } else if (unparsedEvent.includes('medkit_small')){
        finalObject.players[playerIDFinder[userId3]].resup.medkit += 1;
        finalObject.players[playerIDFinder[userId3]].resup.medkitsHealingDone += parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(healing "') + 10, unparsedEvent.lastIndexOf('"')));
    } else if (unparsedEvent.includes('medkit_large')){
        finalObject.players[playerIDFinder[userId3]].resup.medkit += 4;
        finalObject.players[playerIDFinder[userId3]].resup.medkitsHealingDone += parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(healing "') + 10, unparsedEvent.lastIndexOf('"')));
    }
}

function playerConnected(unparsedEvent, finalObject, playerIDFinder){
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    playerIDFinder[userId3] !== undefined ? playerIDFinder[userId3] : ID3toID64Converter(playerIDFinder, userId3);

    //Player Objects are initialized here
    finalObject.players[playerIDFinder[userId3]] = {
        userName: unparsedEvent.slice(unparsedEvent.indexOf('"') + 1, unparsedEvent.indexOf('<')), //this needs to be better, if there is "<" in the name it wont read right
        steamID3: userId3,
        joinedGame: eventDateToSeconds(unparsedEvent),
        leftGame: false,
        team: unparsedEvent.includes('><Red>"') ? "red" : "blue",
        class: unparsedEvent.slice(unparsedEvent.indexOf('changed role to "') + 17, unparsedEvent.lastIndexOf('"')),
        classStats: {
            [unparsedEvent.slice(unparsedEvent.indexOf('changed role to "') + 17, unparsedEvent.lastIndexOf('"'))]: {
                kills: 0,
                assists: 0,
                deaths: 0,
                damage: 0,
                weapon: {},
                time: 0,
            }
        },
        combatScore: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        suicides: 0,
        killAssistPerDeath: 0,
        killsPerDeath: 0,
        longestKillStreak: 0,
        longestDeathStreak: 0,
        medPicksTotal: 0,
        medPicksDroppedUber: 0,
        damageDivision: {
            damageTo:{},
            damageFrom:{},
        },
        damage : 0,
        damageReal : 0,
        damageTaken : 0,
        damageTakenReal: 0,
        damagePerMinute: 0,
        damageTakenPerMinute: 0,
        deathScreenTime: 0,
        ubers: 0,
        ubersawsFed: 0,
        crossbowHealing: 0,
        uberHits: 0,
        uberTypes:{},
        drops: 0,
        resup: {
            medkit: 0,
            medkitsHealingDone: 0,
            ammo: 0,
        },
        pointCaps: 0,
        extinguished: 0,
        dominated: 0,
        buildingKills: 0,
        buildings: 0,
        heal: 0,
        healRate: 0,
        airshot: 0,
        headshots: 0,
        headshotKills: 0,
        backstabs: 0,
        selfDamage: 0,
    };
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