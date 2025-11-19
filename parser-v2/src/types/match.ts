/**
 * Match and round aggregation types
 */

import { Team } from './events';
import { PlayerStats, HealSpread, KillSpread, AssistSpread } from './player';
import { GameEvent } from './events';

export interface TeamStats {
  score: number;
  kills: number;
  damage: number;
  heals: number;
  charges: number; // Ubers used
  drops: number; // Ubers dropped
  firstcaps: number;
  caps: number; // Total point captures
}

export interface RoundTeamStats {
  score: number;
  kills: number;
  damage: number;
  ubers: number;
}

export interface CaptureEvent {
  team: Team;
  time: number; // Seconds since round start
  name: string;
}

export interface Round {
  roundNumber: number;
  roundBegin: number; // Unix timestamp
  roundEnd: number; // Unix timestamp
  roundDuration: number; // Seconds
  winner: Team;
  firstCap: Team | null;
  overtime: boolean;

  teamScores: {
    red: RoundTeamStats;
    blue: RoundTeamStats;
  };

  captureEvents: CaptureEvent[];
  events: GameEvent[]; // All events that occurred in this round

  // Per-player performance in this round
  playerPerformance: Record<
    string,
    {
      kills: number;
      deaths: number;
      damage: number;
      heals: number;
    }
  >;
}

export interface MatchInfo {
  logId: number;
  map: string;
  title: string;
  date: number; // Unix timestamp of match start
  matchLength: number; // Seconds
  winner: Team;
  status: 'completed' | 'incomplete' | 'error';

  // Pause tracking
  pauseData: {
    lastPause: number;
    pauseSum: number;
  };
}

export interface IntervalData {
  red: number[];
  blue: number[];
}

export interface KillStreak {
  player: string;
  streak: number;
  timestamp: number;
}

export interface ParsedMatch {
  // Match metadata
  info: MatchInfo;

  // Team-level stats
  teams: {
    red: TeamStats;
    blue: TeamStats;
  };

  // Player stats
  players: Record<string, PlayerStats>; // steamId64 -> PlayerStats

  // Rounds
  rounds: Round[];

  // Events (chronological)
  events: GameEvent[];

  // Chat messages
  chat: Array<{
    steamId64: string;
    timestamp: number;
    message: string;
  }>;

  // Spreads (for detailed analysis)
  healSpread: HealSpread;
  killSpread: KillSpread;
  assistSpread: AssistSpread;

  // Time-series data
  damagePerInterval: IntervalData;
  healsPerInterval: IntervalData;

  // Killstreaks
  killStreaks: Record<string, KillStreak[]>;

  // Parser metadata
  parserMetadata: {
    version: string;
    parseTime: number; // Milliseconds
    linesProcessed: number;
    errors: ParseError[];
    warnings: ParseWarning[];
  };
}

export interface ParseError {
  level: 'fatal' | 'error' | 'warning' | 'info';
  message: string;
  lineNumber?: number;
  rawLine?: string;
  context?: Record<string, unknown>;
}

export interface ParseWarning {
  message: string;
  lineNumber?: number;
  rawLine?: string;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedMatch;
  errors: ParseError[];
  warnings: ParseWarning[];
  metadata: {
    parseTime: number; // Milliseconds
    linesProcessed: number;
    version: string;
    source: 'cache' | 'database' | 'logs.tf';
  };
}
