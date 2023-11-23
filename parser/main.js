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
            map: logsApiResponse.info !== undefined ? logsApiResponse.info.map : logsApiResponse.map,
            logsTitle : logsApiResponse.info !== undefined ? logsApiResponse.info.title : logsApiResponse.title,
            passTime : 0,
        },
        teams:{
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
        players: {},
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
        killStreaks: logsApiResponse.killstreaks !== undefined ? logsApiResponse.killstreaks : { source: "internal"}
    };

    let playerIDFinder = {};
    let count = 0;

    for (let lineIndex = 0; lineIndex < unparsedArray.length; lineIndex++) {
        const unparsedEvent = unparsedArray[lineIndex];
        unparsedEvent.includes("triggered") ? triggeredEvent(unparsedEvent, parsedJSON, playerIDFinder) : nonTriggeredEvent(unparsedEvent, parsedJSON, playerIDFinder, lastDeathTime);
    }

    return parsedJSON;
}

function eventDateToSeconds(unparsedEvent){
    dateArray = unparsedEvent.split(' ')[1].split('/');
    finalDate= dateArray[2]+ "-" + dateArray[0]+ "-" + dateArray[1] + "T" + unparsedEvent.split(' ')[3].slice(0,-1) + "Z";
    return( new Date(finalDate).getTime()/1000);
}

module.exports = {parse};