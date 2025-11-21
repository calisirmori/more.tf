/**
 * TypeScript types for Card Showcase components
 */

export interface ShowcaseCard {
  id: number;
  cardUrl: string;
  holo: boolean;
  rarity: string;
  seasonname: string;
  division: string;
  class: string;
  overall: number;
  favorite_slot: number;
  gifted_from: string | null;
  gifter_name: string | null;
  gifter_avatar: string | null;
  cbt: number;
  eff: number;
  eva: number;
  dmg: number;
  spt: number;
  srv: number;
  rglname: string;
  format: string;
  league: string;
}

export type CardRarity = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export const RARITY_STYLES = {
  borderColors: {
    legendary: 'border-yellow-500',
    epic: 'border-purple-500',
    rare: 'border-blue-500',
    uncommon: 'border-green-500',
    common: 'border-gray-600',
  } as Record<CardRarity, string>,

  backgroundColors: {
    legendary: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20',
    epic: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
    rare: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
    uncommon: 'bg-gradient-to-br from-green-900/20 to-emerald-900/20',
    common: 'bg-warmscale-7',
  } as Record<CardRarity, string>,

  gradientColors: {
    legendary: 'from-yellow-400 to-orange-500',
    epic: 'from-purple-400 to-pink-500',
    rare: 'from-blue-400 to-cyan-500',
    uncommon: 'from-green-400 to-emerald-500',
    common: 'from-gray-400 to-gray-500',
  } as Record<CardRarity, string>,
};
