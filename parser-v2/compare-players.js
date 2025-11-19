const https = require('https');
const { parseLog } = require('./dist/index');
const AdmZip = require('adm-zip');

const logId = process.argv[2] || '3736413';

// Fetch from both sources
Promise.all([
  new Promise((resolve) => {
    https.get(`https://logs.tf/api/v1/log/${logId}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  }),
  new Promise((resolve) => {
    https.get(`https://logs.tf/logs/log_${logId}.log.zip`, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();
        const textFile = zipEntries[0].getData().toString('utf8');

        const parseResult = await parseLog(textFile, {
          logId: parseInt(logId),
          map: 'unknown',
          title: 'test'
        });
        resolve(parseResult.data);
      });
    });
  })
]).then(([logsTf, ourData]) => {
  console.log(`\n🔍 Comparing player kills for log ${logId}\n`);

  // Build a comparison by steam ID (using ID3 format for consistency)
  const redKillsLogsTf = {};
  const blueKillsLogsTf = {};

  for (const [steamId3, playerData] of Object.entries(logsTf.players)) {
    if (playerData.team === 'Red') {
      redKillsLogsTf[steamId3] = playerData.kills;
    } else if (playerData.team === 'Blue') {
      blueKillsLogsTf[steamId3] = playerData.kills;
    }
  }

  const redKillsOurs = {};
  const blueKillsOurs = {};

  for (const [steamId64, playerData] of Object.entries(ourData.players)) {
    const steamId3 = playerData.steamId.id3;
    if (playerData.team === 'red') {
      redKillsOurs[steamId3] = playerData.kills;
    } else if (playerData.team === 'blue') {
      blueKillsOurs[steamId3] = playerData.kills;
    }
  }

  // Find differences
  console.log('Red team kill differences:');
  let redDiff = 0;
  let foundRedDiff = false;
  for (const steamId3 in redKillsLogsTf) {
    const theirs = redKillsLogsTf[steamId3];
    const ours = redKillsOurs[steamId3] || 0;
    if (theirs !== ours) {
      // Find player name from ourData
      let playerName = 'Unknown';
      for (const [steamId64, playerData] of Object.entries(ourData.players)) {
        if (playerData.steamId.id3 === steamId3) {
          playerName = playerData.userName;
          break;
        }
      }
      console.log(`  ${playerName} (${steamId3}): logs.tf=${theirs} ours=${ours} (diff: ${ours - theirs})`);
      redDiff += (ours - theirs);
      foundRedDiff = true;
    }
  }
  if (!foundRedDiff) {
    console.log('  No differences found');
  }
  console.log('Total Red diff:', redDiff);

  console.log('');
  console.log('Blue team kill differences:');
  let blueDiff = 0;
  let foundBlueDiff = false;
  for (const steamId3 in blueKillsLogsTf) {
    const theirs = blueKillsLogsTf[steamId3];
    const ours = blueKillsOurs[steamId3] || 0;
    if (theirs !== ours) {
      // Find player name from ourData
      let playerName = 'Unknown';
      for (const [steamId64, playerData] of Object.entries(ourData.players)) {
        if (playerData.steamId.id3 === steamId3) {
          playerName = playerData.userName;
          break;
        }
      }
      console.log(`  ${playerName} (${steamId3}): logs.tf=${theirs} ours=${ours} (diff: ${ours - theirs})`);
      blueDiff += (ours - theirs);
      foundBlueDiff = true;
    }
  }
  if (!foundBlueDiff) {
    console.log('  No differences found');
  }
  console.log('Total Blue diff:', blueDiff);
}).catch(err => {
  console.error('Error:', err);
});
