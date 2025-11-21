/**
 * Comparative Stats Aggregator
 * Provides player-by-player comparative statistics for healing, damage, kills, deaths, assists
 */

import { PlayerGameTotals } from '../types/output';
import { Team, TF2Class } from '../types/events';
import { steamId3ToId64 } from '../tokenizer/patterns';

export interface PlayerComparativeStats {
  steamId: string;
  steamId64: string;
  name: string;
  team: Team;
  primaryClass: TF2Class;

  // Core comparative stats
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  healing: number;

  // Derived stats
  kd: number; // kills/deaths ratio
  kda: number; // (kills + assists) / deaths
  dpm: number; // damage per minute
  hpm: number; // healing per minute (medics only)

  // Playtime for rate calculations
  playtimeMinutes: number;
}

export interface TeamComparativeStats {
  team: Team;
  players: PlayerComparativeStats[];

  // Team totals
  totalKills: number;
  totalDeaths: number;
  totalDamage: number;
  totalHealing: number;

  // Team averages
  avgKills: number;
  avgDeaths: number;
  avgDamage: number;
  avgHealing: number;
}

export interface ComparativeStats {
  // Per-team breakdown
  red: TeamComparativeStats;
  blue: TeamComparativeStats;

  // Overall leaders
  leaders: {
    kills: PlayerComparativeStats;
    deaths: PlayerComparativeStats;
    damage: PlayerComparativeStats;
    healing: PlayerComparativeStats;
    kd: PlayerComparativeStats;
    dpm: PlayerComparativeStats;
  };
}

interface ComparativeStatsSummary {
  // Match metadata
  logId: number;
  map: string;
  title: string;
  duration: number; // seconds
  startTime: number; // unix timestamp
  endTime: number; // unix timestamp
  winner?: Team;

  // Team stats
  red: TeamComparativeStats;
  blue: TeamComparativeStats;

  // Leaders
  leaders: {
    kills: PlayerComparativeStats;
    deaths: PlayerComparativeStats;
    damage: PlayerComparativeStats;
    healing: PlayerComparativeStats;
    kd: PlayerComparativeStats;
    dpm: PlayerComparativeStats;
  };
}

export class ComparativeStatsAggregator {
  /**
   * Generate comparative stats summary from player game totals
   */
  static generate(
    logId: number,
    map: string,
    title: string,
    duration: number,
    startTime: number,
    endTime: number,
    winner: Team | undefined,
    players: PlayerGameTotals[],
    matchDurationSeconds: number
  ): ComparativeStatsSummary {
    // Convert players to comparative stats
    const comparativePlayers: PlayerComparativeStats[] = players.map(player => {
      const playtimeMinutes = player.totalPlaytimeSeconds / 60;
      const deaths = player.deaths || 1; // Avoid division by zero

      return {
        steamId: player.steamId,
        steamId64: steamId3ToId64(player.steamId),
        name: player.name,
        team: player.team,
        primaryClass: player.primaryClass,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        damage: player.damage,
        healing: player.healing || 0,
        kd: parseFloat((player.kills / deaths).toFixed(2)),
        kda: parseFloat(((player.kills + player.assists) / deaths).toFixed(2)),
        dpm: parseFloat((playtimeMinutes > 0 ? player.damage / playtimeMinutes : 0).toFixed(2)),
        hpm: parseFloat((playtimeMinutes > 0 ? (player.healing || 0) / playtimeMinutes : 0).toFixed(2)),
        playtimeMinutes: parseFloat(playtimeMinutes.toFixed(2)),
      };
    });

    // Separate by team
    const redPlayers = comparativePlayers.filter(p => p.team === 'red');
    const bluePlayers = comparativePlayers.filter(p => p.team === 'blue');

    // Calculate team stats
    const redStats = this.calculateTeamStats('red', redPlayers);
    const blueStats = this.calculateTeamStats('blue', bluePlayers);

    // Find leaders
    const leaders = {
      kills: this.findLeader(comparativePlayers, p => p.kills),
      deaths: this.findLeader(comparativePlayers, p => p.deaths),
      damage: this.findLeader(comparativePlayers, p => p.damage),
      healing: this.findLeader(comparativePlayers, p => p.healing),
      kd: this.findLeader(comparativePlayers, p => p.kd),
      dpm: this.findLeader(comparativePlayers, p => p.dpm),
    };

    return {
      logId,
      map,
      title,
      duration,
      startTime,
      endTime,
      winner,
      red: redStats,
      blue: blueStats,
      leaders,
    };
  }

  private static calculateTeamStats(
    team: Team,
    players: PlayerComparativeStats[]
  ): TeamComparativeStats {
    const totalKills = players.reduce((sum, p) => sum + p.kills, 0);
    const totalDeaths = players.reduce((sum, p) => sum + p.deaths, 0);
    const totalDamage = players.reduce((sum, p) => sum + p.damage, 0);
    const totalHealing = players.reduce((sum, p) => sum + p.healing, 0);

    const playerCount = players.length || 1;

    return {
      team,
      players: players.sort((a, b) => b.damage - a.damage), // Sort by damage by default
      totalKills,
      totalDeaths,
      totalDamage,
      totalHealing,
      avgKills: parseFloat((totalKills / playerCount).toFixed(2)),
      avgDeaths: parseFloat((totalDeaths / playerCount).toFixed(2)),
      avgDamage: parseFloat((totalDamage / playerCount).toFixed(2)),
      avgHealing: parseFloat((totalHealing / playerCount).toFixed(2)),
    };
  }

  private static findLeader(
    players: PlayerComparativeStats[],
    selector: (p: PlayerComparativeStats) => number
  ): PlayerComparativeStats {
    return players.reduce((leader, player) => {
      return selector(player) > selector(leader) ? player : leader;
    }, players[0]);
  }

  /**
   * Format comparative stats as a readable table
   */
  static formatAsTable(stats: ComparativeStats): string {
    const lines: string[] = [];

    lines.push('');
    lines.push('='.repeat(120));
    lines.push('COMPARATIVE STATS - PLAYER BY PLAYER');
    lines.push('='.repeat(120));

    // Red team
    lines.push('');
    lines.push('RED TEAM');
    lines.push('-'.repeat(120));
    lines.push(this.formatPlayerTableHeader());
    lines.push('-'.repeat(120));
    stats.red.players.forEach(p => {
      lines.push(this.formatPlayerRow(p));
    });
    lines.push('-'.repeat(120));
    lines.push(this.formatTeamTotals(stats.red));

    // Blue team
    lines.push('');
    lines.push('BLUE TEAM');
    lines.push('-'.repeat(120));
    lines.push(this.formatPlayerTableHeader());
    lines.push('-'.repeat(120));
    stats.blue.players.forEach(p => {
      lines.push(this.formatPlayerRow(p));
    });
    lines.push('-'.repeat(120));
    lines.push(this.formatTeamTotals(stats.blue));

    // Leaders
    lines.push('');
    lines.push('LEADERS');
    lines.push('-'.repeat(80));
    lines.push(`Kills:   ${stats.leaders.kills.name.padEnd(30)} ${stats.leaders.kills.kills} (${stats.leaders.kills.team})`);
    lines.push(`Deaths:  ${stats.leaders.deaths.name.padEnd(30)} ${stats.leaders.deaths.deaths} (${stats.leaders.deaths.team})`);
    lines.push(`Damage:  ${stats.leaders.damage.name.padEnd(30)} ${stats.leaders.damage.damage.toLocaleString()} (${stats.leaders.damage.team})`);
    lines.push(`Healing: ${stats.leaders.healing.name.padEnd(30)} ${stats.leaders.healing.healing.toLocaleString()} (${stats.leaders.healing.team})`);
    lines.push(`K/D:     ${stats.leaders.kd.name.padEnd(30)} ${stats.leaders.kd.kd.toFixed(2)} (${stats.leaders.kd.team})`);
    lines.push(`DPM:     ${stats.leaders.dpm.name.padEnd(30)} ${Math.round(stats.leaders.dpm.dpm).toLocaleString()} (${stats.leaders.dpm.team})`);
    lines.push('-'.repeat(80));

    return lines.join('\n');
  }

  private static formatPlayerTableHeader(): string {
    const name = 'Name'.padEnd(25);
    const cls = 'Class'.padEnd(10);
    const k = 'K'.padStart(4);
    const d = 'D'.padStart(4);
    const a = 'A'.padStart(4);
    const dmg = 'Damage'.padStart(8);
    const heal = 'Healing'.padStart(8);
    const kd = 'K/D'.padStart(6);
    const kda = 'KDA'.padStart(6);
    const dpm = 'DPM'.padStart(6);
    const hpm = 'HPM'.padStart(6);

    return `${name} ${cls} ${k} ${d} ${a} ${dmg} ${heal} ${kd} ${kda} ${dpm} ${hpm}`;
  }

  private static formatPlayerRow(p: PlayerComparativeStats): string {
    const name = p.name.substring(0, 25).padEnd(25);
    const cls = p.primaryClass.padEnd(10);
    const k = p.kills.toString().padStart(4);
    const d = p.deaths.toString().padStart(4);
    const a = p.assists.toString().padStart(4);
    const dmg = p.damage.toLocaleString().padStart(8);
    const heal = (p.healing || 0).toLocaleString().padStart(8);
    const kd = p.kd.toFixed(2).padStart(6);
    const kda = p.kda.toFixed(2).padStart(6);
    const dpm = Math.round(p.dpm).toString().padStart(6);
    const hpm = Math.round(p.hpm).toString().padStart(6);

    return `${name} ${cls} ${k} ${d} ${a} ${dmg} ${heal} ${kd} ${kda} ${dpm} ${hpm}`;
  }

  private static formatTeamTotals(team: TeamComparativeStats): string {
    const label = `TEAM TOTALS (${team.players.length} players)`.padEnd(39);
    const k = team.totalKills.toString().padStart(4);
    const d = team.totalDeaths.toString().padStart(4);
    const dmg = team.totalDamage.toLocaleString().padStart(8);
    const heal = team.totalHealing.toLocaleString().padStart(8);

    const avgLabel = `TEAM AVERAGES`.padEnd(39);
    const avgK = team.avgKills.toFixed(1).padStart(4);
    const avgD = team.avgDeaths.toFixed(1).padStart(4);
    const avgDmg = Math.round(team.avgDamage).toLocaleString().padStart(8);
    const avgHeal = Math.round(team.avgHealing).toLocaleString().padStart(8);

    return `${label}     ${k} ${d}      ${dmg} ${heal}\n${avgLabel}     ${avgK} ${avgD}      ${avgDmg} ${avgHeal}`;
  }
}
