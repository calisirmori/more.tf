/**
 * Objective event parser - Point captures, building events
 */

import {
  PointCapturedEvent,
  CaptureBlockedEvent,
  BuildingBuiltEvent,
  BuildingKilledEvent,
  PlayerIdentifier,
  Position,
  Team,
} from '../types/events';
import { RawToken } from '../tokenizer';
import {
  steamId3ToId64,
  PLAYER_PATTERN,
  POSITION_PATTERN,
  OBJECT_TYPE_PATTERN,
  WEAPON_PATTERN,
  extractString,
} from '../tokenizer/patterns';

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

export function parseObjectiveEvent(token: RawToken):
  | PointCapturedEvent
  | CaptureBlockedEvent
  | BuildingBuiltEvent
  | BuildingKilledEvent
  | null {

  const { rawLine, timestamp, lineNumber, players } = token;

  if (!timestamp) return null;

  const baseEvent = {
    timestamp,
    rawLine,
    lineNumber,
  };

  // Point captured
  if (rawLine.includes('triggered "pointcaptured"')) {
    const teamMatch = rawLine.match(/Team "([^"]+)"/);
    const cpMatch = rawLine.match(/\(cp "([^"]+)"\)/);
    const cpnameMatch = rawLine.match(/\(cpname "([^"]+)"\)/);

    if (teamMatch && cpMatch && cpnameMatch) {
      const team = teamMatch[1].toLowerCase() as Team;
      const cpNumber = cpMatch[1];
      const cpName = cpnameMatch[1];

      // Extract all cappers with positions
      const cappers: Array<{ player: PlayerIdentifier; position: Position }> = [];

      // Find all player entries (player1, player2, etc.)
      const playerMatches = rawLine.match(/\(player\d+ "([^"<>]+)<(\d+)><(\[U:1:\d+\])><([^"]+)>"\)/g);
      const positionMatches = rawLine.match(/\(position\d+ "([^"]+)"\)/g);

      if (playerMatches && positionMatches) {
        for (let i = 0; i < Math.min(playerMatches.length, positionMatches.length); i++) {
          const playerMatch = playerMatches[i].match(/"([^"<>]+)<(\d+)><(\[U:1:\d+\])><([^"]+)>"/);
          const posMatch = positionMatches[i].match(/"([^"]+)"/);

          if (playerMatch && posMatch) {
            const [x, y, z] = posMatch[1].split(' ').map(Number);
            cappers.push({
              player: createPlayerIdentifier({
                name: playerMatch[1],
                userId: playerMatch[2],
                steamId3: playerMatch[3],
                team: playerMatch[4],
              }),
              position: { x, y, z },
            });
          }
        }
      }

      return {
        ...baseEvent,
        type: 'point_captured',
        team,
        cpName,
        cpNumber,
        cappers,
      };
    }
  }

  // Capture blocked
  if (rawLine.includes('triggered "captureblocked"')) {
    if (players.length >= 1) {
      const player = createPlayerIdentifier(players[0]);

      return {
        ...baseEvent,
        type: 'capture_blocked',
        player,
      };
    }
  }

  // Building built
  if (rawLine.includes('triggered "player_builtobject"')) {
    if (players.length >= 1) {
      const player = createPlayerIdentifier(players[0]);
      const building = extractString(rawLine, OBJECT_TYPE_PATTERN) || 'unknown';

      return {
        ...baseEvent,
        type: 'building_built',
        player,
        building,
      };
    }
  }

  // Building killed
  if (rawLine.includes('triggered "killedobject"')) {
    if (players.length >= 1) {
      const attacker = createPlayerIdentifier(players[0]);
      const building = extractString(rawLine, OBJECT_TYPE_PATTERN) || 'unknown';
      const weapon = extractString(rawLine, WEAPON_PATTERN) || 'unknown';

      // Try to find object owner
      const ownerMatch = rawLine.match(/\(objectowner "([^"<>]+)<(\d+)><(\[U:1:\d+\])><([^"]+)>"\)/);
      const owner = ownerMatch ? createPlayerIdentifier({
        name: ownerMatch[1],
        userId: ownerMatch[2],
        steamId3: ownerMatch[3],
        team: ownerMatch[4],
      }) : attacker; // Fallback to attacker if owner not found

      // Extract attacker position
      const posMatch = rawLine.match(/\(attacker_position "([^"]+)"\)/);
      const attackerPosition: Position = posMatch
        ? (() => {
            const [x, y, z] = posMatch[1].split(' ').map(Number);
            return { x, y, z };
          })()
        : { x: 0, y: 0, z: 0 };

      return {
        ...baseEvent,
        type: 'building_killed',
        attacker,
        building,
        owner,
        weapon,
        attackerPosition,
      };
    }
  }

  return null;
}
