/**
 * Medic Stats Aggregator
 * Tracks detailed medic statistics including uber build times, usage patterns, and deaths
 */

import { GameEvent, Team } from '../types/events';

export interface MedicUberCycle {
  medicSteamId: string;
  chargeStartTime: number; // When they spawned/started building
  chargeReadyTime?: number; // When they reached 100%
  chargeUsedTime?: number; // When they popped uber
  chargeEndTime?: number; // When uber ended

  timeToBuild?: number; // Seconds to build from 0 to 100%
  timeBeforeUsing?: number; // Seconds between ready and use
  uberDuration?: number; // How long the uber lasted

  deathDuringBuild?: {
    timestamp: number;
    chargePercent: number;
    nearFullCharge: boolean; // 90%+ when died
  };

  deathAfterUse?: {
    timestamp: number;
    secondsAfterPop: number;
  };
}

export interface MedicStats {
  medicSteamId: string;
  medicName: string;
  team: Team;

  // Uber build stats
  totalUbersBuilt: number;
  avgTimeToBuild: number; // Average seconds to build uber

  // Uber usage stats
  totalUbersUsed: number;
  avgTimeBeforeUsing: number; // Average time between ready and use
  avgUberLength: number; // Average uber duration

  // Death stats
  nearFullChargeDeaths: number; // Deaths at 90%+ uber
  deathsAfterCharge: number; // Deaths within 5s of popping

  // Advantage tracking
  majorAdvantagesLost: number; // Lost 80%+ uber charge on death
  biggestAdvantageLost: number; // Highest uber % lost on death

  // Raw cycles for detailed analysis
  uberCycles: MedicUberCycle[];
}

export class MedicStatsAggregator {
  private medicStats: Map<string, MedicStats> = new Map();
  private activeMedicCycles: Map<string, MedicUberCycle> = new Map(); // Key: medicSteamId
  private medicChargePercent: Map<string, number> = new Map(); // Track current charge %
  private recentUberPops: Map<string, number> = new Map(); // medicSteamId -> timestamp of last pop

  processEvent(event: GameEvent): void {
    switch (event.type) {
      case 'player_spawn':
        this.handleSpawn(event);
        break;

      case 'charge_ready':
        this.handleChargeReady(event);
        break;

      case 'charge_deployed':
        this.handleChargeDeployed(event);
        break;

      case 'charge_ended':
        this.handleChargeEnded(event);
        break;

      case 'kill':
        this.handleKill(event);
        break;

      case 'medic_death':
        this.handleMedicDeath(event);
        break;
    }
  }

  private handleSpawn(event: any): void {
    // Only track medic spawns
    if (event.class !== 'medic') return;

    const medicId = event.player.steamId.id3;
    const medicName = event.player.name;
    const team = event.player.team;

    // Ensure medic stats entry exists
    if (!this.medicStats.has(medicId)) {
      this.medicStats.set(medicId, {
        medicSteamId: medicId,
        medicName,
        team,
        totalUbersBuilt: 0,
        avgTimeToBuild: 0,
        totalUbersUsed: 0,
        avgTimeBeforeUsing: 0,
        avgUberLength: 0,
        nearFullChargeDeaths: 0,
        deathsAfterCharge: 0,
        majorAdvantagesLost: 0,
        biggestAdvantageLost: 0,
        uberCycles: [],
      });
    }

    // Start a new uber cycle
    this.activeMedicCycles.set(medicId, {
      medicSteamId: medicId,
      chargeStartTime: event.timestamp,
    });

    this.medicChargePercent.set(medicId, 0);
  }

  private handleChargeReady(event: any): void {
    const medicId = event.medic.steamId.id3;
    const cycle = this.activeMedicCycles.get(medicId);

    if (cycle && !cycle.chargeReadyTime) {
      cycle.chargeReadyTime = event.timestamp;
      cycle.timeToBuild = parseFloat((event.timestamp - cycle.chargeStartTime).toFixed(1));

      const stats = this.medicStats.get(medicId);
      if (stats) {
        stats.totalUbersBuilt++;
      }
    }

    this.medicChargePercent.set(medicId, 100);
  }

  private handleChargeDeployed(event: any): void {
    const medicId = event.medic.steamId.id3;
    const cycle = this.activeMedicCycles.get(medicId);

    if (cycle && cycle.chargeReadyTime) {
      cycle.chargeUsedTime = event.timestamp;
      cycle.timeBeforeUsing = parseFloat((event.timestamp - cycle.chargeReadyTime).toFixed(1));

      const stats = this.medicStats.get(medicId);
      if (stats) {
        stats.totalUbersUsed++;
      }
    }

    // Track recent uber pop for death-after-charge detection
    this.recentUberPops.set(medicId, event.timestamp);
  }

  private handleChargeEnded(event: any): void {
    const medicId = event.medic.steamId.id3;
    const cycle = this.activeMedicCycles.get(medicId);

    if (cycle && cycle.chargeUsedTime) {
      cycle.chargeEndTime = event.timestamp;
      cycle.uberDuration = parseFloat(event.duration.toFixed(1));

      // Finalize cycle
      const stats = this.medicStats.get(medicId);
      if (stats) {
        stats.uberCycles.push(cycle);
      }

      // Start new cycle for next uber build
      this.activeMedicCycles.set(medicId, {
        medicSteamId: medicId,
        chargeStartTime: event.timestamp,
      });
      this.medicChargePercent.set(medicId, 0);
    }
  }

  private handleKill(event: any): void {
    // Check if victim is a medic
    if (event.victim.steamId && event.victim.steamId.id3) {
      this.handleMedicDeath({
        type: 'medic_death',
        timestamp: event.timestamp,
        medic: event.victim,
        killer: event.killer,
      });
    }
  }

  private handleMedicDeath(event: any): void {
    const medicId = event.medic?.steamId?.id3;
    if (!medicId) return;

    const stats = this.medicStats.get(medicId);
    if (!stats) return;

    const cycle = this.activeMedicCycles.get(medicId);

    // Use uberPct from event if available, otherwise use tracked percentage
    const chargePercent = event.uberPct !== undefined ? event.uberPct : (this.medicChargePercent.get(medicId) || 0);

    // Check if near full charge (90%+)
    if (chargePercent >= 90) {
      stats.nearFullChargeDeaths++;

      if (cycle) {
        cycle.deathDuringBuild = {
          timestamp: event.timestamp,
          chargePercent: parseFloat(chargePercent.toFixed(1)),
          nearFullCharge: true,
        };
      }
    }

    // Check for major advantage lost (80%+)
    if (chargePercent >= 80) {
      stats.majorAdvantagesLost++;
    }

    // Track biggest advantage lost
    if (chargePercent > stats.biggestAdvantageLost) {
      stats.biggestAdvantageLost = parseFloat(chargePercent.toFixed(1));
    }

    // Check if death was shortly after popping uber
    const lastPopTime = this.recentUberPops.get(medicId);
    if (lastPopTime && (event.timestamp - lastPopTime) <= 5) {
      stats.deathsAfterCharge++;

      if (cycle) {
        cycle.deathAfterUse = {
          timestamp: event.timestamp,
          secondsAfterPop: parseFloat((event.timestamp - lastPopTime).toFixed(1)),
        };
      }
    }

    // End current cycle on death
    if (cycle) {
      stats.uberCycles.push(cycle);
      this.activeMedicCycles.delete(medicId);
    }

    this.medicChargePercent.set(medicId, 0);
  }

  finalize(): MedicStats[] {
    const allStats: MedicStats[] = [];

    for (const stats of this.medicStats.values()) {
      // Calculate averages
      const buildTimes = stats.uberCycles
        .filter(c => c.timeToBuild !== undefined)
        .map(c => c.timeToBuild!);

      const waitTimes = stats.uberCycles
        .filter(c => c.timeBeforeUsing !== undefined)
        .map(c => c.timeBeforeUsing!);

      const uberLengths = stats.uberCycles
        .filter(c => c.uberDuration !== undefined)
        .map(c => c.uberDuration!);

      stats.avgTimeToBuild = buildTimes.length > 0
        ? parseFloat((buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length).toFixed(1))
        : 0;

      stats.avgTimeBeforeUsing = waitTimes.length > 0
        ? parseFloat((waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length).toFixed(1))
        : 0;

      stats.avgUberLength = uberLengths.length > 0
        ? parseFloat((uberLengths.reduce((a, b) => a + b, 0) / uberLengths.length).toFixed(1))
        : 0;

      allStats.push(stats);
    }

    return allStats;
  }

  getMedicStats(steamId: string): MedicStats | undefined {
    return this.medicStats.get(steamId);
  }

  getAllMedicStats(): MedicStats[] {
    return this.finalize();
  }
}
