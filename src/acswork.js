const { fetch, FetchResultTypes } = require("@sapphire/fetch");
const fs = require('fs');
const { rglSeasonsData } = require("../rgldata/seasons.js");


async function getData() {
    let sumChart = {
        scout:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            caps:[],
            didWin:[],
            healsRecieved:[]
        },
        soldier:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            healthkits:[],
            didWin:[],
            healsRecieved:[]
        },
        pyro:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            didWin:[],
            healsRecieved:[]
        },
        demoman:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            didWin:[],
            healsRecieved:[]
        },
        heavy:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            didWin:[],
            healsRecieved:[]
        },
        engineer:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            didWin:[],
            healsRecieved:[]
        },
        medic:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            didWin:[],
            healsRecieved:[],
            heals:[],
        },
        sniper:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            hs:[],
            didWin:[],
            healsRecieved:[]
        },
        spy:{
            kpm : [],
            apm : [],
            deathpm: [],
            dpm : [],
            dtm : [],
            bs:[],
            didWin:[],
            healsRecieved:[]
        },
    };

    let apiCall = await fetch("http://logs.tf/api/v1/log?map=cp_steel_f12&limit=1000", FetchResultTypes.JSON);

    let logsArray = Object.entries(apiCall.logs);
    // let count1 = 0;
    // let count2 = 0;
    // let count3 = 0;
    // let count4 = 0;
    // let count5 = 0;
    // let count6 = 0;
    // let count7 = 0;
    // let count8 = 0;
    // let count9 = 0;
    count = 1;
    searchAmount = 200;
    for (let index = 0; index < searchAmount; index++) {
        if(logsArray[index][1].players === 18){
            console.log("#"+ count++ + " | " + Math.ceil((index / searchAmount)*100) + "%");

            let logData = await fetch(`http://logs.tf/api/v1/log/${logsArray[index][1].id}`, FetchResultTypes.JSON);
            for (let y = 0; y < 18; y++) {
                if(Object.entries(logData.players)[y] !== undefined && Object.entries(logData.healspread).length === 2) {
                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "demoman"){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    // }
                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "scout" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.scout.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.scout.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.scout.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.scout.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.scout.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.scout.caps.push(parseFloat((Object.entries(logData.players)[y][1].cpc / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.scout.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.scout.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "soldier"  && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.soldier.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.soldier.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.soldier.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.soldier.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.soldier.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.soldier.healthkits.push(parseFloat((Object.entries(logData.players)[y][1].medkits / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.soldier.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.soldier.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "pyro"  && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.pyro.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.pyro.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.pyro.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.pyro.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.pyro.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.pyro.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.pyro.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "demoman" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.demoman.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.demoman.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.demoman.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.demoman.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.demoman.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.demoman.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.demoman.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "heavyweapons" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.heavy.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.heavy.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.heavy.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.heavy.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.heavy.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.heavy.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.heavy.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "engineer" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.engineer.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.engineer.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.engineer.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.engineer.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.engineer.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.engineer.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.engineer.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "medic" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.medic.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.medic.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.medic.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.medic.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.medic.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.medic.heals.push(parseFloat((Object.entries(logData.players)[y][1].heal / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.medic.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.medic.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "sniper" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.sniper.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.sniper.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.sniper.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.sniper.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.sniper.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.sniper.hs.push(parseFloat((Object.entries(logData.players)[y][1].headshots_hit / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.sniper.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.sniper.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    }

                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "spy" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        sumChart.spy.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        sumChart.spy.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        sumChart.spy.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.spy.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.spy.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.spy.bs.push(parseFloat((Object.entries(logData.players)[y][1].backstabs / (playerObject.total_time/60)).toFixed(2)));
                        sumChart.spy.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                        sumChart.spy.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(logData.length/60)).toFixed(2)));
                    }
                }
            }
        }
    }

    // sumChart.scout.dpm /= count1;
    // sumChart.scout.dtm /= count1;
    // sumChart.scout.kpm /= count1;
    // sumChart.scout.apm /= count1;
    // sumChart.scout.deathpm /= count1;
    // sumChart.scout.healthkits /= count1;
    // sumChart.scout.bs /= count1;
    // sumChart.scout.hs /= count1;
    // sumChart.scout.caps /= count1;
    // sumChart.scout.heals /= count1;
   
    // sumChart.soldier.dpm /= count2;
    // sumChart.soldier.dtm /= count2;
    // sumChart.soldier.kpm /= count2;
    // sumChart.soldier.apm /= count2;
    // sumChart.soldier.deathpm /= count2;
    // sumChart.soldier.healthkits /= count2;
    // sumChart.soldier.bs /= count2;
    // sumChart.soldier.hs /= count2;
    // sumChart.soldier.caps /= count2;
    // sumChart.soldier.heals /= count2;
    
    // sumChart.pyro.dpm /= count3;
    // sumChart.pyro.dtm /= count3;
    // sumChart.pyro.kpm /= count3;
    // sumChart.pyro.apm /= count3;
    // sumChart.pyro.deathpm /= count3;
    // sumChart.pyro.healthkits /= count3;
    // sumChart.pyro.bs /= count3;
    // sumChart.pyro.hs /= count3;
    // sumChart.pyro.caps /= count3;
    // sumChart.pyro.heals /= count3;

    // sumChart.demoman.dpm /= count4;
    // sumChart.demoman.dtm /= count4;
    // sumChart.demoman.kpm /= count4;
    // sumChart.demoman.apm /= count4;
    // sumChart.demoman.deathpm /= count4;
    // sumChart.demoman.healthkits /= count4;
    // sumChart.demoman.bs /= count4;
    // sumChart.demoman.hs /= count4;
    // sumChart.demoman.caps /= count4;
    // sumChart.demoman.heals /= count4;

    // sumChart.heavy.dpm /= count5;
    // sumChart.heavy.dtm /= count5;
    // sumChart.heavy.kpm /= count5;
    // sumChart.heavy.apm /= count5;
    // sumChart.heavy.deathpm /= count5;
    // sumChart.heavy.healthkits /= count5;
    // sumChart.heavy.bs /= count5;
    // sumChart.heavy.hs /= count5;
    // sumChart.heavy.caps /= count5;
    // sumChart.heavy.heals /= count5;

    // sumChart.engineer.dpm /= count6;
    // sumChart.engineer.dtm /= count6;
    // sumChart.engineer.kpm /= count6;
    // sumChart.engineer.apm /= count6;
    // sumChart.engineer.deathpm /= count6;
    // sumChart.engineer.healthkits /= count6;
    // sumChart.engineer.bs /= count6;
    // sumChart.engineer.hs /= count6;
    // sumChart.engineer.caps /= count6;
    // sumChart.engineer.heals /= count6;

    // sumChart.medic.dpm /= count7;
    // sumChart.medic.dtm /= count7;
    // sumChart.medic.kpm /= count7;
    // sumChart.medic.apm /= count7;
    // sumChart.medic.deathpm /= count7;
    // sumChart.medic.healthkits /= count7;
    // sumChart.medic.bs /= count7;
    // sumChart.medic.hs /= count7;
    // sumChart.medic.caps /= count7;
    // sumChart.medic.heals /= count7;

    // sumChart.sniper.dpm /= count8;
    // sumChart.sniper.dtm /= count8;
    // sumChart.sniper.kpm /= count8;
    // sumChart.sniper.apm /= count8;
    // sumChart.sniper.deathpm /= count8;
    // sumChart.sniper.healthkits /= count8;
    // sumChart.sniper.bs /= count8;
    // sumChart.sniper.hs /= count8;
    // sumChart.sniper.caps /= count8;
    // sumChart.sniper.heals /= count8;

    // sumChart.spy.dpm /= count9;
    // sumChart.spy.dtm /= count9;
    // sumChart.spy.kpm /= count9;
    // sumChart.spy.apm /= count9;
    // sumChart.spy.deathpm /= count9;
    // sumChart.spy.healthkits /= count9;
    // sumChart.spy.bs /= count9;
    // sumChart.spy.hs /= count9;
    // sumChart.spy.caps /= count9;
    // sumChart.spy.heals /= count9;

    fs.writeFile('cp-steel-hl.txt', JSON.stringify(sumChart,null,2), err => {
        if (err) {
          console.error(err);
        }
        console.log("wrote new file")
    });
}

module.exports = { getData };