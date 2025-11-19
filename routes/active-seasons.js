const express = require('express');
const router = express.Router();
const seasonCache = require('../utils/seasonCache');
const logger = require('../utils/logger');

// Get all active seasons (cached)
router.get('/active-seasons', async (req, res) => {
  try {
    const activeSeasons = await seasonCache.getActiveSeasons();
    res.json(activeSeasons);
  } catch (err) {
    logger.error('Get active seasons error', { error: err.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get specific active season ID by league and format
router.get('/active-seasons/:league/:format', async (req, res) => {
  try {
    const { league, format } = req.params;
    const activeSeasons = await seasonCache.getActiveSeasons();

    const season = activeSeasons[league]?.[format];

    if (!season) {
      return res.status(404).json({
        error: 'No active season found for this league/format',
        league,
        format
      });
    }

    res.json(season);
  } catch (err) {
    logger.error('Get active season error', {
      error: err.message,
      league: req.params.league,
      format: req.params.format
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get all display card seasons (cached)
router.get('/display-card-seasons', async (req, res) => {
  try {
    const displayCardSeasons = await seasonCache.getDisplayCardSeasons();
    res.json(displayCardSeasons);
  } catch (err) {
    logger.error('Get display card seasons error', { error: err.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get specific display card season ID by league and format
router.get('/display-card-seasons/:league/:format', async (req, res) => {
  try {
    const { league, format } = req.params;
    const displayCardSeasons = await seasonCache.getDisplayCardSeasons();

    const season = displayCardSeasons[league]?.[format];

    if (!season) {
      return res.status(404).json({
        error: 'No display card season found for this league/format',
        league,
        format
      });
    }

    res.json(season);
  } catch (err) {
    logger.error('Get display card season error', {
      error: err.message,
      league: req.params.league,
      format: req.params.format
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;
