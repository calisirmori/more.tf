const express = require('express');
const router = express.Router();
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const pool = require('../config/database');
const logger = require('../utils/logger');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2'
});

const BUCKET_NAME = 'moretf-season-cards';

// Get all cards for a specific player (by Steam ID)
router.get('/player/:steamid', async (req, res) => {
  try {
    const { steamid } = req.params;

    // Get all seasons this player has data for
    const seasonsResult = await pool.query(
      `SELECT DISTINCT s.seasonid, s.seasonname, s.league, s.format
       FROM player_card_info pci
       JOIN seasons s ON pci.seasonid = s.seasonid
       WHERE pci.id64 = $1
       ORDER BY s.seasonid DESC`,
      [steamid]
    );

    if (seasonsResult.rows.length === 0) {
      return res.json({
        steamid,
        totalCards: 0,
        cards: []
      });
    }

    const seasons = seasonsResult.rows;
    const seasonIds = seasons.map(s => s.seasonid);

    // Check S3 in batch using ListObjectsV2 with prefix for each season
    // We'll make parallel requests for efficiency
    const cardChecks = await Promise.all(
      seasonIds.map(async (seasonid) => {
        const key = `${seasonid}/${steamid}.png`;
        try {
          await s3Client.send(new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
          }));
          return seasonid; // Card exists
        } catch (err) {
          return null; // Card doesn't exist
        }
      })
    );

    // Filter out nulls (seasons without cards)
    const seasonIdsWithCards = cardChecks.filter(id => id !== null);

    // Build cards array only for seasons with cards in S3
    const cards = seasons
      .filter(season => seasonIdsWithCards.includes(season.seasonid))
      .map(season => ({
        seasonid: season.seasonid,
        seasonName: season.seasonname,
        league: season.league,
        format: season.format,
        displayName: `${season.league} ${season.format} S${season.seasonid}`,
        cardUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${season.seasonid}/${steamid}.png`,
        thumbnailUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${season.seasonid}/${steamid}.png`
      }));

    res.json({
      steamid,
      totalCards: cards.length,
      cards
    });

  } catch (err) {
    logger.error('Get player cards error', { error: err.message, steamid: req.params.steamid });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get card for a specific player in a specific season
router.get('/player/:steamid/season/:seasonid', async (req, res) => {
  try {
    const { steamid, seasonid } = req.params;

    // Get season info
    const seasonResult = await pool.query(
      `SELECT s.seasonid, s.seasonname, s.league, s.format
       FROM seasons s
       WHERE s.seasonid = $1`,
      [seasonid]
    );

    if (seasonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    const season = seasonResult.rows[0];
    const key = `${seasonid}/${steamid}.png`;

    try {
      // Check if the card exists in S3
      await s3Client.send(new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      }));

      res.json({
        seasonid: season.seasonid,
        seasonName: season.seasonname,
        league: season.league,
        format: season.format,
        displayName: `${season.league} ${season.format} S${season.seasonid}`,
        cardUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
        exists: true
      });
    } catch (headErr) {
      res.status(404).json({
        error: 'Card not found',
        exists: false
      });
    }

  } catch (err) {
    logger.error('Get player season card error', { error: err.message, params: req.params });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;
