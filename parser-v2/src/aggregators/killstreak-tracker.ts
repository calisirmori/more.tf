/**
 * Killstreak Tracker
 * Tracks killstreaks (3+ kills within 30 seconds)
 */

import { GameEvent } from '../types/events';

export interface KillInStreak {
  victim: string; // steamId
  timestamp: number;
  weapon: string;
  secondsIntoStreak: number; // Seconds since first kill
}

export interface Killstreak {
  killer: string; // steamId
  killerName: string;
  team: 'red' | 'blue';
  kills: number; // Total kills in streak
  startTime: number; // Timestamp of first kill
  endTime: number; // Timestamp of last kill
  duration: number; // Duration in seconds
  victims: KillInStreak[]; // All kills in the streak
}

export class KillstreakTracker {
  private killstreaks: Killstreak[] = [];

  // Track recent kills per player (rolling 30-second window)
  private recentKills: Map<string, Array<{
    victim: string;
    timestamp: number;
    weapon: string;
    killerName: string;
    team: 'red' | 'blue';
  }>> = new Map();

  processEvent(event: GameEvent): void {
    if (event.type === 'kill') {
      this.handleKill(event);
    }
  }

  private handleKill(event: any): void {
    const killerId = event.killer.steamId.id3;
    const killerName = event.killer.name;
    const killerTeam = event.killer.team;
    const victimId = event.victim.steamId.id3;
    const weapon = event.weapon;
    const timestamp = event.timestamp;

    // Get or create kill list for this player
    if (!this.recentKills.has(killerId)) {
      this.recentKills.set(killerId, []);
    }

    const playerKills = this.recentKills.get(killerId)!;

    // Add this kill
    playerKills.push({
      victim: victimId,
      timestamp,
      weapon,
      killerName,
      team: killerTeam,
    });

    // Remove kills older than 30 seconds
    const cutoff = timestamp - 30;
    const validKills = playerKills.filter(k => k.timestamp > cutoff);
    this.recentKills.set(killerId, validKills);

    // Check if this forms a killstreak (3+ kills within 30 seconds)
    if (validKills.length >= 3) {
      // Check if we already recorded this killstreak
      // A killstreak is "new" if the last recorded one for this player ended before the oldest kill in current window
      const lastStreak = this.killstreaks
        .filter(ks => ks.killer === killerId)
        .sort((a, b) => b.endTime - a.endTime)[0];

      const oldestKillTime = validKills[0].timestamp;
      const shouldRecordStreak = !lastStreak || lastStreak.endTime < oldestKillTime;

      if (shouldRecordStreak) {
        // Record this as a new killstreak
        const firstKill = validKills[0];
        const victims: KillInStreak[] = validKills.map(k => ({
          victim: k.victim,
          timestamp: k.timestamp,
          weapon: k.weapon,
          secondsIntoStreak: parseFloat((k.timestamp - firstKill.timestamp).toFixed(1)),
        }));

        this.killstreaks.push({
          killer: killerId,
          killerName: killerName,
          team: killerTeam,
          kills: validKills.length,
          startTime: firstKill.timestamp,
          endTime: timestamp,
          duration: parseFloat((timestamp - firstKill.timestamp).toFixed(1)),
          victims,
        });
      } else {
        // Update existing killstreak (extend it with new kill)
        if (lastStreak && lastStreak.endTime === playerKills[playerKills.length - 2]?.timestamp) {
          lastStreak.kills = validKills.length;
          lastStreak.endTime = timestamp;
          lastStreak.duration = parseFloat((timestamp - lastStreak.startTime).toFixed(1));

          // Rebuild victims list
          const firstKill = validKills[0];
          lastStreak.victims = validKills.map(k => ({
            victim: k.victim,
            timestamp: k.timestamp,
            weapon: k.weapon,
            secondsIntoStreak: parseFloat((k.timestamp - firstKill.timestamp).toFixed(1)),
          }));
        }
      }
    }
  }

  getKillstreaks(): Killstreak[] {
    return this.killstreaks;
  }

  // Get killstreaks by minimum kill count
  getKillstreaksByCount(minKills: number): Killstreak[] {
    return this.killstreaks.filter(ks => ks.kills >= minKills);
  }

  // Get killstreaks by team
  getKillstreaksByTeam(team: 'red' | 'blue'): Killstreak[] {
    return this.killstreaks.filter(ks => ks.team === team);
  }

  // Get longest killstreaks (by kill count)
  getTopKillstreaks(limit: number = 10): Killstreak[] {
    return [...this.killstreaks]
      .sort((a, b) => b.kills - a.kills)
      .slice(0, limit);
  }

  // Get fastest killstreaks (shortest duration for 3+ kills)
  getFastestKillstreaks(limit: number = 10): Killstreak[] {
    return [...this.killstreaks]
      .filter(ks => ks.kills >= 3)
      .sort((a, b) => a.duration - b.duration)
      .slice(0, limit);
  }

  // Get player's best killstreak
  getPlayerBestStreak(steamId: string): Killstreak | undefined {
    const playerStreaks = this.killstreaks.filter(ks => ks.killer === steamId);
    if (playerStreaks.length === 0) return undefined;
    return playerStreaks.sort((a, b) => b.kills - a.kills)[0];
  }
}
