const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');

// Badge routes
router.post('/badges', (req, res) => {
  const { id64, badge_id } = req.body;
  // Ensure id64 and badge_id are not undefined or null
  if (!id64 || !badge_id) {
    return res.status(400).send("Steam ID and Badge ID are required");
  }

  const query = 'INSERT INTO Badges (id64, badge_id) VALUES ($1, $2)';
  const values = [id64, badge_id];

  pool.query(query, values, (err, result) => {
    if (err) {
      logger.error('Badge insert error', { error: err.message, id64, badge_id });
      return res.status(500).send('Error adding badge');
    }
    res.status(201).send('Badge added successfully');
  });
});

router.put('/badges', (req, res) => {
  const { id64, badge_id, new_badge_id } = req.body;
  // Correct the placeholder syntax for PostgreSQL
  const query = 'UPDATE Badges SET badge_id = $1 WHERE id64 = $2 AND badge_id = $3';
  const values = [new_badge_id, id64, badge_id];

  pool.query(query, values, (err, result) => {
    if (err) {
      logger.error('Badge update error', { error: err.message, id64, badge_id, new_badge_id });
      return res.status(500).send('Error updating badge');
    }
    res.send('Badge updated successfully');
  });
});

router.delete('/badges', (req, res) => {
  const { id64, badge_id } = req.body;
  // Correct the placeholder syntax for PostgreSQL
  const query = 'DELETE FROM Badges WHERE id64 = $1 AND badge_id = $2';
  const values = [id64, badge_id];

  pool.query(query, values, (err, result) => {
    if (err) {
      logger.error('Badge delete error', { error: err.message, id64, badge_id });
      return res.status(500).send('Error removing badge');
    }
    res.send('Badge removed successfully');
  });
});

router.get('/badges/user', (req, res) => {
  const { id64 } = req.query;  // Retrieve the Steam ID from the query parameters
  const query = 'SELECT * FROM Badges WHERE id64 = $1';
  const values = [id64];

  pool.query(query, values, (err, result) => {
    if (err) {
      logger.error('Badge retrieval error', { error: err.message, id64 });
      return res.status(500).send('Error retrieving badges');
    }
    res.send(result.rows);
  });
});

module.exports = router;
