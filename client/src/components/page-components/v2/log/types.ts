/**
 * Type definitions for V2 Log Display Components
 */

export interface PlayerStats {
  steamId: string;
  name: string;
  team: 'Red' | 'Blue';
  primaryClass: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  dpm: number;
  kd: number;
  kda: number;
  damageTaken: number;
  dtm: number;
  healing?: number;
  airshots?: number;
  headshots?: number;
  backstabs?: number;
  capturePointsCapped: number;
}

export interface LogHeaderData {
  logId: number;
  map: string;
  title: string;
  startTime: string;
  duration: number;
  blueScore: number;
  redScore: number;
  winner?: 'Red' | 'Blue';
}

export interface TeamSummary {
  team: 'Red' | 'Blue';
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
  avgKills: number;
  avgDeaths: number;
  avgDamage: number;
  avgHealing: number;
  players: PlayerStats[];
}

export interface LogSummary {
  logId: number;
  map: string;
  title: string;
  duration: number;
  durationFormatted: string;
  startTime: number;
  endTime: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  winner?: string;
  finalScore: {
    red: number;
    blue: number;
  };
  rounds: {
    total: number;
    redWins: number;
    blueWins: number;
  };
  teams: {
    red: TeamSummary;
    blue: TeamSummary;
  };
  playerCount: {
    total: number;
    red: number;
    blue: number;
  };
}

export interface V2LogData {
  parserVersion: string;
  parseTime: number;
  source: 'cache' | 'database' | 'logs.tf';
  playerNames: Record<string, string>;
  summary: LogSummary;
  gameTotals: any;
  matchups: any;
  timeBasedData: any;
  otherData: any;
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
