const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const pool = require('../config/database');
const logger = require('../utils/logger');
const { generatePlayerCard } = require('../utils/cardGenerator');
const {
  getRarityFromDivision,
  isHoloDivision,
  getDivisionSortOrder,
} = require('../utils/rarityMapping');
const { calculateOverall } = require('../utils/classWeights');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
});

const BUCKET_NAME = 'moretf-season-cards';

// Get all seasons with existing designs for a league/format, including stats
router.get('/seasons-with-designs', async (req, res) => {
  try {
    const { league, format } = req.query;

    if (!league || !format) {
      return res.status(400).json({ error: 'Missing league or format' });
    }

    // Get all seasons with saved designs for this league/format
    const designsResult = await pool.query(
      `SELECT DISTINCT ON (scd.seasonid)
        scd.seasonid,
        scd.league,
        scd.format,
        scd.primary_color,
        scd.dark_color,
        scd.light_color,
        scd.accent_color,
        scd.bg_position_x,
        scd.bg_position_y,
        scd.updated_at,
        s.seasonname,
        s.active
      FROM season_card_designs scd
      JOIN seasons s ON scd.seasonid = s.seasonid
      WHERE scd.league = $1 AND scd.format = $2
      ORDER BY scd.seasonid DESC, scd.updated_at DESC`,
      [league, format]
    );

    if (designsResult.rows.length === 0) {
      return res.json({ seasons: [] });
    }

    // For each season, get player count and existing card count
    const seasonsWithStats = await Promise.all(
      designsResult.rows.map(async (design) => {
        // Get total player count for this season
        const playerCountResult = await pool.query(
          `SELECT COUNT(*) as total
           FROM player_card_info
           WHERE seasonid = $1`,
          [design.seasonid]
        );

        const totalPlayers = parseInt(playerCountResult.rows[0].total);

        // Check how many cards exist in S3 by checking a sample
        // For performance, we'll estimate based on database records
        // In a real scenario, you might want to cache this or do periodic scans
        let existingCardsCount = 0;

        // Get all player IDs for this season
        const playerIdsResult = await pool.query(
          `SELECT id64 FROM player_card_info WHERE seasonid = $1 LIMIT 100`,
          [design.seasonid]
        );

        // Check first 100 players to estimate
        for (const player of playerIdsResult.rows) {
          const key = `${design.seasonid}/${player.id64}.png`;
          try {
            await s3Client.send(
              new HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
              })
            );
            existingCardsCount++;
          } catch (error) {
            // Card doesn't exist
          }
        }

        // If we checked less than total, estimate the full count
        const sampledPlayers = playerIdsResult.rows.length;
        if (sampledPlayers < totalPlayers) {
          existingCardsCount = Math.round(
            (existingCardsCount / sampledPlayers) * totalPlayers
          );
        }

        return {
          seasonid: design.seasonid,
          seasonname: design.seasonname,
          league: design.league,
          format: design.format,
          active: design.active,
          design: {
            primary_color: design.primary_color,
            dark_color: design.dark_color,
            light_color: design.light_color,
            accent_color: design.accent_color,
            bg_position_x: design.bg_position_x,
            bg_position_y: design.bg_position_y,
            updated_at: design.updated_at,
          },
          stats: {
            totalPlayers,
            existingCards: existingCardsCount,
          },
        };
      })
    );

    res.json({ seasons: seasonsWithStats });
  } catch (err) {
    logger.error('Get seasons with designs error', {
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

// Generate a single card and return as PNG (for download preview)
router.post('/generate-single-card', async (req, res) => {
  try {
    const {
      player,
      primaryColor,
      darkColor,
      lightColor,
      accentColor,
      bgPositionX,
      bgPositionY,
      seasonInfo,
    } = req.body;

    if (!player) {
      return res.status(400).json({ error: 'Missing player data' });
    }

    // Generate card using Canvas
    const pngBuffer = await generatePlayerCard(player, {
      primaryColor,
      darkColor,
      lightColor,
      accentColor,
      bgPositionX,
      bgPositionY,
      seasonInfo,
    });

    // Send PNG directly
    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${player.rglname || player.id64}_card.png"`
    );
    res.send(pngBuffer);
  } catch (err) {
    logger.error('Generate single card error', {
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Failed to generate card' });
  }
});

// Generate all cards for a season
router.post('/generate-season-cards', async (req, res) => {
  try {
    const {
      league,
      format,
      seasonid,
      primaryColor,
      darkColor,
      lightColor,
      accentColor,
      bgPositionX,
      bgPositionY,
      regenerateOnly,
    } = req.body;

    // Validate required fields
    if (!league || !format || !seasonid) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: league, format, seasonid' });
    }

    // Get season info for seasonname
    const seasonResult = await pool.query(
      `SELECT seasonname FROM seasons WHERE seasonid = $1 LIMIT 1`,
      [seasonid]
    );
    const seasonname = seasonResult.rows[0]?.seasonname || '';

    // Get player data for the season
    const playerResult = await pool.query(
      `SELECT pci.*, tg.rglname
       FROM player_card_info pci
       LEFT JOIN tf2gamers tg ON pci.id64 = tg.steamid
       WHERE pci.seasonid = $1
       ORDER BY pci.division,
         ((pci.cbt*2) + (pci.eff*0.5) + (pci.eva*0.5) + (pci.imp*2) + pci.spt + pci.srv) / 7.0 DESC`,
      [seasonid]
    );

    // Sort players using the dynamic division sorting from rarityMapping
    let players = playerResult.rows.sort((a, b) => {
      const orderA = getDivisionSortOrder(a.division);
      const orderB = getDivisionSortOrder(b.division);

      if (orderA !== orderB) {
        return orderA - orderB; // Sort by division tier first
      }

      // Within same division, sort by player rating using class-specific weights
      const ratingA = calculateOverall(a);
      const ratingB = calculateOverall(b);
      return ratingB - ratingA; // Higher rating first
    });

    // If regenerateOnly is true, filter to only players with existing cards in S3
    if (regenerateOnly) {
      logger.info('Filtering for players with existing cards in S3', {
        seasonid,
        totalPlayers: players.length,
      });

      const existingPlayers = [];
      for (const player of players) {
        const key = `${seasonid}/${player.id64}.png`;
        try {
          await s3Client.send(
            new HeadObjectCommand({
              Bucket: BUCKET_NAME,
              Key: key,
            })
          );
          // Card exists, add to list
          existingPlayers.push(player);
        } catch (error) {
          // Card doesn't exist or error occurred, skip this player
          if (error.name !== 'NotFound') {
            logger.warn('Error checking card existence', {
              player: player.id64,
              error: error.message,
            });
          }
        }
      }

      players = existingPlayers;
      logger.info('Filtered players with existing cards', {
        existingCount: players.length,
      });
    }

    if (players.length === 0) {
      return res
        .status(404)
        .json({ error: regenerateOnly ? 'No existing cards found for this season' : 'No players found for this season' });
    }

    // Start streaming response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Send initial response
    res.write(
      JSON.stringify({ status: 'started', total: players.length }) + '\n'
    );

    let successCount = 0;
    let failedPlayers = [];

    const colors = {
      primaryColor: primaryColor || '#D4822A',
      darkColor: darkColor || '#2C2418',
      lightColor: lightColor || '#E8DCC4',
      accentColor: accentColor || '#D4822A',
      bgPositionX: bgPositionX || 50,
      bgPositionY: bgPositionY || 50,
    };

    // Save the card design to database before generating
    try {
      await pool.query(
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
           updated_at = CURRENT_TIMESTAMP`,
        [
          league,
          format,
          seasonid,
          colors.primaryColor,
          colors.darkColor,
          colors.lightColor,
          colors.accentColor,
          colors.bgPositionX,
          colors.bgPositionY,
        ]
      );
      logger.info('Saved card design to database', {
        league,
        format,
        seasonid,
      });
    } catch (designErr) {
      logger.error('Failed to save card design', {
        error: designErr.message,
        league,
        format,
        seasonid,
      });
      // Continue with generation even if design save fails
    }

    // Generate cards for each player
    for (let i = 0; i < players.length; i++) {
      const player = players[i];

      try {
        logger.info('Generating card for player', {
          id64: player.id64,
          name: player.rglname,
        });

        // Generate card using Canvas
        const pngBuffer = await generatePlayerCard(player, {
          ...colors,
          seasonInfo: {
            league,
            format,
            seasonid,
            seasonname,
          },
        });
        logger.info('Card generated', { size: pngBuffer.length });

        // Determine holo status and rarity based on division using centralized mapping
        const isHolo = isHoloDivision(player.division);
        const rarity = getRarityFromDivision(player.division);

        // Upload to S3 with metadata
        const key = `${seasonid}/${player.id64}.png`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: pngBuffer,
            ContentType: 'image/png',
            Metadata: {
              holo: isHolo.toString(),
              rarity: rarity,
              division: player.division || 'unknown',
              class: player.class || 'unknown',
              format: format,
              league: league,
            },
          })
        );

        successCount++;

        // Send progress update
        res.write(
          JSON.stringify({
            status: 'progress',
            current: i + 1,
            total: players.length,
            player: {
              id64: player.id64,
              name: player.rglname || `Player ${player.id64}`,
              url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
            },
          }) + '\n'
        );
      } catch (error) {
        logger.error('Card generation error', {
          error: error.message,
          stack: error.stack,
          player: player.id64,
          seasonid,
        });

        failedPlayers.push({
          id64: player.id64,
          name: player.rglname || `Player ${player.id64}`,
          error: error.message,
        });

        // Send error update
        res.write(
          JSON.stringify({
            status: 'error',
            current: i + 1,
            total: players.length,
            player: {
              id64: player.id64,
              name: player.rglname || `Player ${player.id64}`,
              error: error.message,
            },
          }) + '\n'
        );
      }
    }

    // Send final response
    res.write(
      JSON.stringify({
        status: 'completed',
        successCount,
        failedCount: failedPlayers.length,
        total: players.length,
        failedPlayers,
        bucketUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${seasonid}/`,
      }) + '\n'
    );

    res.end();
  } catch (err) {
    logger.error('Generate season cards error', {
      error: err.message,
      body: req.body,
    });
    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal server error occurred' });
    } else {
      res.write(
        JSON.stringify({ status: 'fatal_error', error: err.message }) + '\n'
      );
      res.end();
    }
  }
});

module.exports = router;
