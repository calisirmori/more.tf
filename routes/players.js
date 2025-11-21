const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const seasonCache = require('../utils/seasonCache');

// Database query routes for player stats
router.get('/activity/:id', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(
      `select date from logs
  left join players on players.logid=logs.logid where id64=${playerId}
  order by logs.date desc`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Activity query error', { error: err.message, playerId });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/calendar/:id', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(
      `
  WITH DateSeries AS (
    SELECT generate_series(
      DATE '2018-01-01',
      CURRENT_DATE,
      '1 day'
    ) AS match_date
  ),
  MatchStats AS (
    SELECT
      DATE(to_timestamp(logs.date)) AS match_date,
      COUNT(*) AS matches_per_day,
      SUM(CASE WHEN players >= 11 AND players <= 15 THEN 1 ELSE 0 END) AS sixes_matches,
      SUM(CASE WHEN players >= 16 AND players <= 21 THEN 1 ELSE 0 END) AS highlander_matches,
      SUM(CASE WHEN players < 11 OR players > 21 THEN 1 ELSE 0 END) AS other_matches,
      COUNT(CASE WHEN match_result = 'W' THEN 1 ELSE 0 END) AS wins,
      COUNT(CASE WHEN match_result = 'L' THEN 1 ELSE 0 END) AS losses
    FROM
      logs
    JOIN players ON logs.logid = players.logid
    WHERE
      players.id64 = ${playerId} AND
      logs.date >= EXTRACT(EPOCH FROM DATE '2018-01-01')::INT
    GROUP BY
      match_date
  ),
  MaxMatchCount AS (
    SELECT
      MAX(matches_per_day) AS max_matches
    FROM
      MatchStats
  )
  SELECT
    ds.match_date,
    CASE
      WHEN EXTRACT(DOW FROM ds.match_date) = 0 THEN 7
      ELSE EXTRACT(DOW FROM ds.match_date)
    END AS day_of_week_numeric,
    COALESCE(ms.matches_per_day, 0) AS matches_per_day,
    COALESCE(ms.sixes_matches, 0) AS sixes_matches,
    COALESCE(ms.highlander_matches, 0) AS highlander_matches,
    COALESCE(ms.other_matches, 0) AS other_matches,
    COALESCE(ms.wins, 0) AS wins,
    COALESCE(ms.losses, 0) AS losses,
    mmc.max_matches,
    COALESCE(((ms.matches_per_day::FLOAT / GREATEST(mmc.max_matches, 1)) * 100)::NUMERIC(5, 2), 0) AS percentage_of_max
  FROM
    DateSeries ds
  LEFT JOIN MatchStats ms ON ds.match_date = ms.match_date
  CROSS JOIN MaxMatchCount mmc
  ORDER BY
    ds.match_date;

  `
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Calendar query error', { error: err.message, playerId });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/per-class-stats/:id', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(
      `SELECT class,
  Avg(dpm) as dpm,
  COALESCE(sum(match_length), 0) as time,
  COUNT(match_result) filter (WHERE match_result = 'W') as W,
  COUNT(match_result) filter (WHERE match_result = 'L') as L,
  COUNT(match_result) filter (WHERE match_result = 'T') as T
  FROM (
    (SELECT dpm, logid, match_result, class FROM players WHERE id64 = ${playerId}) AS T1
    LEFT JOIN (
      SELECT match_length, logid, date FROM logs WHERE date > 0 AND match_length IS NOT NULL
    ) AS T2
    ON T1.logid = T2.logid
  )
  GROUP BY class
  ORDER BY COUNT(match_result) DESC`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Per-class stats query error', {
        error: err.message,
        playerId,
      });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/per-class-stats-new/:id', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(`select * from class_stats where id64=${playerId}`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Per-class stats new query error', {
        error: err.message,
        playerId,
      });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/per-format-stats/:id', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(
      `select * from format_stats where id64=${playerId} ORDER BY format_played DESC`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Per-format stats query error', {
        error: err.message,
        playerId,
      });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/leaderboard-stats/:format', async (req, response) => {
  const format = req.params.format;

  try {
    // Get display card seasons from cache
    const displayCardSeasons = await seasonCache.getDisplayCardSeasons();

    // Determine which season to use based on format
    let seasonid;
    if (format === 'HL' || format === 'Highlander') {
      seasonid = displayCardSeasons.RGL?.HL?.seasonid ||
                 displayCardSeasons.RGL?.Highlander?.seasonid ||
                 163; // Fallback
    } else {
      seasonid = displayCardSeasons.RGL?.['6s']?.seasonid ||
                 displayCardSeasons.RGL?.['6S']?.seasonid ||
                 displayCardSeasons.RGL?.Sixes?.seasonid ||
                 164; // Fallback
    }

    const queryText = `
    select *
    FROM
    (SELECT *,
            ((cbt*2) + (eff*0.5) + (eva*0.5) + (imp*2) + spt + srv) / 7.0 AS avg_score
        FROM player_card_info
        WHERE (seasonid = ${seasonid} AND format = '${format}')
        ORDER BY avg_score DESC) as T1
  inner JOIN
    tf2gamers on tf2gamers.steamid=T1.id64 `;

    const result = await pool.query(queryText);

    if (result.rows.length === 0) {
      response.status(404).json({ error: 'Player not found' });
    } else {
      // Include season info in response
      response.json({
        players: result.rows,
        seasonid: seasonid,
        format: format
      });
    }
  } catch (err) {
    logger.error('Leaderboard stats query error', {
      error: err.message,
      format,
    });
    response.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.get('/playercard-stats/:id', async (req, response) => {
  try {
    const playerId = req.params.id;

    // Get display card seasons from cache
    const displayCardSeasons = await seasonCache.getDisplayCardSeasons();

    // Extract season IDs for RGL (primary league)
    const hlSeasonId =
      displayCardSeasons.RGL?.HL?.seasonid ||
      displayCardSeasons.RGL?.Highlander?.seasonid;
    const sixesSeasonId =
      displayCardSeasons.RGL?.['6s']?.seasonid ||
      displayCardSeasons.RGL?.['6S']?.seasonid ||
      displayCardSeasons.RGL?.Sixes?.seasonid;

    // Build season filter - use display card seasons if available, otherwise fall back to hardcoded
    let seasonFilter = '';
    const seasonIds = [];

    if (hlSeasonId) seasonIds.push(hlSeasonId);
    if (sixesSeasonId) seasonIds.push(sixesSeasonId);

    // Fallback to hardcoded seasons if no display card seasons are set
    if (seasonIds.length === 0) {
      seasonFilter =
        '(seasonid = 163 OR seasonid = 164 OR seasonid = 165 OR seasonid = 166)';
    } else if (seasonIds.length === 1) {
      seasonFilter = `seasonid = ${seasonIds[0]}`;
    } else {
      seasonFilter = `seasonid IN (${seasonIds.join(', ')})`;
    }

    const queryText = `SELECT * FROM player_card_info WHERE id64 = $1 AND ${seasonFilter}`;

    // Use a parameterized query to prevent SQL injection
    const result = await pool.query(queryText, [playerId]);

    // Check if any rows were returned
    if (result.rows.length === 0) {
      response.status(404).json({ error: 'Player not found' });
    } else {
      response.json(result.rows);
    }
  } catch (err) {
    logger.error('Playercard stats query error', {
      error: err.message,
      playerId: req.params.id,
    });
    response.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.get('/per-map-stats/:id', (req, response) => {
  let playerId = req.params.id;
  pool
    .query(
      `select * from map_stats where id64=${playerId} order by map_count desc`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Per-map stats query error', {
        error: err.message,
        playerId,
      });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/peers-page/:id', (req, response) => {
  // Temporarily disabled due to performance issues - under rework
  logger.info('Peers page temporarily disabled', { playerId: req.params.id });
  response.status(503).json({
    error: 'This feature is temporarily unavailable while we optimize performance.',
    message: 'The peers page is currently under rework. Please check back soon!',
    underRework: true
  });
});

module.exports = router;
