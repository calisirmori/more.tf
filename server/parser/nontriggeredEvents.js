

function nonTriggeredEvent(unparsedEvent, finalObject, playerIDFinder, lastDeathTime){
    if(unparsedEvent.includes('" killed "') && !unparsedEvent.includes("feign_death") && finalObject.info.gameIsActive){
        killEvent(unparsedEvent, finalObject, playerIDFinder, lastDeathTime);
    } else if (unparsedEvent.includes('say')){
        chatMessage(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes('changed role to') || unparsedEvent.includes('connected, address') || unparsedEvent.includes('entered')){
        playerConnected(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes('picked up item')){
        resupEvents(unparsedEvent, finalObject, playerIDFinder)
    } else if (unparsedEvent.includes('spawned as')){
        deathScreenTime(unparsedEvent, finalObject, playerIDFinder, lastDeathTime);
    } else if (unparsedEvent.includes('committed suicide with')) {
        suicideEvent(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes('score')) {
        scoreUpdate(unparsedEvent, finalObject)
    } else if (unparsedEvent.includes('disconnected')) {
        disconnectEvent(unparsedEvent, finalObject, playerIDFinder)
    } else if (unparsedEvent.includes('joined team')) {
        let playerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
        finalObject.players[playerIDFinder[playerId3]].team = unparsedEvent.includes('Red') ? "red" : "blue";
    } else if (!unparsedEvent.includes('feign_death') 
    && !unparsedEvent.includes('position_report')
    && !unparsedEvent.includes('entered') && finalObject.info.gameIsActive) {
    }
}

function disconnectEvent(unparsedEvent, finalObject, playerIDFinder){
    let playerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    finalObject.players[playerIDFinder[playerId3]].leftGame = eventDateToSeconds(unparsedEvent);
}

function scoreUpdate(unparsedEvent, finalObject){
    if(unparsedEvent.includes('current score')){
        unparsedEvent.includes('Red') && (finalObject.rounds[finalObject.rounds.length - 1].teamScores.red.score =  unparsedEvent.slice(unparsedEvent.indexOf('current score "') + 15, unparsedEvent.indexOf('" with')));
        unparsedEvent.includes('Blue') && (finalObject.rounds[finalObject.rounds.length - 1].teamScores.blue.score = unparsedEvent.slice(unparsedEvent.indexOf('current score "') + 15, unparsedEvent.indexOf('" with')));
    } else if (unparsedEvent.includes('final score')){
        unparsedEvent.includes('Red') && (finalObject.teams.red.score =  unparsedEvent.slice(unparsedEvent.indexOf('final score "') + 13, unparsedEvent.indexOf('" with')));
        unparsedEvent.includes('Blue') && (finalObject.teams.blue.score = unparsedEvent.slice(unparsedEvent.indexOf('final score "') + 13, unparsedEvent.indexOf('" with')));
    }
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

function killEvent(unparsedEvent, finalObject, playerIDFinder, lastDeathTime){
    let killerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let victimId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);
    let killerCordinates = (unparsedEvent.slice(unparsedEvent.indexOf('attacker_position') + 19, unparsedEvent.lastIndexOf(') (victim_position') - 1)).split(" ");
    let victimCordinates = (unparsedEvent.slice(unparsedEvent.indexOf('victim_position') + 17, unparsedEvent.lastIndexOf('")'))).split(" ");
    let killerWeapon = unparsedEvent.slice(unparsedEvent.indexOf('with "') + 6, unparsedEvent.lastIndexOf('" ('));

    //Record kill to player stat
    finalObject.players[playerIDFinder[killerId3]].kills++;
    finalObject.players[playerIDFinder[victimId3]].deaths++;

    //killer gun stat
    
    //kill to round
    finalObject.rounds[finalObject.rounds.length - 1].teamScores[finalObject.players[playerIDFinder[killerId3]].team].kills++;
    
    //team object kill stat
    finalObject.teams[finalObject.players[playerIDFinder[killerId3]].team].kills ++;
    
    //Last death time recorded
    lastDeathTime[playerIDFinder[victimId3]] = eventDateToSeconds(unparsedEvent);
    
    //kill class specific stats
    let currentKillerClass = finalObject.players[playerIDFinder[killerId3]].class;
    let currentvictimClass = finalObject.players[playerIDFinder[victimId3]].class;


    if(finalObject.players[playerIDFinder[killerId3]].classStats[currentKillerClass].weapons[killerWeapon] === undefined){
        finalObject.players[playerIDFinder[killerId3]].classStats[currentKillerClass].weapons[killerWeapon] = {kills: 0}
    }
    
    finalObject.players[playerIDFinder[killerId3]].classStats[currentKillerClass].weapons[killerWeapon].kills++;
    finalObject.players[playerIDFinder[killerId3]].classStats[currentKillerClass].kills++;
    finalObject.players[playerIDFinder[victimId3]].classStats[currentvictimClass].deaths++;
    
    // Kill event is made here
    let eventObject = {
        type: "kill",
        killerId: playerIDFinder[killerId3],
        victimId: playerIDFinder[victimId3],
        time: eventDateToSeconds(unparsedEvent),
        elapsedTime: eventDateToSeconds(unparsedEvent) - finalObject.info.date,
        killer:{
            class: currentKillerClass,
            position:{
                x: killerCordinates[0],
                y: killerCordinates[1],
                z: killerCordinates[2],
            },
        },
        victim:{
            class: currentvictimClass,
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

    //Custom kill stats
    if(unparsedEvent.includes("custom")) {
        let customKillType = unparsedEvent.slice(unparsedEvent.indexOf('customkill "') + 12, unparsedEvent.lastIndexOf(') (attacker_position') - 1)
        switch (customKillType) {
            case "headshot":
                finalObject.players[playerIDFinder[killerId3]].headshotKills++;
                break;
            case "backstab":
                finalObject.players[playerIDFinder[killerId3]].backstabs++;
                break;
        }
    } 

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
    finalObject.players[playerIDFinder[userId3]] === undefined ? (finalObject.players[playerIDFinder[userId3]] = {
        userName: unparsedEvent.slice(unparsedEvent.indexOf('"') + 1, unparsedEvent.indexOf('<')), //this needs to be better, if there is "<" in the name it wont read right
        steamID3: userId3,
        joinedGame: eventDateToSeconds(unparsedEvent),
        leftGame: false,
        team: unparsedEvent.includes('><Red>"') ? "red" : "blue",
        class: unparsedEvent.slice(unparsedEvent.indexOf('changed role to "') + 17, unparsedEvent.lastIndexOf('"')),
        classStats: {
            changedClass: eventDateToSeconds(unparsedEvent),
            [unparsedEvent.slice(unparsedEvent.indexOf('changed role to "') + 17, unparsedEvent.lastIndexOf('"'))]: {
                kills: 0,
                assists: 0,
                deaths: 0,
                damage: 0,
                weapons: {},
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
        medicPicks: 0,
        medicDrops: 0,
        damageDivision: {
            damageTo:{},
            damageFrom:{},
        },
        damage : 0,
        damageReal : 0,
        damagePerMinute: 0,
        damageTaken : 0,
        damageTakenReal: 0,
        damageTakenPerMinute: 0,
        deathScreenTime: 0,
        crossbowHealing: 0,
        medicStats: {
            uberTypes:{},
            ubers: 0,
            drops: 0,
            uberLength: 0,
            nearFullDeaths: 0,
            healAfterSpawn: 0,
        },
        uberHits: 0,
        resup: {
            medkit: 0,
            medkitsHealingDone: 0,
            ammo: 0,
        },
        pointCaps: 0,
        capturesBlocked: 0,
        extinguished: 0,
        dominated: 0,
        revenged: 0,
        buildingKills: 0,
        buildings: 0,
        heals: 0,
        healsPerMinute: 0,
        airshots: 0,
        headshots: 0,
        headshotKills: 0,
        backstabs: 0,
    }) : classSwaps(unparsedEvent, finalObject, playerIDFinder);
}

function classSwaps(unparsedEvent, finalObject, playerIDFinder){
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let playerObject = finalObject.players[playerIDFinder[userId3]];
    let eventTime = eventDateToSeconds(unparsedEvent);

    playerObject.classStats[playerObject.class].time += (eventTime - playerObject.classStats.changedClass);
    playerObject.class = unparsedEvent.slice(unparsedEvent.indexOf('changed role to "') + 17, unparsedEvent.lastIndexOf('"'));
    playerObject.classStats.changedClass = eventTime;
    playerObject.classStats[playerObject.class] === undefined && (finalObject.players[playerIDFinder[userId3]].classStats[playerObject.class] = {
        kills: 0,
        assists: 0,                                                                                                                                                  
        deaths: 0,
        damage: 0,
        weapons: {},
        time: 0,
    });
}

function suicideEvent(unparsedEvent, finalObject, playerIDFinder){
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    finalObject.players[playerIDFinder[userId3]].suicides++;
}

function deathScreenTime(unparsedEvent, finalObject, playerIDFinder, lastDeathTime){
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    if (lastDeathTime[playerIDFinder[userId3]] !== undefined){
        finalObject.players[playerIDFinder[userId3]].deathScreenTime += (eventDateToSeconds(unparsedEvent) - lastDeathTime[playerIDFinder[userId3]]);
    }
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

module.exports = {nonTriggeredEvent, playerConnected};