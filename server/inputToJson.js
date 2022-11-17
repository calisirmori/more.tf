
var gameIsActive = false;
var match_info = {};
var players = {};
var kill_info = {};
var killCount = 0;
var kills = {
    "red": {
        "scout": {},
        "soldier": {},
        "pyro": {},
        "demoman": {},
        "heavyweapons": {},
        "engineer": {},
        "medic": {},
        "sniper": {},
        "spy": {},
    },
    "blue": {
        "scout": {},
        "soldier": {},
        "pyro": {},
        "demoman": {},
        "heavyweapons": {},
        "engineer": {},
        "medic": {},
        "sniper": {},
        "spy": {},
    }
};


function stringToObject(inputString){
    var stringArray = inputString.split(/\r?\n/);
    for (var i = 0; i <stringArray.length; ++i){
        if(stringArray[i].includes("role") && !gameIsActive){
            currentString = stringArray[i];
            currentPlayerClass = currentString.slice(currentString.indexOf('changed role to') + 17,currentString.lastIndexOf('"'));
            currentPlayerId = currentString.slice(currentString.indexOf('[U:1:'),currentString.lastIndexOf(']>')+1);
            currentPlayerTeam = currentString.includes("Red") ? "red" : "blue";
            playerObject = {
                [currentPlayerId] : {
                    "team" : currentPlayerTeam,
                    "class" : currentPlayerClass,
                    "extinguished" : 0,
                    "domination" : 0,
                    "objectkills" : 0,
                    "objectbuilds" :0,
                    "ammopickup" : 0,
                    "kills" : {
                    },
                    "damage" : {
                        "total": 0,
                        "scout": 0,
                        "soldier": 0,
                        "pyro": 0,
                        "demoman": 0,
                        "heavyweapons": 0,
                        "engineer": 0,
                        "medic": 0,
                        "sniper": 0,
                        "spy": 0,
                    }
                }
            }
            players= { ...players, ...playerObject }    
        } 

        // getting general information from kills
        if(stringArray[i].includes("Round_Start")) gameIsActive = true;
        if(stringArray[i].includes("Round_Win")) gameIsActive = false;

        if(stringArray[i].includes("killed") && !stringArray[i].includes("killedobject") && gameIsActive){
            killCount++;
            currentString = stringArray[i];
            currentKillerId = currentString.slice(currentString.indexOf('[U:1:'),currentString.indexOf(']>')+1);
            currentVictimId = currentString.slice(currentString.lastIndexOf('[U:1:'),currentString.lastIndexOf(']>')+1);
            currentKillerLocation = currentString.slice(currentString.indexOf('attacker_position') + 19 , currentString.lastIndexOf(') (victim_position')-1 )
            currentVictimLocation = currentString.slice(currentString.indexOf('victim_position') + 17 , currentString.lastIndexOf('")'))
            killerWeapon = currentString.slice(currentString.indexOf('with "')+6, currentString.lastIndexOf('" ('))
            kill_info = {
                "killer" : {
                    "id" : currentKillerId,
                    "weapon" : killerWeapon,
                    "location" : currentKillerLocation,
                },
                "victim" : {
                    "id" : currentVictimId,
                    "location" : currentVictimLocation,
                }
            }
            players[currentKillerId].kills[killCount] = {...players[currentKillerId].kills[killCount], ...kill_info}
        }
        
        if(stringArray[i].includes("damage") && gameIsActive){
            killCount++;
            currentString = stringArray[i];
            currentDamagerId = currentString.slice(currentString.indexOf('[U:1:'),currentString.indexOf(']>')+1);
            currentVictimId = currentString.slice(currentString.lastIndexOf('[U:1:'),currentString.lastIndexOf(']>')+1);
            if (stringArray[i].includes("realdamage")){
                currentDamage = currentString.slice(currentString.lastIndexOf('realdamage "') + 12 , currentString.lastIndexOf('") (weapon'))
                
            } else {
                currentDamage = currentString.slice(currentString.lastIndexOf('(damage "') + 9 , currentString.lastIndexOf('") (weapon'))
            }

            players[currentDamagerId].damage[players[currentVictimId].class] += parseInt(currentDamage);
            players[currentDamagerId].damage.total += parseInt(currentDamage);
        }

        if(stringArray[i].includes("player_extinguished") && gameIsActive){
            currentString = stringArray[i];
            currentPyroId = currentString.slice(currentString.indexOf('[U:1:'),currentString.indexOf(']>')+1);
            players[currentPyroId].extinguished++; 
        }

        if(stringArray[i].includes("domination") && gameIsActive){
            currentString = stringArray[i];
            currentdominationId = currentString.slice(currentString.indexOf('[U:1:'),currentString.indexOf(']>')+1);
            players[currentdominationId].domination++; 
        }

        if(stringArray[i].includes("killedobject") && gameIsActive){
            currentString = stringArray[i];
            currentPlayerId = currentString.slice(currentString.indexOf('[U:1:'),currentString.indexOf(']>')+1);
            players[currentPlayerId].objectkills++; 
        }
        if(stringArray[i].includes("player_builtobject") && gameIsActive){
            currentString = stringArray[i];
            currentPlayerId = currentString.slice(currentString.indexOf('[U:1:'),currentString.indexOf(']>')+1);
            players[currentPlayerId].objectbuilds++; 
        }
        if(stringArray[i].includes("picked") && gameIsActive){
            currentString = stringArray[i];
            currentPlayerId = currentString.slice(currentString.indexOf('[U:1:'),currentString.indexOf(']>')+1);
            if( stringArray[i].includes("ammopack_small")){
                players[currentPlayerId].ammopickup++; 
            }else if (stringArray[i].includes("tf_ammo_pack") || stringArray[i].includes("tf_ammo_pack") ){
                players[currentPlayerId].ammopickup+=2; 
            } else if( stringArray[i].includes("ammopack_large")){
                players[currentPlayerId].ammopickup+=4; 
            }
        }
    }
    match_info = {...match_info, players, kills}
    return(match_info.players);
}
module.exports = { stringToObject };