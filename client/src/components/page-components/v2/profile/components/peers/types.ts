/**
 * TypeScript types for Peers components
 */

export interface Peer {
  peer_id64: string;
  w: string | number;
  l: string | number;
  count: number;
}

export interface PeerSteamInfo {
  [steamId: string]: {
    avatarfull: string;
    personaname: string;
  };
}
