const express = require('express');
const router = express.Router();
const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const pool = require('../config/database');
const logger = require('../utils/logger');
const { getDivisionSortOrder } = require('../utils/rarityMapping');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
});

const BUCKET_NAME = 'moretf-season-cards';

// Get all available leagues
router.get('/leagues', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT league FROM seasons WHERE league IS NOT NULL ORDER BY league'
    );
    res.json(result.rows);
  } catch (err) {
    logger.error('Get leagues error', { error: err.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get formats for a specific league
router.get('/formats/:league', async (req, res) => {
  try {
    const { league } = req.params;
    const result = await pool.query(
      'SELECT DISTINCT format FROM seasons WHERE league = $1 AND format IS NOT NULL ORDER BY format',
      [league]
    );
    res.json(result.rows);
  } catch (err) {
    logger.error('Get formats error', {
      error: err.message,
      league: req.params.league,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get seasons for a specific league and format
router.get('/seasons/:league/:format', async (req, res) => {
  try {
    const { league, format } = req.params;
    const result = await pool.query(
      `SELECT DISTINCT seasonid, seasonname, active
       FROM seasons
       WHERE league = $1 AND format = $2
       ORDER BY seasonid DESC`,
      [league, format]
    );
    res.json(result.rows);
  } catch (err) {
    logger.error('Get seasons error', {
      error: err.message,
      league: req.params.league,
      format: req.params.format,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get card design for a specific season
router.get('/design/:league/:format/:seasonid', async (req, res) => {
  try {
    const { league, format, seasonid } = req.params;
    const result = await pool.query(
      `SELECT * FROM season_card_designs
       WHERE league = $1 AND format = $2 AND seasonid = $3`,
      [league, format, seasonid]
    );

    if (result.rows.length === 0) {
      // Return default design if none exists
      res.json({
        league,
        format,
        seasonid: parseInt(seasonid),
        primary_color: '#D4822A',
        dark_color: '#2C2418',
        light_color: '#E8DCC4',
        accent_color: '#D4822A',
        bg_position_x: 50,
        bg_position_y: 50,
      });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    logger.error('Get card design error', {
      error: err.message,
      params: req.params,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Save/update card design (admin only)
router.post('/design', async (req, res) => {
  try {
    const {
      league,
      format,
      seasonid,
      primary_color,
      dark_color,
      light_color,
      accent_color,
      bg_position_x,
      bg_position_y,
    } = req.body;

    // Validate required fields
    if (
      !league ||
      !format ||
      !seasonid ||
      !primary_color ||
      !dark_color ||
      !light_color ||
      !accent_color
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate position values
    if (
      bg_position_x < 0 ||
      bg_position_x > 100 ||
      bg_position_y < 0 ||
      bg_position_y > 100
    ) {
      return res
        .status(400)
        .json({ error: 'Background position must be between 0 and 100' });
    }

    const result = await pool.query(
      `INSERT INTO season_card_designs
       (league, format, seasonid, primary_color, dark_color, light_color, accent_color, bg_position_x, bg_position_y, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       ON CONFLICT (league, format, seasonid)
       DO UPDATE SET
         primary_color = $4,
         dark_color = $5,
         light_color = $6,
         accent_color = $7,
         bg_position_x = $8,
         bg_position_y = $9,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        league,
        format,
        seasonid,
        primary_color,
        dark_color,
        light_color,
        accent_color,
        bg_position_x,
        bg_position_y,
      ]
    );

    res.json({ success: true, design: result.rows[0] });
  } catch (err) {
    logger.error('Save card design error', {
      error: err.message,
      body: req.body,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get player card data for a specific season with S3 status check
router.get('/player-data/:seasonid', async (req, res) => {
  try {
    const seasonid = parseInt(req.params.seasonid);

    const result = await pool.query(
      `SELECT pci.*, tg.rglname
       FROM player_card_info pci
       LEFT JOIN tf2gamers tg ON pci.id64 = tg.steamid
       WHERE pci.seasonid = $1
       ORDER BY pci.division,
         ((pci.cbt*2) + (pci.eff*0.5) + (pci.eva*0.5) + (pci.imp*2) + pci.spt + pci.srv) / 7.0 DESC`,
      [seasonid]
    );

    // Check S3 for existing cards
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `${seasonid}/`,
      });

      const listResponse = await s3Client.send(listCommand);
      const existingCards = new Set();

      if (listResponse.Contents) {
        listResponse.Contents.forEach((obj) => {
          // Extract player ID from key (format: seasonid/playerid.png)
          const match = obj.Key.match(/\/(\d+)\.png$/);
          if (match) {
            existingCards.add(match[1]);
          }
        });
      }

      // Add generated status and URL to players, then sort properly
      const playersWithStatus = result.rows.map((player) => ({
        ...player,
        generated: existingCards.has(player.id64),
        generatedUrl: existingCards.has(player.id64)
          ? `https://${BUCKET_NAME}.s3.amazonaws.com/${seasonid}/${player.id64}.png`
          : null,
      }));

      // Sort using dynamic division sorting from rarityMapping
      playersWithStatus.sort((a, b) => {
        const orderA = getDivisionSortOrder(a.division);
        const orderB = getDivisionSortOrder(b.division);

        if (orderA !== orderB) {
          return orderA - orderB; // Sort by division tier first
        }

        // Within same division, sort by player rating
        const ratingA =
          (a.cbt * 2 + a.eff * 0.5 + a.eva * 0.5 + a.imp * 2 + a.spt + a.srv) /
          7.0;
        const ratingB =
          (b.cbt * 2 + b.eff * 0.5 + b.eva * 0.5 + b.imp * 2 + b.spt + b.srv) /
          7.0;
        return ratingB - ratingA; // Higher rating first
      });

      res.json(playersWithStatus);
    } catch (s3Error) {
      logger.warn(
        'S3 check failed, returning players without generated status',
        {
          error: s3Error.message,
          seasonid,
        }
      );
      // If S3 check fails, return players without generated status
      res.json(
        result.rows.map((player) => ({
          ...player,
          generated: false,
          generatedUrl: null,
        }))
      );
    }
  } catch (err) {
    logger.error('Get player data error', {
      error: err.message,
      seasonid: req.params.seasonid,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get S3 bucket status for a season (card count)
router.get('/bucket-status/:seasonid', async (req, res) => {
  try {
    const { seasonid } = req.params;

    // List all objects in the season folder
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${seasonid}/`,
    });

    const listResponse = await s3Client.send(listCommand);
    const cardCount = listResponse.Contents ? listResponse.Contents.length : 0;

    res.json({
      seasonid: parseInt(seasonid),
      bucketExists: cardCount > 0,
      cardCount,
      bucketUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${seasonid}/`,
    });
  } catch (err) {
    logger.error('Get bucket status error', {
      error: err.message,
      seasonid: req.params.seasonid,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Clear all cards for a season from S3
router.delete('/clear-bucket/:seasonid', async (req, res) => {
  try {
    const { seasonid } = req.params;

    // List all objects in the season folder
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${seasonid}/`,
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return res.json({
        success: true,
        deletedCount: 0,
        message: 'No cards found for this season',
      });
    }

    // Prepare objects for deletion
    const objectsToDelete = listResponse.Contents.map((obj) => ({
      Key: obj.Key,
    }));

    // Delete all objects
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
      },
    });

    await s3Client.send(deleteCommand);

    logger.info('Cleared season bucket', {
      seasonid,
      deletedCount: objectsToDelete.length,
    });

    res.json({
      success: true,
      deletedCount: objectsToDelete.length,
      message: `Successfully deleted ${objectsToDelete.length} cards`,
    });
  } catch (err) {
    logger.error('Clear bucket error', {
      error: err.message,
      seasonid: req.params.seasonid,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;
