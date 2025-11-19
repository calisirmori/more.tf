/**
 * Quick test script for parser v2
 * Usage: node parser-v2/test-parser.js
 */

const fs = require('fs');
const path = require('path');
const { parseLog } = require('./dist/index');

async function testParser() {
  console.log('🧪 Testing Parser V2...\n');

  // Read sample log
  const logPath = path.join(__dirname, 'tests/fixtures/log_3966472.log');
  console.log(`📖 Reading log file: ${logPath}`);

  const logContent = fs.readFileSync(logPath, 'utf8');
  const lines = logContent.split('\n').length;
  const size = (logContent.length / 1024).toFixed(2);

  console.log(`   Lines: ${lines}`);
  console.log(`   Size: ${size} KB\n`);

  // Parse
  console.log('⚙️  Parsing...');
  const startTime = Date.now();

  const result = await parseLog(logContent, {
    logId: 3966472,
    map: 'koth_product_final',
    title: 'Test Match',
  });

  const parseTime = Date.now() - startTime;

  // Results
  console.log(`\n✨ Parse Complete!`);
  console.log(`   Time: ${parseTime}ms`);
  console.log(`   Success: ${result.success}`);

  if (result.success && result.data) {
    console.log(`\n📊 Match Info:`);
    console.log(`   Log ID: ${result.data.info.logId}`);
    console.log(`   Map: ${result.data.info.map}`);
    console.log(`   Duration: ${(result.data.info.matchLength / 60).toFixed(1)} minutes`);
    console.log(`   Winner: ${result.data.info.winner}`);
    console.log(`   Red Score: ${result.data.teams.red.score}`);
    console.log(`   Blue Score: ${result.data.teams.blue.score}`);

    console.log(`\n👥 Players: ${Object.keys(result.data.players).length}`);
    console.log(`🎮 Rounds: ${result.data.rounds.length}`);
    console.log(`📝 Events: ${result.data.events.length}`);
    console.log(`💬 Chat Messages: ${result.data.chat.length}`);

    console.log(`\n⚡ Performance:`);
    console.log(`   Lines Processed: ${result.metadata.linesProcessed}`);
    console.log(`   Events/Second: ${(result.data.events.length / (parseTime / 1000)).toFixed(0)}`);
    console.log(`   Lines/Second: ${(result.metadata.linesProcessed / (parseTime / 1000)).toFixed(0)}`);

    // Show top 3 players by damage
    const playerArray = Object.entries(result.data.players)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.damage - a.damage)
      .slice(0, 3);

    console.log(`\n🏆 Top 3 Players (by damage):`);
    playerArray.forEach((player, i) => {
      console.log(`   ${i + 1}. ${player.userName}: ${player.damage} damage (${player.kills}K/${player.deaths}D)`);
    });

    // Show errors/warnings
    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors: ${result.errors.length}`);
      result.errors.slice(0, 3).forEach(err => {
        console.log(`   - ${err.level}: ${err.message}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${result.warnings.length}`);
      result.warnings.slice(0, 3).forEach(warn => {
        console.log(`   - ${warn.message}`);
      });
    }

    // Save output for inspection
    const outputPath = path.join(__dirname, 'test-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2));
    console.log(`\n💾 Full output saved to: ${outputPath}`);

  } else {
    console.error(`\n❌ Parse Failed!`);
    console.error(`   Errors: ${result.errors.length}`);
    result.errors.forEach(err => {
      console.error(`   - ${err.level}: ${err.message}`);
    });
  }

  console.log(`\n✅ Test Complete\n`);
}

testParser().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
