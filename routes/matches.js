const express = require('express');
const router = express.Router();
const AdmZip = require('adm-zip');
const { fetch, FetchResultTypes } = require('@sapphire/fetch');
const parser = require('../parser/main.js');
const pool = require('../config/database');
const logger = require('../utils/logger');

// Match history and log routes
router.get(
  '/match-history/:id&class-played=:classPlayed&map=:map&after=:after&format=:format&order=:order&limit=:limit',
  (req, response) => {
    const playerId = req.params.id;
    const classSearched =
      req.params.classPlayed === 'none'
        ? 'class'
        : "'" + req.params.classPlayed + "'";
    const mapSearched = req.params.map === 'none' ? '' : req.params.map;
    const dateAfter = req.params.after === 'none' ? '0' : req.params.after;
    const format =
      req.params.format === 'none' ? 'format' : "'" + req.params.format + "'";
    const orderBy = req.params.order === 'none' ? 'date' : req.params.order;
    const limit = req.params.limit === 'none' ? '10000' : req.params.limit;

    pool
      .query(
        `select * from
  (select id64,kills,assists,deaths,dpm,dtm,heals,map,date,match_length,class,title,match_result,format,logs.logid from logs
  left join players on players.logid=logs.logid) as T1
  where id64=${playerId} and class=${classSearched} and map like '%${mapSearched}%' and date > ${dateAfter} and format=${format}
  order by ${orderBy} desc
  limit ${limit}`
      )

      .then((res) => response.send(res))
      .catch((err) => {
        logger.error('Match history query error', {
          error: err.message,
          playerId,
        });
        response
          .status(500)
          .json({ error: 'An internal server error occurred' });
      });
  }
);

router.get('/log-search/:id', (req, response) => {
  let logID = req.params.id;

  pool
    .query(`SELECT * FROM logs WHERE logid=${logID}`)
    .then((res) => response.send(res))
    .catch((err) => {
      logger.error('Log search query error', { error: err.message, logID });
      response.status(500).json({ error: 'An internal server error occurred' });
    });
});

router.post('/upload', (req, res) => {
  // Assuming the request body will have title, map, key, uploader, and optionally updatelog
  const { title, map, key, uploader, updatelog } = req.body;

  // Log upload info
  logger.info('Upload received', {
    title,
    map,
    uploader,
    hasUpdateLog: !!updatelog,
  });

  // Respond to the client
  res.json({
    message: 'Information received',
    data: req.body,
  });
});

router.get('/log/:id', async (req, res) => {
  let matchId = req.params.id;
  matchId = parseInt(matchId);

  if (isNaN(matchId) || matchId > Number.MAX_SAFE_INTEGER) {
    return res
      .status(400)
      .json({ errorCode: 400, message: 'Bad logs ID', error: 'Bad Request' });
  }

  // Check if the log information exists in the logs table
  const logApiExistsQuery =
    'SELECT logid, map, title FROM logs WHERE logid = $1';
  const logApiExistsValues = [matchId];

  try {
    // Attempt to get log metadata from your database
    const logApiExistsResult = await pool.query(
      logApiExistsQuery,
      logApiExistsValues
    );
    let logsApiResponse;

    if (logApiExistsResult.rows.length > 0) {
      // Metadata exists in the logs table, use it
      logsApiResponse = logApiExistsResult.rows[0];
    } else {
      // Metadata does not exist in the logs table, fetch from logs.tf API
      const externalApiResponse = await fetch(
        `https://logs.tf/api/v1/log/${matchId}`
      );
      logsApiResponse = await externalApiResponse.json();
    }

    // Check if the raw log data exists in your logcache table
    const rawLogExistsQuery = 'SELECT raw_log FROM logcache WHERE logid = $1';
    const rawLogExistsResult = await pool.query(
      rawLogExistsQuery,
      logApiExistsValues
    );

    if (rawLogExistsResult.rows.length > 0) {
      // Raw log data exists, parse and respond
      const rawLogData = rawLogExistsResult.rows[0].raw_log;
      const zip = new AdmZip(rawLogData);
      const zipEntries = zip.getEntries();
      const textFile = zipEntries[0].getData().toString('utf8');
      const parsedData = await parser.parse(textFile, matchId, logsApiResponse);
      return res.json({ ...parsedData, source: 'database' });
    }

    // Raw log data does not exist, fetch the raw logs from logs.tf
    const buffer = await fetch(
      `http://logs.tf/logs/log_${matchId}.log.zip`,
      FetchResultTypes.Buffer
    );
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const textFile = zipEntries[0].getData().toString('utf8');

    const insertDate = Date.now(); // Current timestamp in milliseconds
    const insertQuery =
      'INSERT INTO logcache(logid, insert_date, raw_log) VALUES($1, $2, $3)';
    const values = [matchId, insertDate, buffer];

    await pool.query(insertQuery, values);

    // Parse the fetched logs and respond
    const parsedData = await parser.parse(textFile, matchId, logsApiResponse);
    return res.json({ ...parsedData, source: 'logs.tf' });
  } catch (error) {
    logger.error('Log fetch error', { error: error.message, logId: matchId });
    res.status(500).json({ errorCode: 500, message: 'Internal Server Error' });
  }
});

module.exports = router;
