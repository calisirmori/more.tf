/**
 * TypeScript type definitions for Profile v2
 * Clean, well-organized types for all profile-related data
 */

export interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
  avatar: string;
  profileurl: string;
  loccountrycode?: string;
}

export interface TeamInfo {
  id: string;
  tag: string;
  name?: string;
}

export interface RGLProfile {
  name?: string;
  currentTeams?: {
    highlander?: TeamInfo | null;
    sixes?: TeamInfo | null;
  };
}

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
}

export interface SocialLinks {
  youtube?: string;
  twitch?: string;
  twitter?: string;
  discord?: string;
}

export interface ProfileData {
  playerSteamInfo: SteamProfile;
  rglInfo: RGLProfile;
  badges?: Badge[];
  socialLinks?: SocialLinks;
  inventoryCount?: number;
  isOwnProfile?: boolean;
}

export type ProfileTab = 'overview' | 'matches' | 'peers' | 'activity' | 'gallery';

export const PROFILE_TABS: ProfileTab[] = ['overview', 'matches', 'peers', 'activity', 'gallery'];
