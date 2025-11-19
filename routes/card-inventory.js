const express = require('express');
const router = express.Router();
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const pool = require('../config/database');
const logger = require('../utils/logger');
const {
  getRarityFromDivision,
  isHoloDivision,
} = require('../utils/rarityMapping');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
});

const BUCKET_NAME = 'moretf-season-cards';

// Get player's full inventory with card details and S3 metadata
router.get('/inventory/:steamid', async (req, res) => {
  try {
    const { steamid } = req.params;
    const {
      season,
      league,
      format,
      rarity,
      search,
      sort = 'acquired_desc',
      limit = 50,
      offset = 0,
    } = req.query;

    logger.info('Fetching inventory', {
      steamid,
      season,
      league,
      format,
      rarity,
      search,
      sort,
      limit,
      offset,
    });

    // Build WHERE clause for filters
    let whereClause = 'ci.owner_steamid = $1';
    const params = [steamid];
    let paramCount = 1;

    if (season) {
      paramCount++;
      whereClause += ` AND ci.seasonid = $${paramCount}`;
      params.push(season);
    }

    if (league) {
      paramCount++;
      whereClause += ` AND s.league = $${paramCount}`;
      params.push(league);
    }

    if (format) {
      paramCount++;
      whereClause += ` AND pci.format = $${paramCount}`;
      params.push(format);
    }

    if (rarity) {
      const rarityDivisions = {
        legendary: ['invite', 'Invite'],
        epic: ['advanced', 'Advanced'],
        rare: ['main', 'Main'],
        uncommon: ['intermediate', 'Intermediate'],
      };
      if (rarityDivisions[rarity]) {
        paramCount++;
        whereClause += ` AND pci.division = ANY($${paramCount}::text[])`;
        params.push(rarityDivisions[rarity]);
      }
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (tg.rglname ILIKE $${paramCount} OR s.seasonname ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Build ORDER BY clause (for inner and outer queries)
    let innerOrderByClause = 'ci.id';
    let outerOrderByClause;
    switch (sort) {
      case 'acquired_desc':
        outerOrderByClause = 'acquired_at DESC';
        break;
      case 'acquired_asc':
        outerOrderByClause = 'acquired_at ASC';
        break;
      case 'rating_desc':
        outerOrderByClause =
          '((cbt*2) + (eff*0.5) + (eva*0.5) + (dmg*2) + spt + srv) / 7.0 DESC';
        break;
      case 'season_desc':
        outerOrderByClause = 'seasonid DESC';
        break;
      case 'season_asc':
        outerOrderByClause = 'seasonid ASC';
        break;
      default:
        outerOrderByClause = 'seasonid DESC';
    }

    // Get total count (using DISTINCT to handle duplicate seasons)
    const countQuery = `
      SELECT COUNT(DISTINCT ci.id) as total
      FROM card_inventory ci
      JOIN player_card_info pci ON ci.card_steamid = pci.id64::text AND ci.seasonid = pci.seasonid
      JOIN seasons s ON ci.seasonid = s.seasonid
      LEFT JOIN tf2gamers tg ON pci.id64 = tg.steamid
      WHERE ${whereClause}
    `;
    logger.debug('Count query', { query: countQuery, params });
    const countResult = await pool.query(countQuery, params);

    const totalCards = parseInt(countResult.rows[0].total);

    // Get paginated cards (using subquery to handle duplicate seasons and preserve sort order)
    params.push(limit, offset);
    const cardsResult = await pool.query(
      `
      SELECT * FROM (
        SELECT DISTINCT ON (ci.id)
          ci.id,
          ci.card_steamid,
          ci.seasonid,
          ci.acquired_at,
          ci.is_favorited,
          ci.favorite_slot,
          ci.gifted_from,
          gifter_tg.rglname as gifter_name,
          gifter_si.avatar as gifter_avatar,
          pci.class,
          pci.division,
          pci.format,
          pci.cbt,
          pci.spt,
          pci.srv,
          pci.eff,
          pci.imp as dmg,
          pci.eva,
          s.seasonname,
          s.league,
          tg.rglname
        FROM card_inventory ci
        JOIN player_card_info pci ON ci.card_steamid = pci.id64::text AND ci.seasonid = pci.seasonid
        JOIN seasons s ON ci.seasonid = s.seasonid
        LEFT JOIN tf2gamers tg ON pci.id64 = tg.steamid
        LEFT JOIN tf2gamers gifter_tg ON ci.gifted_from = gifter_tg.steamid::text
        LEFT JOIN steam_info gifter_si ON ci.gifted_from = gifter_si.id64::text
        WHERE ${whereClause}
        ORDER BY ${innerOrderByClause}
      ) AS distinct_cards
      ORDER BY ${outerOrderByClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `,
      params
    );

    // Add S3 URL and card metadata
    const cardsWithMetadata = cardsResult.rows.map((card) => {
      const key = `${card.seasonid}/${card.card_steamid}.png`;

      return {
        ...card,
        // Always provide the S3 URL - let the frontend handle if it doesn't exist
        cardUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`,
        holo: isHoloDivision(card.division),
        rarity: getRarityFromDivision(card.division),
        overall: Math.round(
          (card.cbt * 2 +
            card.spt +
            card.srv +
            card.eff * 0.5 +
            card.dmg * 2 +
            card.eva * 0.5) /
            7
        ),
      };
    });

    res.json({
      steamid,
      totalCards,
      cards: cardsWithMetadata,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCards > parseInt(offset) + parseInt(limit),
      },
    });
  } catch (err) {
    logger.error('Get inventory error', {
      error: err.message,
      stack: err.stack,
      steamid: req.params.steamid,
    });
    res.status(500).json({
      error: 'An internal server error occurred',
      details: err.message,
    });
  }
});

// Get favorited cards for a player
router.get('/favorites/:steamid', async (req, res) => {
  try {
    const { steamid } = req.params;

    const favoritesResult = await pool.query(
      `
      SELECT DISTINCT ON (ci.id)
        ci.id,
        ci.card_steamid,
        ci.seasonid,
        ci.favorite_slot,
        ci.gifted_from,
        gifter_tg.rglname as gifter_name,
        gifter_si.avatar as gifter_avatar,
        pci.class,
        pci.division,
        pci.format,
        s.seasonname,
        s.league,
        tg.rglname
      FROM card_inventory ci
      JOIN player_card_info pci ON ci.card_steamid = pci.id64::text AND ci.seasonid = pci.seasonid
      JOIN seasons s ON ci.seasonid = s.seasonid
      LEFT JOIN tf2gamers tg ON pci.id64 = tg.steamid
      LEFT JOIN tf2gamers gifter_tg ON ci.gifted_from = gifter_tg.steamid::text
      LEFT JOIN steam_info gifter_si ON ci.gifted_from = gifter_si.id64::text
      WHERE ci.owner_steamid = $1 AND ci.is_favorited = true
      ORDER BY ci.id, ci.favorite_slot ASC NULLS LAST
      LIMIT 5
    `,
      [steamid]
    );

    // Add S3 URL and metadata
    const favoritesWithMetadata = favoritesResult.rows.map((card) => {
      const key = `${card.seasonid}/${card.card_steamid}.png`;

      return {
        ...card,
        cardUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`,
        holo: isHoloDivision(card.division),
        rarity: getRarityFromDivision(card.division),
      };
    });

    res.json({
      steamid,
      favorites: favoritesWithMetadata,
    });
  } catch (err) {
    logger.error('Get favorites error', {
      error: err.message,
      steamid: req.params.steamid,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Toggle favorite status for a card
router.patch('/favorite/:inventoryId', async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { favoriteSlot } = req.body; // Optional: specify which slot (1-5)

    // Get current card info
    const cardResult = await pool.query(
      'SELECT id, owner_steamid, is_favorited, favorite_slot FROM card_inventory WHERE id = $1',
      [inventoryId]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found in inventory' });
    }

    const card = cardResult.rows[0];

    // Toggle favorite
    if (card.is_favorited) {
      // Unfavorite
      await pool.query(
        'UPDATE card_inventory SET is_favorited = false, favorite_slot = NULL WHERE id = $1',
        [inventoryId]
      );

      res.json({ success: true, is_favorited: false, favorite_slot: null });
    } else {
      // Favorite - check if user already has 5 favorites
      const favCountResult = await pool.query(
        'SELECT COUNT(*) as count FROM card_inventory WHERE owner_steamid = $1 AND is_favorited = true',
        [card.owner_steamid]
      );

      if (parseInt(favCountResult.rows[0].count) >= 5) {
        return res.status(400).json({
          error: 'Maximum 5 favorites allowed. Unfavorite a card first.',
        });
      }

      // Determine slot
      let slot = favoriteSlot;
      if (!slot) {
        // Find first available slot
        const usedSlotsResult = await pool.query(
          'SELECT favorite_slot FROM card_inventory WHERE owner_steamid = $1 AND is_favorited = true ORDER BY favorite_slot',
          [card.owner_steamid]
        );
        const usedSlots = usedSlotsResult.rows
          .map((r) => r.favorite_slot)
          .filter((s) => s !== null);
        for (let i = 1; i <= 5; i++) {
          if (!usedSlots.includes(i)) {
            slot = i;
            break;
          }
        }
      }

      // Check if slot is already taken
      if (slot) {
        const slotCheckResult = await pool.query(
          'SELECT id FROM card_inventory WHERE owner_steamid = $1 AND favorite_slot = $2',
          [card.owner_steamid, slot]
        );

        if (slotCheckResult.rows.length > 0) {
          return res
            .status(400)
            .json({ error: `Favorite slot ${slot} is already taken` });
        }
      }

      await pool.query(
        'UPDATE card_inventory SET is_favorited = true, favorite_slot = $1 WHERE id = $2',
        [slot, inventoryId]
      );

      res.json({ success: true, is_favorited: true, favorite_slot: slot });
    }
  } catch (err) {
    logger.error('Toggle favorite error', {
      error: err.message,
      inventoryId: req.params.inventoryId,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Get inventory statistics
router.get('/stats/:steamid', async (req, res) => {
  try {
    const { steamid } = req.params;

    const statsResult = await pool.query(
      `
      SELECT
        COUNT(*) as total_cards,
        COUNT(DISTINCT ci.seasonid) as unique_seasons,
        COUNT(*) FILTER (WHERE pci.division IN ('invite', 'Invite')) as legendary_count,
        COUNT(*) FILTER (WHERE pci.division IN ('advanced', 'Advanced')) as epic_count,
        COUNT(*) FILTER (WHERE pci.division IN ('main', 'Main')) as rare_count,
        COUNT(*) FILTER (WHERE pci.division IN ('intermediate', 'Intermediate')) as uncommon_count,
        COUNT(*) FILTER (WHERE pci.division NOT IN ('invite', 'Invite', 'advanced', 'Advanced', 'main', 'Main', 'intermediate', 'Intermediate')) as common_count,
        COUNT(*) FILTER (WHERE ci.is_favorited = true) as favorited_count
      FROM card_inventory ci
      JOIN player_card_info pci ON ci.card_steamid = pci.id64::text AND ci.seasonid = pci.seasonid
      WHERE ci.owner_steamid = $1
    `,
      [steamid]
    );

    res.json({
      steamid,
      stats: statsResult.rows[0],
    });
  } catch (err) {
    logger.error('Get inventory stats error', {
      error: err.message,
      steamid: req.params.steamid,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Share/gift a card to another user (creates a copy)
router.post('/gift/:inventoryId', async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { recipientSteamId } = req.body;

    if (!recipientSteamId) {
      return res.status(400).json({ error: 'Recipient Steam ID is required' });
    }

    // Get the card to be shared
    const cardResult = await pool.query(
      `SELECT ci.*, pci.class, pci.division, pci.format, s.seasonname
       FROM card_inventory ci
       JOIN player_card_info pci ON ci.card_steamid = pci.id64::text AND ci.seasonid = pci.seasonid
       JOIN seasons s ON ci.seasonid = s.seasonid
       WHERE ci.id = $1`,
      [inventoryId]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found in inventory' });
    }

    const card = cardResult.rows[0];

    // Check if the user is authenticated and owns this card in their inventory
    if (!req.isAuthenticated() || req.user.id !== card.owner_steamid) {
      return res.status(403).json({ error: 'You do not own this card' });
    }

    // Check if the card belongs to the player (only the player on the card can gift it)
    if (card.card_steamid !== req.user.id) {
      return res.status(403).json({
        error: 'You can only gift cards that have your name on them'
      });
    }

    // Check if recipient exists
    const recipientCheck = await pool.query(
      'SELECT steamid FROM tf2gamers WHERE steamid = $1',
      [recipientSteamId]
    );

    if (recipientCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Recipient not found in the database' });
    }

    // Check if recipient already has this exact card (same card_steamid and seasonid)
    const duplicateCheck = await pool.query(
      'SELECT id FROM card_inventory WHERE owner_steamid = $1 AND card_steamid = $2 AND seasonid = $3',
      [recipientSteamId, card.card_steamid, card.seasonid]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Recipient already owns this card',
      });
    }

    // Create a new card entry for the recipient (sharing/copying)
    const giftResult = await pool.query(
      `INSERT INTO card_inventory (owner_steamid, card_steamid, seasonid, acquired_at, gifted_from)
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING id`,
      [recipientSteamId, card.card_steamid, card.seasonid, card.owner_steamid]
    );

    logger.info('Card shared', {
      from: card.owner_steamid,
      to: recipientSteamId,
      cardId: inventoryId,
      newCardId: giftResult.rows[0].id,
      season: card.seasonname,
    });

    res.json({
      success: true,
      message: 'Card successfully shared',
      newCardId: giftResult.rows[0].id,
    });
  } catch (err) {
    logger.error('Share card error', {
      error: err.message,
      stack: err.stack,
      inventoryId: req.params.inventoryId,
    });
    res.status(500).json({
      error: 'An internal server error occurred',
      details: err.message,
    });
  }
});

module.exports = router;
