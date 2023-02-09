const { nonTriggeredEvent } = require("./nontriggeredEvents");
const { triggeredEvent } = require("./triggeredEvents");


async function parse(LogFile){

    unparsedArray = LogFile.split(/\r?\n/);
    let parsedJSON = {
        id: Math.floor(Math.random() * 90000000 + 10000000),
        info:{
            isImported: true,
            logsID: 000000,
            demosID: 000000,
            date: eventDateToSeconds(unparsedArray[0]),
            matchLength: eventDateToSeconds(unparsedArray[unparsedArray.length-2])-eventDateToSeconds(unparsedArray[0])
        },
        teams:{},
        players:{},
        events:[], //60% done
        rounds:[],
        combatScores:{},
        damageSpread:{},
        healSpread:{},
        killSpread:{}, //done needs double checked
        chat:[] //done needs double checked
    };

    let playerIDFinder = {};

    for (let lineIndex = 0; lineIndex < unparsedArray.length; lineIndex++) {
        const unparsedEvent = unparsedArray[lineIndex];
        unparsedEvent.includes("triggered") ? triggeredEvent(unparsedEvent, parsedJSON, playerIDFinder) : nonTriggeredEvent(unparsedEvent, parsedJSON, playerIDFinder);

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
        // World triggered | world events
        
        //bugged?? see https://logs.tf/3350991
        // airshot_rocket |      // rocket_jump |      // airshot_sticky |      // mvp1 |      // mvp2 |      // mvp3 |      // airshot_pipebomb |      // sticky_jump |      // player_loadout |      // airblast_player |      // backstab |      // crit_kill |      // defended_medic |      // airshot_flare |      // airshot_stun |      // stun |      // airshot_headshot |      // deflected_rocket |      // airshot_arrow |      // teleport_used |      // teleport |       // //all non "triggered" events
        
        // picked up item | pickup ammo/medkit
        // spawned as | class change
        // say | chat
        // demos.tf | messages from demos.tf
        // changed role to | initial spawned class
        // changed name to |      // connected, address | mid match connect
        // entered the game | mid match connect
        // disconnected | mid match disconnect
        // joined team | team swap
        // position_report |minutly position report
        // STEAM USERID validated |?
        // current score |score after a round
        // STV Available at |demos.tf link!! use this if available instead of cross reference
        // final score | match end scores
        // committed suicide | suicide
        // killed |kill event

        // ){
        //     count++;
        //     console.log(unparsedEvent);
        // }
    }
    //console.log(parsedJSON.players)
}

function eventDateToSeconds(unparsedEvent){
    dateArray = unparsedEvent.split(' ')[1].split('/');
    finalDate= dateArray[2]+ "-" + dateArray[0]+ "-" + dateArray[1] + "T" + unparsedEvent.split(' ')[3].slice(0,-1) + "Z";
    return( new Date(finalDate).getTime()/1000);
}

module.exports = {parse};