/**
 * TypeScript types for Player Card components
 */

export interface PlayerCardData {
  seasonid: number;
  format: string;
  class: string;
  division: string;
  league: string;
  seasonname: string;
  rglname: string;
  cbt: number;
  spt: number;
  srv: number;
  eff: number;
  dmg: number;
  eva: number;
}

export interface SeasonCard {
  exists: boolean;
  cardUrl: string | null;
  holo: boolean;
}

export type CardFormat = 'HL' | '6S';
