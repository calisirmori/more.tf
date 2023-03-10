const { nonTriggeredEvent } = require("./nontriggeredEvents");
const { triggeredEvent } = require("./triggeredEvents");


async function parse(LogFile, matchID, logsApiResponse){

    let lastDeathTime = {};
    unparsedArray = LogFile.split(/\r?\n/);
    const lastIndex = unparsedArray.length - 1;
    let parsedJSON = {
        id: Math.floor(Math.random() * 90000000 + 10000000),
        info:{
            gameIsActive: false,
            isImported: true,
            logsID: matchID,
            demosID: 000000,
            date: eventDateToSeconds(unparsedArray[0]),
            matchLength: eventDateToSeconds(unparsedArray[lastIndex-5]) - eventDateToSeconds(unparsedArray[0]),
            winner: "live",
            status: true,
            pause: {
                lastPause: 0,
                pauseSum: 0,
            },
            map: logsApiResponse.info.map,
            logsTitle : logsApiResponse.info.title,

        },
        teams:{ // done
            red:{
                score: 0,
                kills: 0,
                damage: 0,
                charges: 0,
                drops: 0,
                firstcaps: 0,
                caps: 0,
            },
            blue:{
                score: 0,
                kills: 0,
                damage: 0,
                charges: 0,
                drops: 0,
                firstcaps: 0,
                caps: 0,
            },
        },
        players:{},
        events:[], //60% done
        rounds:[],
        combatScores:{},
        healSpread:{},
        healsPerInterval: {
            red:[],
            blue:[]
        },
        damagePerInterval: {
            red:[],
            blue:[]
        },
        killSpread:{}, //done needs double checked
        assistSpread:{}, //done needs double checked
        chat:[], //done needs double checked
        killStreaks: logsApiResponse.killstreaks
    };

    let playerIDFinder = {};
    let count = 0;
    if (unparsedArray[2].includes("changed role to")){
        for (let lineIndex = 0; lineIndex < unparsedArray.length; lineIndex++) {
            const unparsedEvent = unparsedArray[lineIndex];
            unparsedEvent.includes("triggered") ? triggeredEvent(unparsedEvent, parsedJSON, playerIDFinder) : nonTriggeredEvent(unparsedEvent, parsedJSON, playerIDFinder, lastDeathTime);
        }
    } else {
        return("depreciated logs plugin or combined log")
    }
    // console.log(parsedJSON.teams)
    return parsedJSON;
}

function eventDateToSeconds(unparsedEvent){
    dateArray = unparsedEvent.split(' ')[1].split('/');
    finalDate= dateArray[2]+ "-" + dateArray[0]+ "-" + dateArray[1] + "T" + unparsedEvent.split(' ')[3].slice(0,-1) + "Z";
    return( new Date(finalDate).getTime()/1000);
}

module.exports = {parse};


        //all triggered events
        // healed | heal event
        // damage | damage event
        // kill assist | assist event
        // shot_fired | shot fired event
        // shot_hit | shot hit event
        // player_builtobject | sapper/engie buildings event
        // player_carryobject | engie picked up buiding event
        // player_dropobject | dropped to carried object event
        // object_detonated | engie self detonate object
        // pointcaptured | pointscapped event
        // captureblocked | point blocked event
        // domination | domination event
        // revenge | revenge event
        // flagevent | flagevent soccer mode
        // empty_uber | uber over event
        // player_extinguished | uber ready event
        // jarate_attack | Sydney Sniper full charge
        // milk_attack | milkman?
        // gas_attack | pyro gas
        // chargeready | uber ready event
        // chargedeployed | uber used event
        // chargeended | uber duration event
        // force_suicide | kill bind?
        // medic_death | medic kill event
        // medic_death_ex | uber percentage on death event
        // first_heal_after_spawn | time spent without healing after spawn
        // lost_uber_advantage | lost advantages 
        // Intermission_Win_Limit | round end
        // matchpause | pause event
        // matchunpause | unpause event

        
        // demos.tf | messages from demos.tf
        // changed name to |
        // disconnected | mid match disconnect
        // joined team | team swap
        // current score |score after a round
        // STV Available at |demos.tf link!! use this if available instead of cross reference
