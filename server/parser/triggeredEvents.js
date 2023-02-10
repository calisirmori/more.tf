
function triggeredEvent(unparsedEvent, finalObject, playerIDFinder){
    if(unparsedEvent.includes("World")){
        worldEvents(unparsedEvent, finalObject);
    } else if (unparsedEvent.includes("pause")){
        pauseEvents(unparsedEvent, finalObject);
    } else if (unparsedEvent.includes('"shot_hit"') || unparsedEvent.includes('"shot_fired"') ){
        shotEvents(unparsedEvent, finalObject, playerIDFinder);
    } else if (unparsedEvent.includes(' "damage" ') && finalObject.info.gameIsActive){
        damageEvent(unparsedEvent, finalObject, playerIDFinder);
    }
    // else {
    //     console.log(unparsedEvent);
    // }
}

function worldEvents(unparsedEvent, finalObject){
    if(unparsedEvent.includes("Round_Start")){
        finalObject.info.gameIsActive = true;

        if(finalObject.rounds.length === 0 || finalObject.rounds[finalObject.rounds.length-1].roundDuration !== "live")
        finalObject.rounds.push({
            roundBegin: eventDateToSeconds(unparsedEvent),
            roundWinner: "live",
            firstCap: "live",
            roundDuration: "live",
            overtime: false,
            teamScores:{
                red:{
                    score: 0,
                    kills: 0,
                    damage: 0,
                    ubers: 0,
                },
                blue:{
                    score: 0,
                    kills: 0,
                    damage: 0,
                    ubers: 0,
                }
            },
            events:[],
            playerPerformance:{}
        })
    } else if(unparsedEvent.includes("Round_Overtime")){
        finalObject.rounds[finalObject.rounds.length-1].overtime = true;
    } else if(unparsedEvent.includes("Round_Win")){
        finalObject.info.gameIsActive = false;
        finalObject.rounds[finalObject.rounds.length-1].roundWinner = unparsedEvent.includes("Red") ? "red" : "blue";
    } else if(unparsedEvent.includes("Round_Length")){
        finalObject.rounds[finalObject.rounds.length-1].roundDuration = Math.ceil(parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(seconds ')+10, unparsedEvent.lastIndexOf('"'))));
    } else if(unparsedEvent.includes("Round_Win")){
        finalObject.info.gameIsActive = false;
    }
}

function pauseEvents(unparsedEvent, finalObject){
    console.log(unparsedEvent);
}

function shotEvents(unparsedEvent, finalObject, playerIDFinder){
    let userId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('" (weapon "') + 11, unparsedEvent.lastIndexOf('")'));
    let currentClass = finalObject.players[playerIDFinder[userId3]].class;

    //weapon classification is made here
    try {
        finalObject.players[playerIDFinder[userId3]].classStats[currentClass].weapons[weaponUsed][(unparsedEvent.includes("shot_hit") ? "shotsHit" : "shotsFired")]++;
    } catch (error) {
        finalObject.players[playerIDFinder[userId3]].classStats[currentClass].weapons[weaponUsed] = {
            kills: 0,
            damage: 0,
            shotsFired: 0,
            shotsHit: 0
        }
        finalObject.players[playerIDFinder[userId3]].classStats[currentClass].weapons[weaponUsed][(unparsedEvent.includes("shot_hit") ? "shotsHit" : "shotsFired")]++;
    }
}

function damageEvent(unparsedEvent, finalObject, playerIDFinder){
    let damageDealerId3 = unparsedEvent.slice(unparsedEvent.indexOf('[U:1:'), unparsedEvent.indexOf(']>') + 1);
    let damageRecieverId3 = unparsedEvent.slice(unparsedEvent.lastIndexOf('[U:1:'), unparsedEvent.lastIndexOf(']>') + 1);
    let damageDealt = parseInt(unparsedEvent.slice(unparsedEvent.indexOf('(damage "') + 9, unparsedEvent.lastIndexOf('") (weapon')));
    
    //weapon finder
    let weaponUsed;
    if(unparsedEvent.includes("healing")){
        weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('(weapon') + 9, unparsedEvent.lastIndexOf('") (healing'));
    } else if(unparsedEvent.includes('crit')){
        weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('(weapon') + 9, unparsedEvent.indexOf('") (crit'));
    } else if(unparsedEvent.includes("airshot")){
        weaponUsed = unparsedEvent.slice(unparsedEvent.indexOf('(weapon') + 9, unparsedEvent.lastIndexOf('") (airshot'));
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
        }
        finalObject.players[playerIDFinder[damageDealerId3]].classStats[currentClass].weapons[weaponUsed].damage += damageDealt;
    }

    //damageDivision spread
    if(finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] === undefined ){
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] = 0;
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageFrom[playerIDFinder[damageRecieverId3]] = 0;
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] += damageDealt;

    } else {
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] += damageDealt;
    }

    if(finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageFrom[playerIDFinder[damageDealerId3]] === undefined ){
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageTo[playerIDFinder[damageRecieverId3]] = 0;
        finalObject.players[playerIDFinder[damageDealerId3]].damageDivision.damageFrom[playerIDFinder[damageRecieverId3]] = 0;
        finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageFrom[playerIDFinder[damageDealerId3]] += damageDealt;
    } else {
        finalObject.players[playerIDFinder[damageRecieverId3]].damageDivision.damageFrom[playerIDFinder[damageDealerId3]] += damageDealt;
    }

    //round damage
    
}

function eventDateToSeconds(unparsedEvent){
    dateArray = unparsedEvent.split(' ')[1].split('/');
    finalDate= dateArray[2]+ "-" + dateArray[0]+ "-" + dateArray[1] + "T" + unparsedEvent.split(' ')[3].slice(0,-1) + "Z";
    return( new Date(finalDate).getTime()/1000);
}

module.exports = {triggeredEvent};