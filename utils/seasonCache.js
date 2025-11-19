const pool = require('../config/database');
const logger = require('./logger');

class SeasonCache {
  constructor() {
    this.redisCache = null;
    this.CACHE_KEY = 'season:active';
    this.DISPLAY_CARD_KEY = 'season:displayCard';
    this.CACHE_TTL = 86400; // 24 hours in seconds
  }

  // Initialize with Redis cache (called from index.js)
  setRedisCache(redisCache) {
    this.redisCache = redisCache;
    logger.info('Season cache initialized with Redis');
  }

  async getActiveSeasons() {
    // Use Redis cache if available
    if (this.redisCache) {
      return await this.redisCache.getOrSet(
        this.CACHE_KEY,
        () => this.fetchActiveSeasonsFromDB(),
        this.CACHE_TTL
      );
    }

    // Fallback to direct DB fetch
    return await this.fetchActiveSeasonsFromDB();
  }

  async fetchActiveSeasonsFromDB() {
    try {
      logger.info('Fetching active seasons from database');

      const result = await pool.query(`
        SELECT seasonid, seasonname, league, format, active, displayCard
        FROM season_metadata
        WHERE active = true OR displayCard = true
        ORDER BY league, format
      `);

      // Transform into easy-to-use object
      const activeSeasons = {
        RGL: {},
        OZF: {}
      };

      result.rows.forEach(season => {
        if (!activeSeasons[season.league]) {
          activeSeasons[season.league] = {};
        }

        if (season.active) {
          activeSeasons[season.league][season.format] = {
            seasonid: season.seasonid,
            seasonname: season.seasonname
          };
        }
      });

      logger.info('Active seasons fetched from database', { activeSeasons });
      return activeSeasons;
    } catch (err) {
      logger.error('Failed to fetch active seasons from database', { error: err.message });
      return { RGL: {}, OZF: {} };
    }
  }

  async fetchDisplayCardSeasonsFromDB() {
    try {
      logger.info('Fetching display card seasons from database');

      const result = await pool.query(`
        SELECT seasonid, seasonname, league, format, displayCard
        FROM season_metadata
        WHERE displayCard = true
        ORDER BY league, format
      `);

      const displayCardSeasons = {
        RGL: {},
        OZF: {}
      };

      result.rows.forEach(season => {
        if (!displayCardSeasons[season.league]) {
          displayCardSeasons[season.league] = {};
        }

        if (season.displaycard) {
          displayCardSeasons[season.league][season.format] = {
            seasonid: season.seasonid,
            seasonname: season.seasonname
          };
        }
      });

      logger.info('Display card seasons fetched from database', { displayCardSeasons });
      return displayCardSeasons;
    } catch (err) {
      logger.error('Failed to fetch display card seasons from database', { error: err.message });
      return { RGL: {}, OZF: {} };
    }
  }

  async getDisplayCardSeasons() {
    // Use Redis cache if available
    if (this.redisCache) {
      return await this.redisCache.getOrSet(
        this.DISPLAY_CARD_KEY,
        () => this.fetchDisplayCardSeasonsFromDB(),
        this.CACHE_TTL
      );
    }

    // Fallback to direct DB fetch
    return await this.fetchDisplayCardSeasonsFromDB();
  }

  // Force cache invalidation (call this when admin updates seasons)
  async invalidate() {
    logger.info('Invalidating season cache');

    if (this.redisCache) {
      await this.redisCache.del(this.CACHE_KEY);
      await this.redisCache.del(this.DISPLAY_CARD_KEY);
      await this.redisCache.clearPattern('season:*');
    }
  }

  // Get specific active season ID
  async getActiveSeasonId(league, format) {
    const activeSeasons = await this.getActiveSeasons();
    const season = activeSeasons[league]?.[format];
    return season?.seasonid || null;
  }

  // Get specific display card season ID
  async getDisplayCardSeasonId(league, format) {
    const displayCardSeasons = await this.getDisplayCardSeasons();
    const season = displayCardSeasons[league]?.[format];
    return season?.seasonid || null;
  }
}

// Export singleton instance
module.exports = new SeasonCache();
