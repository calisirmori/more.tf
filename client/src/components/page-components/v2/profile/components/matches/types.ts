/**
 * TypeScript types for Match History components
 */

export interface Match {
  logid: string;
  class: string;
  match_result: 'W' | 'L' | 'T';
  map: string;
  title: string;
  kills: number;
  deaths: number;
  assists: number;
  dpm: number;
  heals: number;
  dtm: number;
  format: string;
  match_length: number;
  date: number;
}

export type MatchResult = 'W' | 'L' | 'T';

export const MATCH_RESULT_STYLES: Record<MatchResult, string> = {
  W: 'bg-green-600',
  L: 'bg-red-600',
  T: 'bg-stone-500',
};
