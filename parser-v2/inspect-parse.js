/**
 * Inspection tool for parsed log output
 * Usage: node parser-v2/inspect-parse.js [section]
 */

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'test-output.json');

if (!fs.existsSync(outputPath)) {
  console.error('❌ No test output found. Run test-parser.js first!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
const section = process.argv[2] || 'summary';

function formatNumber(num) {
  return num.toLocaleString();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

switch (section.toLowerCase()) {
  case 'summary':
  case 'info':
    console.log('\n📊 Match Summary\n');
    console.log(`Log ID:       ${data.info.logId}`);
    console.log(`Map:          ${data.info.map}`);
    console.log(`Title:        ${data.info.title}`);
    console.log(`Duration:     ${formatTime(data.info.matchLength)}`);
    console.log(`Winner:       ${data.info.winner.toUpperCase()}`);
    console.log(`Status:       ${data.info.status}`);
    console.log(`\n🔴 Red Score:  ${data.teams.red.score}`);
    console.log(`🔵 Blue Score: ${data.teams.blue.score}`);
    console.log(`\nPlayers:      ${Object.keys(data.players).length}`);
    console.log(`Rounds:       ${data.rounds.length}`);
    console.log(`Events:       ${formatNumber(data.events.length)}`);
    console.log(`Chat Msgs:    ${data.chat.length}\n`);
    break;

  case 'players':
    console.log('\n👥 Players\n');
    const playerArray = Object.entries(data.players)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.damage - a.damage);

    console.log('Name                  Team    Class      K   D   A   Damage   Heals');
    console.log('─'.repeat(75));
    playerArray.forEach(p => {
      const name = p.userName.padEnd(20).substring(0, 20);
      const team = p.team === 'red' ? '🔴' : p.team === 'blue' ? '🔵' : '⚪';
      const cls = p.primaryClass.padEnd(10).substring(0, 10);
      const k = p.kills.toString().padStart(3);
      const d = p.deaths.toString().padStart(3);
      const a = p.assists.toString().padStart(3);
      const dmg = p.damage.toString().padStart(7);
      const heal = p.heals.toString().padStart(7);
      console.log(`${name} ${team}  ${cls} ${k} ${d} ${a} ${dmg} ${heal}`);
    });
    console.log();
    break;

  case 'rounds':
    console.log('\n🎮 Rounds\n');
    data.rounds.forEach((round, i) => {
      console.log(`Round ${round.roundNumber} - ${formatTime(round.roundDuration)}`);
      console.log(`  Winner:    ${round.winner}`);
      console.log(`  First Cap: ${round.firstCap || 'none'}`);
      console.log(`  Overtime:  ${round.overtime ? 'Yes' : 'No'}`);
      console.log(`  Red:  ${round.teamScores.red.kills} kills, ${round.teamScores.red.damage} damage`);
      console.log(`  Blue: ${round.teamScores.blue.kills} kills, ${round.teamScores.blue.damage} damage`);
      console.log(`  Caps: ${round.captureEvents.length}`);
      console.log();
    });
    break;

  case 'teams':
    console.log('\n🏆 Team Stats\n');
    console.log('🔴 RED TEAM:');
    console.log(`  Score:     ${data.teams.red.score}`);
    console.log(`  Kills:     ${formatNumber(data.teams.red.kills)}`);
    console.log(`  Damage:    ${formatNumber(data.teams.red.damage)}`);
    console.log(`  Heals:     ${formatNumber(data.teams.red.heals)}`);
    console.log(`  Ubers:     ${data.teams.red.charges}`);
    console.log(`  Drops:     ${data.teams.red.drops}`);
    console.log(`  Caps:      ${data.teams.red.caps}`);
    console.log();
    console.log('🔵 BLUE TEAM:');
    console.log(`  Score:     ${data.teams.blue.score}`);
    console.log(`  Kills:     ${formatNumber(data.teams.blue.kills)}`);
    console.log(`  Damage:    ${formatNumber(data.teams.blue.damage)}`);
    console.log(`  Heals:     ${formatNumber(data.teams.blue.heals)}`);
    console.log(`  Ubers:     ${data.teams.blue.charges}`);
    console.log(`  Drops:     ${data.teams.blue.drops}`);
    console.log(`  Caps:      ${data.teams.blue.caps}`);
    console.log();
    break;

  case 'chat':
    console.log('\n💬 Chat Messages\n');
    data.chat.forEach(msg => {
      const player = data.players[msg.steamId64];
      const name = player ? player.userName : 'Unknown';
      const time = new Date(msg.timestamp * 1000).toLocaleTimeString();
      console.log(`[${time}] ${name}: ${msg.message}`);
    });
    console.log();
    break;

  case 'events':
    const eventCounts = {};
    data.events.forEach(e => {
      eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
    });

    console.log('\n📝 Event Breakdown\n');
    const sorted = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1]);

    console.log('Event Type                Count');
    console.log('─'.repeat(40));
    sorted.forEach(([type, count]) => {
      const t = type.padEnd(25);
      const c = count.toString().padStart(7);
      console.log(`${t} ${c}`);
    });
    console.log(`${'─'.repeat(40)}`);
    console.log(`${'TOTAL'.padEnd(25)} ${formatNumber(data.events.length).padStart(7)}`);
    console.log();
    break;

  case 'medics':
    console.log('\n💉 Medic Stats\n');
    const medics = Object.entries(data.players)
      .map(([id, stats]) => ({ id, ...stats }))
      .filter(p => p.medicStats.ubers > 0)
      .sort((a, b) => b.heals - a.heals);

    console.log('Name                  Team   Heals   Ubers  Drops  AvgLength');
    console.log('─'.repeat(65));
    medics.forEach(m => {
      const name = m.userName.padEnd(20).substring(0, 20);
      const team = m.team === 'red' ? '🔴' : '🔵';
      const heals = m.heals.toString().padStart(7);
      const ubers = m.medicStats.ubers.toString().padStart(5);
      const drops = m.medicStats.drops.toString().padStart(5);
      const avg = m.medicStats.averageUberLength.toFixed(1).padStart(8);
      console.log(`${name} ${team}  ${heals} ${ubers} ${drops} ${avg}s`);
    });
    console.log();
    break;

  case 'meta':
  case 'metadata':
    console.log('\n⚙️  Parser Metadata\n');
    console.log(`Version:        ${data.parserMetadata.version}`);
    console.log(`Parse Time:     ${data.parserMetadata.parseTime}ms`);
    console.log(`Lines:          ${formatNumber(data.parserMetadata.linesProcessed)}`);
    console.log(`Events/sec:     ${formatNumber(Math.round(data.events.length / (data.parserMetadata.parseTime / 1000)))}`);
    console.log(`Lines/sec:      ${formatNumber(Math.round(data.parserMetadata.linesProcessed / (data.parserMetadata.parseTime / 1000)))}`);
    console.log(`Errors:         ${data.parserMetadata.errors.length}`);
    console.log(`Warnings:       ${data.parserMetadata.warnings.length}`);
    console.log();
    break;

  case 'help':
    console.log('\n🔍 Parse Inspector\n');
    console.log('Usage: node parser-v2/inspect-parse.js [section]\n');
    console.log('Available sections:');
    console.log('  summary    - Match overview (default)');
    console.log('  players    - Player stats table');
    console.log('  rounds     - Round-by-round breakdown');
    console.log('  teams      - Team statistics');
    console.log('  chat       - Chat messages');
    console.log('  events     - Event type counts');
    console.log('  medics     - Medic-specific stats');
    console.log('  meta       - Parser metadata\n');
    break;

  default:
    console.log(`\n❌ Unknown section: ${section}`);
    console.log('Run with "help" to see available sections\n');
}
