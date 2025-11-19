const express = require('express');
const router = express.Router();
const { fetch, FetchResultTypes, FetchMethods } = require('@sapphire/fetch');
const logger = require('../utils/logger');

// External API routes
router.get('/steam-info', async (req, res) => {
  await SteamAPICall(req, res);
});

async function SteamAPICall(req, res, maxRetries = 5, attemptNumber = 1) {
  const userIds = req.query.ids;

  if (!userIds) {
    return res.status(400).send('No IDs provided');
  }
  const URL = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAMKEY}&steamids=${userIds}`;

  try {
    const logsApiResponse = await fetch(URL, FetchResultTypes.JSON);
    res.send(logsApiResponse);
  } catch (error) {
    if (attemptNumber >= maxRetries) {
      logger.error('Steam API call failed', {
        error: error.message,
        attemptNumber,
      });
      res.status(500).send('steam error');
    } else {
      const delayInSeconds = Math.pow(1.2, attemptNumber);
      const variance = 0.3; // 20% variance (10% in either direction)
      const randomFactor = 1 - variance / 2 + Math.random() * variance; // This will generate a number between 0.9 and 1.1
      const randomizedDelayInSeconds = delayInSeconds * randomFactor;
      await new Promise((resolve) =>
        setTimeout(resolve, randomizedDelayInSeconds * 1000)
      );
      await SteamAPICall(req, res, maxRetries, attemptNumber + 1);
    }
  }
}

router.get('/rgl-profile/:id', async (req, res) => {
  const userId = req.params.id;
  var URL = `https://api.rgl.gg/v0/profile/${userId}`;
  try {
    const logsApiResponse = await fetch(URL, FetchResultTypes.JSON);
    res.send(logsApiResponse);
  } catch (error) {
    logger.error('RGL profile fetch error', { error: error.message, userId });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

router.post('/rgl-profile-bulk', async (req, res) => {
  try {
    const rglApiResponse = await fetch(
      'https://api.rgl.gg/v0/profile/getmany',
      {
        method: FetchMethods.Post,
        body: req.body,
      },
      FetchResultTypes.JSON
    );
    res.send(rglApiResponse);
  } catch (error) {
    logger.error('RGL profile bulk fetch error', { error: error.message });
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;
