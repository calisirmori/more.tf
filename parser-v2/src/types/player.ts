/**
 * Player statistics and aggregation types
 */

import { TF2Class, Team, SteamID } from './events';

export interface WeaponStats {
  kills: number;
  damage: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number; // Calculated: shotsHit / shotsFired
}

export interface ClassStats {
  kills: number;
  assists: number;
  deaths: number;
  damage: number;
  damageTaken: number;
  heals: number;
  weapons: Record<string, WeaponStats>;
  playtime: number; // Seconds spent on this class
}

export interface MedicStats {
  ubers: number;
  drops: number;
  uberLength: number; // Average uber length
  nearFullDeaths: number; // Deaths with >90% uber
  healAfterSpawn: number; // Average time to first heal after spawn
  uberTypes: Record<string, number>; // medigun type -> count
  averageUberLength: number; // Calculated
}

export interface ResupplyStats {
  medkit: number;
  medkitsHealingDone: number;
  ammo: number;
}

export interface DamageDivision {
  damageTo: Record<string, number>; // steamId64 -> damage dealt
  damageFrom: Record<string, number>; // steamId64 -> damage received
}

export interface PlayerStats {
  // Identity
  steamId: SteamID;
  userName: string;
  team: Team;
  primaryClass: TF2Class; // Most played class

  // Timing
  joinedGame: number; // Unix timestamp
  leftGame: number | null; // Unix timestamp or null if still in game
  playtime: number; // Total playtime in seconds

  // Combat Stats
  kills: number;
  deaths: number;
  assists: number;
  suicides: number;
  damage: number;
  damageReal: number;
  damageTaken: number;
  damageTakenReal: number;

  // Calculated Combat Stats
  damagePerMinute: number;
  damageTakenPerMinute: number;
  killsPerDeath: number;
  killAssistsPerDeath: number;

  // Medic Stats
  heals: number;
  healsPerMinute: number;
  crossbowHealing: number;
  medicStats: MedicStats;
  medicPicks: number; // Kills on enemy medics
  medicDrops: number; // Caused enemy medic to drop uber

  // Special Stats
  headshots: number;
  headshotKills: number;
  backstabs: number;
  airshots: number;
  pointCaps: number;
  capturesBlocked: number;
  extinguished: number;
  dominated: number;
  revenged: number;
  buildingKills: number;
  buildings: number;
  uberHits: number; // Hits on ubered players (0 damage)

  // Time-based Stats
  deathScreenTime: number; // Time spent dead

  // Class-specific Stats
  classStats: Record<TF2Class, ClassStats>;

  // Detailed Breakdowns
  damageDivision: DamageDivision;
  resupply: ResupplyStats;

  // Combat Score (calculated at end)
  combatScore: number;

  // Per-round performance
  roundPerformance: Record<
    number,
    {
      kills: number;
      deaths: number;
      damage: number;
      heals: number;
    }
  >;
}

export interface PlayerSnapshot {
  steamId64: string;
  name: string;
  team: Team;
  class: TF2Class;
}

// Helper type for tracking damage/kills/assists spreads
export interface PlayerSpread {
  [steamId64: string]: number;
}

export interface HealSpread {
  [healerId: string]: {
    [targetId: string]: number;
  };
}

export interface KillSpread {
  [killerId: string]: {
    [victimId: string]: number;
  };
}

export interface AssistSpread {
  [assisterId: string]: {
    [victimId: string]: number;
  };
}
