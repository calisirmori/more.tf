/**
 * Redis caching layer for parsed logs
 */

import { ParsedMatch } from '../types/match';
import { PARSER_VERSION } from '../index';

// Import the RedisCache class from existing utils
// We'll use it in the implementation below

const CACHE_TTL = 604800; // 7 days in seconds

/**
 * Generate cache key for a log
 */
export function generateCacheKey(logId: number): string {
  return `log:parsed:${logId}:v${PARSER_VERSION}`;
}

/**
 * Get parsed log from cache
 */
export async function getCachedLog(
  redisCache: any, // RedisCache instance
  logId: number
): Promise<ParsedMatch | null> {
  try {
    const key = generateCacheKey(logId);
    const cached = await redisCache.get(key);

    if (cached) {
      // Validate that it's a ParsedMatch object
      if (cached.info && cached.players && cached.rounds) {
        return cached as ParsedMatch;
      }
    }

    return null;
  } catch (err) {
    console.error('Error getting cached log:', err);
    return null;
  }
}

/**
 * Store parsed log in cache
 */
export async function setCachedLog(
  redisCache: any, // RedisCache instance
  logId: number,
  parsedMatch: ParsedMatch
): Promise<boolean> {
  try {
    const key = generateCacheKey(logId);
    await redisCache.set(key, parsedMatch, CACHE_TTL);
    return true;
  } catch (err) {
    console.error('Error setting cached log:', err);
    return false;
  }
}

/**
 * Invalidate cache for a specific log
 */
export async function invalidateLog(
  redisCache: any,
  logId: number
): Promise<boolean> {
  try {
    const key = generateCacheKey(logId);
    await redisCache.del(key);
    return true;
  } catch (err) {
    console.error('Error invalidating log cache:', err);
    return false;
  }
}

/**
 * Invalidate all parser v2 caches
 * Useful when parser logic changes
 */
export async function invalidateAllParserCaches(
  redisCache: any
): Promise<number> {
  try {
    const pattern = `log:parsed:*:v${PARSER_VERSION}`;
    return await redisCache.clearPattern(pattern);
  } catch (err) {
    console.error('Error invalidating all parser caches:', err);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(
  redisCache: any
): Promise<{
  version: string;
  ttl: number;
  keyPattern: string;
}> {
  return {
    version: PARSER_VERSION,
    ttl: CACHE_TTL,
    keyPattern: `log:parsed:*:v${PARSER_VERSION}`,
  };
}
