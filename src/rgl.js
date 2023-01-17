// this is used to generate stats for rgl players

const { fetch, FetchResultTypes } = require("@sapphire/fetch");
const fs = require('fs');
const { rglSeasonsData } = require("../rgldata/seasons.js");


async function getData() {
    let seasonObject = {};
    let sumNumbersObject = {};
    let seasonsArray = Object.entries(rglSeasonsData);
    
    for ( let seasonIndex = 0; seasonIndex < seasonsArray.length; seasonIndex++){
        
        console.log(seasonIndex + " / " + seasonsArray.length)
        let currentDivisions = {};
        let currentTeams = rglSeasonsData[seasonsArray[seasonIndex][0]].participatingTeams;
        let totalPlayers = 0 ;

        for (let index = 0; index < currentTeams.length; index++) {
            console.log(index + " / " + currentTeams.length)
            await new Promise(resolve => setTimeout(resolve, 1000));
            let apiCall = await fetch(`https://api.rgl.gg/v0/teams/${currentTeams[index]}`, FetchResultTypes.JSON);
            totalPlayers += apiCall.players.length;
            currentDivisions[apiCall.divisionName] === undefined ? currentDivisions[apiCall.divisionName] = apiCall.players.length : currentDivisions[apiCall.divisionName] += apiCall.players.length;
        }

        let seasonNumbers = {
            seasonName: rglSeasonsData[seasonsArray[seasonIndex][0]].name,
            totalMatches: rglSeasonsData[seasonsArray[seasonIndex][0]].matchesPlayedDuringSeason.length,
            totalTeams: rglSeasonsData[seasonsArray[seasonIndex][0]].participatingTeams.length,
            totalPlayers : totalPlayers,
            playerDivision: currentDivisions,
        }
        sumNumbersObject[seasonsArray[seasonIndex][0]] = {...sumNumbersObject[seasonsArray[seasonIndex][0]], ...seasonNumbers};
    }

    console.log(sumNumbersObject)

    fs.writeFile('sumNumbers.txt', JSON.stringify(sumNumbersObject,null,2), err => {
        if (err) {
          console.error(err);
        }
        console.log("wrote new file")
    });
    
    console.log("-----------------------");
    console.log("Total Seasons : " + Object.entries(rglSeasonsData).length);
    console.log("-----------------------");
}

module.exports = { getData };