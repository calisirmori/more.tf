/**
 * Combat event parser - Kills, damage, assists, shots
 */

import {
  DamageEvent,
  KillEvent,
  AssistEvent,
  SuicideEvent,
  ShotFiredEvent,
  ShotHitEvent,
  PlayerIdentifier,
  Position,
} from '../types/events';
import { RawToken } from '../tokenizer';
import {
  steamId3ToId64,
  DAMAGE_VALUE_PATTERN,
  REAL_DAMAGE_PATTERN,
  WEAPON_PATTERN,
  CRIT_PATTERN,
  HEADSHOT_PATTERN,
  AIRSHOT_PATTERN,
  CUSTOM_KILL_PATTERN,
  extractValue,
  extractString,
  hasPattern,
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

export function parseCombatEvent(token: RawToken):
  | DamageEvent
  | KillEvent
  | AssistEvent
  | SuicideEvent
  | ShotFiredEvent
  | ShotHitEvent
  | null {

  const { rawLine, timestamp, lineNumber, players, positions } = token;

  if (!timestamp) return null;

  const baseEvent = {
    timestamp,
    rawLine,
    lineNumber,
  };

  // Kill event
  if (rawLine.includes('" killed "')) {
    if (players.length >= 2 && positions.length >= 2) {
      const killer = createPlayerIdentifier(players[0]);
      const victim = createPlayerIdentifier(players[1]);
      const weapon = extractString(rawLine, /with "([^"]+)"/) || 'unknown';
      const customKill = extractString(rawLine, CUSTOM_KILL_PATTERN);

      // Calculate distance
      const [attackerPos, victimPos] = positions;
      const distance = Math.round(
        Math.sqrt(
          Math.pow(attackerPos.x - victimPos.x, 2) +
          Math.pow(attackerPos.y - victimPos.y, 2) +
          Math.pow(attackerPos.z - victimPos.z, 2)
        )
      );

      return {
        ...baseEvent,
        type: 'kill',
        killer,
        victim,
        weapon,
        customKill: customKill || undefined,
        attackerPosition: attackerPos,
        victimPosition: victimPos,
        distance,
      };
    }
  }

  // Damage event
  if (rawLine.includes('triggered "damage"')) {
    if (players.length >= 2) {
      const attacker = createPlayerIdentifier(players[0]);
      const victim = createPlayerIdentifier(players[1]);
      const damage = extractValue(rawLine, DAMAGE_VALUE_PATTERN) || 0;
      const realDamage = extractValue(rawLine, REAL_DAMAGE_PATTERN);
      const weapon = extractString(rawLine, WEAPON_PATTERN) || 'unknown';

      return {
        ...baseEvent,
        type: 'damage',
        attacker,
        victim,
        damage,
        realDamage: realDamage || undefined,
        weapon,
        crit: hasPattern(rawLine, CRIT_PATTERN),
        headshot: hasPattern(rawLine, HEADSHOT_PATTERN),
        airshot: hasPattern(rawLine, AIRSHOT_PATTERN),
      };
    }
  }

  // Kill assist
  if (rawLine.includes('triggered "kill assist"')) {
    if (players.length >= 2 && positions.length >= 3) {
      const assister = createPlayerIdentifier(players[0]);
      const victim = createPlayerIdentifier(players[1]);

      return {
        ...baseEvent,
        type: 'assist',
        assister,
        victim,
        attackerPosition: positions[1], // Attacker position
        assisterPosition: positions[0], // Assister position
        victimPosition: positions[2],   // Victim position
      };
    }
  }

  // Suicide
  if (rawLine.includes('committed suicide')) {
    if (players.length >= 1) {
      const player = createPlayerIdentifier(players[0]);
      const weapon = extractString(rawLine, /committed suicide with "([^"]+)"/) || 'world';

      return {
        ...baseEvent,
        type: 'suicide',
        player,
        weapon,
      };
    }
  }

  // Shot fired
  if (rawLine.includes('triggered "shot_fired"')) {
    if (players.length >= 1) {
      const player = createPlayerIdentifier(players[0]);
      const weapon = extractString(rawLine, WEAPON_PATTERN) || 'unknown';

      return {
        ...baseEvent,
        type: 'shot_fired',
        player,
        weapon,
      };
    }
  }

  // Shot hit
  if (rawLine.includes('triggered "shot_hit"')) {
    if (players.length >= 1) {
      const player = createPlayerIdentifier(players[0]);
      const weapon = extractString(rawLine, WEAPON_PATTERN) || 'unknown';

      return {
        ...baseEvent,
        type: 'shot_hit',
        player,
        weapon,
      };
    }
  }

  return null;
}
