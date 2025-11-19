/**
 * World event parser - Round events, game state changes
 */

import {
  RoundStartEvent,
  RoundWinEvent,
  RoundLengthEvent,
  GameOverEvent,
  TeamScoreEvent,
  RoundOvertimeEvent,
  Team,
} from '../types/events';
import { RawToken } from '../tokenizer';
import {
  ROUND_WIN_PATTERN,
  ROUND_LENGTH_PATTERN,
  GAME_OVER_PATTERN,
  TEAM_SCORE_PATTERN,
  extractString,
} from '../tokenizer/patterns';

export function parseWorldEvent(token: RawToken):
  | RoundStartEvent
  | RoundWinEvent
  | RoundLengthEvent
  | GameOverEvent
  | TeamScoreEvent
  | RoundOvertimeEvent
  | null {

  const { rawLine, timestamp, lineNumber } = token;

  if (!timestamp) return null;

  const baseEvent = {
    timestamp,
    rawLine,
    lineNumber,
  };

  // Round Start
  if (rawLine.includes('Round_Start')) {
    return {
      ...baseEvent,
      type: 'round_start',
    };
  }

  // Round Win
  if (rawLine.includes('Round_Win')) {
    const winnerMatch = rawLine.match(ROUND_WIN_PATTERN);
    if (winnerMatch) {
      const winner = winnerMatch[1].toLowerCase() as Team;
      return {
        ...baseEvent,
        type: 'round_win',
        winner,
      };
    }
  }

  // Round Length
  if (rawLine.includes('Round_Length')) {
    const lengthMatch = rawLine.match(ROUND_LENGTH_PATTERN);
    if (lengthMatch) {
      return {
        ...baseEvent,
        type: 'round_length',
        seconds: parseFloat(lengthMatch[1]),
      };
    }
  }

  // Game Over
  if (rawLine.includes('Game_Over')) {
    const reason = extractString(rawLine, GAME_OVER_PATTERN) || 'Unknown';
    return {
      ...baseEvent,
      type: 'game_over',
      reason,
    };
  }

  // Round Overtime
  if (rawLine.includes('Round_Overtime')) {
    return {
      ...baseEvent,
      type: 'round_overtime',
    };
  }

  // Team Score
  const scoreMatch = rawLine.match(TEAM_SCORE_PATTERN);
  if (scoreMatch) {
    const [, teamName, scoreType, score, playerCount] = scoreMatch;
    return {
      ...baseEvent,
      type: 'team_score',
      team: teamName.toLowerCase() as Team,
      score: parseInt(score),
      playerCount: parseInt(playerCount),
      isFinal: scoreType === 'final',
    };
  }

  return null;
}
