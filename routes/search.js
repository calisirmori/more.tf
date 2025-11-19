const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');

// Search routes
router.get('/username-search/:username', (req, response) => {
  let playerUserName = req.params.username;
  pool
    .query(
      `WITH ranked_names AS (
    SELECT
      id64,
      name,
      count,
      ROW_NUMBER() OVER (PARTITION BY id64 ORDER BY count DESC) AS rn
    FROM name_search
    WHERE name LIKE '%${playerUserName}%'
  )
  SELECT si.id64,si.avatar,ranked_names.name,si.name, count
  FROM ranked_names
  inner join steam_info si on si.id64=ranked_names.id64 WHERE rn = 1
  order by count desc
  LIMIT 5`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Username search query error', {
        error: err.message,
        playerUserName,
      });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/peers-search/:id', (req, response) => {
  let playerId = req.params.id;

  pool
    .query(
      ` select * from peer_table pt where main_id64=${playerId} order by count desc`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Peers search query error', {
        error: err.message,
        playerId,
      });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.get('/enemies-search/:id', (req, response) => {
  let playerId = req.params.id;

  pool
    .query(
      ` select * from enemy_table pt where main_id64=${playerId} order by count desc`
    )
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Enemies search query error', {
        error: err.message,
        playerId,
      });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

module.exports = router;
