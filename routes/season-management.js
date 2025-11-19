const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const seasonCache = require('../utils/seasonCache');

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  if (req.cookies && req.cookies.isAdmin === 'true') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

// Apply admin verification to all routes
router.use(verifyAdmin);

// Get all seasons
router.get('/seasons', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT seasonid, seasonname, league, format, active, displayCard
      FROM season_metadata
      ORDER BY league, format, seasonid DESC
    `);
    res.json(result.rows);
  } catch (err) {
    logger.error('Get all seasons error', { error: err.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get seasons by league
router.get('/seasons/league/:league', async (req, res) => {
  try {
    const { league } = req.params;
    const result = await pool.query(`
      SELECT seasonid, seasonname, league, format, active, displayCard
      FROM season_metadata
      WHERE league = $1
      ORDER BY format, seasonid DESC
    `, [league]);
    res.json(result.rows);
  } catch (err) {
    logger.error('Get seasons by league error', { error: err.message, league: req.params.league });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get seasons by league and format
router.get('/seasons/league/:league/format/:format', async (req, res) => {
  try {
    const { league, format } = req.params;
    const result = await pool.query(`
      SELECT seasonid, seasonname, league, format, active, displayCard
      FROM season_metadata
      WHERE league = $1 AND format = $2
      ORDER BY seasonid DESC
    `, [league, format]);
    res.json(result.rows);
  } catch (err) {
    logger.error('Get seasons by league and format error', {
      error: err.message,
      league: req.params.league,
      format: req.params.format
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get active seasons
router.get('/seasons/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT seasonid, seasonname, league, format, active, displayCard
      FROM season_metadata
      WHERE active = true
      ORDER BY league, format
    `);
    res.json(result.rows);
  } catch (err) {
    logger.error('Get active seasons error', { error: err.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get single season by ID
router.get('/seasons/:seasonid', async (req, res) => {
  try {
    const { seasonid } = req.params;
    const result = await pool.query(`
      SELECT seasonid, seasonname, league, format, active, displayCard
      FROM season_metadata
      WHERE seasonid = $1
    `, [seasonid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Get season by ID error', { error: err.message, seasonid: req.params.seasonid });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Create new season
router.post('/seasons', async (req, res) => {
  try {
    const { seasonid, seasonname, league, format, active } = req.body;

    // Validate required fields
    if (!seasonid || !seasonname || !league || !format) {
      return res.status(400).json({
        error: 'Missing required fields: seasonid, seasonname, league, format'
      });
    }

    // Check if season ID already exists
    const existingCheck = await pool.query(
      'SELECT seasonid FROM season_metadata WHERE seasonid = $1',
      [seasonid]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Season ID already exists' });
    }

    // If setting as active, deactivate other seasons for the same league/format
    if (active) {
      await pool.query(`
        UPDATE season_metadata
        SET active = false
        WHERE league = $1 AND format = $2 AND active = true
      `, [league, format]);
    }

    // Insert new season
    const result = await pool.query(`
      INSERT INTO season_metadata (seasonid, seasonname, league, format, active, displayCard)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING seasonid, seasonname, league, format, active, displayCard
    `, [seasonid, seasonname, league, format, active || false]);

    logger.info('Season created', {
      seasonid,
      seasonname,
      league,
      format,
      admin: req.cookies.adminUser || 'unknown'
    });

    // Invalidate cache
    await seasonCache.invalidate();

    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Create season error', { error: err.message, body: req.body });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Update season
router.put('/seasons/:seasonid', async (req, res) => {
  try {
    const { seasonid } = req.params;
    const { seasonname, league, format, active } = req.body;

    // Check if season exists
    const existingCheck = await pool.query(
      'SELECT seasonid, league, format FROM season_metadata WHERE seasonid = $1',
      [seasonid]
    );

    if (existingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    const existingSeason = existingCheck.rows[0];
    const targetLeague = league || existingSeason.league;
    const targetFormat = format || existingSeason.format;

    // If setting as active, deactivate other seasons for the same league/format
    if (active === true) {
      await pool.query(`
        UPDATE season_metadata
        SET active = false
        WHERE league = $1 AND format = $2 AND seasonid != $3 AND active = true
      `, [targetLeague, targetFormat, seasonid]);
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (seasonname !== undefined) {
      updates.push(`seasonname = $${paramCount++}`);
      values.push(seasonname);
    }
    if (league !== undefined) {
      updates.push(`league = $${paramCount++}`);
      values.push(league);
    }
    if (format !== undefined) {
      updates.push(`format = $${paramCount++}`);
      values.push(format);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      values.push(active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(seasonid);

    const query = `
      UPDATE season_metadata
      SET ${updates.join(', ')}
      WHERE seasonid = $${paramCount}
      RETURNING seasonid, seasonname, league, format, active, displayCard
    `;

    const result = await pool.query(query, values);

    logger.info('Season updated', {
      seasonid,
      updates: Object.keys(req.body),
      admin: req.cookies.adminUser || 'unknown'
    });

    // Invalidate cache
    await seasonCache.invalidate();

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Update season error', { error: err.message, seasonid: req.params.seasonid, body: req.body });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Toggle season active status
router.patch('/seasons/:seasonid/toggle-active', async (req, res) => {
  try {
    const { seasonid } = req.params;

    // Get current season info
    const seasonCheck = await pool.query(
      'SELECT seasonid, league, format, active FROM season_metadata WHERE seasonid = $1',
      [seasonid]
    );

    if (seasonCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    const season = seasonCheck.rows[0];
    const newActiveState = !season.active;

    // If activating, deactivate others for same league/format
    if (newActiveState) {
      await pool.query(`
        UPDATE season_metadata
        SET active = false
        WHERE league = $1 AND format = $2 AND seasonid != $3 AND active = true
      `, [season.league, season.format, seasonid]);
    }

    // Toggle the season
    const result = await pool.query(`
      UPDATE season_metadata
      SET active = $1
      WHERE seasonid = $2
      RETURNING seasonid, seasonname, league, format, active, displayCard
    `, [newActiveState, seasonid]);

    logger.info('Season active status toggled', {
      seasonid,
      newActiveState,
      admin: req.cookies.adminUser || 'unknown'
    });

    // Invalidate cache
    await seasonCache.invalidate();

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Toggle season active error', { error: err.message, seasonid: req.params.seasonid });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Toggle season displayCard status
router.patch('/seasons/:seasonid/toggle-displaycard', async (req, res) => {
  try {
    const { seasonid } = req.params;

    // Get current season info
    const seasonCheck = await pool.query(
      'SELECT seasonid, league, format, displayCard FROM season_metadata WHERE seasonid = $1',
      [seasonid]
    );

    if (seasonCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    const season = seasonCheck.rows[0];
    const newDisplayCardState = !season.displaycard;

    // If setting as displayCard, deactivate others for same league/format
    if (newDisplayCardState) {
      await pool.query(`
        UPDATE season_metadata
        SET displayCard = false
        WHERE league = $1 AND format = $2 AND seasonid != $3 AND displayCard = true
      `, [season.league, season.format, seasonid]);
    }

    // Toggle the season displayCard
    const result = await pool.query(`
      UPDATE season_metadata
      SET displayCard = $1
      WHERE seasonid = $2
      RETURNING seasonid, seasonname, league, format, active, displayCard
    `, [newDisplayCardState, seasonid]);

    logger.info('Season displayCard status toggled', {
      seasonid,
      newDisplayCardState,
      admin: req.cookies.adminUser || 'unknown'
    });

    // Invalidate cache
    await seasonCache.invalidate();

    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Toggle season displayCard error', { error: err.message, seasonid: req.params.seasonid });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Delete season
router.delete('/seasons/:seasonid', async (req, res) => {
  try {
    const { seasonid } = req.params;

    // Check if season exists
    const existingCheck = await pool.query(
      'SELECT seasonid, seasonname FROM season_metadata WHERE seasonid = $1',
      [seasonid]
    );

    if (existingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Delete the season
    await pool.query('DELETE FROM season_metadata WHERE seasonid = $1', [seasonid]);

    logger.info('Season deleted', {
      seasonid,
      seasonname: existingCheck.rows[0].seasonname,
      admin: req.cookies.adminUser || 'unknown'
    });

    // Invalidate cache
    await seasonCache.invalidate();

    res.json({ message: 'Season deleted successfully', seasonid });
  } catch (err) {
    logger.error('Delete season error', { error: err.message, seasonid: req.params.seasonid });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get distinct leagues
router.get('/leagues', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT league
      FROM season_metadata
      WHERE league IS NOT NULL
      ORDER BY league
    `);
    res.json(result.rows.map(row => row.league));
  } catch (err) {
    logger.error('Get leagues error', { error: err.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get distinct formats
router.get('/formats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT format
      FROM season_metadata
      WHERE format IS NOT NULL
      ORDER BY format
    `);
    res.json(result.rows.map(row => row.format));
  } catch (err) {
    logger.error('Get formats error', { error: err.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;
