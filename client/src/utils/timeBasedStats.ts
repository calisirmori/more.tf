/**
 * Utility functions for calculating time-based statistics from log intervals
 */

interface Interval {
  intervalIndex: number;
  startTime: number;
  endTime: number;
  relativeStartTime: string;
  relativeEndTime: string;
  durationSeconds: number;
  red: TeamIntervalStats;
  blue: TeamIntervalStats;
  players: PlayerIntervalStats[];
}

interface TeamIntervalStats {
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;
  healing: number;
  ubers: number;
  drops: number;
}

interface PlayerIntervalStats {
  steamId: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;
  healing: number;
  ubers: number;
  drops: number;
  healingTo?: { [steamId: string]: number };
}

interface TimeBasedData {
  intervalSeconds: number;
  totalIntervals: number;
  matchStartTime: number;
  matchEndTime: number;
  matchDurationSeconds: number;
  intervals: Interval[];
}

interface CumulativePlayerStats {
  steamId: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;
  healing: number;
  ubers: number;
  drops: number;
  airshots?: number;
  headshots?: number;
  backstabs?: number;
  capturePointsCapped?: number;
}

/**
 * Calculate cumulative stats for all players within a specific interval range
 */
export function calculateCumulativeStats(
  timeBasedData: TimeBasedData,
  startIntervalIndex: number,
  endIntervalIndex: number,
  gameTotalPlayers: any[]
): CumulativePlayerStats[] {
  const playerStatsMap = new Map<string, CumulativePlayerStats>();

  // Initialize all players
  gameTotalPlayers.forEach((player) => {
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
      airshots: 0,
      headshots: 0,
      backstabs: 0,
      capturePointsCapped: 0,
    });
  });

  // Sum up stats from startIntervalIndex to endIntervalIndex (inclusive)
  for (
    let i = startIntervalIndex;
    i <= endIntervalIndex && i < timeBasedData.intervals.length;
    i++
  ) {
    const interval = timeBasedData.intervals[i];

    interval.players.forEach((intervalPlayer) => {
      const playerStats = playerStatsMap.get(intervalPlayer.steamId);
      if (playerStats) {
        playerStats.kills += intervalPlayer.kills || 0;
        playerStats.deaths += intervalPlayer.deaths || 0;
        playerStats.assists += intervalPlayer.assists || 0;
        playerStats.damage += intervalPlayer.damage || 0;
        playerStats.damageTaken += intervalPlayer.damageTaken || 0;
        playerStats.healing += intervalPlayer.healing || 0;
        playerStats.ubers += intervalPlayer.ubers || 0;
        playerStats.drops += intervalPlayer.drops || 0;
      }
    });
  }

  // For stats not tracked in intervals (airshots, headshots, etc.),
  // we'll need to scale them proportionally based on damage dealt
  gameTotalPlayers.forEach((player) => {
    const playerStats = playerStatsMap.get(player.steamId);
    if (playerStats && player.damage > 0) {
      const damageRatio = playerStats.damage / player.damage;

      // Scale special stats proportionally
      playerStats.airshots = Math.round((player.airshots || 0) * damageRatio);
      playerStats.headshots = Math.round((player.headshots || 0) * damageRatio);
      playerStats.backstabs = Math.round((player.backstabs || 0) * damageRatio);
      playerStats.capturePointsCapped = Math.round(
        (player.capturePointsCapped || 0) * damageRatio
      );
    }
  });

  return Array.from(playerStatsMap.values());
}

/**
 * Calculate cumulative team stats within a specific interval range
 */
export function calculateCumulativeTeamStats(
  timeBasedData: TimeBasedData,
  startIntervalIndex: number,
  endIntervalIndex: number
): {
  red: TeamIntervalStats;
  blue: TeamIntervalStats;
} {
  const redStats: TeamIntervalStats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    damageTaken: 0,
    healing: 0,
    ubers: 0,
    drops: 0,
  };

  const blueStats: TeamIntervalStats = {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    damageTaken: 0,
    healing: 0,
    ubers: 0,
    drops: 0,
  };

  // Sum up stats from startIntervalIndex to endIntervalIndex (inclusive)
  for (
    let i = startIntervalIndex;
    i <= endIntervalIndex && i < timeBasedData.intervals.length;
    i++
  ) {
    const interval = timeBasedData.intervals[i];

    // Add red team stats
    redStats.kills += interval.red.kills || 0;
    redStats.deaths += interval.red.deaths || 0;
    redStats.assists += interval.red.assists || 0;
    redStats.damage += interval.red.damage || 0;
    redStats.damageTaken += interval.red.damageTaken || 0;
    redStats.healing += interval.red.healing || 0;
    redStats.ubers += interval.red.ubers || 0;
    redStats.drops += interval.red.drops || 0;

    // Add blue team stats
    blueStats.kills += interval.blue.kills || 0;
    blueStats.deaths += interval.blue.deaths || 0;
    blueStats.assists += interval.blue.assists || 0;
    blueStats.damage += interval.blue.damage || 0;
    blueStats.damageTaken += interval.blue.damageTaken || 0;
    blueStats.healing += interval.blue.healing || 0;
    blueStats.ubers += interval.blue.ubers || 0;
    blueStats.drops += interval.blue.drops || 0;
  }

  return { red: redStats, blue: blueStats };
}

/**
 * Get the actual elapsed time in seconds for the selected interval range
 */
export function getElapsedTime(
  timeBasedData: TimeBasedData,
  startIntervalIndex: number,
  endIntervalIndex: number
): number {
  if (
    endIntervalIndex >= timeBasedData.intervals.length ||
    startIntervalIndex >= timeBasedData.intervals.length
  ) {
    return timeBasedData.matchDurationSeconds;
  }

  const startInterval = timeBasedData.intervals[startIntervalIndex];
  const endInterval = timeBasedData.intervals[endIntervalIndex];

  return endInterval.endTime - startInterval.startTime;
}

/**
 * Calculate cumulative healing targets for all players within a specific interval range
 * Returns a map of medicSteamId -> { targetSteamId: healingAmount }
 */
export function calculateCumulativeHealingTargets(
  timeBasedData: TimeBasedData,
  startIntervalIndex: number,
  endIntervalIndex: number
): Map<string, Record<string, number>> {
  const healingTargetsMap = new Map<string, Record<string, number>>();

  // Sum up healing targets from startIntervalIndex to endIntervalIndex (inclusive)
  for (
    let i = startIntervalIndex;
    i <= endIntervalIndex && i < timeBasedData.intervals.length;
    i++
  ) {
    const interval = timeBasedData.intervals[i];

    interval.players.forEach((intervalPlayer) => {
      if (intervalPlayer.healingTo && Object.keys(intervalPlayer.healingTo).length > 0) {
        // This player is a medic who healed others
        const medicSteamId = intervalPlayer.steamId;

        if (!healingTargetsMap.has(medicSteamId)) {
          healingTargetsMap.set(medicSteamId, {});
        }

        const medicTargets = healingTargetsMap.get(medicSteamId)!;

        Object.entries(intervalPlayer.healingTo).forEach(([targetSteamId, healing]) => {
          if (!medicTargets[targetSteamId]) {
            medicTargets[targetSteamId] = 0;
          }
          medicTargets[targetSteamId] += healing;
        });
      }
    });
  }

  return healingTargetsMap;
}
