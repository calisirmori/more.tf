/**
 * Player state event parser - Connections, role changes, spawns
 */

import {
  PlayerConnectedEvent,
  PlayerDisconnectedEvent,
  PlayerRoleChangeEvent,
  PlayerTeamChangeEvent,
  PlayerSpawnEvent,
  PlayerIdentifier,
  TF2Class,
  Team,
} from '../types/events';
import { RawToken } from '../tokenizer';
import { steamId3ToId64 } from '../tokenizer/patterns';

function createPlayerIdentifier(player: {
  name: string;
  userId: string;
  steamId3: string;
  team: string;
}): PlayerIdentifier {
  return {
    name: player.name,
    steamId: {
      id3: player.steamId3,
      id64: steamId3ToId64(player.steamId3),
    },
    team: player.team.toLowerCase() as Team,
    userId: player.userId,
  };
}

export function parsePlayerStateEvent(token: RawToken):
  | PlayerConnectedEvent
  | PlayerDisconnectedEvent
  | PlayerRoleChangeEvent
  | PlayerTeamChangeEvent
  | PlayerSpawnEvent
  | null {

  const { rawLine, timestamp, lineNumber, players } = token;

  if (!timestamp || players.length === 0) return null;

  const baseEvent = {
    timestamp,
    rawLine,
    lineNumber,
  };

  const player = createPlayerIdentifier(players[0]);

  // Player connected
  if (rawLine.includes('connected, address') || rawLine.includes('entered the game')) {
    return {
      ...baseEvent,
      type: 'player_connected',
      player,
    };
  }

  // Player disconnected
  if (rawLine.includes('disconnected')) {
    return {
      ...baseEvent,
      type: 'player_disconnected',
      player,
    };
  }

  // Role change
  if (rawLine.includes('changed role to')) {
    const classMatch = rawLine.match(/changed role to "([^"]+)"/);
    if (classMatch) {
      return {
        ...baseEvent,
        type: 'player_role_change',
        player,
        class: classMatch[1] as TF2Class,
      };
    }
  }

  // Team change
  if (rawLine.includes('joined team')) {
    const teamMatch = rawLine.match(/joined team "([^"]+)"/);
    if (teamMatch) {
      return {
        ...baseEvent,
        type: 'player_team_change',
        player,
        newTeam: teamMatch[1].toLowerCase() as Team,
      };
    }
  }

  // Spawn
  if (rawLine.includes('spawned as')) {
    const classMatch = rawLine.match(/spawned as "([^"]+)"/);
    if (classMatch) {
      return {
        ...baseEvent,
        type: 'player_spawn',
        player,
        class: classMatch[1] as TF2Class,
      };
    }
  }

  return null;
}
