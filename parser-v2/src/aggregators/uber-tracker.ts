/**
 * Uber Tracking Aggregator
 * Tracks uber usage with context: deaths before uber, damage/deaths during uber
 */

import { GameEvent } from '../types/events';

export interface UberDeathBefore {
  steamId: string;
  timestamp: number;
  secondsBeforeUber: number;
  killer?: string;
}

export interface SignificantDamage {
  steamId: string;
  damageTaken: number; // Total damage this player took during uber (100+ only)
}

export interface UberDeathDuring {
  steamId: string;
  timestamp: number;
  secondsIntoUber: number;
  killer?: string;
  totalDamageTaken: number; // Total damage this player took during the uber before dying
}

export interface UberTracking {
  // Uber metadata
  timestamp: number;
  medicSteamId: string;
  medicName: string;
  team: 'red' | 'blue';
  duration: number; // How long the uber lasted (seconds)

  // Context: 15 seconds before uber
  deathsBefore: UberDeathBefore[]; // Teammates who died in the 15s before uber

  // During uber - only significant damage (100+)
  significantDamage: SignificantDamage[]; // Players who took 100+ damage during uber
  deathsDuring: UberDeathDuring[]; // Teammates who died during their own uber

  // Summary stats
  totalDamageTaken: number; // Total damage team took during uber
  advantageLost: number; // Number of teammates who died during uber
}

interface UberInProgress {
  medicSteamId: string;
  medicName: string;
  team: 'red' | 'blue';
  startTime: number;
  endTime?: number;
  playerDamageTotals: Map<string, number>; // Track damage per player during uber
}

export class UberTracker {
  private ubers: UberTracking[] = [];
  private activeUbers: Map<string, UberInProgress> = new Map(); // Key: medicSteamId

  // Rolling window of deaths (last 30 seconds, we'll filter to 15s when needed)
  private recentDeaths: Array<{
    steamId: string;
    timestamp: number;
    team: 'red' | 'blue';
    killer?: string;
  }> = [];

  processEvent(event: GameEvent): void {
    switch (event.type) {
      case 'charge_deployed':
        this.handleUberStart(event);
        break;

      case 'charge_ended':
        this.handleUberEnd(event);
        break;

      case 'kill':
        this.handleKill(event);
        break;

      case 'damage':
        this.handleDamage(event);
        break;
    }
  }

  private handleUberStart(event: any): void {
    const medicId = event.medic.steamId.id3;
    const medicName = event.medic.name;
    const team = event.medic.team;
    const timestamp = event.timestamp;

    // Get deaths in the 15 seconds before this uber
    const deathsBefore: UberDeathBefore[] = this.recentDeaths
      .filter(d =>
        d.team === team &&
        d.timestamp < timestamp &&
        d.timestamp >= timestamp - 15
      )
      .map(d => ({
        steamId: d.steamId,
        timestamp: d.timestamp,
        secondsBeforeUber: parseFloat((timestamp - d.timestamp).toFixed(1)),
        killer: d.killer,
      }));

    // Start tracking this uber
    this.activeUbers.set(medicId, {
      medicSteamId: medicId,
      medicName,
      team,
      startTime: timestamp,
      playerDamageTotals: new Map(),
    });

    // Store preliminary uber data (will be finalized on uber end)
    // We store it now with deaths before
    this.ubers.push({
      timestamp,
      medicSteamId: medicId,
      medicName,
      team,
      duration: 0, // Will be updated when uber ends
      deathsBefore,
      significantDamage: [],
      deathsDuring: [],
      totalDamageTaken: 0,
      advantageLost: 0,
    });
  }

  private handleUberEnd(event: any): void {
    const medicId = event.medic.steamId.id3;
    const timestamp = event.timestamp;
    const duration = event.duration;

    const activeUber = this.activeUbers.get(medicId);
    if (!activeUber) return;

    activeUber.endTime = timestamp;

    // Find the corresponding uber in our tracking array
    const uberIndex = this.ubers.findIndex(
      u => u.medicSteamId === medicId && u.timestamp === activeUber.startTime
    );

    if (uberIndex !== -1) {
      const uber = this.ubers[uberIndex];

      // Update with damage data
      uber.duration = parseFloat(duration.toFixed(1));

      // Calculate total damage and filter for significant damage (100+)
      let totalDamage = 0;
      const significantDamage: SignificantDamage[] = [];

      for (const [playerId, damage] of activeUber.playerDamageTotals.entries()) {
        totalDamage += damage;
        if (damage >= 100) {
          significantDamage.push({
            steamId: playerId,
            damageTaken: damage,
          });
        }
      }

      uber.totalDamageTaken = totalDamage;
      uber.significantDamage = significantDamage.sort((a, b) => b.damageTaken - a.damageTaken);

      // Calculate deaths during uber with total damage taken
      const deathsDuring: UberDeathDuring[] = this.recentDeaths
        .filter(d =>
          d.team === activeUber.team &&
          d.timestamp >= activeUber.startTime &&
          d.timestamp <= timestamp
        )
        .map(d => ({
          steamId: d.steamId,
          timestamp: d.timestamp,
          secondsIntoUber: parseFloat((d.timestamp - activeUber.startTime).toFixed(1)),
          killer: d.killer,
          totalDamageTaken: activeUber.playerDamageTotals.get(d.steamId) || 0,
        }));

      uber.deathsDuring = deathsDuring;
      uber.advantageLost = deathsDuring.length;
    }

    // Clean up
    this.activeUbers.delete(medicId);
  }

  private handleKill(event: any): void {
    const victimId = event.victim.steamId.id3;
    const victimTeam = event.victim.team;
    const killerId = event.killer ? event.killer.steamId.id3 : undefined;
    const timestamp = event.timestamp;

    // Add to recent deaths
    this.recentDeaths.push({
      steamId: victimId,
      timestamp,
      team: victimTeam,
      killer: killerId,
    });

    // Keep only last 30 seconds of deaths (cleanup)
    const cutoff = timestamp - 30;
    this.recentDeaths = this.recentDeaths.filter(d => d.timestamp > cutoff);
  }

  private handleDamage(event: any): void {
    const victimId = event.victim.steamId.id3;
    const victimTeam = event.victim.team;
    const damage = event.damage;
    const timestamp = event.timestamp;

    // Check if victim's team has an active uber
    for (const [medicId, uber] of this.activeUbers.entries()) {
      if (uber.team === victimTeam && timestamp >= uber.startTime) {
        // Track total damage per player
        const current = uber.playerDamageTotals.get(victimId) || 0;
        uber.playerDamageTotals.set(victimId, current + damage);
      }
    }
  }

  getUbers(): UberTracking[] {
    return this.ubers;
  }

  // Get ubers by team
  getUbersByTeam(team: 'red' | 'blue'): UberTracking[] {
    return this.ubers.filter(u => u.team === team);
  }

  // Get ubers where teammates died during (failed ubers)
  getFailedUbers(): UberTracking[] {
    return this.ubers.filter(u => u.deathsDuring.length > 0);
  }

  // Get ubers with significant damage taken (e.g., >1000 damage)
  getHighDamageUbers(threshold: number = 1000): UberTracking[] {
    return this.ubers.filter(u => u.totalDamageTaken >= threshold);
  }

  // Get ubers where team was already down players before uber
  getDisadvantageUbers(): UberTracking[] {
    return this.ubers.filter(u => u.deathsBefore.length > 0);
  }
}
