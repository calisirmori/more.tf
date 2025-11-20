/**
 * Log Summary Generator
 * Creates focused summary from GameTotals
 */

import { GameTotals, PlayerGameTotals } from '../types/output';
import { LogSummary, TeamSummary } from '../types/summary';
import { Team } from '../types/events';

/**
 * Generate a focused log summary from game totals
 */
export function generateLogSummary(gameTotals: GameTotals): LogSummary {
  const durationMinutes = gameTotals.duration / 60;

  // Calculate team summaries
  const redTeam = generateTeamSummary('red', gameTotals, durationMinutes);
  const bluTeam = generateTeamSummary('blue', gameTotals, durationMinutes);

  // Use winner from gameTotals (calculated by aggregator with proper round win + tiebreaker logic)
  const winner: Team | 'tie' = gameTotals.winner || 'tie';

  // Count players per team
  const players = gameTotals.players;
  const redPlayers = players.filter(p => p.team === 'red').length;
  const bluePlayers = players.filter(p => p.team === 'blue').length;

  return {
    // Basic info
    logId: gameTotals.logId,
    map: gameTotals.map,
    title: gameTotals.title,

    // Duration
    duration: gameTotals.duration,
    durationFormatted: formatDuration(gameTotals.duration),
    startTime: gameTotals.startTime,
    endTime: gameTotals.endTime,
    startTimeFormatted: formatTimestamp(gameTotals.startTime),
    endTimeFormatted: formatTimestamp(gameTotals.endTime),

    // Match outcome
    winner,
    finalScore: {
      red: redTeam.score,
      blue: bluTeam.score,
    },

    // Rounds
    rounds: {
      total: gameTotals.rounds.total,
      redWins: gameTotals.rounds.redWins,
      blueWins: gameTotals.rounds.blueWins,
    },

    // Teams
    teams: {
      red: redTeam,
      blue: bluTeam,
    },

    // Player count
    playerCount: {
      total: players.length,
      red: redPlayers,
      blue: bluePlayers,
    },
  };
}

/**
 * Generate team summary with derived stats
 */
function generateTeamSummary(
  team: Team,
  gameTotals: GameTotals,
  durationMinutes: number
): TeamSummary {
  const teamData = team === 'red' ? gameTotals.teams.red : gameTotals.teams.blue;

  // Calculate derived stats
  const kd = teamData.deaths > 0 ? teamData.kills / teamData.deaths : teamData.kills;
  const dpm = durationMinutes > 0 ? teamData.damage / durationMinutes : 0;
  const hpm = durationMinutes > 0 ? teamData.healing / durationMinutes : 0;

  return {
    team,
    score: teamData.score,
    kills: teamData.kills,
    deaths: teamData.deaths,
    damage: teamData.damage,
    healing: teamData.healing,
    ubers: teamData.ubers,
    drops: teamData.drops,

    // Derived stats (rounded to 2 decimals)
    kd: Math.round(kd * 100) / 100,
    dpm: Math.round(dpm),
    hpm: Math.round(hpm),
  };
}

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format unix timestamp to readable date/time
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get a concise one-line summary
 */
export function getOneLineSummary(summary: LogSummary): string {
  const winner = summary.winner === 'tie' ? 'TIE' : summary.winner.toUpperCase();
  const score = `${summary.finalScore.red}-${summary.finalScore.blue}`;
  const rounds = summary.rounds.total > 1
    ? ` (${summary.rounds.redWins}-${summary.rounds.blueWins})`
    : '';

  return `Log #${summary.logId}: ${summary.map} - ${winner} ${score}${rounds} - ${summary.durationFormatted}`;
}

/**
 * Get a pretty-printed multi-line summary
 */
export function getPrettySummary(summary: LogSummary): string {
  const lines: string[] = [];

  lines.push('═'.repeat(60));
  lines.push(`  LOG #${summary.logId} SUMMARY`);
  lines.push('═'.repeat(60));
  lines.push('');

  // Match info
  lines.push('Match Information:');
  lines.push(`  Map:      ${summary.map}`);
  lines.push(`  Title:    ${summary.title}`);
  lines.push(`  Duration: ${summary.durationFormatted}`);
  lines.push(`  Started:  ${summary.startTimeFormatted}`);
  lines.push(`  Ended:    ${summary.endTimeFormatted}`);
  lines.push('');

  // Match outcome
  const winnerText = summary.winner === 'tie'
    ? 'TIE'
    : `${summary.winner.toUpperCase()} WINS`;
  lines.push('Match Outcome:');
  lines.push(`  Winner:      ${winnerText}`);
  lines.push(`  Final Score: RED ${summary.finalScore.red} - ${summary.finalScore.blue} BLU`);

  if (summary.rounds.total > 1) {
    lines.push(`  Round Wins:  RED ${summary.rounds.redWins} - ${summary.rounds.blueWins} BLU`);
    lines.push(`  Total Rounds: ${summary.rounds.total}`);
  }
  lines.push('');

  // Team stats
  lines.push('Team Statistics:');
  lines.push('');
  lines.push('                RED       BLU');
  lines.push('  ─────────────────────────────');
  lines.push(`  Kills       ${pad(summary.teams.red.kills, 6)}    ${pad(summary.teams.blue.kills, 6)}`);
  lines.push(`  Deaths      ${pad(summary.teams.red.deaths, 6)}    ${pad(summary.teams.blue.deaths, 6)}`);
  lines.push(`  K/D         ${pad(summary.teams.red.kd.toFixed(2), 6)}    ${pad(summary.teams.blue.kd.toFixed(2), 6)}`);
  lines.push(`  Damage      ${pad(summary.teams.red.damage, 6)}    ${pad(summary.teams.blue.damage, 6)}`);
  lines.push(`  DPM         ${pad(summary.teams.red.dpm, 6)}    ${pad(summary.teams.blue.dpm, 6)}`);
  lines.push(`  Healing     ${pad(summary.teams.red.healing, 6)}    ${pad(summary.teams.blue.healing, 6)}`);
  lines.push(`  HPM         ${pad(summary.teams.red.hpm, 6)}    ${pad(summary.teams.blue.hpm, 6)}`);
  lines.push(`  Ubers       ${pad(summary.teams.red.ubers, 6)}    ${pad(summary.teams.blue.ubers, 6)}`);
  lines.push(`  Drops       ${pad(summary.teams.red.drops, 6)}    ${pad(summary.teams.blue.drops, 6)}`);
  lines.push('');

  // Player count
  lines.push('Players:');
  lines.push(`  Total:  ${summary.playerCount.total}`);
  lines.push(`  RED:    ${summary.playerCount.red}`);
  lines.push(`  BLU:    ${summary.playerCount.blue}`);
  lines.push('');

  lines.push('═'.repeat(60));

  return lines.join('\n');
}

/**
 * Pad a number/string to fixed width (right-aligned)
 */
function pad(value: number | string, width: number): string {
  return String(value).padStart(width, ' ');
}
