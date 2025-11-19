const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * GET /v2/viewer
 * Simple web interface to view parsed log results
 */
router.get('/viewer', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parser V2 Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0e27;
      color: #e0e0e0;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { color: #4a9eff; margin-bottom: 20px; font-size: 2em; }
    h2 { color: #ff6b6b; margin: 30px 0 15px; font-size: 1.5em; }
    h3 { color: #ffd93d; margin: 20px 0 10px; font-size: 1.2em; }

    .input-section {
      background: #1a1f3a;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border: 1px solid #2a3555;
    }

    input[type="number"] {
      padding: 10px 15px;
      font-size: 16px;
      border: 2px solid #2a3555;
      background: #0f1525;
      color: #e0e0e0;
      border-radius: 5px;
      width: 200px;
      margin-right: 10px;
    }

    button {
      padding: 10px 20px;
      font-size: 16px;
      background: #4a9eff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    button:hover { background: #357abd; }
    button:disabled { background: #555; cursor: not-allowed; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: #1a1f3a;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #2a3555;
    }

    .stat-label { color: #888; font-size: 0.9em; margin-bottom: 5px; }
    .stat-value { color: #4a9eff; font-size: 1.5em; font-weight: 600; }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #1a1f3a;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 30px;
    }

    th {
      background: #2a3555;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #ffd93d;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #2a3555;
    }

    tr:hover { background: #242a45; }

    .team-red { color: #ff6b6b; font-weight: 600; }
    .team-blue { color: #4a9eff; font-weight: 600; }

    .loading {
      text-align: center;
      padding: 40px;
      color: #888;
      font-size: 1.2em;
    }

    .error {
      background: #4a1f1f;
      border: 1px solid #ff6b6b;
      color: #ff6b6b;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .success {
      background: #1f4a1f;
      border: 1px solid #6bff6b;
      color: #6bff6b;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #2a3555;
      padding-bottom: 10px;
    }

    .tab {
      padding: 8px 16px;
      background: #1a1f3a;
      border: 1px solid #2a3555;
      border-radius: 5px 5px 0 0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab:hover { background: #242a45; }
    .tab.active { background: #4a9eff; color: white; border-color: #4a9eff; }

    .tab-content { display: none; }
    .tab-content.active { display: block; }

    pre {
      background: #0f1525;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      border: 1px solid #2a3555;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎮 Parser V2 Viewer</h1>

    <div class="input-section">
      <input type="number" id="logId" placeholder="Log ID (e.g., 3966472)" value="3966472">
      <button onclick="loadLog()">Load Log</button>
      <button onclick="loadTestData()">Load Test Data</button>
    </div>

    <div id="loading" class="loading" style="display: none;">
      ⏳ Parsing log...
    </div>

    <div id="error" class="error" style="display: none;"></div>

    <div id="content" style="display: none;">
      <div class="tabs">
        <div class="tab active" onclick="showTab('summary')">Summary</div>
        <div class="tab" onclick="showTab('players')">Players</div>
        <div class="tab" onclick="showTab('rounds')">Rounds</div>
        <div class="tab" onclick="showTab('teams')">Teams</div>
        <div class="tab" onclick="showTab('events')">Events</div>
        <div class="tab" onclick="showTab('raw')">Raw JSON</div>
      </div>

      <div id="tab-summary" class="tab-content active"></div>
      <div id="tab-players" class="tab-content"></div>
      <div id="tab-rounds" class="tab-content"></div>
      <div id="tab-teams" class="tab-content"></div>
      <div id="tab-events" class="tab-content"></div>
      <div id="tab-raw" class="tab-content"></div>
    </div>
  </div>

  <script>
    let currentData = null;

    function showTab(name) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('tab-' + name).classList.add('active');
    }

    async function loadTestData() {
      try {
        const response = await fetch('/api/v2/viewer/test-data');
        const data = await response.json();
        displayData(data);
      } catch (err) {
        showError('Failed to load test data: ' + err.message);
      }
    }

    async function loadLog() {
      const logId = document.getElementById('logId').value;
      if (!logId) {
        showError('Please enter a log ID');
        return;
      }

      document.getElementById('loading').style.display = 'block';
      document.getElementById('error').style.display = 'none';
      document.getElementById('content').style.display = 'none';

      try {
        const response = await fetch('/api/v2/log/' + logId);
        const data = await response.json();

        if (data.errorCode) {
          throw new Error(data.message || 'Failed to parse log');
        }

        displayData(data);
      } catch (err) {
        showError('Failed to load log: ' + err.message);
      } finally {
        document.getElementById('loading').style.display = 'none';
      }
    }

    function showError(message) {
      document.getElementById('error').textContent = message;
      document.getElementById('error').style.display = 'block';
      document.getElementById('content').style.display = 'none';
    }

    function displayData(data) {
      currentData = data;
      document.getElementById('error').style.display = 'none';
      document.getElementById('content').style.display = 'block';

      renderSummary(data);
      renderPlayers(data);
      renderRounds(data);
      renderTeams(data);
      renderEvents(data);
      renderRaw(data);
    }

    function renderSummary(data) {
      const duration = Math.floor(data.info.matchLength / 60) + ':' +
                       (Math.floor(data.info.matchLength % 60)).toString().padStart(2, '0');

      const html = \`
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Log ID</div>
            <div class="stat-value">\${data.info.logId}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Map</div>
            <div class="stat-value">\${data.info.map}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Duration</div>
            <div class="stat-value">\${duration}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Winner</div>
            <div class="stat-value team-\${data.info.winner}">\${data.info.winner.toUpperCase()}</div>
          </div>
        </div>

        <h3>Score</h3>
        <div class="stats-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="stat-card">
            <div class="stat-label">🔴 Red Team</div>
            <div class="stat-value team-red">\${data.teams.red.score}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">🔵 Blue Team</div>
            <div class="stat-value team-blue">\${data.teams.blue.score}</div>
          </div>
        </div>

        <h3>Overview</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Players</div>
            <div class="stat-value">\${Object.keys(data.players).length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Rounds</div>
            <div class="stat-value">\${data.rounds.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Events</div>
            <div class="stat-value">\${data.events.length.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Parse Time</div>
            <div class="stat-value">\${data.parserMetadata.parseTime}ms</div>
          </div>
        </div>
      \`;

      document.getElementById('tab-summary').innerHTML = html;
    }

    function renderPlayers(data) {
      const players = Object.entries(data.players)
        .map(([id, p]) => ({...p, id}))
        .sort((a, b) => b.damage - a.damage);

      const rows = players.map(p => \`
        <tr>
          <td>\${p.userName}</td>
          <td class="team-\${p.team}">\${p.team}</td>
          <td>\${p.primaryClass}</td>
          <td>\${p.kills}</td>
          <td>\${p.deaths}</td>
          <td>\${p.assists}</td>
          <td>\${p.damage.toLocaleString()}</td>
          <td>\${p.damagePerMinute}</td>
          <td>\${p.heals.toLocaleString()}</td>
        </tr>
      \`).join('');

      const html = \`
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th>Class</th>
              <th>K</th>
              <th>D</th>
              <th>A</th>
              <th>Damage</th>
              <th>DPM</th>
              <th>Heals</th>
            </tr>
          </thead>
          <tbody>\${rows}</tbody>
        </table>
      \`;

      document.getElementById('tab-players').innerHTML = html;
    }

    function renderRounds(data) {
      const rows = data.rounds.map(r => \`
        <tr>
          <td>\${r.roundNumber}</td>
          <td class="team-\${r.winner}">\${r.winner}</td>
          <td>\${Math.floor(r.roundDuration / 60)}:\${(Math.floor(r.roundDuration % 60)).toString().padStart(2, '0')}</td>
          <td>\${r.firstCap || '-'}</td>
          <td>\${r.overtime ? 'Yes' : 'No'}</td>
          <td>\${r.teamScores.red.kills}</td>
          <td>\${r.teamScores.blue.kills}</td>
          <td>\${r.captureEvents.length}</td>
        </tr>
      \`).join('');

      const html = \`
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Winner</th>
              <th>Duration</th>
              <th>First Cap</th>
              <th>OT</th>
              <th>Red Kills</th>
              <th>Blue Kills</th>
              <th>Caps</th>
            </tr>
          </thead>
          <tbody>\${rows}</tbody>
        </table>
      \`;

      document.getElementById('tab-rounds').innerHTML = html;
    }

    function renderTeams(data) {
      const html = \`
        <h3>🔴 Red Team</h3>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Score</div><div class="stat-value">\${data.teams.red.score}</div></div>
          <div class="stat-card"><div class="stat-label">Kills</div><div class="stat-value">\${data.teams.red.kills}</div></div>
          <div class="stat-card"><div class="stat-label">Damage</div><div class="stat-value">\${data.teams.red.damage.toLocaleString()}</div></div>
          <div class="stat-card"><div class="stat-label">Heals</div><div class="stat-value">\${data.teams.red.heals.toLocaleString()}</div></div>
          <div class="stat-card"><div class="stat-label">Ubers</div><div class="stat-value">\${data.teams.red.charges}</div></div>
          <div class="stat-card"><div class="stat-label">Drops</div><div class="stat-value">\${data.teams.red.drops}</div></div>
        </div>

        <h3>🔵 Blue Team</h3>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Score</div><div class="stat-value">\${data.teams.blue.score}</div></div>
          <div class="stat-card"><div class="stat-label">Kills</div><div class="stat-value">\${data.teams.blue.kills}</div></div>
          <div class="stat-card"><div class="stat-label">Damage</div><div class="stat-value">\${data.teams.blue.damage.toLocaleString()}</div></div>
          <div class="stat-card"><div class="stat-label">Heals</div><div class="stat-value">\${data.teams.blue.heals.toLocaleString()}</div></div>
          <div class="stat-card"><div class="stat-label">Ubers</div><div class="stat-value">\${data.teams.blue.charges}</div></div>
          <div class="stat-card"><div class="stat-label">Drops</div><div class="stat-value">\${data.teams.blue.drops}</div></div>
        </div>
      \`;

      document.getElementById('tab-teams').innerHTML = html;
    }

    function renderEvents(data) {
      const eventCounts = {};
      data.events.forEach(e => {
        eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
      });

      const rows = Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => \`
          <tr>
            <td>\${type}</td>
            <td>\${count.toLocaleString()}</td>
          </tr>
        \`).join('');

      const html = \`
        <table>
          <thead>
            <tr>
              <th>Event Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>\${rows}</tbody>
        </table>
      \`;

      document.getElementById('tab-events').innerHTML = html;
    }

    function renderRaw(data) {
      const html = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      document.getElementById('tab-raw').innerHTML = html;
    }

    // Auto-load test data on page load
    window.addEventListener('load', () => {
      loadTestData();
    });
  </script>
</body>
</html>
  `;

  res.send(html);
});

/**
 * GET /v2/viewer/test-data
 * Returns the test output JSON
 */
router.get('/viewer/test-data', (req, res) => {
  const testOutputPath = path.join(__dirname, '../../parser-v2/test-output.json');

  if (fs.existsSync(testOutputPath)) {
    const data = JSON.parse(fs.readFileSync(testOutputPath, 'utf8'));
    res.json(data);
  } else {
    res.status(404).json({ error: 'Test data not found. Run test-parser.js first.' });
  }
});

module.exports = router;
