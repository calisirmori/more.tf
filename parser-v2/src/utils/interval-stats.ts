/**
 * Interval Stats Generator
 * Creates aggregated statistics for time intervals from bucketed events
 * Useful for graphing and slider-based log viewing
 */

import { GameEvent } from '../types/events';
import { TimeBucket } from '../types/output';

export interface PlayerIntervalStats {
  steamId: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;
  healing: number;
  ubers: number;
  drops: number;

  // Healing breakdown: which players did this player heal
  healingTo?: Record<string, number>; // { steamId: healingAmount }
}

export interface TeamIntervalStats {
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;
  healing: number;
  ubers: number;
  drops: number;
}

export interface IntervalStats {
  intervalIndex: number;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  relativeStartTime: string; // e.g., "5:30"
  relativeEndTime: string; // e.g., "10:30"
  durationSeconds: number;

  // Team totals for this interval
  red: TeamIntervalStats;
  blue: TeamIntervalStats;

  // Per-player stats for this interval
  players: PlayerIntervalStats[];
}

export interface IntervalStatsData {
  intervalSeconds: number; // e.g., 300 for 5-minute intervals
  totalIntervals: number;
  matchStartTime: number;
  matchEndTime: number;
  matchDurationSeconds: number;
  intervals: IntervalStats[];
}

/**
 * Generate interval-based statistics from time buckets
 * @param buckets - Time buckets (10-second intervals)
 * @param intervalSeconds - Desired interval size in seconds (default: 300 = 5 minutes)
 * @returns Aggregated interval statistics
 */
export function generateIntervalStats(
  buckets: TimeBucket[],
  intervalSeconds: number = 300
): IntervalStatsData {
  if (buckets.length === 0) {
    return {
      intervalSeconds,
      totalIntervals: 0,
      matchStartTime: 0,
      matchEndTime: 0,
      matchDurationSeconds: 0,
      intervals: [],
    };
  }

  const matchStartTime = buckets[0].startTime;
  const matchEndTime = buckets[buckets.length - 1].endTime;
  const matchDurationSeconds = matchEndTime - matchStartTime;

  // Calculate how many intervals we need
  const totalIntervals = Math.ceil(matchDurationSeconds / intervalSeconds);

  const intervals: IntervalStats[] = [];

  for (let i = 0; i < totalIntervals; i++) {
    const intervalStartTime = matchStartTime + i * intervalSeconds;
    const intervalEndTime = Math.min(intervalStartTime + intervalSeconds, matchEndTime);

    // Get all buckets that fall within this interval
    const bucketsInInterval = buckets.filter(
      bucket => bucket.startTime >= intervalStartTime && bucket.startTime < intervalEndTime
    );

    // Aggregate stats for this interval
    const intervalStats = aggregateBuckets(
      bucketsInInterval,
      i,
      intervalStartTime,
      intervalEndTime,
      matchStartTime
    );

    intervals.push(intervalStats);
  }

  return {
    intervalSeconds,
    totalIntervals,
    matchStartTime,
    matchEndTime,
    matchDurationSeconds,
    intervals,
  };
}

/**
 * Aggregate multiple buckets into a single interval stat
 */
function aggregateBuckets(
  buckets: TimeBucket[],
  intervalIndex: number,
  startTime: number,
  endTime: number,
  matchStartTime: number
): IntervalStats {
  const playerStatsMap = new Map<string, PlayerIntervalStats>();
  const redTeamStats: TeamIntervalStats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    damageTaken: 0,
    healing: 0,
    ubers: 0,
    drops: 0,
  };
  const blueTeamStats: TeamIntervalStats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    damageTaken: 0,
    healing: 0,
    ubers: 0,
    drops: 0,
  };

  // Helper to get or create player stats
  const getPlayerStats = (steamId: string): PlayerIntervalStats => {
    if (!playerStatsMap.has(steamId)) {
      playerStatsMap.set(steamId, {
        steamId,
        kills: 0,
        deaths: 0,
        assists: 0,
        damage: 0,
        damageTaken: 0,
        healing: 0,
        ubers: 0,
        drops: 0,
      });
    }
    return playerStatsMap.get(steamId)!;
  };

  // Process all events in all buckets for this interval
  for (const bucket of buckets) {
    for (const event of bucket.events) {
      switch (event.type) {
        case 'kill': {
          const killer = getPlayerStats(event.killer.steamId.id3);
          const victim = getPlayerStats(event.victim.steamId.id3);

          killer.kills++;
          victim.deaths++;

          // Team stats
          if (event.killer.team === 'red') redTeamStats.kills++;
          else if (event.killer.team === 'blue') blueTeamStats.kills++;

          if (event.victim.team === 'red') redTeamStats.deaths++;
          else if (event.victim.team === 'blue') blueTeamStats.deaths++;
          break;
        }

        case 'assist': {
          const assister = getPlayerStats(event.assister.steamId.id3);
          assister.assists++;

          // Team stats
          if (event.assister.team === 'red') redTeamStats.assists++;
          else if (event.assister.team === 'blue') blueTeamStats.assists++;
          break;
        }

        case 'damage': {
          const attacker = getPlayerStats(event.attacker.steamId.id3);
          const victim = getPlayerStats(event.victim.steamId.id3);

          attacker.damage += event.damage;
          victim.damageTaken += event.damage;

          // Team stats
          if (event.attacker.team === 'red') redTeamStats.damage += event.damage;
          else if (event.attacker.team === 'blue') blueTeamStats.damage += event.damage;

          if (event.victim.team === 'red') redTeamStats.damageTaken += event.damage;
          else if (event.victim.team === 'blue') blueTeamStats.damageTaken += event.damage;
          break;
        }

        case 'heal': {
          const healer = getPlayerStats(event.healer.steamId.id3);
          const patient = event.target.steamId.id3;

          healer.healing += event.healing;

          // Track healing per patient
          if (!healer.healingTo) {
            healer.healingTo = {};
          }
          healer.healingTo[patient] = (healer.healingTo[patient] || 0) + event.healing;

          // Team stats
          if (event.healer.team === 'red') redTeamStats.healing += event.healing;
          else if (event.healer.team === 'blue') blueTeamStats.healing += event.healing;
          break;
        }

        case 'charge_deployed': {
          const medic = getPlayerStats(event.medic.steamId.id3);
          medic.ubers++;

          // Team stats
          if (event.medic.team === 'red') redTeamStats.ubers++;
          else if (event.medic.team === 'blue') blueTeamStats.ubers++;
          break;
        }

        case 'medic_death': {
          if (event.uberCharge) {
            const medic = getPlayerStats(event.medic.steamId.id3);
            medic.drops++;

            // Team stats
            if (event.medic.team === 'red') redTeamStats.drops++;
            else if (event.medic.team === 'blue') blueTeamStats.drops++;
          }
          break;
        }
      }
    }
  }

  // Format relative times
  const relativeStartTime = formatRelativeTime(startTime - matchStartTime);
  const relativeEndTime = formatRelativeTime(endTime - matchStartTime);

  return {
    intervalIndex,
    startTime,
    endTime,
    relativeStartTime,
    relativeEndTime,
    durationSeconds: endTime - startTime,
    red: redTeamStats,
    blue: blueTeamStats,
    players: Array.from(playerStatsMap.values()),
  };
}

/**
 * Format seconds as MM:SS
 */
function formatRelativeTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get stats for a specific time range
 * @param intervalStats - Full interval stats data
 * @param startSeconds - Start time in seconds (relative to match start)
 * @param endSeconds - End time in seconds (relative to match start)
 * @returns Aggregated stats for the specified range
 */
export function getStatsForTimeRange(
  intervalStats: IntervalStatsData,
  startSeconds: number,
  endSeconds: number
): IntervalStats {
  const relevantIntervals = intervalStats.intervals.filter(interval => {
    const relStart = interval.startTime - intervalStats.matchStartTime;
    const relEnd = interval.endTime - intervalStats.matchStartTime;
    return relStart < endSeconds && relEnd > startSeconds;
  });

  // Aggregate all relevant intervals
  const playerStatsMap = new Map<string, PlayerIntervalStats>();
  const redTeamStats: TeamIntervalStats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    damageTaken: 0,
    healing: 0,
    ubers: 0,
    drops: 0,
  };
  const blueTeamStats: TeamIntervalStats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    damageTaken: 0,
    healing: 0,
    ubers: 0,
    drops: 0,
  };

  for (const interval of relevantIntervals) {
    // Aggregate team stats
    redTeamStats.kills += interval.red.kills;
    redTeamStats.deaths += interval.red.deaths;
    redTeamStats.assists += interval.red.assists;
    redTeamStats.damage += interval.red.damage;
    redTeamStats.damageTaken += interval.red.damageTaken;
    redTeamStats.healing += interval.red.healing;
    redTeamStats.ubers += interval.red.ubers;
    redTeamStats.drops += interval.red.drops;

    blueTeamStats.kills += interval.blue.kills;
    blueTeamStats.deaths += interval.blue.deaths;
    blueTeamStats.assists += interval.blue.assists;
    blueTeamStats.damage += interval.blue.damage;
    blueTeamStats.damageTaken += interval.blue.damageTaken;
    blueTeamStats.healing += interval.blue.healing;
    blueTeamStats.ubers += interval.blue.ubers;
    blueTeamStats.drops += interval.blue.drops;

    // Aggregate player stats
    for (const player of interval.players) {
      if (!playerStatsMap.has(player.steamId)) {
        playerStatsMap.set(player.steamId, {
          steamId: player.steamId,
          kills: 0,
          deaths: 0,
          assists: 0,
          damage: 0,
          damageTaken: 0,
          healing: 0,
          ubers: 0,
          drops: 0,
        });
      }

      const existing = playerStatsMap.get(player.steamId)!;
      existing.kills += player.kills;
      existing.deaths += player.deaths;
      existing.assists += player.assists;
      existing.damage += player.damage;
      existing.damageTaken += player.damageTaken;
      existing.healing += player.healing;
      existing.ubers += player.ubers;
      existing.drops += player.drops;

      // Aggregate healing per patient
      if (player.healingTo) {
        if (!existing.healingTo) {
          existing.healingTo = {};
        }
        for (const [patientId, healAmount] of Object.entries(player.healingTo)) {
          existing.healingTo[patientId] = (existing.healingTo[patientId] || 0) + healAmount;
        }
      }
    }
  }

  const matchStartTime = intervalStats.matchStartTime;

  return {
    intervalIndex: -1, // Custom range
    startTime: matchStartTime + startSeconds,
    endTime: matchStartTime + endSeconds,
    relativeStartTime: formatRelativeTime(startSeconds),
    relativeEndTime: formatRelativeTime(endSeconds),
    durationSeconds: endSeconds - startSeconds,
    red: redTeamStats,
    blue: blueTeamStats,
    players: Array.from(playerStatsMap.values()),
  };
}
