/**
 * Log Summary Types
 * Focused summary information for quick overview
 */

import { Team } from './events';

/**
 * Primary match information summary
 */
export interface LogSummary {
  // Basic match info
  logId: number;
  map: string;
  title: string;

  // Duration and timing
  duration: number; // seconds
  durationFormatted: string; // e.g., "32:45"
  startTime: number; // unix timestamp
  endTime: number; // unix timestamp
  startTimeFormatted: string; // e.g., "2025-11-19 14:32:15"
  endTimeFormatted: string; // e.g., "2025-11-19 15:05:00"

  // Match outcome
  winner: Team | 'tie';
  finalScore: {
    red: number;
    blue: number;
  };

  // Round information
  rounds: {
    total: number;
    redWins: number;
    blueWins: number;
  };

  // Quick team stats
  teams: {
    red: TeamSummary;
    blue: TeamSummary;
  };

  // Player count
  playerCount: {
    total: number;
    red: number;
    blue: number;
  };
}

/**
 * Quick team summary
 */
export interface TeamSummary {
  team: Team;
  score: number;
  kills: number;
  deaths: number;
  damage: number;
  healing: number;
  ubers: number;
  drops: number;

  // Derived stats
  kd: number; // kills / deaths ratio
  dpm: number; // damage per minute
  hpm: number; // healing per minute (medic only relevant)
}
