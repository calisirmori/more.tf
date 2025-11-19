/**
 * Test parser V2 against multiple random logs from logs.tf
 * Usage: node parser-v2/test-multiple-logs.js
 */

const https = require('https');
const { parseLog } = require('./dist/index');
const AdmZip = require('adm-zip');

// Generate random log IDs between 3000000 and 4000000
function generateRandomLogIds(count) {
  const ids = [];
  for (let i = 0; i < count; i++) {
    const id = Math.floor(Math.random() * 1000000) + 3000000;
    ids.push(id);
  }
  return ids;
}

function fetchLogTfData(logId) {
  return new Promise((resolve, reject) => {
    https.get(`https://logs.tf/api/v1/log/${logId}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function fetchRawLog(logId) {
  return new Promise((resolve, reject) => {
    https.get(`https://logs.tf/logs/log_${logId}.log.zip`, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const zip = new AdmZip(buffer);
          const zipEntries = zip.getEntries();
          const textFile = zipEntries[0].getData().toString('utf8');
          resolve(textFile);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function testLog(logId) {
  try {
    console.log(`\n📥 Fetching log ${logId}...`);

    // Fetch logs.tf data
    const logTfData = await fetchLogTfData(logId);

    // Fetch raw log
    const rawLog = await fetchRawLog(logId);

    // Parse with our parser
    const parseResult = await parseLog(rawLog, {
      logId: logId,
      map: logTfData.info?.map || logTfData.map,
      title: logTfData.info?.title || logTfData.title,
    });

    if (!parseResult.success || !parseResult.data) {
      console.log(`❌ Log ${logId}: Parse failed`);
      return null;
    }

    const ourData = parseResult.data;

    // Compare
    const comparison = {
      logId,
      map: ourData.info.map,
      duration: {
        ours: Math.floor(ourData.info.matchLength),
        theirs: logTfData.length,
        match: Math.abs(ourData.info.matchLength - logTfData.length) <= 1,
      },
      redKills: {
        ours: ourData.teams.red.kills,
        theirs: logTfData.teams.Red.kills,
        diff: ourData.teams.red.kills - logTfData.teams.Red.kills,
        match: ourData.teams.red.kills === logTfData.teams.Red.kills,
      },
      blueKills: {
        ours: ourData.teams.blue.kills,
        theirs: logTfData.teams.Blue.kills,
        diff: ourData.teams.blue.kills - logTfData.teams.Blue.kills,
        match: ourData.teams.blue.kills === logTfData.teams.Blue.kills,
      },
      redDamage: {
        ours: ourData.teams.red.damage,
        theirs: logTfData.teams.Red.dmg,
        diff: ourData.teams.red.damage - logTfData.teams.Red.dmg,
        match: ourData.teams.red.damage === logTfData.teams.Red.dmg,
      },
      blueDamage: {
        ours: ourData.teams.blue.damage,
        theirs: logTfData.teams.Blue.dmg,
        diff: ourData.teams.blue.damage - logTfData.teams.Blue.dmg,
        match: ourData.teams.blue.damage === logTfData.teams.Blue.dmg,
      },
    };

    console.log(`✅ Log ${logId}: ${comparison.map}`);
    console.log(`   Duration: ${comparison.duration.ours}s vs ${comparison.duration.theirs}s ${comparison.duration.match ? '✅' : '❌'}`);
    console.log(`   Red Kills: ${comparison.redKills.ours} vs ${comparison.redKills.theirs} (${comparison.redKills.diff >= 0 ? '+' : ''}${comparison.redKills.diff}) ${comparison.redKills.match ? '✅' : '❌'}`);
    console.log(`   Blue Kills: ${comparison.blueKills.ours} vs ${comparison.blueKills.theirs} (${comparison.blueKills.diff >= 0 ? '+' : ''}${comparison.blueKills.diff}) ${comparison.blueKills.match ? '✅' : '❌'}`);
    console.log(`   Red Damage: ${comparison.redDamage.ours} vs ${comparison.redDamage.theirs} (${comparison.redDamage.diff >= 0 ? '+' : ''}${comparison.redDamage.diff}) ${comparison.redDamage.match ? '✅' : '❌'}`);
    console.log(`   Blue Damage: ${comparison.blueDamage.ours} vs ${comparison.blueDamage.theirs} (${comparison.blueDamage.diff >= 0 ? '+' : ''}${comparison.blueDamage.diff}) ${comparison.blueDamage.match ? '✅' : '❌'}`);

    return comparison;
  } catch (err) {
    console.log(`❌ Log ${logId}: Error - ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🧪 Testing Parser V2 with 10 Random Logs\n');

  const logIds = generateRandomLogIds(10);
  console.log('Testing logs:', logIds.join(', '));

  const results = [];

  for (const logId of logIds) {
    const result = await testLog(logId);
    if (result) {
      results.push(result);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n📊 SUMMARY\n');
  console.log(`Successfully parsed: ${results.length}/${logIds.length} logs\n`);

  if (results.length === 0) {
    console.log('No successful parses to analyze.');
    return;
  }

  const durationMatches = results.filter(r => r.duration.match).length;
  const redKillMatches = results.filter(r => r.redKills.match).length;
  const blueKillMatches = results.filter(r => r.blueKills.match).length;
  const redDamageMatches = results.filter(r => r.redDamage.match).length;
  const blueDamageMatches = results.filter(r => r.blueDamage.match).length;

  console.log(`Duration matches: ${durationMatches}/${results.length} (${Math.round(durationMatches/results.length*100)}%)`);
  console.log(`Red Kill matches: ${redKillMatches}/${results.length} (${Math.round(redKillMatches/results.length*100)}%)`);
  console.log(`Blue Kill matches: ${blueKillMatches}/${results.length} (${Math.round(blueKillMatches/results.length*100)}%)`);
  console.log(`Red Damage matches: ${redDamageMatches}/${results.length} (${Math.round(redDamageMatches/results.length*100)}%)`);
  console.log(`Blue Damage matches: ${blueDamageMatches}/${results.length} (${Math.round(blueDamageMatches/results.length*100)}%)`);

  // Kill difference analysis
  const redKillDiffs = results.map(r => r.redKills.diff);
  const blueKillDiffs = results.map(r => r.blueKills.diff);
  const avgRedKillDiff = redKillDiffs.reduce((a, b) => a + b, 0) / redKillDiffs.length;
  const avgBlueKillDiff = blueKillDiffs.reduce((a, b) => a + b, 0) / blueKillDiffs.length;

  console.log(`\nAverage Red Kill Difference: ${avgRedKillDiff >= 0 ? '+' : ''}${avgRedKillDiff.toFixed(1)}`);
  console.log(`Average Blue Kill Difference: ${avgBlueKillDiff >= 0 ? '+' : ''}${avgBlueKillDiff.toFixed(1)}`);

  // Damage difference analysis
  const redDamageDiffs = results.map(r => r.redDamage.diff);
  const blueDamageDiffs = results.map(r => r.blueDamage.diff);
  const avgRedDamageDiff = redDamageDiffs.reduce((a, b) => a + b, 0) / redDamageDiffs.length;
  const avgBlueDamageDiff = blueDamageDiffs.reduce((a, b) => a + b, 0) / blueDamageDiffs.length;

  console.log(`\nAverage Red Damage Difference: ${avgRedDamageDiff >= 0 ? '+' : ''}${avgRedDamageDiff.toFixed(1)}`);
  console.log(`Average Blue Damage Difference: ${avgBlueDamageDiff >= 0 ? '+' : ''}${avgBlueDamageDiff.toFixed(1)}`);

  console.log('\n✅ Test Complete\n');
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
