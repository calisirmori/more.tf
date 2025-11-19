/**
 * Medic event parser - Heals, ubers, medic deaths
 */

import {
  HealEvent,
  ChargeDeployedEvent,
  ChargeEndedEvent,
  ChargeReadyEvent,
  MedicDeathEvent,
  FirstHealAfterSpawnEvent,
  PlayerIdentifier,
} from '../types/events';
import { RawToken } from '../tokenizer';
import {
  steamId3ToId64,
  HEALING_VALUE_PATTERN,
  WEAPON_PATTERN,
  AIRSHOT_PATTERN,
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

export function parseMedicEvent(token: RawToken):
  | HealEvent
  | ChargeDeployedEvent
  | ChargeEndedEvent
  | ChargeReadyEvent
  | MedicDeathEvent
  | FirstHealAfterSpawnEvent
  | null {

  const { rawLine, timestamp, lineNumber, players } = token;

  if (!timestamp) return null;

  const baseEvent = {
    timestamp,
    rawLine,
    lineNumber,
  };

  // Heal event
  if (rawLine.includes('triggered "healed"')) {
    if (players.length >= 2) {
      const healer = createPlayerIdentifier(players[0]);
      const target = createPlayerIdentifier(players[1]);
      const healing = extractValue(rawLine, HEALING_VALUE_PATTERN) || 0;
      const isCrossbow = healing > 80; // Crossbow heals are typically >80

      return {
        ...baseEvent,
        type: 'heal',
        healer,
        target,
        healing,
        crossbow: isCrossbow,
        airshot: hasPattern(rawLine, AIRSHOT_PATTERN),
      };
    }
  }

  // Charge deployed
  if (rawLine.includes('triggered "chargedeployed"')) {
    if (players.length >= 1) {
      const medic = createPlayerIdentifier(players[0]);
      const medigunMatch = rawLine.match(/\(medigun "([^"]+)"\)/);
      const medigun = medigunMatch ? medigunMatch[1] : 'medigun';

      return {
        ...baseEvent,
        type: 'charge_deployed',
        medic,
        medigun,
      };
    }
  }

  // Charge ended
  if (rawLine.includes('triggered "chargeended"')) {
    if (players.length >= 1) {
      const medic = createPlayerIdentifier(players[0]);
      const durationMatch = rawLine.match(/\(duration "([^"]+)"\)/);
      const duration = durationMatch ? parseFloat(durationMatch[1]) : 0;

      return {
        ...baseEvent,
        type: 'charge_ended',
        medic,
        duration,
      };
    }
  }

  // Charge ready
  if (rawLine.includes('triggered "chargeready"')) {
    if (players.length >= 1) {
      const medic = createPlayerIdentifier(players[0]);

      return {
        ...baseEvent,
        type: 'charge_ready',
        medic,
      };
    }
  }

  // Medic death
  if (rawLine.includes('triggered "medic_death"')) {
    if (players.length >= 2) {
      const killer = createPlayerIdentifier(players[0]);
      const medic = createPlayerIdentifier(players[1]);
      const hasUber = rawLine.includes('ubercharge "1"');
      const uberPctMatch = rawLine.match(/\(uberpct "(\d+)"\)/);
      const uberPct = uberPctMatch ? parseInt(uberPctMatch[1]) : undefined;

      return {
        ...baseEvent,
        type: 'medic_death',
        killer,
        medic,
        uberCharge: hasUber,
        uberPct,
      };
    }
  }

  // First heal after spawn
  if (rawLine.includes('triggered "first_heal_after_spawn"')) {
    if (players.length >= 1) {
      const medic = createPlayerIdentifier(players[0]);
      const timeMatch = rawLine.match(/\(time "([^"]+)"\)/);
      const time = timeMatch ? parseFloat(timeMatch[1]) : 0;

      return {
        ...baseEvent,
        type: 'first_heal_after_spawn',
        medic,
        time,
      };
    }
  }

  return null;
}
