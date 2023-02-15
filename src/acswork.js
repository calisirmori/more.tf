const { fetch, FetchResultTypes } = require("@sapphire/fetch");
const fs = require('fs');
const { rglSeasonsData } = require("../rgldata/seasons.js");


async function getData() {
    let percentiles = [
        {"kpm":0.2,"apm":0,"deathpm":0.3,"dpm":176,"dtm":176,"healsRecieved":30.3273},
        {"kpm":0.26,"apm":0,"deathpm":0.37,"dpm":196.66,"dtm":187,"healsRecieved":39.5566},
        {"kpm":0.29,"apm":0.06,"deathpm":0.39,"dpm":210,"dtm":192,"healsRecieved":43.2597},
        {"kpm":0.3132,"apm":0.07,"deathpm":0.43,"dpm":225,"dtm":201,"healsRecieved":47.3068},
        {"kpm":0.35,"apm":0.08,"deathpm":0.45,"dpm":232,"dtm":204,"healsRecieved":49.5765},
        {"kpm":0.38,"apm":0.09,"deathpm":0.47,"dpm":238,"dtm":209,"healsRecieved":52.6498},
        {"kpm":0.39,"apm":0.09,"deathpm":0.4831,"dpm":244,"dtm":212,"healsRecieved":56.2175},
        {"kpm":0.41,"apm":0.1,"deathpm":0.5,"dpm":249,"dtm":214.64,"healsRecieved":58.0384},
        {"kpm":0.43,"apm":0.11,"deathpm":0.52,"dpm":254,"dtm":218,"healsRecieved":60.074},
        {"kpm":0.45,"apm":0.12,"deathpm":0.54,"dpm":256.3,"dtm":221.3,"healsRecieved":61.873},
        {"kpm":0.46,"apm":0.12,"deathpm":0.55,"dpm":260,"dtm":224,"healsRecieved":64.1086},
        {"kpm":0.48,"apm":0.13,"deathpm":0.56,"dpm":263,"dtm":227,"healsRecieved":65.3784},
        {"kpm":0.49,"apm":0.13,"deathpm":0.57,"dpm":266.29,"dtm":229,"healsRecieved":66.46},
        {"kpm":0.51,"apm":0.14,"deathpm":0.59,"dpm":270,"dtm":231,"healsRecieved":67.3948},
        {"kpm":0.52,"apm":0.14,"deathpm":0.6,"dpm":273,"dtm":234,"healsRecieved":69.815},
        {"kpm":0.53,"apm":0.15,"deathpm":0.61,"dpm":276,"dtm":236,"healsRecieved":71.5012},
        {"kpm":0.54,"apm":0.16,"deathpm":0.61,"dpm":279,"dtm":238,"healsRecieved":73.41},
        {"kpm":0.55,"apm":0.16,"deathpm":0.62,"dpm":282,"dtm":240,"healsRecieved":74.7788},
        {"kpm":0.56,"apm":0.17,"deathpm":0.63,"dpm":284,"dtm":241,"healsRecieved":76.2143},
        {"kpm":0.57,"apm":0.17,"deathpm":0.63,"dpm":286,"dtm":242,"healsRecieved":77.696},
        {"kpm":0.59,"apm":0.17,"deathpm":0.64,"dpm":289,"dtm":244,"healsRecieved":79.5874},
        {"kpm":0.6,"apm":0.18,"deathpm":0.65,"dpm":291.26,"dtm":245,"healsRecieved":80.7452},
        {"kpm":0.61,"apm":0.18,"deathpm":0.66,"dpm":293,"dtm":247,"healsRecieved":81.6859},
        {"kpm":0.61,"apm":0.19,"deathpm":0.67,"dpm":295.92,"dtm":248,"healsRecieved":83.1792},
        {"kpm":0.62,"apm":0.19,"deathpm":0.6725,"dpm":297,"dtm":249,"healsRecieved":84.0775},
        {"kpm":0.63,"apm":0.19,"deathpm":0.68,"dpm":300,"dtm":251,"healsRecieved":84.9658},
        {"kpm":0.64,"apm":0.2,"deathpm":0.69,"dpm":301,"dtm":252,"healsRecieved":86.0074},
        {"kpm":0.64,"apm":0.2,"deathpm":0.7,"dpm":302,"dtm":253,"healsRecieved":86.6548},
        {"kpm":0.65,"apm":0.2,"deathpm":0.7,"dpm":304,"dtm":254,"healsRecieved":87.67},
        {"kpm":0.66,"apm":0.21,"deathpm":0.71,"dpm":306,"dtm":255,"healsRecieved":88.936},
        {"kpm":0.67,"apm":0.21,"deathpm":0.71,"dpm":308,"dtm":257,"healsRecieved":90.3253},
        {"kpm":0.68,"apm":0.21,"deathpm":0.72,"dpm":310,"dtm":258,"healsRecieved":91.438},
        {"kpm":0.68,"apm":0.22,"deathpm":0.73,"dpm":312,"dtm":260,"healsRecieved":92.2289},
        {"kpm":0.69,"apm":0.22,"deathpm":0.73,"dpm":314,"dtm":261,"healsRecieved":92.9},
        {"kpm":0.7,"apm":0.23,"deathpm":0.74,"dpm":315,"dtm":262,"healsRecieved":94.1},
        {"kpm":0.7088,"apm":0.23,"deathpm":0.75,"dpm":316.88,"dtm":264,"healsRecieved":95.1976},
        {"kpm":0.71,"apm":0.24,"deathpm":0.76,"dpm":318,"dtm":265,"healsRecieved":96.46},
        {"kpm":0.72,"apm":0.24,"deathpm":0.76,"dpm":320,"dtm":266,"healsRecieved":97.3226},
        {"kpm":0.73,"apm":0.24,"deathpm":0.77,"dpm":321,"dtm":267,"healsRecieved":98.26},
        {"kpm":0.74,"apm":0.25,"deathpm":0.78,"dpm":323,"dtm":268,"healsRecieved":98.994},
        {"kpm":0.75,"apm":0.25,"deathpm":0.78,"dpm":325,"dtm":269,"healsRecieved":99.656},
        {"kpm":0.75,"apm":0.25,"deathpm":0.79,"dpm":327,"dtm":271,"healsRecieved":101.0644},
        {"kpm":0.76,"apm":0.26,"deathpm":0.8,"dpm":329,"dtm":271.19,"healsRecieved":102.2719},
        {"kpm":0.77,"apm":0.26,"deathpm":0.8,"dpm":331,"dtm":273,"healsRecieved":103.1408},
        {"kpm":0.78,"apm":0.26,"deathpm":0.81,"dpm":332,"dtm":274,"healsRecieved":104.847},
        {"kpm":0.78,"apm":0.27,"deathpm":0.81,"dpm":333,"dtm":275,"healsRecieved":105.8},
        {"kpm":0.79,"apm":0.27,"deathpm":0.82,"dpm":334,"dtm":276,"healsRecieved":106.8059},
        {"kpm":0.8,"apm":0.28,"deathpm":0.82,"dpm":337,"dtm":277,"healsRecieved":107.8636},
        {"kpm":0.81,"apm":0.28,"deathpm":0.83,"dpm":339,"dtm":279,"healsRecieved":108.8434},
        {"kpm":0.82,"apm":0.28,"deathpm":0.83,"dpm":340,"dtm":280,"healsRecieved":109.88},
        {"kpm":0.83,"apm":0.29,"deathpm":0.84,"dpm":342,"dtm":281,"healsRecieved":110.91},
        {"kpm":0.83,"apm":0.29,"deathpm":0.84,"dpm":344,"dtm":282,"healsRecieved":112.3112},
        {"kpm":0.84,"apm":0.3,"deathpm":0.85,"dpm":345,"dtm":283,"healsRecieved":113.5049},
        {"kpm":0.85,"apm":0.3,"deathpm":0.85,"dpm":346,"dtm":284,"healsRecieved":114.332},
        {"kpm":0.86,"apm":0.31,"deathpm":0.86,"dpm":348,"dtm":285,"healsRecieved":115.444},
        {"kpm":0.87,"apm":0.31,"deathpm":0.87,"dpm":349,"dtm":286,"healsRecieved":116.3424},
        {"kpm":0.88,"apm":0.31,"deathpm":0.88,"dpm":351,"dtm":287,"healsRecieved":117.8743},
        {"kpm":0.89,"apm":0.32,"deathpm":0.88,"dpm":353,"dtm":289,"healsRecieved":119.2584},
        {"kpm":0.9,"apm":0.32,"deathpm":0.89,"dpm":354,"dtm":290,"healsRecieved":120.6735},
        {"kpm":0.91,"apm":0.33,"deathpm":0.9,"dpm":356,"dtm":291,"healsRecieved":121.518},
        {"kpm":0.91,"apm":0.33,"deathpm":0.9013,"dpm":357,"dtm":292,"healsRecieved":122.6326},
        {"kpm":0.92,"apm":0.33,"deathpm":0.91,"dpm":359,"dtm":293,"healsRecieved":123.7328},
        {"kpm":0.93,"apm":0.34,"deathpm":0.92,"dpm":361,"dtm":295,"healsRecieved":125.0174},
        {"kpm":0.94,"apm":0.34,"deathpm":0.93,"dpm":362,"dtm":296,"healsRecieved":126.3884},
        {"kpm":0.95,"apm":0.35,"deathpm":0.94,"dpm":364,"dtm":297,"healsRecieved":127.2945},
        {"kpm":0.96,"apm":0.35,"deathpm":0.94,"dpm":366,"dtm":298,"healsRecieved":129.3102},
        {"kpm":0.97,"apm":0.35,"deathpm":0.95,"dpm":367,"dtm":299,"healsRecieved":131.2011},
        {"kpm":0.97,"apm":0.36,"deathpm":0.96,"dpm":369.44,"dtm":300,"healsRecieved":132.6572},
        {"kpm":0.98,"apm":0.36,"deathpm":0.96,"dpm":372,"dtm":301,"healsRecieved":133.6177},
        {"kpm":1,"apm":0.37,"deathpm":0.97,"dpm":375,"dtm":302,"healsRecieved":134.542},
        {"kpm":1,"apm":0.37,"deathpm":0.98,"dpm":376,"dtm":303,"healsRecieved":135.7844},
        {"kpm":1.01,"apm":0.38,"deathpm":0.98,"dpm":378,"dtm":304,"healsRecieved":137.4792},
        {"kpm":1.02,"apm":0.38,"deathpm":0.99,"dpm":380,"dtm":306,"healsRecieved":139.2726},
        {"kpm":1.03,"apm":0.39,"deathpm":1,"dpm":382,"dtm":307,"healsRecieved":141.0124},
        {"kpm":1.04,"apm":0.39,"deathpm":1.01,"dpm":385,"dtm":308,"healsRecieved":143.06},
        {"kpm":1.0508,"apm":0.4,"deathpm":1.02,"dpm":387,"dtm":309,"healsRecieved":144.4384},
        {"kpm":1.06,"apm":0.4041,"deathpm":1.03,"dpm":389,"dtm":311,"healsRecieved":146.1061},
        {"kpm":1.08,"apm":0.41,"deathpm":1.03,"dpm":392,"dtm":313,"healsRecieved":148.3314},
        {"kpm":1.09,"apm":0.42,"deathpm":1.04,"dpm":394.07,"dtm":314,"healsRecieved":150.1207},
        {"kpm":1.11,"apm":0.43,"deathpm":1.05,"dpm":397,"dtm":316,"healsRecieved":151.16},
        {"kpm":1.12,"apm":0.4373,"deathpm":1.06,"dpm":400,"dtm":318,"healsRecieved":153.97},
        {"kpm":1.1306,"apm":0.44,"deathpm":1.07,"dpm":404,"dtm":319,"healsRecieved":155.969},
        {"kpm":1.15,"apm":0.45,"deathpm":1.08,"dpm":407.39,"dtm":321,"healsRecieved":158.0068},
        {"kpm":1.16,"apm":0.46,"deathpm":1.09,"dpm":411.72,"dtm":323,"healsRecieved":160.9092},
        {"kpm":1.18,"apm":0.47,"deathpm":1.1,"dpm":416,"dtm":325,"healsRecieved":162.5855},
        {"kpm":1.19,"apm":0.47,"deathpm":1.1038,"dpm":419,"dtm":328,"healsRecieved":165.7138},
        {"kpm":1.21,"apm":0.48,"deathpm":1.11,"dpm":422,"dtm":330,"healsRecieved":168.7871},
        {"kpm":1.2204,"apm":0.5,"deathpm":1.12,"dpm":425,"dtm":332,"healsRecieved":171.3876},
        {"kpm":1.24,"apm":0.5,"deathpm":1.14,"dpm":429,"dtm":335,"healsRecieved":173.1033},
        {"kpm":1.26,"apm":0.52,"deathpm":1.15,"dpm":434,"dtm":338,"healsRecieved":176.994},
        {"kpm":1.27,"apm":0.53,"deathpm":1.16,"dpm":439.03,"dtm":340,"healsRecieved":179.9418},
        {"kpm":1.29,"apm":0.55,"deathpm":1.17,"dpm":445,"dtm":343,"healsRecieved":184.4124},
        {"kpm":1.32,"apm":0.56,"deathpm":1.19,"dpm":452,"dtm":347.69,"healsRecieved":188.5469},
        {"kpm":1.3502,"apm":0.5702,"deathpm":1.21,"dpm":457.02,"dtm":350.02,"healsRecieved":192.5524},
        {"kpm":1.39,"apm":0.61,"deathpm":1.22,"dpm":465.35,"dtm":356,"healsRecieved":198.6765},
        {"kpm":1.4368,"apm":0.63,"deathpm":1.2468,"dpm":475.68,"dtm":359.68,"healsRecieved":203.8152},
        {"kpm":1.47,"apm":0.67,"deathpm":1.2701,"dpm":488.01,"dtm":367.01,"healsRecieved":213.3805},
        {"kpm":1.53,"apm":0.72,"deathpm":1.3134,"dpm":507.34,"dtm":377.34,"healsRecieved":223.3156},
        {"kpm":1.64,"apm":0.7867,"deathpm":1.3934,"dpm":535,"dtm":394.34,"healsRecieved":237.424},
        {"kpm":2.13,"apm":1.61,"deathpm":1.83,"dpm":618,"dtm":569,"healsRecieved":299.03}];
    
    let weights = {
        kpm: 0.35,
        apm: 0.24,
        deathpm: -0.35,
        dpm: 0.29,
        dtm: -0.25
    }

    let sumChart = {
        // scout:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     caps:[],
        //     didWin:[],
        //     healsRecieved:[]
        // },

        soldier:{
            combatScore:[]
        },

        // pyro:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     didWin:[],
        //     healsRecieved:[]
        // },
        // demoman:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     didWin:[],
        //     healsRecieved:[]
        // },
        // heavy:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     didWin:[],
        //     healsRecieved:[]
        // },
        // engineer:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     didWin:[],
        //     healsRecieved:[]
        // },
        // medic:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     didWin:[],
        //     healsRecieved:[],
        //     heals:[],
        // },
        // sniper:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     hs:[],
        //     didWin:[],
        //     healsRecieved:[]
        // },
        // spy:{
        //     kpm : [],
        //     apm : [],
        //     deathpm: [],
        //     dpm : [],
        //     dtm : [],
        //     bs:[],
        //     didWin:[],
        //     healsRecieved:[]
        // },
    };

    let apiCall = await fetch("http://logs.tf/api/v1/log?map=koth_product_final&limit=1000", FetchResultTypes.JSON);

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
    searchAmount = 10;
    for (let index = 0; index < searchAmount; index++) {
        if(logsArray[index] !== undefined && logsArray[index][1].players === 18){
            console.log("#"+ count++ + " | " + Math.ceil((index / searchAmount)*100) + "%");
            let logData = await fetch(`http://logs.tf/api/v1/log/3354778`, FetchResultTypes.JSON);
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
                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "scout" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.scout.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.scout.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.scout.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.scout.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.scout.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.scout.caps.push(parseFloat((Object.entries(logData.players)[y][1].cpc / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.scout.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.scout.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    // }
                    if(Object.entries(logData.players)[y][1].class_stats[0].type === "soldier"  && Object.entries(logData.players)[y][1].class_stats[0].total_time === logData.length ){
                        playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                        let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
                        let currentDpm = Math.round(playerObject.dmg / (playerObject.total_time/60));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentDpm > percentiles[dpmIndex].dpm){
                                dpmPerc = dpmIndex*weights.dpm;
                            }
                        }
                        let currentDtm = Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentDtm > percentiles[dpmIndex].dtm){
                                dtmPerc = dpmIndex*weights.dtm;
                            }
                        }
                        let currentKpm = parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentKpm > percentiles[dpmIndex].kpm){
                                kpmPerc = dpmIndex*weights.kpm;
                            }
                        }
                        let currentApm = parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentApm > percentiles[dpmIndex].apm){
                                apmPerc = dpmIndex*weights.apm/2;
                            }
                        }
                        let currentDeaths = parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2));
                        for (let dpmIndex = 0; dpmIndex < percentiles.length; dpmIndex++) {
                            if(currentDeaths > percentiles[dpmIndex].deathpm){
                                deathpmPerc = dpmIndex*weights.deathpm;
                            }
                        }
                        // let constat = ((Math.round(dpmPerc*10))/10)+((Math.round(dtmPerc*10))/10)+((Math.round(kpmPerc*10))/10)+((Math.round(apmPerc*10))/10)+((Math.round(deathpmPerc*10))/10);
                        Math.round((dpmPerc+dtmPerc+kpmPerc+apmPerc+deathpmPerc+43)/0.107) !== null && sumChart.soldier.combatScore.push(Math.round((dpmPerc+dtmPerc+kpmPerc+apmPerc+deathpmPerc+43)/0.107))
                        console.log(Math.round((dpmPerc+dtmPerc+kpmPerc+apmPerc+deathpmPerc+43)/0.107))
                        // sumChart.soldier.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                        // sumChart.soldier.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                        // sumChart.soldier.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                        // sumChart.soldier.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                        // sumChart.soldier.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    }

                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "pyro"  && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.pyro.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.pyro.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.pyro.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.pyro.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.pyro.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.pyro.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.pyro.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    // }

                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "demoman" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.demoman.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.demoman.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.demoman.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.demoman.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.demoman.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.demoman.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.demoman.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    // }

                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "heavyweapons" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.heavy.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.heavy.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.heavy.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.heavy.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.heavy.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.heavy.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.heavy.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    // }

                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "engineer" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.engineer.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.engineer.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.engineer.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.engineer.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.engineer.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.engineer.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.engineer.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    // }

                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "medic" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.medic.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.medic.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.medic.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.medic.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.medic.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.medic.heals.push(parseFloat((Object.entries(logData.players)[y][1].heal / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.medic.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.medic.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    // }

                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "sniper" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.sniper.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.sniper.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.sniper.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.sniper.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.sniper.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.sniper.hs.push(parseFloat((Object.entries(logData.players)[y][1].headshots_hit / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.sniper.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.sniper.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(playerObject.total_time/60)).toFixed(2)));
                    // }

                    // if(Object.entries(logData.players)[y][1].class_stats[0].type === "spy" && Object.entries(logData.players)[y][1].class_stats[0].total_time > 300){
                    //     playerObject = Object.entries(logData.players)[y][1].class_stats[0];
                    //     sumChart.spy.dpm.push(Math.round(playerObject.dmg / (playerObject.total_time/60)));
                    //     sumChart.spy.dtm.push(Math.round(Object.entries(logData.players)[y][1].dt / (playerObject.total_time/60)));
                    //     sumChart.spy.kpm.push(parseFloat((Object.entries(logData.players)[y][1].kills / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.spy.apm.push(parseFloat((Object.entries(logData.players)[y][1].assists / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.spy.deathpm.push(parseFloat((Object.entries(logData.players)[y][1].deaths / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.spy.bs.push(parseFloat((Object.entries(logData.players)[y][1].backstabs / (playerObject.total_time/60)).toFixed(2)));
                    //     sumChart.spy.didWin.push( logData.teams.Red.score > logData.teams.Blue.score ? (Object.entries(logData.players)[y][1].team === "Red" ? true : false) : (Object.entries(logData.players)[y][1].team === "Red" ? false : true));
                    //     sumChart.spy.healsRecieved.push(parseFloat((((Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[1][1][Object.entries(logData.players)[y][0]]) + (Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]] === undefined ? 0 : Object.entries(logData.healspread)[0][1][Object.entries(logData.players)[y][0]]))/(logData.length/60)).toFixed(2)));
                    // }
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

    fs.writeFile('cs.txt', JSON.stringify(sumChart,null,2), err => {
        if (err) {
          console.error(err);
        }
        console.log("wrote new file")
    });
}

module.exports = { getData };