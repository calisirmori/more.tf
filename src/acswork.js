const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const fs = require('fs');
const { rglSeasonsData } = require('../rgldata/seasons.js');
const {
  statPercentiles,
  statWeights,
} = require('./CombatScoreInitialPercentiles');

async function getData() {
  let combatScores = {
    scout: [],
    soldier: [],
    pyro: [],
    demoman: [],
    heavy: [],
    engineer: [],
    medic: [],
    sniper: [],
    spy: [],
  };

  let apiCall = await fetch(
    'http://logs.tf/api/v1/log?limit=10000',
    FetchResultTypes.JSON
  );
  let logsArray = Object.entries(apiCall.logs);
  searchAmount = 10000;
  let count = 1;
  let format = 'cp';
  for (let index = 0; index < searchAmount; index++) {
    if (logsArray[index] !== undefined && logsArray[index][1].players === 18) {
      if (logsArray[index][1].map === 'cp_steel_f12') {
        console.log(
          '#' +
            count++ +
            ' | ' +
            Math.ceil((index / searchAmount) * 100) +
            '% | ' +
            logsArray[index][1].id
        );
        let logData = await fetch(
          `http://logs.tf/api/v1/log/${logsArray[index][1].id}`,
          FetchResultTypes.JSON
        );

        for (let y = 0; y < 18; y++) {
          if (
            Object.entries(logData.players)[y] !== undefined &&
            Object.entries(logData.healspread).length === 2
          ) {
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'scout' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.scout[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.scout[format].dpm[dpmIndex]
                ) {
                  dpmPerc = dpmIndex * statWeights.highlander.scout[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.scout[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.scout[format].dtm[dpmIndex]
                ) {
                  dtmPerc = dpmIndex * statWeights.highlander.scout[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.scout[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.scout[format].kpm[dpmIndex]
                ) {
                  kpmPerc = dpmIndex * statWeights.highlander.scout[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.scout[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.scout[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.scout[format].apm) / 2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.scout[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.scout[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.scout[format].deathpm;
                }
              }
              combatScores.scout.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.scout[format].dtm * -100 +
                      statWeights.highlander.scout[format].deathpm * -100)) /
                    (statWeights.highlander.scout[format].kpm * 0.1 +
                      statWeights.highlander.scout[format].dpm * 0.1 +
                      statWeights.highlander.scout[format].apm * 0.1 +
                      statWeights.highlander.scout[format].dtm * -0.1 +
                      statWeights.highlander.scout[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'soldier' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.soldier[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.soldier[format].dpm[dpmIndex]
                ) {
                  dpmPerc =
                    dpmIndex * statWeights.highlander.soldier[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.soldier[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.soldier[format].dtm[dpmIndex]
                ) {
                  dtmPerc =
                    dpmIndex * statWeights.highlander.soldier[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.soldier[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.soldier[format].kpm[dpmIndex]
                ) {
                  kpmPerc =
                    dpmIndex * statWeights.highlander.soldier[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.soldier[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.soldier[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.soldier[format].apm) / 2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.soldier[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.soldier[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.soldier[format].deathpm;
                }
              }
              combatScores.soldier.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.soldier[format].dtm * -100 +
                      statWeights.highlander.soldier[format].deathpm * -100)) /
                    (statWeights.highlander.soldier[format].kpm * 0.1 +
                      statWeights.highlander.soldier[format].dpm * 0.1 +
                      statWeights.highlander.soldier[format].apm * 0.1 +
                      statWeights.highlander.soldier[format].dtm * -0.1 +
                      statWeights.highlander.soldier[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'pyro' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.pyro[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.pyro[format].dpm[dpmIndex]
                ) {
                  dpmPerc = dpmIndex * statWeights.highlander.pyro[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.pyro[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.pyro[format].dtm[dpmIndex]
                ) {
                  dtmPerc = dpmIndex * statWeights.highlander.pyro[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.pyro[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.pyro[format].kpm[dpmIndex]
                ) {
                  kpmPerc = dpmIndex * statWeights.highlander.pyro[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.pyro[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.pyro[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.pyro[format].apm) / 2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.pyro[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.pyro[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.pyro[format].deathpm;
                }
              }
              combatScores.pyro.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.pyro[format].dtm * -100 +
                      statWeights.highlander.pyro[format].deathpm * -100)) /
                    (statWeights.highlander.pyro[format].kpm * 0.1 +
                      statWeights.highlander.pyro[format].dpm * 0.1 +
                      statWeights.highlander.pyro[format].apm * 0.1 +
                      statWeights.highlander.pyro[format].dtm * -0.1 +
                      statWeights.highlander.pyro[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'demoman' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.demoman[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.demoman[format].dpm[dpmIndex]
                ) {
                  dpmPerc =
                    dpmIndex * statWeights.highlander.demoman[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.demoman[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.demoman[format].dtm[dpmIndex]
                ) {
                  dtmPerc =
                    dpmIndex * statWeights.highlander.demoman[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.demoman[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.demoman[format].kpm[dpmIndex]
                ) {
                  kpmPerc =
                    dpmIndex * statWeights.highlander.demoman[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.demoman[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.demoman[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.demoman[format].apm) / 2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.demoman[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.demoman[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.demoman[format].deathpm;
                }
              }
              combatScores.demoman.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.demoman[format].dtm * -100 +
                      statWeights.highlander.demoman[format].deathpm * -100)) /
                    (statWeights.highlander.demoman[format].kpm * 0.1 +
                      statWeights.highlander.demoman[format].dpm * 0.1 +
                      statWeights.highlander.demoman[format].apm * 0.1 +
                      statWeights.highlander.demoman[format].dtm * -0.1 +
                      statWeights.highlander.demoman[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'heavyweapons' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.heavy[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.heavy[format].dpm[dpmIndex]
                ) {
                  dpmPerc = dpmIndex * statWeights.highlander.heavy[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.heavy[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.heavy[format].dtm[dpmIndex]
                ) {
                  dtmPerc = dpmIndex * statWeights.highlander.heavy[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.heavy[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.heavy[format].kpm[dpmIndex]
                ) {
                  kpmPerc = dpmIndex * statWeights.highlander.heavy[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.heavy[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.heavy[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.heavy[format].apm) / 2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.heavy[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.heavy[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.heavy[format].deathpm;
                }
              }
              combatScores.heavy.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.heavy[format].dtm * -100 +
                      statWeights.highlander.heavy[format].deathpm * -100)) /
                    (statWeights.highlander.heavy[format].kpm * 0.1 +
                      statWeights.highlander.heavy[format].dpm * 0.1 +
                      statWeights.highlander.heavy[format].apm * 0.1 +
                      statWeights.highlander.heavy[format].dtm * -0.1 +
                      statWeights.highlander.heavy[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'engineer' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.engineer[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.engineer[format].dpm[dpmIndex]
                ) {
                  dpmPerc =
                    dpmIndex * statWeights.highlander.engineer[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.engineer[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.engineer[format].dtm[dpmIndex]
                ) {
                  dtmPerc =
                    dpmIndex * statWeights.highlander.engineer[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.engineer[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.engineer[format].kpm[dpmIndex]
                ) {
                  kpmPerc =
                    dpmIndex * statWeights.highlander.engineer[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.engineer[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.engineer[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.engineer[format].apm) /
                    2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.engineer[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.engineer[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.engineer[format].deathpm;
                }
              }
              combatScores.engineer.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.engineer[format].dtm * -100 +
                      statWeights.highlander.engineer[format].deathpm * -100)) /
                    (statWeights.highlander.engineer[format].kpm * 0.1 +
                      statWeights.highlander.engineer[format].dpm * 0.1 +
                      statWeights.highlander.engineer[format].apm * 0.1 +
                      statWeights.highlander.engineer[format].dtm * -0.1 +
                      statWeights.highlander.engineer[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'sniper' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.sniper[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.sniper[format].dpm[dpmIndex]
                ) {
                  dpmPerc =
                    dpmIndex * statWeights.highlander.sniper[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.sniper[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.sniper[format].dtm[dpmIndex]
                ) {
                  dtmPerc =
                    dpmIndex * statWeights.highlander.sniper[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.sniper[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.sniper[format].kpm[dpmIndex]
                ) {
                  kpmPerc =
                    dpmIndex * statWeights.highlander.sniper[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.sniper[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.sniper[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.sniper[format].apm) / 2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.sniper[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.sniper[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.sniper[format].deathpm;
                }
              }
              combatScores.sniper.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.sniper[format].dtm * -100 +
                      statWeights.highlander.sniper[format].deathpm * -100)) /
                    (statWeights.highlander.sniper[format].kpm * 0.1 +
                      statWeights.highlander.sniper[format].dpm * 0.1 +
                      statWeights.highlander.sniper[format].apm * 0.1 +
                      statWeights.highlander.sniper[format].dtm * -0.1 +
                      statWeights.highlander.sniper[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'spy' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dpmPerc, dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDpm = Math.round(
                playerObject.dmg / (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.spy[format].dpm.length;
                dpmIndex++
              ) {
                if (
                  currentDpm >
                  statPercentiles.highlander.spy[format].dpm[dpmIndex]
                ) {
                  dpmPerc = dpmIndex * statWeights.highlander.spy[format].dpm;
                }
              }
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.spy[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.spy[format].dtm[dpmIndex]
                ) {
                  dtmPerc = dpmIndex * statWeights.highlander.spy[format].dtm;
                }
              }
              let currentKpm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].kills /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.spy[format].kpm.length;
                dpmIndex++
              ) {
                if (
                  currentKpm >
                  statPercentiles.highlander.spy[format].kpm[dpmIndex]
                ) {
                  kpmPerc = dpmIndex * statWeights.highlander.spy[format].kpm;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.spy[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.spy[format].apm[dpmIndex]
                ) {
                  apmPerc =
                    (dpmIndex * statWeights.highlander.spy[format].apm) / 2;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.spy[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.spy[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.spy[format].deathpm;
                }
              }
              combatScores.spy.push(
                Math.round(
                  (dpmPerc +
                    dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.spy[format].dtm * -100 +
                      statWeights.highlander.spy[format].deathpm * -100)) /
                    (statWeights.highlander.spy[format].kpm * 0.1 +
                      statWeights.highlander.spy[format].dpm * 0.1 +
                      statWeights.highlander.spy[format].apm * 0.1 +
                      statWeights.highlander.spy[format].dtm * -0.1 +
                      statWeights.highlander.spy[format].deathpm * -0.1)
                ) / 10
              );
            }
            if (
              Object.entries(logData.players)[y][1].class_stats[0].type ===
                'medic' &&
              Object.entries(logData.players)[y][1].class_stats[0]
                .total_time === logData.length
            ) {
              playerObject = Object.entries(logData.players)[y][1]
                .class_stats[0];
              let dtmPerc, kpmPerc, apmPerc, deathpmPerc;
              let currentDtm = Math.round(
                Object.entries(logData.players)[y][1].dt /
                  (playerObject.total_time / 60)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.medic[format].dtm.length;
                dpmIndex++
              ) {
                if (
                  currentDtm >
                  statPercentiles.highlander.medic[format].dtm[dpmIndex]
                ) {
                  dtmPerc = dpmIndex * statWeights.highlander.medic[format].dtm;
                }
              }
              let currentHeals = parseFloat(
                (
                  Object.entries(logData.players)[y][1].heal /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.medic[format].heals.length;
                dpmIndex++
              ) {
                if (
                  currentHeals >
                  statPercentiles.highlander.medic[format].heals[dpmIndex]
                ) {
                  kpmPerc =
                    dpmIndex * statWeights.highlander.medic[format].heals;
                }
              }
              let currentApm = parseFloat(
                (
                  Object.entries(logData.players)[y][1].assists /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex < statPercentiles.highlander.medic[format].apm.length;
                dpmIndex++
              ) {
                if (
                  currentApm >
                  statPercentiles.highlander.medic[format].apm[dpmIndex]
                ) {
                  apmPerc = dpmIndex * statWeights.highlander.medic[format].apm;
                }
              }
              let currentDeaths = parseFloat(
                (
                  Object.entries(logData.players)[y][1].deaths /
                  (playerObject.total_time / 60)
                ).toFixed(2)
              );
              for (
                let dpmIndex = 0;
                dpmIndex <
                statPercentiles.highlander.medic[format].deathpm.length;
                dpmIndex++
              ) {
                if (
                  currentDeaths >
                  statPercentiles.highlander.medic[format].deathpm[dpmIndex]
                ) {
                  deathpmPerc =
                    dpmIndex * statWeights.highlander.medic[format].deathpm;
                }
              }
              combatScores.medic.push(
                Math.round(
                  (dtmPerc +
                    kpmPerc +
                    apmPerc +
                    deathpmPerc +
                    (statWeights.highlander.medic[format].dtm * -100 +
                      statWeights.highlander.medic[format].deathpm * -100)) /
                    (statWeights.highlander.medic[format].heals * 0.1 +
                      statWeights.highlander.medic[format].apm * 0.1 +
                      statWeights.highlander.medic[format].dtm * -0.1 +
                      statWeights.highlander.medic[format].deathpm * -0.1)
                ) / 10
              );
            }
          }
        }
      }
    }
  }

  fs.writeFile(
    'cp-hl-combatscores.txt',
    JSON.stringify(combatScores, null, 2),
    (err) => {
      if (err) {
        console.error(err);
      }
      console.log('wrote new file');
    }
  );
}

module.exports = { getData };
