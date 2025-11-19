/**
 * Compare Parser V2 output with logs.tf official API
 * Usage: node parser-v2/compare-with-logtf.js [logId]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const logId = process.argv[2] || '3966472';

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

async function compare() {
  console.log(`\n🔍 Comparing Parser V2 output with logs.tf for log ${logId}\n`);

  // Load our parser output
  const ourOutputPath = path.join(__dirname, 'test-output.json');
  if (!fs.existsSync(ourOutputPath)) {
    console.error('❌ No test output found. Run test-parser.js first!');
    process.exit(1);
  }

  const ourData = JSON.parse(fs.readFileSync(ourOutputPath, 'utf8'));

  // Fetch logs.tf data
  console.log('📥 Fetching logs.tf data...');
  const logTfData = await fetchLogTfData(logId);
  console.log('✅ Fetched logs.tf data\n');

  // Compare basic match info
  console.log('📊 MATCH INFO COMPARISON\n');
  console.log('Field              Ours              logs.tf           Match?');
  console.log('─'.repeat(70));

  const duration = Math.floor(ourData.info.matchLength);
  console.log(`Duration (s)       ${duration.toString().padEnd(18)}${logTfData.length.toString().padEnd(18)}${duration === logTfData.length ? '✅' : '❌'}`);

  console.log(`Map                ${ourData.info.map.padEnd(18)}${logTfData.info.map.padEnd(18)}${ourData.info.map === logTfData.info.map ? '✅' : '❌'}`);

  // Compare team scores
  console.log('\n🏆 TEAM SCORES\n');
  console.log('Team               Ours              logs.tf           Match?');
  console.log('─'.repeat(70));

  const ourRedScore = ourData.teams.red.score;
  const ourBlueScore = ourData.teams.blue.score;
  const logTfRedScore = logTfData.teams.Red.score;
  const logTfBlueScore = logTfData.teams.Blue.score;

  console.log(`Red Score          ${ourRedScore.toString().padEnd(18)}${logTfRedScore.toString().padEnd(18)}${ourRedScore === logTfRedScore ? '✅' : '❌'}`);
  console.log(`Blue Score         ${ourBlueScore.toString().padEnd(18)}${logTfBlueScore.toString().padEnd(18)}${ourBlueScore === logTfBlueScore ? '✅' : '❌'}`);

  // Compare team stats
  console.log('\n📈 TEAM STATS\n');
  console.log('Stat               Red (Ours)        Red (logs.tf)     Match?');
  console.log('─'.repeat(70));

  const redStats = [
    ['Kills', ourData.teams.red.kills, logTfData.teams.Red.kills],
    ['Damage', ourData.teams.red.damage, logTfData.teams.Red.dmg],
    ['Charges', ourData.teams.red.charges, logTfData.teams.Red.charges],
    ['Drops', ourData.teams.red.drops, logTfData.teams.Red.drops],
    ['Caps', ourData.teams.red.caps, logTfData.teams.Red.caps],
    ['First Caps', ourData.teams.red.firstcaps, logTfData.teams.Red.firstcaps],
  ];

  redStats.forEach(([name, ours, theirs]) => {
    const match = ours === theirs ? '✅' : '❌';
    console.log(`${name.padEnd(19)}${ours.toString().padEnd(18)}${theirs.toString().padEnd(18)}${match}`);
  });

  console.log('\nStat               Blue (Ours)       Blue (logs.tf)    Match?');
  console.log('─'.repeat(70));

  const blueStats = [
    ['Kills', ourData.teams.blue.kills, logTfData.teams.Blue.kills],
    ['Damage', ourData.teams.blue.damage, logTfData.teams.Blue.dmg],
    ['Charges', ourData.teams.blue.charges, logTfData.teams.Blue.charges],
    ['Drops', ourData.teams.blue.drops, logTfData.teams.Blue.drops],
    ['Caps', ourData.teams.blue.caps, logTfData.teams.Blue.caps],
    ['First Caps', ourData.teams.blue.firstcaps, logTfData.teams.Blue.firstcaps],
  ];

  blueStats.forEach(([name, ours, theirs]) => {
    const match = ours === theirs ? '✅' : '❌';
    console.log(`${name.padEnd(19)}${ours.toString().padEnd(18)}${theirs.toString().padEnd(18)}${match}`);
  });

  // Compare player count
  console.log('\n👥 PLAYER COUNT\n');
  const ourPlayerCount = Object.keys(ourData.players).length;
  const logTfPlayerCount = Object.keys(logTfData.players).length;
  console.log(`Our Parser:        ${ourPlayerCount} players`);
  console.log(`logs.tf:           ${logTfPlayerCount} players`);
  console.log(`Match:             ${ourPlayerCount === logTfPlayerCount ? '✅' : '❌'}\n`);

  // Compare individual player stats for a few key players
  console.log('🎮 SAMPLE PLAYER STATS COMPARISON\n');

  // Find corresponding players (logs.tf uses ID3, we use ID64)
  const logTfPlayers = Object.entries(logTfData.players).slice(0, 3);

  for (const [id3, logTfPlayer] of logTfPlayers) {
    // Convert ID3 to ID64 to find in our data
    const cleanId3 = id3.replace(/\[U:1:(\d+)\]/, '$1');
    const accountId = parseInt(cleanId3);
    const steamId64 = (76561197960265728n + BigInt(accountId)).toString();

    const ourPlayer = ourData.players[steamId64];

    if (!ourPlayer) {
      console.log(`⚠️  Player ${id3} not found in our output`);
      continue;
    }

    console.log(`Player: ${ourPlayer.userName} (${id3})`);
    console.log('Stat               Ours              logs.tf           Match?');
    console.log('─'.repeat(70));

    const playerStats = [
      ['Kills', ourPlayer.kills, logTfPlayer.kills],
      ['Deaths', ourPlayer.deaths, logTfPlayer.deaths],
      ['Assists', ourPlayer.assists, logTfPlayer.assists],
      ['Damage', ourPlayer.damage, logTfPlayer.dmg],
    ];

    playerStats.forEach(([name, ours, theirs]) => {
      const match = ours === theirs ? '✅' : '❌';
      console.log(`${name.padEnd(19)}${ours.toString().padEnd(18)}${theirs.toString().padEnd(18)}${match}`);
    });

    // Check medic stats if applicable
    if (logTfPlayer.ubers > 0) {
      console.log(`Heals              ${ourPlayer.heals.toString().padEnd(18)}${logTfPlayer.heal.toString().padEnd(18)}${ourPlayer.heals === logTfPlayer.heal ? '✅' : '❌'}`);
      console.log(`Ubers              ${ourPlayer.medicStats.ubers.toString().padEnd(18)}${logTfPlayer.ubers.toString().padEnd(18)}${ourPlayer.medicStats.ubers === logTfPlayer.ubers ? '✅' : '❌'}`);
      console.log(`Drops              ${ourPlayer.medicStats.drops.toString().padEnd(18)}${logTfPlayer.drops.toString().padEnd(18)}${ourPlayer.medicStats.drops === logTfPlayer.drops ? '✅' : '❌'}`);
    }

    console.log();
  }

  // Summary
  console.log('\n📝 SUMMARY\n');

  const checks = [
    ['Match Duration', duration === logTfData.length],
    ['Red Score', ourRedScore === logTfRedScore],
    ['Blue Score', ourBlueScore === logTfBlueScore],
    ['Red Kills', ourData.teams.red.kills === logTfData.teams.Red.kills],
    ['Blue Kills', ourData.teams.blue.kills === logTfData.teams.Blue.kills],
    ['Red Damage', ourData.teams.red.damage === logTfData.teams.Red.dmg],
    ['Blue Damage', ourData.teams.blue.damage === logTfData.teams.Blue.dmg],
    ['Player Count', ourPlayerCount === logTfPlayerCount],
  ];

  const passing = checks.filter(([_, pass]) => pass).length;
  const total = checks.length;

  checks.forEach(([name, pass]) => {
    console.log(`${pass ? '✅' : '❌'} ${name}`);
  });

  console.log(`\n${passing}/${total} checks passing (${Math.round(passing/total*100)}%)\n`);

  if (passing === total) {
    console.log('🎉 Perfect match! All core stats align with logs.tf\n');
  } else {
    console.log('⚠️  Some discrepancies found. Review the comparison above.\n');
  }
}

compare().catch(err => {
  console.error('❌ Comparison failed:', err.message);
  process.exit(1);
});
