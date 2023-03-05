const { statPercentiles, statWeights, finalScorePercentiles } = require("./combatScoreData");
const { playerConnected } = require("./nontriggeredEvents");
const { fetch, FetchResultTypes, FetchMethods  } = require("@sapphire/fetch");

function triggeredEvent(unparsedEvent, finalObject, playerIDFinder) {
    if (unparsedEvent.includes("World")) {
        worldEvents(unparsedEvent, finalObject);
    } else if (unparsedEvent.includes("pause")) {
        pauseEvents(unparsedEvent, finalObject);
    } else if (unparsedEvent.includes('"shot_hit"') || unparsedEvent.includes('"shot_fired"')) {
        shotEvents(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes(' "damage" ') && finalObject.info.gameIsActive) {
        damageEvent(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes(' "kill assist" ') && finalObject.info.gameIsActive) {
        assistEvent(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes(' "healed" ') && finalObject.info.gameIsActive) {
        healEvent(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes(' "domination" ') && finalObject.info.gameIsActive) {
        commonEvents(unparsedEvent, finalObject, playerIDFinder, "dominated");
    } else if (unparsedEvent.includes(' "killedobject" ') && finalObject.info.gameIsActive) {
        commonEvents(unparsedEvent, finalObject, playerIDFinder, "buildingKills");
    } else if (unparsedEvent.includes(' "revenge" ') && finalObject.info.gameIsActive) {
        commonEvents(unparsedEvent, finalObject, playerIDFinder, "revenged");
    } else if (unparsedEvent.includes(' "player_extinguished" ') && finalObject.info.gameIsActive) {
        commonEvents(unparsedEvent, finalObject, playerIDFinder, "extinguished");
    } else if (unparsedEvent.includes(' "player_builtobject" ') && finalObject.info.gameIsActive) {
        commonEvents(unparsedEvent, finalObject, playerIDFinder, "buildings");
    } else if (unparsedEvent.includes(' "captureblocked" ') && finalObject.info.gameIsActive) {
        commonEvents(unparsedEvent, finalObject, playerIDFinder, "capturesBlocked");
    } else if ((unparsedEvent.includes(' "charge') || unparsedEvent.includes(' "empty_uber') || unparsedEvent.includes('"first_heal_after_spawn"')) && finalObject.info.gameIsActive) {
        uberChargeEvents(unparsedEvent, finalObject, playerIDFinder);
    } else if ((unparsedEvent.includes(' "medic')) && finalObject.info.gameIsActive) {
        medicEvents(unparsedEvent, finalObject, playerIDFinder);
    } else if ((unparsedEvent.includes(' "pointcaptured" ')) && finalObject.info.gameIsActive) {
        pointsCappedEvent(unparsedEvent, finalObject, playerIDFinder);
    } else if (finalObject.info.gameIsActive && !unparsedEvent.includes('object')
        && !unparsedEvent.includes('flagevent')
        && !unparsedEvent.includes('jarate_attack')
        && !unparsedEvent.includes('lost_uber_advantage')) {
    }
}

async function worldEvents(unparsedEvent, finalObject) {
    if (unparsedEvent.includes("Round_Start")) {
        finalObject.info.gameIsActive = true;

        if (finalObject.rounds.length === 0 || finalObject.rounds[finalObject.rounds.length - 1].roundDuration !== "live")
            finalObject.rounds.push({
                roundBegin: eventDateToSeconds(unparsedEvent),
                roundWinner: "live",
                firstCap: "live",
                roundDuration: "live",
                overtime: false,
                teamScores: {
                    red: {
                        score: 0,
                        kills: 0,
                        damage: 0,
                        ubers: 0,
                    },
                    blue: {
                        score: 0,
                        kills: 0,
                        damage: 0,
                        ubers: 0,
                    }
                },
                captureEvents: [],
                events: [],
                playerPerformance: {}
            })
    } else if (unparsedEvent.includes("Round_Overtime")) {
        finalObject.rounds[finalObject.rounds.length - 1].overtime = true;
    } else if (unparsedEvent.includes("Round_Win")) {
        finalObject.info.gameIsActive = false;
        finalObject.rounds[finalObject.rounds.length - 1].roundWinner = unparsedEvent.includes("Red") ? "red" : "blue";
    } else if (unparsedEvent.includes("Round_Length")) {
        finalObject.rounds[finalObject.rounds.length - 1].roundDuration = Math.ceil(parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(seconds ') + 10, unparsedEvent.lastIndexOf('"'))));
    } else if (unparsedEvent.includes("Round_Win")) {
        finalObject.info.gameIsActive = false;
    } else if (unparsedEvent.includes("Game_Over")) {
        let finalObjectArray = Object.entries(finalObject.players)
        let matchEndTime = eventDateToSeconds(unparsedEvent);

        // await rglData(finalObject);

        for (let playerIndex = 0; playerIndex < finalObjectArray.length; playerIndex++) {
            let currentClass = finalObject.players[finalObjectArray[playerIndex][0]].class;
            finalObject.players[finalObjectArray[playerIndex][0]].classStats[currentClass].time = matchEndTime - finalObject.players[finalObjectArray[playerIndex][0]].classStats.changedClass;
            finalObject.players[finalObjectArray[playerIndex][0]].damagePerMinute = Math.ceil(finalObject.players[finalObjectArray[playerIndex][0]].damage / (finalObject.info.matchLength / 60));
            finalObject.players[finalObjectArray[playerIndex][0]].damageTakenPerMinute = Math.ceil(finalObject.players[finalObjectArray[playerIndex][0]].damageTaken / (finalObject.info.matchLength / 60));
            finalObject.players[finalObjectArray[playerIndex][0]].healsPerMinute = Math.ceil(finalObject.players[finalObjectArray[playerIndex][0]].heals / (finalObject.info.matchLength / 60));
            finalObject.players[finalObjectArray[playerIndex][0]].killAssistPerDeath = (Math.round((finalObject.players[finalObjectArray[playerIndex][0]].kills + finalObject.players[finalObjectArray[playerIndex][0]].assists) / (finalObject.players[finalObjectArray[playerIndex][0]].deaths / 10))) / 10
            finalObject.players[finalObjectArray[playerIndex][0]].killsPerDeath = (Math.round(finalObject.players[finalObjectArray[playerIndex][0]].kills / (finalObject.players[finalObjectArray[playerIndex][0]].deaths / 10))) / 10
            finalObject.players[finalObjectArray[playerIndex][0]].medicStats.ubers !== 0 && (finalObject.players[finalObjectArray[playerIndex][0]].medicStats.uberLength = (Math.round(finalObject.players[finalObjectArray[playerIndex][0]].medicStats.uberLength / (finalObject.players[finalObjectArray[playerIndex][0]].medicStats.ubers / 10))) / 10)
            finalObject.players[finalObjectArray[playerIndex][0]].damageDivision.damageTo = Object.entries(finalObject.players[finalObjectArray[playerIndex][0]].damageDivision.damageTo)
                .sort(([, b], [, a]) => a - b)
                .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
            finalObject.players[finalObjectArray[playerIndex][0]].damageDivision.damageFrom = Object.entries(finalObject.players[finalObjectArray[playerIndex][0]].damageDivision.damageFrom)
                .sort(([, b], [, a]) => a - b)
                .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
            if (finalObject.healSpread[finalObjectArray[playerIndex][0]] !== undefined) {
                finalObject.healSpread[finalObjectArray[playerIndex][0]] = Object.entries(finalObject.healSpread[finalObjectArray[playerIndex][0]])
                    .sort(([, b], [, a]) => a - b)
                    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
            }
            finalObject.info.winner = finalObject.teams.red.score > finalObject.teams.blue.score ? "red" : "blue";
            finalObject.info.matchLength = eventDateToSeconds(unparsedEvent) - finalObject.info.date;

            let stats = currentClass === "medic" ? ["heals", "apm", "deathpm", "dtm"] : ["kpm", "dpm", "apm", "deathpm", "dtm"];
            let combatStats = {
                apm: (Math.round(finalObject.players[finalObjectArray[playerIndex][0]].assists * 100 / (finalObject.info.matchLength / 60))) / 100,
                kpm: (Math.round(finalObject.players[finalObjectArray[playerIndex][0]].kills * 100 / (finalObject.info.matchLength / 60))) / 100,
                dpm: finalObject.players[finalObjectArray[playerIndex][0]].damagePerMinute,
                dtm: finalObject.players[finalObjectArray[playerIndex][0]].damageTakenPerMinute,
                heals: finalObject.players[finalObjectArray[playerIndex][0]].healsPerMinute,
                deathpm: (Math.round(finalObject.players[finalObjectArray[playerIndex][0]].deaths * 100 / (finalObject.info.matchLength / 60))) / 100,
            };


            let currentScoreSum = 0;
            
            const mapName = finalObject.info.map.split("_")[0];
            const statWeightsForMap = statWeights.highlander[currentClass][mapName];

            for (let statIndex = 0; statIndex < stats.length; statIndex++) {
                let currentStatName = stats[statIndex];

                let currentStatArray = statPercentiles.highlander[currentClass][mapName][currentStatName];
                for (let spotIndex = 0; spotIndex < currentStatArray.length; spotIndex++) {
                    if (combatStats[currentStatName] <= currentStatArray[spotIndex]) {
                        currentScoreSum += spotIndex * statWeightsForMap[currentStatName];
                        break;
                    }
                }
            }

            const isMedic = currentClass === "medic";
            const dtm = statWeightsForMap.dtm;
            const deathpm = statWeightsForMap.deathpm;
            const apmWeight = statWeightsForMap.apm * 0.1;
            const dpmWeight = statWeightsForMap.dpm * 0.1;
            const dtmWeight = dtm * -0.1;
            const kpmWeight = statWeightsForMap.kpm * 0.1;
            const deathpmWeight = deathpm * -0.1;
            const healsWeight = statWeightsForMap.heals * 0.1;

            const numerator = currentScoreSum + (dtm * -100 + deathpm * -100);
            const denominator = isMedic 
            ? healsWeight + apmWeight + dtmWeight + deathpmWeight
            : kpmWeight + dpmWeight + apmWeight + dtmWeight + deathpmWeight;

            currentScoreSum = Math.round(numerator / denominator) / 10;

            let playerCombatScore = -1;
            const targetedScorePercentiles = finalScorePercentiles[mapName][currentClass];
            for (let combatScoreIndex = 0; combatScoreIndex < targetedScorePercentiles.length; combatScoreIndex++) {
                if (targetedScorePercentiles[combatScoreIndex] > currentScoreSum) {
                    let lowerScore = combatScoreIndex > 0 ? targetedScorePercentiles[combatScoreIndex-1] : 0;
                    let highScore = targetedScorePercentiles[combatScoreIndex];
                    let differenceBetweenLowHigh = highScore - lowerScore;
                    let differenceBetweenRealScoreAndLow = playerCombatScore - lowerScore;
                    let tenthsPlace = differenceBetweenRealScoreAndLow / differenceBetweenLowHigh;
                    playerCombatScore = combatScoreIndex;
                    playerCombatScore = playerCombatScore + (tenthsPlace / 100.0);
                    break;
                }
            }

            finalObject.players[finalObjectArray[playerIndex][0]].combatScore = playerCombatScore;
        }
    }
}

// async function rglData(finalObject) {

//     let currentPlayers = [];

//     Object.entries(finalObject.players).map(player => {
//         currentPlayers.push(player[0])
//     })

//     try {
//         let URL = `https://api.rgl.gg/v0/profile/getmany`;

//         const rglApiResponse = await fetch(
//             URL,
//             {
//                 method: FetchMethods.Post,
//                 body: currentPlayers
//             },
//             FetchResultTypes.JSON
//         );
//         await setPlayerRGLinfo(rglApiResponse,finalObject);
//         console.log(rglApiResponse)
//     } catch (error) {
//         console.log(error);
//     }
// }

// async function setPlayerRGLinfo(rglApiResponse,finalObject){
//     rglApiResponse.map(player =>{
//         finalObject.players[player.steamId].rgl.userName = player.name;
//         finalObject.players[player.steamId].rgl.rank = player.currentTeams.highlander !== null ? player.currentTeams.highlander.divisionName : "unknown";
//     });
// }

function pointsCappedEvent(unparsedEvent, finalObject, playerIDFinder) {
    eventDateToSeconds(unparsedEvent)

    //first cap
    if (finalObject.rounds[finalObject.rounds.length - 1].firstCap === "live") {
        finalObject.rounds[finalObject.rounds.length - 1].firstCap = (unparsedEvent.slice(unparsedEvent.indexOf('Team "') + 6, unparsedEvent.indexOf('" triggered "pointcaptured')) === "Red" ? "red" : "blue");
        finalObject.teams[unparsedEvent.slice(unparsedEvent.indexOf('Team "') + 6, unparsedEvent.indexOf('" triggered "pointcaptured')) === "Red" ? "red" : "blue"].firstcaps++;
    }

    //total caps
    finalObject.teams[unparsedEvent.slice(unparsedEvent.indexOf('Team "') + 6, unparsedEvent.indexOf('" triggered "pointcaptured')) === "Red" ? "red" : "blue"].caps++;

    // points capped stat
    let eventPlayerArray = unparsedEvent.split(") (player");
    for (let index = 1; index < eventPlayerArray.length; index++) {
        let playerId3 = eventPlayerArray[index].slice(eventPlayerArray[index].indexOf('[U:1:'), eventPlayerArray[index].indexOf(']>') + 1);
        finalObject.players[playerIDFinder[playerId3]].pointCaps++;
    }

    //capture events in rounds
    let captureEventObject = {
        team: unparsedEvent.slice(unparsedEvent.indexOf('Team "') + 6, unparsedEvent.indexOf('" triggered "pointcaptured')),
        time: (eventDateToSeconds(unparsedEvent) - finalObject.rounds[finalObject.rounds.length - 1].roundBegin),
        name: unparsedEvent.slice(unparsedEvent.indexOf('"pointcaptured" (cp "') + 21, unparsedEvent.indexOf('") (cpname')),
    }
    finalObject.rounds[finalObject.rounds.length - 1].captureEvents.push(captureEventObject);

}

function medicEvents(unparsedEvent, finalObject, playerIDFinder) {
    if (unparsedEvent.includes('"medic_death_ex" (uberpct "9')) {
        let medicId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
        finalObject.players[playerIDFinder[medicId3]].medicStats.nearFullDeaths++;
    } else if (unparsedEvent.includes("medic_death")) {
        let killerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
        let medicId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);

        finalObject.players[playerIDFinder[killerId3]].medicPicks++;
        if (unparsedEvent.includes('ubercharge "1"')) {
            finalObject.players[playerIDFinder[killerId3]].medicDrops++;
            finalObject.players[playerIDFinder[medicId3]].medicStats.drops++;
            finalObject.teams[finalObject.players[playerIDFinder[killerId3]].team].drops++;
        }
    }
}

function uberChargeEvents(unparsedEvent, finalObject, playerIDFinder) {
    let medicId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);

    //ubers used
    if (unparsedEvent.includes(' "chargedeployed" ')) {
        let medigunType = unparsedEvent.slice(unparsedEvent.indexOf('" (medigun "') + 12, unparsedEvent.lastIndexOf('")'));
        finalObject.players[playerIDFinder[medicId3]].medicStats.ubers++;
        finalObject.teams[finalObject.players[playerIDFinder[medicId3]].team].charges++;
        if (finalObject.players[playerIDFinder[medicId3]].medicStats.uberTypes[medigunType] === undefined) {
            finalObject.players[playerIDFinder[medicId3]].medicStats.uberTypes[medigunType] = 1
        } else {
            finalObject.players[playerIDFinder[medicId3]].medicStats.uberTypes[medigunType]++;
        }
    } else if (unparsedEvent.includes(' "chargeended" ')) {
        let uberLength = parseFloat(unparsedEvent.slice(unparsedEvent.indexOf('" (duration "') + 13, unparsedEvent.lastIndexOf('")')));
        finalObject.players[playerIDFinder[medicId3]].medicStats.uberLength += uberLength;
    } else if (unparsedEvent.includes('"first_heal_after_spawn"')) {
        let healAfterSpawnTime = parseFloat(unparsedEvent.slice(unparsedEvent.indexOf('(time ') + 7, unparsedEvent.lastIndexOf('")')));
        finalObject.players[playerIDFinder[medicId3]].medicStats.healAfterSpawn += healAfterSpawnTime;
    }
}

function commonEvents(unparsedEvent, finalObject, playerIDFinder, eventType) {
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    finalObject.players[playerIDFinder[userId3]][eventType]++;
}

function healEvent(unparsedEvent, finalObject, playerIDFinder) {
    let healerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let recieverId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);
    let healDone = parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(healing "') + 10, unparsedEvent.lastIndexOf('")')));

    healDone > 80 && (finalObject.players[playerIDFinder[healerId3]].crossbowHealing += healDone);

    //player heals stat
    finalObject.players[playerIDFinder[healerId3]].heals += healDone;
    if (finalObject.healSpread[playerIDFinder[healerId3]] === undefined) {
        finalObject.healSpread[playerIDFinder[healerId3]] = {};
        finalObject.healSpread[playerIDFinder[healerId3]][playerIDFinder[recieverId3]] = healDone;
    } else {
        finalObject.healSpread[playerIDFinder[healerId3]][playerIDFinder[recieverId3]] === undefined ? (finalObject.healSpread[playerIDFinder[healerId3]][playerIDFinder[recieverId3]] = healDone) : (finalObject.healSpread[playerIDFinder[healerId3]][playerIDFinder[recieverId3]] += healDone);
    }

    //airshot event
    if (unparsedEvent.includes("airshot")) {
        finalObject.players[playerIDFinder[healerId3]].airshots++;
    }

    // heals per interval
    let timeInterval = 30;
    let currentIntervalIndex = Math.floor((eventDateToSeconds(unparsedEvent) - finalObject.info.date) / timeInterval);
    if (finalObject.healsPerInterval[finalObject.players[playerIDFinder[healerId3]].team][currentIntervalIndex] === undefined) {
        finalObject.healsPerInterval[finalObject.players[playerIDFinder[healerId3]].team][currentIntervalIndex] = 0;
    } else {
        finalObject.healsPerInterval[finalObject.players[playerIDFinder[healerId3]].team][currentIntervalIndex] += healDone;
    }
}

function assistEvent(unparsedEvent, finalObject, playerIDFinder) {
    let assisterId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let victimId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);

    //player stat
    finalObject.players[playerIDFinder[assisterId3]].assists++;

    //class specific assist events
    let currentAssisterClass = finalObject.players[playerIDFinder[assisterId3]].class;
    finalObject.players[playerIDFinder[assisterId3]].classStats[currentAssisterClass].assists++;

    //assist Spread object is made here
    if (finalObject.assistSpread[playerIDFinder[assisterId3]] === undefined) {
        finalObject.assistSpread[playerIDFinder[assisterId3]] = {};
        finalObject.assistSpread[playerIDFinder[assisterId3]][playerIDFinder[victimId3]] = 1;
    } else {
        finalObject.assistSpread[playerIDFinder[assisterId3]][playerIDFinder[victimId3]] === undefined ? (finalObject.assistSpread[playerIDFinder[assisterId3]][playerIDFinder[victimId3]] = 1) : (finalObject.assistSpread[playerIDFinder[assisterId3]][playerIDFinder[victimId3]]++);
    }
}

function pauseEvents(unparsedEvent, finalObject) {
    if (unparsedEvent.includes("unpause")) {
        finalObject.info.pause.pauseSum = eventDateToSeconds(unparsedEvent) - finalObject.info.pause.lastPuase;
    } else {
        finalObject.info.pause.lastPuase = eventDateToSeconds(unparsedEvent);
    }
}

function shotEvents(unparsedEvent, finalObject, playerIDFinder) {
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('" (weapon "') + 11, unparsedEvent.lastIndexOf('")'));
    let currentClass = finalObject.players[playerIDFinder[userId3]].class;

    //weapon classification is made here
    if (finalObject.players[playerIDFinder[userId3]].classStats[currentClass].weapons[weaponUsed] !== undefined) {
        finalObject.players[playerIDFinder[userId3]].classStats[currentClass].weapons[weaponUsed][(unparsedEvent.includes("shot_hit") ? "shotsHit" : "shotsFired")]++;
    } else {
        finalObject.players[playerIDFinder[userId3]].classStats[currentClass].weapons[weaponUsed] = {
            kills: 0,
            damage: 0,
            shotsFired: 0,
            shotsHit: 0
        }
        finalObject.players[playerIDFinder[userId3]].classStats[currentClass].weapons[weaponUsed][(unparsedEvent.includes("shot_hit") ? "shotsHit" : "shotsFired")]++;
    }
}

function damageEvent(unparsedEvent, finalObject, playerIDFinder) {
    let damageDealerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let damageRecieverId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);
    let damageDealt = parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(damage "') + 9, unparsedEvent.lastIndexOf('") (weapon')));

    damageDealt === 0 && finalObject.players[playerIDFinder[damageDealerId3]].uberHits++;

    //weapon finder
    let weaponUsed;
    if (unparsedEvent.includes("healing")) {
        weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('(weapon') + 9, unparsedEvent.lastIndexOf('") (healing'));
    } else if (unparsedEvent.includes('crit')) {
        weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('(weapon') + 9, unparsedEvent.indexOf('") (crit'));
        if (unparsedEvent.includes(") (headshot")) {
            finalObject.players[playerIDFinder[damageDealerId3]].headshots++;
        }
    } else if (unparsedEvent.includes("airshot")) {
        weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('(weapon') + 9, unparsedEvent.lastIndexOf('") (airshot'));
        finalObject.players[playerIDFinder[damageDealerId3]].airshots++;
    } else {
        weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('(weapon') + 9, unparsedEvent.lastIndexOf('")'));
    }

    //damage final
    let currentReal = damageDealt;
    if (unparsedEvent.includes("realdamage")) {
        damageDealt = parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(damage "') + 9, unparsedEvent.lastIndexOf('") (realdamage')));
        currentReal = parseInt(unparsedEvent.slice(unparsedEvent.lastIndexOf('") (realdamage') + 16, unparsedEvent.lastIndexOf('") (weapon')));
    }
    damageDealt > 450 && (damageDealt = 450);

    // player stats damage/realdamage/dt/realdt
    finalObject.players[playerIDFinder[damageDealerId3]].damage += damageDealt;
    finalObject.players[playerIDFinder[damageDealerId3]].damageReal += currentReal;
    finalObject.players[playerIDFinder[damageRecieverId3]].damageTaken += damageDealt;
    finalObject.players[playerIDFinder[damageRecieverId3]].damageTakenReal += currentReal;

    // player weapon specific damage
    let currentClass = finalObject.players[playerIDFinder[damageDealerId3]].class;
    finalObject.players[playerIDFinder[damageDealerId3]].classStats[currentClass].damage += damageDealt;
    try {
        finalObject.players[playerIDFinder[damageDealerId3]].classStats[currentClass].weapons[weaponUsed].damage += damageDealt;
    } catch (error) {
        finalObject.players[playerIDFinder[damageDealerId3]].classStats[currentClass].weapons[weaponUsed] = {
            kills: 0,
            damage: 0,
            shotsHit: 0,
            shotsFired: 0,
        }
        finalObject.players[playerIDFinder[damageDealerId3]].classStats[currentClass].weapons[weaponUsed].damage += damageDealt;
    }

    //damageDivision spread
    if (finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] === undefined) {
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] = 0;
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageFrom[playerIDFinder[damageRecieverId3]] = 0;
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] += damageDealt;

    } else {
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] += damageDealt;
    }

    if (finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageFrom[playerIDFinder[damageDealerId3]] === undefined) {
        finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageTo[playerIDFinder[damageDealerId3]] = 0;
        finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageFrom[playerIDFinder[damageDealerId3]] = 0;
        finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageFrom[playerIDFinder[damageDealerId3]] += damageDealt;
    } else {
        finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageFrom[playerIDFinder[damageDealerId3]] += damageDealt;
    }

    //round object damage stat
    finalObject.rounds[finalObject.rounds.length - 1].teamScores[finalObject.players[playerIDFinder[damageDealerId3]].team].damage += damageDealt;

    //team object damage stat
    finalObject.teams[finalObject.players[playerIDFinder[damageDealerId3]].team].damage += damageDealt;

    //damage per interval
    let timeInterval = 30;
    let currentIntervalIndex = Math.floor((eventDateToSeconds(unparsedEvent) - finalObject.info.date) / timeInterval);
    if (finalObject.damagePerInterval[finalObject.players[playerIDFinder[damageDealerId3]].team][currentIntervalIndex] === undefined) {
        finalObject.damagePerInterval[finalObject.players[playerIDFinder[damageDealerId3]].team][currentIntervalIndex] = 0;
    } else {
        finalObject.damagePerInterval[finalObject.players[playerIDFinder[damageDealerId3]].team][currentIntervalIndex] += damageDealt;
    }

}

function eventDateToSeconds(unparsedEvent) {
    dateArray = unparsedEvent.split(' ')[1].split('/');
    finalDate = dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1] + "T" + unparsedEvent.split(' ')[3].slice(0, -1) + "Z";
    return (new Date(finalDate).getTime() / 1000);
}

module.exports = { triggeredEvent };