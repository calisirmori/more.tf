const express = require('express');
const router = express.Router();
const AdmZip = require('adm-zip');
const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const pool = require('../../config/database');
const logger = require('../../utils/logger');
const RedisCache = require('../../utils/redisCache');

// Import parser v2 (will be compiled TypeScript)
const { parseLog, generateLogSummary } = require('../../parser-v2/dist/index-v2');
const {
  getCachedLog,
  setCachedLog,
} = require('../../parser-v2/dist/cache/parser-cache');

// Initialize Redis cache (passed from index.js)
let redisCache;

function setRedisCache(cache) {
  redisCache = cache;
}

/**
 * Shared function to get parsed log data
 * Handles caching, database retrieval, and parsing
 */
async function getParsedLog(matchId) {
  const startTime = Date.now();

  // Step 1: Check Redis cache
  if (redisCache) {
    logger.info('Checking cache for log', { logId: matchId });
    const cached = await getCachedLog(redisCache, matchId);

    if (cached) {
      logger.info('Cache hit for log', {
        logId: matchId,
        cacheAge: Date.now() - cached.info.date,
      });

      return {
        data: cached,
        source: 'cache',
        totalTime: Date.now() - startTime,
      };
    }
  }

  logger.info('Cache miss for log, fetching from database', { logId: matchId });

  // Step 2: Get log metadata
  const logApiExistsQuery = 'SELECT logid, map, title FROM logs WHERE logid = $1';
  const logApiExistsResult = await pool.query(logApiExistsQuery, [matchId]);

  let logsApiResponse;
  if (logApiExistsResult.rows.length > 0) {
    logsApiResponse = logApiExistsResult.rows[0];
  } else {
    // Fallback to logs.tf API
    logger.info('Log not in database, fetching from logs.tf API', { logId: matchId });
    const externalApiResponse = await fetch(
      `https://logs.tf/api/v1/log/${matchId}`
    );
    logsApiResponse = await externalApiResponse.json();
  }

  // Step 3: Get raw log data
  const rawLogExistsQuery = 'SELECT raw_log FROM logcache WHERE logid = $1';
  const rawLogExistsResult = await pool.query(rawLogExistsQuery, [matchId]);

  let buffer;
  let source = 'database';

  if (rawLogExistsResult.rows.length > 0) {
    buffer = rawLogExistsResult.rows[0].raw_log;
    logger.info('Raw log found in database', { logId: matchId });
  } else {
    // Fetch from logs.tf
    logger.info('Raw log not in database, fetching from logs.tf', { logId: matchId });
    buffer = await fetch(
      `http://logs.tf/logs/log_${matchId}.log.zip`,
      FetchResultTypes.Buffer
    );
    source = 'logs.tf';

    // Cache the raw log
    const insertQuery =
      'INSERT INTO logcache(logid, insert_date, raw_log) VALUES($1, $2, $3)';
    await pool.query(insertQuery, [matchId, Date.now(), buffer]);
    logger.info('Cached raw log in database', { logId: matchId });
  }

  // Step 4: Unzip log
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();
  const textFile = zipEntries[0].getData().toString('utf8');

  logger.info('Unzipped log file', {
    logId: matchId,
    size: textFile.length,
    lines: textFile.split('\n').length,
  });

  // Step 5: Parse with v2 parser
  const parseResult = await parseLog(textFile, {
    logId: matchId,
    map: logsApiResponse.map || logsApiResponse.info?.map,
    title: logsApiResponse.title || logsApiResponse.info?.title,
  });

  if (!parseResult.success || !parseResult.data) {
    logger.error('Parse failed', {
      logId: matchId,
      errors: parseResult.errors,
    });

    throw new Error(JSON.stringify({
      errorCode: 500,
      message: 'Failed to parse log',
      errors: parseResult.errors,
      warnings: parseResult.warnings,
    }));
  }

  // Step 6: Cache parsed result
  if (redisCache) {
    await setCachedLog(redisCache, matchId, parseResult.data);
    logger.info('Cached parsed log', { logId: matchId });
  }

  const totalTime = Date.now() - startTime;
  logger.info('Successfully parsed log', {
    logId: matchId,
    parseTime: parseResult.metadata.parseTime,
    totalTime,
    source,
  });

  return {
    data: parseResult.data,
    source,
    totalTime,
  };
}

/**
 * GET /v2/log/:id
 * Parse a TF2 log using the new parser v2 (full response)
 */
router.get('/log/:id', async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  // Validate log ID
  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad logs ID',
      error: 'Bad Request',
    });
  }

  try {
    const { data, source, totalTime } = await getParsedLog(matchId);

    return res.json({
      ...data,
      parserMetadata: {
        ...data.parserMetadata,
        source,
        totalTime,
      },
    });
  } catch (error) {
    logger.error('Error processing log request', {
      error: error.message,
      stack: error.stack,
      logId: matchId,
    });

    // Try to parse error as JSON (from parse failures)
    try {
      const errorData = JSON.parse(error.message);
      return res.status(errorData.errorCode || 500).json(errorData);
    } catch {
      return res.status(500).json({
        errorCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
});

/**
 * GET /v2/log/:id/summary
 * Get only the summary section
 */
router.get('/log/:id/summary', async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad logs ID',
      error: 'Bad Request',
    });
  }

  try {
    const { data, source, totalTime } = await getParsedLog(matchId);

    return res.json({
      summary: data.summary,
      playerNames: data.playerNames,
      parserMetadata: {
        source,
        totalTime,
        section: 'summary',
      },
    });
  } catch (error) {
    logger.error('Error processing summary request', {
      error: error.message,
      stack: error.stack,
      logId: matchId,
    });

    try {
      const errorData = JSON.parse(error.message);
      return res.status(errorData.errorCode || 500).json(errorData);
    } catch {
      return res.status(500).json({
        errorCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
});

/**
 * GET /v2/log/:id/timebased
 * Get only the time-based data section
 */
router.get('/log/:id/timebased', async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad logs ID',
      error: 'Bad Request',
    });
  }

  try {
    const { data, source, totalTime } = await getParsedLog(matchId);

    return res.json({
      timeBasedData: data.timeBasedData,
      playerNames: data.playerNames,
      parserMetadata: {
        source,
        totalTime,
        section: 'timebased',
      },
    });
  } catch (error) {
    logger.error('Error processing timebased request', {
      error: error.message,
      stack: error.stack,
      logId: matchId,
    });

    try {
      const errorData = JSON.parse(error.message);
      return res.status(errorData.errorCode || 500).json(errorData);
    } catch {
      return res.status(500).json({
        errorCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
});

/**
 * GET /v2/log/:id/gametotals
 * Get only the game totals section
 */
router.get('/log/:id/gametotals', async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad logs ID',
      error: 'Bad Request',
    });
  }

  try {
    const { data, source, totalTime } = await getParsedLog(matchId);

    return res.json({
      gameTotals: data.gameTotals,
      playerNames: data.playerNames,
      parserMetadata: {
        source,
        totalTime,
        section: 'gametotals',
      },
    });
  } catch (error) {
    logger.error('Error processing gametotals request', {
      error: error.message,
      stack: error.stack,
      logId: matchId,
    });

    try {
      const errorData = JSON.parse(error.message);
      return res.status(errorData.errorCode || 500).json(errorData);
    } catch {
      return res.status(500).json({
        errorCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
});

/**
 * GET /v2/log/:id/matchups
 * Get only the matchup stats section
 */
router.get('/log/:id/matchups', async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad logs ID',
      error: 'Bad Request',
    });
  }

  try {
    const { data, source, totalTime } = await getParsedLog(matchId);

    return res.json({
      matchups: data.matchups,
      playerNames: data.playerNames,
      parserMetadata: {
        source,
        totalTime,
        section: 'matchups',
      },
    });
  } catch (error) {
    logger.error('Error processing matchups request', {
      error: error.message,
      stack: error.stack,
      logId: matchId,
    });

    try {
      const errorData = JSON.parse(error.message);
      return res.status(errorData.errorCode || 500).json(errorData);
    } catch {
      return res.status(500).json({
        errorCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
});

/**
 * GET /v2/log/:id/otherdata
 * Get only the other data section (players, rounds, chat, ubers, killstreaks)
 */
router.get('/log/:id/otherdata', async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({
      errorCode: 400,
      message: 'Bad logs ID',
      error: 'Bad Request',
    });
  }

  try {
    const { data, source, totalTime } = await getParsedLog(matchId);

    return res.json({
      otherData: data.otherData,
      playerNames: data.playerNames,
      parserMetadata: {
        source,
        totalTime,
        section: 'otherdata',
      },
    });
  } catch (error) {
    logger.error('Error processing otherdata request', {
      error: error.message,
      stack: error.stack,
      logId: matchId,
    });

    try {
      const errorData = JSON.parse(error.message);
      return res.status(errorData.errorCode || 500).json(errorData);
    } catch {
      return res.status(500).json({
        errorCode: 500,
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
});

module.exports = {
  router,
  setRedisCache,
};
