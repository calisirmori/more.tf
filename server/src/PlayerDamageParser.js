

function damageParser(inputLogFile){

    let logFile = inputLogFile.split(/\r?\n/);
    console.log(logFile)
    let totalDamageSum = 0;
    let realDamageSum = 0;
    let playerFocus = "[U:1:108135668]"
    let activeGame = false;
    for( let i=0; i<logFile.length; i++){
        if(logFile[i].includes("Round_Start")) activeGame = true;
        if(logFile[i].includes("Round_Win")) activeGame = false;
        if(logFile[i].includes("damage") && logFile[i].includes(playerFocus)&&activeGame)
        {
            //console.log(logFile[i]);
            let currentLineElements = logFile[i].replace(/[()]/g, '').replace(/[""]/g, '').split(" ");
            
            if(logFile[i].includes("realdamage") && logFile[i].lastIndexOf(playerFocus) != logFile[i].lastIndexOf("[U:1:")){
                //console.log(logFile[i])
                //console.log(logFile[i].slice(logFile[i].indexOf("[U:1:"), logFile[i].indexOf("]><")+1),
                //        logFile[i].slice(logFile[i].lastIndexOf("[U:1:"), logFile[i].lastIndexOf("]><")+1))
                let currentDamage = logFile[i].slice(logFile[i].indexOf('(damage "')+9, logFile[i].lastIndexOf('") (realdamage'))
                let currentReal = logFile[i].slice(logFile[i].lastIndexOf('") (realdamage')+16, logFile[i].lastIndexOf('") (weapon'))
                totalDamageSum+=parseInt(currentDamage);
                realDamageSum+=parseInt(currentReal)
                //console.log(currentDamage,currentReal)
            }else if(logFile[i].includes("damage") && logFile[i].lastIndexOf(playerFocus) != logFile[i].lastIndexOf("[U:1:")){
                //console.log(logFile[i])
                //console.log(logFile[i].slice(logFile[i].indexOf("[U:1:"), logFile[i].indexOf("]><")+1),
                //        logFile[i].slice(logFile[i].lastIndexOf("[U:1:"), logFile[i].lastIndexOf("]><")+1))
                let currentDamage = logFile[i].slice(logFile[i].indexOf('(damage "')+9, logFile[i].lastIndexOf('") (weapon'))
                realDamageSum+=parseInt(currentDamage);
                //console.log(currentDamage)
            }
        }
        if(logFile[i].includes(playerFocus) && logFile[i].includes("object")){
            console.log(logFile[i]);
        }
    }
    let totalDamage = totalDamageSum+realDamageSum;
    console.log("log actual damage :" + totalDamageSum,`\n`,'realdamage' + realDamageSum, "totaldamage :" + totalDamage )
}

module.exports = { damageParser };