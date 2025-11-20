/**
 * V2 Parser Output Structure
 * Industry-standard format with four main sections:
 * 1. Game Totals - Summarized statistics for the entire match
 * 2. Comparative Stats - Player-by-player comparative statistics
 * 3. Time-Based Data - Events organized into 10-second buckets
 * 4. Additional Data - Players, rounds, metadata, etc.
 */

import { TF2Class, Team, GameEvent } from './events';
import { TimeBucketedData } from '../utils/time-buckets';

// ==================== SECTION 1: GAME TOTALS ====================

export interface WeaponStats {
  weapon: string;

  // Combat stats per weapon
  kills: number;
  damage: number;

  // Accuracy (for weapons that track shots)
  shotsFired?: number;
  shotsHit?: number;
  accuracy?: number;

  // Special kills
  headshots?: number;
  backstabs?: number;
  airshots?: number;
}

export interface ClassStats {
  class: TF2Class;
  playtimeSeconds: number;

  // Per-weapon breakdown
  weapons: WeaponStats[];

  // Combat stats per class (totals across all weapons)
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;

  // Class-specific
  healing?: number;
  ubers?: number;
  drops?: number;
  airshots?: number;
  headshots?: number;
  backstabs?: number;

  // Accuracy (totals across all weapons)
  shotsFired?: number;
  shotsHit?: number;
  accuracy?: number;

  // Objectives
  medkits: number;
  medkitsHealth: number;
  capturePointsCapped: number;
  capturesBlocked: number;
  buildingsBuilt: number;
  buildingsDestroyed: number;
}

export interface PlayerSession {
  connectedAt: number;
  disconnectedAt?: number;
  durationSeconds?: number;
}

export interface PlayerGameTotals {
  steamId: string;
  name: string;
  team: Team;
  primaryClass: TF2Class;

  // Playtime and class tracking
  totalPlaytimeSeconds: number; // Total time in game (sum of all sessions)
  classesPlayed: TF2Class[]; // All classes played
  sessions: PlayerSession[]; // All connection sessions

  // Per-class stats breakdown
  classes: ClassStats[]; // Stats broken down by class

  // Overall match totals (sum across all classes)
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;

  // Class-specific totals
  healing?: number; // Medic
  ubers?: number; // Medic
  drops?: number; // Medic
  airshots?: number; // Soldier/Demo
  headshots?: number; // Sniper
  backstabs?: number; // Spy

  // Accuracy (for hitscan)
  shotsFired?: number;
  shotsHit?: number;
  accuracy?: number;

  // Advanced stats
  medkits: number;
  medkitsHealth: number;
  capturePointsCapped: number;
  capturesBlocked: number;
  buildingsBuilt: number;
  buildingsDestroyed: number;
}

export interface TeamGameTotals {
  team: Team;
  score: number;
  kills: number;
  deaths: number;
  damage: number;
  healing: number;
  ubers: number;
  drops: number;
  capturePoints: number;
}

export interface GameTotals {
  // Match info
  logId: number;
  map: string;
  title: string;
  duration: number; // seconds
  startTime: number; // unix timestamp
  endTime: number; // unix timestamp

  // Winning team
  winner?: Team;

  // Team totals
  teams: {
    red: TeamGameTotals;
    blue: TeamGameTotals;
  };

  // Player totals
  players: PlayerGameTotals[];

  // Round summary
  rounds: {
    total: number;
    redWins: number;
    blueWins: number;
  };
}

// ==================== SECTION 2: COMPARATIVE STATS ====================

// Matchup Stats - Player vs Player and Player vs Class
export interface PlayerMatchup {
  kills: number;
  deaths: number;
  damage: number;
  damageTaken: number;
  assists: number;
  healing: number;
}

export interface ClassMatchup {
  kills: number;
  deaths: number;
  damage: number;
  damageTaken: number;
  assists: number;
  healing: number;
}

export interface PlayerMatchupStats {
  steamId: string;
  // name removed - look up from playerNames map
  vsPlayers: Record<string, PlayerMatchup>;  // Player to Player
  vsClasses: Record<TF2Class, ClassMatchup>; // Player to Class
}

export interface MatchupStats {
  players: PlayerMatchupStats[];
}

// Summary Stats - Overall player performance
export interface PlayerComparativeStats {
  steamId: string;
  name: string;
  team: Team;
  primaryClass: TF2Class;

  // Core stats
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  healing: number;

  // Derived stats
  kd: number; // kills/deaths ratio
  kda: number; // (kills + assists) / deaths
  dpm: number; // damage per minute
  hpm: number; // healing per minute

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

// Matchup stats moved to root level, summary merged into top-level summary
export type ComparativeStats = MatchupStats;

// ==================== SECTION 3: TIME-BASED DATA ====================
// This contains ALL time-sensitive events organized into 10-second buckets
// This is the actual event log that the slider will use

export interface TimeBucket {
  // Bucket info
  bucketIndex: number;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  relativeStartTime: string; // e.g., "5:30"
  relativeEndTime: string; // e.g., "5:40"

  // All time-based events in this bucket
  // Includes: kills, damage, healing, spawns, ubers, objectives, etc.
  events: GameEvent[];
}

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
  startTime: number;
  endTime: number;
  relativeStartTime: string;
  relativeEndTime: string;
  durationSeconds: number;
  red: TeamIntervalStats;
  blue: TeamIntervalStats;
  players: PlayerIntervalStats[];
}

export interface TimeBasedData {
  intervalSeconds: number;
  totalIntervals: number;
  matchStartTime: number;
  matchEndTime: number;
  matchDurationSeconds: number;
  intervals: IntervalStats[];
}

// ==================== KILLSTREAK TRACKING ====================

export interface KillInStreak {
  victim: string; // steamId
  timestamp: number;
  weapon: string;
  secondsIntoStreak: number;
}

export interface Killstreak {
  killer: string; // steamId
  killerName: string;
  team: Team;
  kills: number;
  startTime: number;
  endTime: number;
  duration: number;
  victims: KillInStreak[];
}

// ==================== UBER TRACKING ====================

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
  totalDamageTaken: number;
}

export interface UberTracking {
  timestamp: number;
  medicSteamId: string;
  medicName: string;
  team: Team;
  duration: number;

  deathsBefore: UberDeathBefore[];
  significantDamage: SignificantDamage[]; // Players who took 100+ damage during uber
  deathsDuring: UberDeathDuring[];

  totalDamageTaken: number;
  advantageLost: number;
}

// ==================== SECTION 4: OTHER/NON-TIME-SENSITIVE DATA ====================
// This contains data that is not time-sensitive: chat, player info, rounds, etc.

export interface PlayerDetails {
  steamId: string;
  steamId64: string;
  name: string;
  team: Team;
  classesPlayed: TF2Class[];
  primaryClass: TF2Class;
  connected: number;
  disconnected?: number;
}

export interface RoundTeamStats {
  score: number;
  kills: number;
  damage: number;
  ubers: number;
}

export interface RoundPlayerPerformance {
  kills: number;
  deaths: number;
  damage: number;
  heals: number;
}

export interface RoundDetails {
  roundNumber: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  winner?: Team;
  score: {
    red: number;
    blue: number;
  };
  teamStats?: {
    red: RoundTeamStats;
    blue: RoundTeamStats;
  };
  playerPerformance?: Record<string, RoundPlayerPerformance>;
  firstCap?: Team | null;
  midfight?: Team | null; // Winner of midfight (first cap of the round)
  overtime?: boolean;
}

export interface ChatMessage {
  timestamp: number;
  steamId: string;
  playerName: string;
  team: Team;
  message: string;
  isTeamChat: boolean;
}

// ==================== MEDIC STATS ====================

export interface MedicUberCycle {
  medicSteamId: string;
  chargeStartTime: number;
  chargeReadyTime?: number;
  chargeUsedTime?: number;
  chargeEndTime?: number;
  timeToBuild?: number;
  timeBeforeUsing?: number;
  uberDuration?: number;
  deathDuringBuild?: {
    timestamp: number;
    chargePercent: number;
    nearFullCharge: boolean;
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
  totalUbersBuilt: number;
  avgTimeToBuild: number;
  totalUbersUsed: number;
  avgTimeBeforeUsing: number;
  avgUberLength: number;
  nearFullChargeDeaths: number;
  deathsAfterCharge: number;
  majorAdvantagesLost: number;
  biggestAdvantageLost: number;
  uberCycles: MedicUberCycle[];
}

export interface OtherData {
  // Player roster
  players: PlayerDetails[];

  // Round information
  rounds: RoundDetails[];

  // Chat log (non-time-sensitive - separate from time-based events)
  chat: ChatMessage[];

  // Uber tracking with context
  ubers: UberTracking[];

  // Killstreak tracking (3+ kills within 30 seconds)
  killstreaks: Killstreak[];

  // Medic statistics (detailed medic performance)
  medicStats: MedicStats[];

  // Server info
  serverInfo?: {
    ip?: string;
    port?: number;
    sv_tags?: string[];
  };
}

// ==================== MAIN OUTPUT STRUCTURE ====================

export interface ParsedLog {
  // Metadata
  parserVersion: string;
  parseTime: number; // milliseconds
  source: 'cache' | 'database' | 'logs.tf';

  // Player name map - single source of truth for player names
  // Key: steamId, Value: final name the player used
  playerNames: Record<string, string>;

  // Summary - Complete match overview (combines metadata, teams, players, and leaders)
  summary: {
    // Match metadata
    logId: number;
    map: string;
    title: string;
    duration: number; // seconds
    durationFormatted: string; // "MM:SS"
    startTime: number; // unix timestamp
    endTime: number; // unix timestamp
    startTimeFormatted: string; // "YYYY-MM-DD HH:MM:SS"
    endTimeFormatted: string; // "YYYY-MM-DD HH:MM:SS"
    winner?: Team;

    // Final score
    finalScore: {
      red: number;
      blue: number;
    };

    // Rounds
    rounds: {
      total: number;
      redWins: number;
      blueWins: number;
    };

    // Team stats (with player arrays)
    teams: {
      red: {
        team: Team;
        score: number;
        kills: number;
        deaths: number;
        damage: number;
        healing: number;
        ubers: number;
        drops: number;
        kd: number;
        dpm: number;
        hpm: number;

        // Team averages
        avgKills: number;
        avgDeaths: number;
        avgDamage: number;
        avgHealing: number;

        // All red team players with comparative stats
        players: PlayerComparativeStats[];
      };
      blue: {
        team: Team;
        score: number;
        kills: number;
        deaths: number;
        damage: number;
        healing: number;
        ubers: number;
        drops: number;
        kd: number;
        dpm: number;
        hpm: number;

        // Team averages
        avgKills: number;
        avgDeaths: number;
        avgDamage: number;
        avgHealing: number;

        // All blue team players with comparative stats
        players: PlayerComparativeStats[];
      };
    };

    // Player count
    playerCount: {
      total: number;
      red: number;
      blue: number;
    };
  };

  // Section 1: Game Totals (summarized statistics)
  gameTotals: GameTotals;

  // Section 2: Matchup Stats (player vs player and player vs class)
  matchups: ComparativeStats;

  // Section 3: Time-Based Data (actual events in 10-second buckets)
  timeBasedData: TimeBasedData;

  // Section 4: Other Data (non-time-sensitive info)
  otherData: OtherData;

  // Errors and warnings
  errors: Array<{
    level: 'warning' | 'error' | 'fatal';
    message: string;
    context?: any;
    lineNumber?: number;
  }>;

  warnings: Array<{
    message: string;
    lineNumber?: number;
  }>;
}

// ==================== PARSE RESULT ====================

export interface ParseResult {
  success: boolean;
  data?: ParsedLog;
  errors: Array<{
    level: 'warning' | 'error' | 'fatal';
    message: string;
    context?: any;
    lineNumber?: number;
  }>;
  warnings: Array<{
    message: string;
    lineNumber?: number;
  }>;
  metadata: {
    parseTime: number;
    linesProcessed: number;
    version: string;
    source: string;
  };
}
