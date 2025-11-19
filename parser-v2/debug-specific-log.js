/**
 * Debug a specific log to understand discrepancies
 * Usage: node parser-v2/debug-specific-log.js <logId>
 */

const https = require('https');
const { parseLog } = require('./dist/index');
const AdmZip = require('adm-zip');

const logId = process.argv[2] || '3760787';

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

async function debug() {
  console.log(`\n🔍 Debugging log ${logId}\n`);

  // Fetch logs.tf data
  const logTfData = await fetchLogTfData(logId);
  console.log('logs.tf data:');
  console.log(`  Map: ${logTfData.info?.map || logTfData.map}`);
  console.log(`  Title: ${logTfData.info?.title || logTfData.title}`);
  console.log(`  Duration: ${logTfData.length}s`);
  console.log(`  Red Kills: ${logTfData.teams.Red.kills}`);
  console.log(`  Blue Kills: ${logTfData.teams.Blue.kills}`);
  console.log(`  Rounds: ${logTfData.rounds ? logTfData.rounds.length : 'N/A'}`);

  // Fetch raw log
  console.log(`\n📥 Fetching raw log...`);
  const rawLog = await fetchRawLog(logId);
  const lines = rawLog.split('\n');
  console.log(`  Total lines: ${lines.length}`);

  // Parse with our parser
  console.log(`\n⚙️  Parsing...`);
  const parseResult = await parseLog(rawLog, {
    logId: parseInt(logId),
    map: logTfData.info?.map || logTfData.map,
    title: logTfData.info?.title || logTfData.title,
  });

  if (!parseResult.success || !parseResult.data) {
    console.log(`❌ Parse failed`);
    console.log('Errors:', parseResult.errors);
    return;
  }

  const ourData = parseResult.data;

  console.log('\nOur parser data:');
  console.log(`  Duration: ${Math.floor(ourData.info.matchLength)}s`);
  console.log(`  Red Kills: ${ourData.teams.red.kills}`);
  console.log(`  Blue Kills: ${ourData.teams.blue.kills}`);
  console.log(`  Red Damage: ${ourData.teams.red.damage}`);
  console.log(`  Blue Damage: ${ourData.teams.blue.damage}`);
  console.log(`  Rounds: ${ourData.rounds.length}`);
  console.log(`  Events: ${ourData.events.length}`);

  // Analyze rounds
  console.log('\n📊 Round Analysis:');
  ourData.rounds.forEach(round => {
    const roundKills = round.teamScores.red.kills + round.teamScores.blue.kills;
    console.log(`  Round ${round.roundNumber}: ${round.roundDuration}s, ${roundKills} kills, winner: ${round.winner}`);
  });

  // Check for Round_Start events
  const roundStarts = ourData.events.filter(e => e.type === 'round_start');
  const roundWins = ourData.events.filter(e => e.type === 'round_win');
  console.log(`\n🎮 Round Events:`);
  console.log(`  Round_Start events: ${roundStarts.length}`);
  console.log(`  Round_Win events: ${roundWins.length}`);

  // Check kill event distribution
  const killEvents = ourData.events.filter(e => e.type === 'kill');
  console.log(`\n⚔️  Kill Events:`);
  console.log(`  Total kill events: ${killEvents.length}`);
  console.log(`  Team kill totals: Red=${ourData.teams.red.kills} Blue=${ourData.teams.blue.kills}`);
  console.log(`  Difference: ${killEvents.length - (ourData.teams.red.kills + ourData.teams.blue.kills)} kills not counted in teams`);

  // logs.tf comparison
  console.log(`\n📈 Comparison:`);
  console.log(`  Red Kills: ${ourData.teams.red.kills} vs ${logTfData.teams.Red.kills} (${ourData.teams.red.kills - logTfData.teams.Red.kills >= 0 ? '+' : ''}${ourData.teams.red.kills - logTfData.teams.Red.kills})`);
  console.log(`  Blue Kills: ${ourData.teams.blue.kills} vs ${logTfData.teams.Blue.kills} (${ourData.teams.blue.kills - logTfData.teams.Blue.kills >= 0 ? '+' : ''}${ourData.teams.blue.kills - logTfData.teams.Blue.kills})`);
  console.log(`  Red Damage: ${ourData.teams.red.damage} vs ${logTfData.teams.Red.dmg} (${ourData.teams.red.damage - logTfData.teams.Red.dmg >= 0 ? '+' : ''}${ourData.teams.red.damage - logTfData.teams.Red.dmg})`);
  console.log(`  Blue Damage: ${ourData.teams.blue.damage} vs ${logTfData.teams.Blue.dmg} (${ourData.teams.blue.damage - logTfData.teams.Blue.dmg >= 0 ? '+' : ''}${ourData.teams.blue.damage - logTfData.teams.Blue.dmg})`);
}

debug().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
