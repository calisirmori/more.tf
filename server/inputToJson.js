var weapons
var player_info = {
    "name": "",
    "level": 0,
}
var match_info = {

};
var medics = {
    "blue_med": {
        "id" : "[U:1:292246112]",
        "healing": 0,
    },
    "red_med": {
        "id" : "[U:1:171802556]",
        "healing": 0,
    }
}
var gameIsActive = false;

function stringToObject(inputString){
    var stringArray = inputString.split(/\r?\n/);

    //for(var i = 0; i < stringArray.length; i++) {
    //    
    //    if(stringArray[i].includes("Round_Start")) gameIsActive = true;
    //    if(stringArray[i].includes("Round_Win")) gameIsActive = false;
//
    //    if( stringArray[i].includes("healed") && gameIsActive == true){
    //        if(stringArray[i].includes("[U:1:171802556]")){
    //            var healingDone = stringArray[i].slice(
    //                stringArray[i].indexOf('healing "')+9,
    //                stringArray[i].lastIndexOf('"')
    //            );
    //            medics.blue_med.healing = medics.blue_med.healing + parseInt(healingDone)
    //        } else if (stringArray[i].includes("[U:1:292246112]")) {
    //            var healingDone = stringArray[i].slice(
    //                stringArray[i].indexOf('healing "')+9,
    //                stringArray[i].lastIndexOf('"')
    //            );
    //            medics.red_med.healing = medics.red_med.healing + parseInt(healingDone)
    //        }
    //    }
    //    
    //}
    //console.log(medics);
    //for(var i = 0; i < 5; ++i){
    //    player_info.name = "jacob" + i;
    //    player_info.level = i;
    //    match_info["match_info" + i] = { ...match_info[i], ...player_info }
    //}
    //console.log(match_info);
    
    var all = []
    for (var i = 0; i <stringArray.length; ++i){

        if(
            
        //ALL TERMS KOTH

        !stringArray[i].includes("triggered") 
        // && !stringArray[i].includes("shot_fired")
        // && !stringArray[i].includes("shot_hit")
        // && !stringArray[i].includes("damage")
        // && !stringArray[i].includes("healed")
        // && !stringArray[i].includes("player_builtobject")
        // && !stringArray[i].includes("object_detonated") //pda object det
        // && !stringArray[i].includes("player_dropobject") //put the object back down
        // && !stringArray[i].includes("player_carryobject") //picked up object
        // && !stringArray[i].includes("kill assist")
        // && !stringArray[i].includes("chargedeployed")
        // && !stringArray[i].includes("player_extinguished")
        // && !stringArray[i].includes("domination")
        // && !stringArray[i].includes("revenge")
        // && !stringArray[i].includes("medic_death") //reports the uber percentage
        // && !stringArray[i].includes("chargeended") //reports uber duration
        // && !stringArray[i].includes("first_heal_after_spawn") // second wasted until uber
        // && !stringArray[i].includes("chargeready")
        // && !stringArray[i].includes("empty_uber")
        // && !stringArray[i].includes("lost_uber_advantage")
        // && !stringArray[i].includes("pointcaptured")
        // && !stringArray[i].includes("captureblocked")
        // && !stringArray[i].includes("Round_Start")
        // && !stringArray[i].includes("Round_Setup_Begin")
        // && !stringArray[i].includes("Round_Setup_End")
        // && !stringArray[i].includes("Round_Length")
        // && !stringArray[i].includes("Round_Win")
        // && !stringArray[i].includes("Game_Over")

        && !stringArray[i].includes("say_team")
        && !stringArray[i].includes("say")
        && !stringArray[i].includes("spawned")
        && !stringArray[i].includes("killed") // KillerId | "killed" | VictimId | "with" | KillersGun | (attacker_position) | (victim_position)
        && !stringArray[i].includes("killedobject") // ".Sizzle<5><[U:1:203000791]><Red>" triggered "killedobject" (object "OBJ_SENTRYGUN") (weapon "sniperrifle") (objectowner "lampin<8><[U:1:4101350]><Blue>") (attacker_position "-1541 484 291")
        //&& !stringArray[i].includes("position_report")
        && !stringArray[i].includes("picked") // tf_ammo_pack | medkit_medium | ammopack_medium | ammopack_small | ammopack_large
        && !stringArray[i].includes("changed role")
        && !stringArray[i].includes("committed suicide with")
        && !stringArray[i].includes("current score")

        //steel
        && !stringArray[i].includes("joined team")
        && !stringArray[i].includes("disconnected")
        && !stringArray[i].includes("current score")
        && !stringArray[i].includes("final score")
        
        //extras
        && !stringArray[i].includes("changed name")
        && !stringArray[i].includes("connected")
        && !stringArray[i].includes("entered the game")
        && !stringArray[i].includes("least 5 minutes long")
        && stringArray[i].includes("position")

        ){
            
            console.log(stringArray[i])
            
        } 
    }
}



module.exports = { stringToObject };