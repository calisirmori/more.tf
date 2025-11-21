/**
 * TypeScript types for Trends components
 */

export interface TrendData {
  class: string;
  matches: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
}

export interface FormatTrendData {
  format: string;
  matches: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
}

export interface TrendsFilter {
  timeRange: number; // 0-100 slider value
  minMatches: number; // 0-100 slider value
  showWins: boolean;
  showLosses: boolean;
}
