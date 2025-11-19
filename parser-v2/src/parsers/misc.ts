/**
 * Miscellaneous event parser - Chat, pickups, dominations, etc.
 */

import {
  DominationEvent,
  RevengeEvent,
  ExtinguishEvent,
  ItemPickupEvent,
  ChatMessageEvent,
  PauseEvent,
  PlayerIdentifier,
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
    team: player.team.toLowerCase() as any,
    userId: player.userId,
  };
}

export function parseMiscEvent(token: RawToken):
  | DominationEvent
  | RevengeEvent
  | ExtinguishEvent
  | ItemPickupEvent
  | ChatMessageEvent
  | PauseEvent
  | null {

  const { rawLine, timestamp, lineNumber, players } = token;

  if (!timestamp) return null;

  const baseEvent = {
    timestamp,
    rawLine,
    lineNumber,
  };

  // Domination
  if (rawLine.includes('triggered "domination"')) {
    if (players.length >= 2) {
      const dominator = createPlayerIdentifier(players[0]);
      const dominated = createPlayerIdentifier(players[1]);

      return {
        ...baseEvent,
        type: 'domination',
        dominator,
        dominated,
      };
    }
  }

  // Revenge
  if (rawLine.includes('triggered "revenge"')) {
    if (players.length >= 2) {
      const avenger = createPlayerIdentifier(players[0]);
      const victim = createPlayerIdentifier(players[1]);

      return {
        ...baseEvent,
        type: 'revenge',
        avenger,
        victim,
      };
    }
  }

  // Extinguish
  if (rawLine.includes('triggered "player_extinguished"')) {
    if (players.length >= 2) {
      const extinguisher = createPlayerIdentifier(players[0]);
      const target = createPlayerIdentifier(players[1]);

      return {
        ...baseEvent,
        type: 'extinguish',
        extinguisher,
        target,
      };
    }
  }

  // Item pickup
  if (rawLine.includes('picked up item')) {
    if (players.length >= 1) {
      const player = createPlayerIdentifier(players[0]);
      const itemMatch = rawLine.match(/picked up item "([^"]+)"/);
      const item = itemMatch ? itemMatch[1] : 'unknown';

      // Extract healing value if present (for medkits)
      const healingMatch = rawLine.match(/\(healing "(\d+)"\)/);
      const healing = healingMatch ? parseInt(healingMatch[1]) : undefined;

      return {
        ...baseEvent,
        type: 'item_pickup',
        player,
        item,
        healing,
      };
    }
  }

  // Chat message
  if (rawLine.includes('say "')) {
    if (players.length >= 1) {
      const player = createPlayerIdentifier(players[0]);
      const messageMatch = rawLine.match(/say "([^"]+)"/);
      const message = messageMatch ? messageMatch[1] : '';

      return {
        ...baseEvent,
        type: 'chat',
        player,
        message,
      };
    }
  }

  // Pause/Unpause
  if (rawLine.includes('pause') || rawLine.includes('unpause')) {
    const type = rawLine.includes('unpause') ? 'unpause' : 'pause';

    return {
      ...baseEvent,
      type,
    };
  }

  return null;
}
