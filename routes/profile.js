const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const seasonCache = require('../utils/seasonCache');

/**
 * Consolidated Profile Data Endpoint
 * Fetches all necessary data for a player profile in a single request
 * This reduces the number of round-trips from the client to the server
 */
router.get('/profile-data/:id', async (req, res) => {
  const playerId = req.params.id;

  try {
    // Execute all database queries in parallel
    const [
      steamInfoResult,
      matchHistoryResult,
      activityResult,
      peersResult,
      enemiesResult,
      perClassStatsResult,
      perFormatStatsResult,
      perMapStatsResult,
      playerCardResult,
      rglProfileResult,
    ] = await Promise.allSettled([
      // Steam info
      fetchSteamInfo(playerId),

      // Match history (last 15 matches)
      pool.query(`
        select * from
        (select id64,kills,assists,deaths,dpm,dtm,heals,map,date,match_length,class,title,match_result,format,logs.logid from logs
        left join players on players.logid=logs.logid) as T1
        where id64=${playerId} and class=class and map like '%%' and date > 0 and format=format
        order by date desc
        limit 15
      `),

      // Activity data
      pool.query(`
        select date from logs
        left join players on players.logid=logs.logid where id64=${playerId}
        order by logs.date desc
      `),

      // Peers/teammates
      pool.query(`
        select * from peer_table pt where main_id64=${playerId} order by count desc
      `),

      // Enemies
      pool.query(`
        select * from enemy_table pt where main_id64=${playerId} order by count desc
      `),

      // Per-class stats
      pool.query(`
        SELECT class,
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
        ORDER BY COUNT(match_result) DESC
      `),

      // Per-format stats
      pool.query(`
        select * from format_stats where id64=${playerId} ORDER BY format_played DESC
      `),

      // Per-map stats
      pool.query(`
        select * from map_stats where id64=${playerId} order by map_count desc
      `),

      // Player card stats
      fetchPlayerCardStats(playerId),

      // RGL profile (external API)
      fetchRGLProfile(playerId),
    ]);

    // Process steam info for teammates/enemies
    let teamMatesSteamInfo = {};

    // Combine peers and enemies for bulk steam lookup
    const peersData =
      peersResult.status === 'fulfilled' ? peersResult.value.rows : [];
    const enemiesData =
      enemiesResult.status === 'fulfilled' ? enemiesResult.value.rows : [];
    const combinedPeers = [...peersData, ...enemiesData];

    if (combinedPeers.length > 0) {
      const peerIds = combinedPeers.map((peer) => peer.peer_id64).slice(0, 100); // Limit to first 100
      const peerSteamInfo = await fetchSteamInfo(peerIds.join(','));

      if (
        peerSteamInfo &&
        peerSteamInfo.response &&
        peerSteamInfo.response.players
      ) {
        teamMatesSteamInfo = peerSteamInfo.response.players.reduce(
          (obj, item) => {
            obj[item.steamid] = item;
            return obj;
          },
          {}
        );
      }
    }

    // Build response object with all data
    const response = {
      playerSteamInfo:
        steamInfoResult.status === 'fulfilled' &&
        steamInfoResult.value?.response?.players?.[0]
          ? steamInfoResult.value.response.players[0]
          : null,

      matchHistory:
        matchHistoryResult.status === 'fulfilled'
          ? matchHistoryResult.value.rows || []
          : [],

      activity:
        activityResult.status === 'fulfilled'
          ? activityResult.value.rows || []
          : [],

      rglInfo:
        rglProfileResult.status === 'fulfilled'
          ? rglProfileResult.value || {}
          : {},

      peers: peersData,

      enemies: enemiesData,

      teamMatesSteamInfo: teamMatesSteamInfo,

      perClassStats:
        perClassStatsResult.status === 'fulfilled'
          ? perClassStatsResult.value.rows || []
          : [],

      perFormatStats:
        perFormatStatsResult.status === 'fulfilled'
          ? perFormatStatsResult.value.rows || []
          : [],

      perMapStats:
        perMapStatsResult.status === 'fulfilled'
          ? perMapStatsResult.value.rows || []
          : [],

      playerCard:
        playerCardResult.status === 'fulfilled' && playerCardResult.value
          ? playerCardResult.value
          : [],
    };

    res.json(response);
  } catch (error) {
    logger.error('Profile data fetch error', {
      error: error.message,
      playerId,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

/**
 * Fetch S3 card for a player
 */
router.get('/profile-s3-card/:playerId/:seasonId', async (req, res) => {
  const { playerId, seasonId } = req.params;

  try {
    // Check if player card exists for this season
    const query = `
      SELECT division
      FROM player_card_info
      WHERE id64 = $1 AND seasonid = $2
    `;

    const result = await pool.query(query, [playerId, seasonId]);

    if (result.rows.length > 0) {
      const division = result.rows[0].division;
      const BUCKET_NAME = 'moretf-season-cards';

      // Determine if card should be holo based on division
      const isHoloDivision = (division) => {
        const holoDivisions = ['invite', 'Invite', 'advanced', 'Advanced'];
        return holoDivisions.includes(division);
      };

      res.json({
        exists: true,
        cardUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${seasonId}/${playerId}.png`,
        holo: isHoloDivision(division),
      });
    } else {
      res.json({
        exists: false,
        cardUrl: null,
        holo: false,
      });
    }
  } catch (error) {
    logger.error('S3 card fetch error', {
      error: error.message,
      playerId,
      seasonId,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Helper function to fetch Steam info with retry logic
async function fetchSteamInfo(userIds, maxRetries = 5, attemptNumber = 1) {
  if (!userIds) {
    return null;
  }

  const URL = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAMKEY}&steamids=${userIds}`;

  try {
    const response = await fetch(URL, FetchResultTypes.JSON);
    return response;
  } catch (error) {
    if (attemptNumber >= maxRetries) {
      logger.error('Steam API call failed', {
        error: error.message,
        attemptNumber,
      });
      return null;
    } else {
      const delayInSeconds = Math.pow(1.2, attemptNumber);
      const variance = 0.3;
      const randomFactor = 1 - variance / 2 + Math.random() * variance;
      const randomizedDelayInSeconds = delayInSeconds * randomFactor;
      await new Promise((resolve) =>
        setTimeout(resolve, randomizedDelayInSeconds * 1000)
      );
      return fetchSteamInfo(userIds, maxRetries, attemptNumber + 1);
    }
  }
}

// Helper function to fetch RGL profile
async function fetchRGLProfile(playerId) {
  try {
    const URL = `https://api.rgl.gg/v0/profile/${playerId}`;
    const response = await fetch(URL, FetchResultTypes.JSON);
    return response;
  } catch (error) {
    logger.error('RGL profile fetch error', { error: error.message, playerId });
    return {};
  }
}

// Helper function to fetch player card stats
async function fetchPlayerCardStats(playerId) {
  try {
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
    const result = await pool.query(queryText, [playerId]);

    // Only return cards that exist in the card_inventory (meaning they have been generated)
    // This prevents showing placeholder cards for players who have stats but no generated card
    if (result.rows.length === 0) {
      return [];
    }

    // Filter to only include cards that exist in card_inventory
    const cardsWithInventory = await Promise.all(
      result.rows.map(async (card) => {
        const inventoryCheck = await pool.query(
          'SELECT 1 FROM card_inventory WHERE card_steamid = $1 AND seasonid = $2 LIMIT 1',
          [playerId, card.seasonid]
        );
        return inventoryCheck.rows.length > 0 ? card : null;
      })
    );

    // Filter out null values (cards that don't exist in inventory)
    return cardsWithInventory.filter((card) => card !== null);
  } catch (error) {
    logger.error('Player card stats fetch error', {
      error: error.message,
      playerId,
    });
    return [];
  }
}

module.exports = router;
