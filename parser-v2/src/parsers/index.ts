/**
 * Main event parser - Orchestrates all event parsers
 */

import { GameEvent } from '../types/events';
import { RawToken, TokenCategory } from '../tokenizer';
import { parseWorldEvent } from './world';
import { parsePlayerStateEvent } from './player';
import { parseCombatEvent } from './combat';
import { parseMedicEvent } from './medic';
import { parseObjectiveEvent } from './objectives';
import { parseMiscEvent } from './misc';

/**
 * Parse a token into a typed event
 */
export function parseEvent(token: RawToken): GameEvent | null {
  // Route to appropriate parser based on category
  switch (token.category) {
    case TokenCategory.WORLD_EVENT:
      return parseWorldEvent(token);

    case TokenCategory.PLAYER_STATE:
      return parsePlayerStateEvent(token);

    case TokenCategory.COMBAT:
      return parseCombatEvent(token);

    case TokenCategory.MEDIC:
      return parseMedicEvent(token);

    case TokenCategory.OBJECTIVE:
      return parseObjectiveEvent(token);

    case TokenCategory.CHAT:
    case TokenCategory.PAUSE:
    case TokenCategory.MISC:
      return parseMiscEvent(token);

    default:
      return null;
  }
}

/**
 * Parse all tokens into events
 */
export function parseEvents(tokens: RawToken[]): GameEvent[] {
  const events: GameEvent[] = [];

  for (const token of tokens) {
    const event = parseEvent(token);
    if (event) {
      events.push(event);
    }
  }

  return events;
}

/**
 * Get parsing statistics
 */
export function getParseStats(tokens: RawToken[], events: GameEvent[]): {
  tokensProcessed: number;
  eventsGenerated: number;
  parseRate: number;
  eventsByType: Record<string, number>;
} {
  const eventsByType: Record<string, number> = {};

  for (const event of events) {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
  }

  return {
    tokensProcessed: tokens.length,
    eventsGenerated: events.length,
    parseRate: events.length / tokens.length,
    eventsByType,
  };
}
