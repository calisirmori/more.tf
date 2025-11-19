const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');

// Miscellaneous routes
router.get('/findcookie/:id', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(`select steamid from cookies where uuid="${playerId}"`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Find cookie query error', { error: err.message, playerId });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/officials', (req, response) => {
  pool
    .query(
      `select matchid,matches.seasonid,team1.region,team1.league,matches.division,team1,team1.teamname as team1_name,team1.teamtag as team1_tag ,team2,team2.teamname as team2_name,team2.teamtag as team2_tag,day_played,isforfeit,team1.format,match_name,map2,map3,map1
    from matches
    JOIN teams AS team1 ON matches.team1 = team1.teamid
    JOIN teams AS team2 ON matches.team2 = team2.teamid
    ORDER BY day_played`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Officials query error', { error: err.message });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/db-try', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(
      `select map,
  sum(match_length) as time,
  COUNT(match_result) filter (where match_result='W') as W,
  COUNT(match_result) filter (where match_result='L') as L,
  COUNT(match_result) filter (where match_result='T') as T
  From ((Select logid,match_result FROM players where id64=${playerId}) AS T1
  left JOIN (SELECT match_length,logid,date,map FROM logs where date >0) AS T2
  On t1.logid=t2.logid)
  group by map
  order by time desc`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('DB try query error', { error: err.message, playerId });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

module.exports = router;
