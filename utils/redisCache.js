const logger = require('./logger');

class RedisCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.memoryCache = {}; // Fallback for when Redis is unavailable
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null
   */
  async get(key) {
    if (!this.redis || !this.redis.isOpen) {
      // Fallback to memory cache
      const cached = this.memoryCache[key];
      if (cached && cached.expiresAt > Date.now()) {
        logger.debug('Memory cache hit', { key });
        return cached.value;
      }
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.debug('Redis cache hit', { key });
        return JSON.parse(value);
      }
      return null;
    } catch (err) {
      logger.error('Redis get error', { error: err.message, key });
      // Try memory cache fallback
      const cached = this.memoryCache[key];
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 24 hours)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttlSeconds = 86400) { // 24 hours default
    // Always set in memory cache as fallback
    this.memoryCache[key] = {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };

    if (!this.redis || !this.redis.isOpen) {
      logger.debug('Redis unavailable, using memory cache only', { key });
      return true;
    }

    try {
      await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
      logger.debug('Redis cache set', { key, ttlSeconds });
      return true;
    } catch (err) {
      logger.error('Redis set error', { error: err.message, key });
      // Memory cache is already set, so return true
      return true;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    // Delete from memory cache
    delete this.memoryCache[key];

    if (!this.redis || !this.redis.isOpen) {
      return true;
    }

    try {
      await this.redis.del(key);
      logger.debug('Redis cache deleted', { key });
      return true;
    } catch (err) {
      logger.error('Redis delete error', { error: err.message, key });
      return false;
    }
  }

  /**
   * Get or set cache (fetch from function if not cached)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Async function to fetch data if not cached
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {Promise<any>} - Cached or fresh data
   */
  async getOrSet(key, fetchFn, ttlSeconds = 86400) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Not in cache, fetch fresh data
    logger.info('Cache miss, fetching fresh data', { key });
    const freshData = await fetchFn();

    // Store in cache
    await this.set(key, freshData, ttlSeconds);

    return freshData;
  }

  /**
   * Clear all keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., "season:*")
   * @returns {Promise<number>} - Number of keys deleted
   */
  async clearPattern(pattern) {
    // Clear from memory cache
    Object.keys(this.memoryCache).forEach(key => {
      if (key.startsWith(pattern.replace('*', ''))) {
        delete this.memoryCache[key];
      }
    });

    if (!this.redis || !this.redis.isOpen) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.redis.del(keys);
      logger.info('Redis pattern cleared', { pattern, count: keys.length });
      return keys.length;
    } catch (err) {
      logger.error('Redis clear pattern error', { error: err.message, pattern });
      return 0;
    }
  }
}

module.exports = RedisCache;
