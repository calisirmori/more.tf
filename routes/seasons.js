const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');

// Season summary routes
router.get('/season-summary/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`WITH rglinfo AS (
    SELECT tf2gamers.steamid, teams.teamname, teams.teamid, tf2gamers.rglname, playerteams.date_joined
    FROM playerteams
    INNER JOIN tf2gamers ON tf2gamers.steamid = playerteams.steamid
    INNER JOIN teams ON playerteams.teamid = teams.teamid
    WHERE teams.seasonid = ${seasonID}
),
week_info AS (
    SELECT id64, division, classid,
           SUM(kills) AS kills,
           SUM(assist) AS assist,
           SUM(deaths) AS deaths,
           SUM(damage) AS dmg,
           SUM(damage_taken) AS dt,
           SUM(headshots) AS hs,
           SUM(backstabs) AS bs,
           SUM(airshots) AS airshots,
           SUM(spy_kills) AS spykills,
           SUM(heals_received) AS hr,
           SUM(bleed_dmg) AS bleed,
           SUM(sentry_dmg) AS sentry_dmg,
           SUM(heals) AS heals,
           SUM(ubers) AS ubers,
           SUM(ubers_dropped) AS drops,
           SUM(crossbows_hit) AS crossbow,
           SUM(playtime) AS time,
           SUM(avg_uber_build) AS avg_uber_build,
           ROUND(AVG(acc), 1) AS acc
    FROM season_combined sc
    WHERE seasonid = ${seasonID}
    GROUP BY id64, classid, division
)
, playerinfo AS (
    SELECT t1.*
    FROM rglinfo AS t1
    INNER JOIN (
        SELECT steamid, MAX(date_joined) AS max_date_joined
        FROM rglinfo
        GROUP BY steamid
    ) AS t2
    ON t1.steamid = t2.steamid AND t1.date_joined = t2.max_date_joined
)
SELECT playerinfo.*, week_info.*
FROM playerinfo
INNER JOIN week_info
ON playerinfo.steamid::BIGINT = week_info.id64`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Season summary query error', { error: err.message, seasonID });
      response.status(500).json({ error: 'An internal server error occurred' });
    })
});

router.get('/season-summary-ozf/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`select id64,
        max(teamname) as teamname,
        max(teamid) as teamid,
        max(name) as ozfname,
        division,
        classid,
      sum(kills) as kills,
      sum(assist) as assist,
      sum(deaths) as deaths,
      sum(damage) as dmg,
      sum(damage_taken) as dt,
      sum(headshots) as hs,
      sum(backstabs) as bs,
      sum(airshots) as airshots,
      sum(spy_kills) as spykills,
      sum(heals_received) as hr,
      sum(bleed_dmg) as bleed,
      sum(sentry_dmg) as sentry_dmg,
      sum(heals) as heals,
      sum(ubers) as ubers,
      sum(ubers_dropped) as drops,
      sum(crossbows_hit) as crossbow,
      sum(playtime) as time,
      sum(avg_uber_build) as avg_uber_build,
      ROUND(avg(acc), 1) as acc
      from season_combined sc
      where seasonid=${seasonID}
      --and week_num!= (select max(week_num) from season_combined sc where seasonid=${seasonID})
      group by id64,classid,division
      order by classid,division`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Season summary OZF query error', { error: err.message, seasonID });
      response.status(500).json({ error: 'An internal server error occurred' });
    })
});

router.get('/lastweek-season-summary-ozf/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`select id64,
        max(teamname) as teamname,
        max(teamid) as teamid,
        max(name) as ozfname,
        division,
        classid,
      sum(kills) as kills,
      sum(assist) as assist,
      sum(deaths) as deaths,
      sum(damage) as dmg,
      sum(damage_taken) as dt,
      sum(headshots) as hs,
      sum(backstabs) as bs,
      sum(airshots) as airshots,
      sum(spy_kills) as spykills,
      sum(heals_received) as hr,
      sum(bleed_dmg) as bleed,
      sum(sentry_dmg) as sentry_dmg,
      sum(heals) as heals,
      sum(ubers) as ubers,
      sum(ubers_dropped) as drops,
      sum(crossbows_hit) as crossbow,
      sum(playtime) as time,
      sum(avg_uber_build) as avg_uber_build,
      ROUND(avg(acc), 1) as acc
      from season_combined sc
      where seasonid=${seasonID}
      and week_num!= (select max(week_num) from season_combined sc where seasonid=${seasonID})
      group by id64,classid,division
      order by classid,division`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Last week season summary OZF query error', { error: err.message, seasonID });
      response.status(500).json({ error: 'An internal server error occurred' });
    })
});

router.get('/lastweek-season-summary/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`
      select *
  from
      (SELECT tf2gamers.steamid, teams.teamname, teams.teamid, tf2gamers.rglname
FROM playerteams
INNER JOIN tf2gamers ON tf2gamers.steamid = playerteams.steamid
INNER JOIN teams ON playerteams.teamid = teams.teamid
 where date_left=-1
 and playerteams.seasonid=${seasonID}) as playerinfo
  inner join
      (select id64,division,classid,
      sum(kills) as kills,
      sum(assist) as assist,
      sum(deaths) as deaths,
      sum(damage) as dmg,
      sum(damage_taken) as dt,
      sum(headshots) as hs,
      sum(backstabs) as bs,
      sum(airshots) as airshots,
      sum(spy_kills) as spykills,
      sum(heals_received) as hr,
      sum(bleed_dmg) as bleed,
      sum(sentry_dmg) as sentry_dmg,
      sum(heals) as heals,
      sum(ubers) as ubers,
      sum(ubers_dropped) as drops,
      sum(crossbows_hit) as crossbow,
      sum(playtime) as time,
      sum(avg_uber_build) as avg_uber_build,
      ROUND(avg(acc), 1) as acc
      from season_combined sc
      where seasonid=${seasonID}
      and week_num!= (select max(week_num) from season_combined sc where seasonid=${seasonID})
      group by id64,classid,division
      order by classid,division) as weekinfo
  on
      playerinfo.steamid::BIGINT=weekinfo.id64`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Last week season summary query error', { error: err.message, seasonID });
      response.status(500).json({ error: 'An internal server error occurred' });
    })
});

router.get('/current-week/:id', (req, response) => {
  let seasonID = req.params.id;
  pool.query(`select max(week_num) from season_combined sc where seasonid=${seasonID}`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Current week query error', { error: err.message, seasonID });
      response.status(500).json({ error: 'An internal server error occurred' });
    })
});

module.exports = router;
