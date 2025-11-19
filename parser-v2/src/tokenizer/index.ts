/**
 * Tokenizer - Splits log file into structured line tokens
 */

import {
  extractTimestamp,
  extractPlayers,
  extractPositions,
  hasPattern,
  TRIGGERED_PATTERN,
  WORLD_TRIGGER_PATTERN,
  KILL_PATTERN,
  DAMAGE_PATTERN,
  SUICIDE_PATTERN,
  ROLE_CHANGE_PATTERN,
  TEAM_CHANGE_PATTERN,
  SPAWNED_PATTERN,
  CONNECTED_PATTERN,
  DISCONNECTED_PATTERN,
  ITEM_PICKUP_PATTERN,
  CHAT_PATTERN,
  PAUSE_PATTERN,
  UNPAUSE_PATTERN,
} from './patterns';

export interface RawToken {
  lineNumber: number;
  timestamp: number | null;
  rawLine: string;
  category: TokenCategory;
  players: Array<{
    name: string;
    userId: string;
    steamId3: string;
    team: string;
  }>;
  positions: Array<{ x: number; y: number; z: number }>;
}

export enum TokenCategory {
  WORLD_EVENT = 'world_event',
  PLAYER_STATE = 'player_state',
  COMBAT = 'combat',
  MEDIC = 'medic',
  OBJECTIVE = 'objective',
  MISC = 'misc',
  CHAT = 'chat',
  PAUSE = 'pause',
  UNKNOWN = 'unknown',
}

/**
 * Categorize a log line based on its content
 */
function categorizeL(line: string): TokenCategory {
  // World events (Round_Start, Game_Over, etc.)
  if (hasPattern(line, WORLD_TRIGGER_PATTERN)) {
    return TokenCategory.WORLD_EVENT;
  }

  // Combat events
  if (
    hasPattern(line, KILL_PATTERN) ||
    hasPattern(line, DAMAGE_PATTERN) ||
    hasPattern(line, SUICIDE_PATTERN) ||
    line.includes('shot_fired') ||
    line.includes('shot_hit') ||
    line.includes('kill assist')
  ) {
    return TokenCategory.COMBAT;
  }

  // Medic events
  if (
    line.includes('healed') ||
    line.includes('charge') ||
    line.includes('medic_death') ||
    line.includes('first_heal_after_spawn') ||
    line.includes('empty_uber')
  ) {
    return TokenCategory.MEDIC;
  }

  // Objective events
  if (
    line.includes('pointcaptured') ||
    line.includes('captureblocked') ||
    line.includes('player_builtobject') ||
    line.includes('killedobject')
  ) {
    return TokenCategory.OBJECTIVE;
  }

  // Player state changes
  if (
    hasPattern(line, ROLE_CHANGE_PATTERN) ||
    hasPattern(line, TEAM_CHANGE_PATTERN) ||
    hasPattern(line, SPAWNED_PATTERN) ||
    hasPattern(line, CONNECTED_PATTERN) ||
    hasPattern(line, DISCONNECTED_PATTERN)
  ) {
    return TokenCategory.PLAYER_STATE;
  }

  // Chat messages
  if (hasPattern(line, CHAT_PATTERN)) {
    return TokenCategory.CHAT;
  }

  // Pause events
  if (hasPattern(line, PAUSE_PATTERN) || hasPattern(line, UNPAUSE_PATTERN)) {
    return TokenCategory.PAUSE;
  }

  // Item pickups and misc
  if (
    hasPattern(line, ITEM_PICKUP_PATTERN) ||
    line.includes('domination') ||
    line.includes('revenge') ||
    line.includes('extinguished')
  ) {
    return TokenCategory.MISC;
  }

  return TokenCategory.UNKNOWN;
}

/**
 * Tokenize a single log line
 */
export function tokenizeLine(line: string, lineNumber: number): RawToken {
  const timestamp = extractTimestamp(line);
  const players = extractPlayers(line);
  const positions = extractPositions(line);
  const category = categorizeL(line);

  return {
    lineNumber,
    timestamp,
    rawLine: line.trim(),
    category,
    players,
    positions,
  };
}

/**
 * Tokenize an entire log file
 * @param logContent - Raw log file content
 * @returns Array of tokens
 */
export function tokenize(logContent: string): RawToken[] {
  const lines = logContent.split(/\r?\n/);
  const tokens: RawToken[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line || line.length === 0) {
      continue;
    }

    // Skip non-log lines (some logs have extra content)
    if (!line.startsWith('L ')) {
      continue;
    }

    const token = tokenizeLine(line, i + 1);
    tokens.push(token);
  }

  return tokens;
}

/**
 * Fast validation of log format
 * Checks first few lines to ensure it's a valid TF2 log
 */
export function validateLogFormat(logContent: string): {
  valid: boolean;
  error?: string;
} {
  const lines = logContent.split(/\r?\n/);

  // Check if file is empty
  if (lines.length === 0) {
    return { valid: false, error: 'Log file is empty' };
  }

  // Find first non-empty line
  let firstLine: string | undefined;
  for (const line of lines) {
    if (line.trim().length > 0) {
      firstLine = line;
      break;
    }
  }

  if (!firstLine) {
    return { valid: false, error: 'No valid log lines found' };
  }

  // Check if first line starts with 'L' (log prefix)
  if (!firstLine.startsWith('L ')) {
    return {
      valid: false,
      error: `Invalid log format: expected line to start with 'L', got '${firstLine.substring(0, 10)}...'`,
    };
  }

  // Check if we can extract a timestamp
  const timestamp = extractTimestamp(firstLine);
  if (timestamp === null) {
    return {
      valid: false,
      error: `Could not parse timestamp from first line: ${firstLine.substring(0, 50)}...`,
    };
  }

  return { valid: true };
}

/**
 * Get token statistics for debugging
 */
export function getTokenStats(tokens: RawToken[]): {
  total: number;
  byCategory: Record<TokenCategory, number>;
  withTimestamps: number;
  withPlayers: number;
  withPositions: number;
} {
  const byCategory: Record<TokenCategory, number> = {
    [TokenCategory.WORLD_EVENT]: 0,
    [TokenCategory.PLAYER_STATE]: 0,
    [TokenCategory.COMBAT]: 0,
    [TokenCategory.MEDIC]: 0,
    [TokenCategory.OBJECTIVE]: 0,
    [TokenCategory.MISC]: 0,
    [TokenCategory.CHAT]: 0,
    [TokenCategory.PAUSE]: 0,
    [TokenCategory.UNKNOWN]: 0,
  };

  let withTimestamps = 0;
  let withPlayers = 0;
  let withPositions = 0;

  for (const token of tokens) {
    byCategory[token.category]++;
    if (token.timestamp !== null) withTimestamps++;
    if (token.players.length > 0) withPlayers++;
    if (token.positions.length > 0) withPositions++;
  }

  return {
    total: tokens.length,
    byCategory,
    withTimestamps,
    withPlayers,
    withPositions,
  };
}
