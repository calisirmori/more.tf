/**
 * Test tokenizer on a specific log to find parsing failures
 */

const https = require('https');
const AdmZip = require('adm-zip');
const { tokenizeLine } = require('./dist/tokenizer/index');

const logId = process.argv[2] || '3760787';

https.get(`https://logs.tf/logs/log_${logId}.log.zip`, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const textFile = zipEntries[0].getData().toString('utf8');
    const lines = textFile.split('\n');

    let killLines = 0;
    let tokenizedKills = 0;
    let failedKills = [];

    lines.forEach((line, idx) => {
      if (line.includes('" killed "')) {
        killLines++;
        const token = tokenizeLine(line, idx);

        if (token.players.length >= 2 && token.positions.length >= 2) {
          tokenizedKills++;
        } else {
          if (failedKills.length < 5) {
            failedKills.push({
              line: idx + 1,
              players: token.players.length,
              positions: token.positions.length,
              raw: line.substring(0, 200)
            });
          }
        }
      }
    });

    console.log(`\nTokenizer Analysis for log ${logId}:`);
    console.log(`  Total kill lines: ${killLines}`);
    console.log(`  Successfully tokenized: ${tokenizedKills}`);
    console.log(`  Failed to tokenize: ${killLines - tokenizedKills}`);

    if (failedKills.length > 0) {
      console.log(`\n❌ Sample failed kills:`);
      failedKills.forEach(f => {
        console.log(`  Line ${f.line}: players=${f.players}, positions=${f.positions}`);
        console.log(`    ${f.raw}`);
      });
    }
  });
});
