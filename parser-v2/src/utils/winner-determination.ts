/**
 * Winner Determination Logic
 * Determines match winner based on round data
 */

import { Team } from '../types/events';
import { Round } from '../types/match';

/**
 * Filter out invalid/dead rounds
 * A round is considered valid if:
 * 1. It has a legitimate winner (not 'unknown')
 * 2. It has meaningful activity (kills/damage/duration)
 * 3. For 5CP/KOTH maps: score advanced (otherwise it's a tie)
 */
export function filterValidRounds(rounds: Round[], mapName: string): Round[] {
  const validRounds: Round[] = [];

  // Determine if this is a 5CP or KOTH map (where scores represent rounds won)
  // vs payload/attack-defend maps (where scores represent capture points within a round)
  const is5CPorKOTH = (mapName.startsWith('cp_') &&
                       !mapName.startsWith('cp_steel') &&  // Steel is attack-defend
                       !mapName.startsWith('cp_gorge')) ||  // Gorge is attack-defend
                      mapName.startsWith('koth_');

  let lastScore = { red: 0, blue: 0 };

  for (const round of rounds) {
    // Must have a winner declared
    if (round.winner === 'unknown' || round.winner === null || round.winner === undefined) {
      continue;
    }

    // Check if round has any meaningful activity
    // Dead rounds (server restarts, immediate round ends) have no activity
    const hasActivity =
      round.teamScores.red.kills > 0 ||
      round.teamScores.blue.kills > 0 ||
      round.teamScores.red.damage > 0 ||
      round.teamScores.blue.damage > 0 ||
      round.teamScores.red.ubers > 0 ||
      round.teamScores.blue.ubers > 0 ||
      round.roundDuration > 30; // Round lasted more than 30 seconds

    if (!hasActivity) {
      continue;
    }

    // For 5CP/KOTH maps: check if score advanced (to detect tie rounds)
    // For payload/A-D maps: skip this check (scores represent capture points, not wins)
    if (is5CPorKOTH) {
      const currentScore = {
        red: round.teamScores.red.score,
        blue: round.teamScores.blue.score,
      };

      const scoreAdvanced =
        currentScore.red > lastScore.red ||
        currentScore.blue > lastScore.blue;

      if (!scoreAdvanced) {
        // Score didn't advance - this round was a tie
        continue;
      }

      lastScore = currentScore;
    }

    validRounds.push(round);
  }

  return validRounds;
}

/**
 * Determine match winner based on round data
 *
 * Logic:
 * 1. Filter out warmup/dead rounds (no meaningful activity)
 * 2. Count round wins for each team
 * 3. If one team has more round wins, they win
 * 4. If tied, apply payload tiebreaker: team that won their round faster wins
 */
export function determineWinner(rounds: Round[], mapName: string): Team | undefined {
  // Filter out warmup/invalid/dead rounds
  const validRounds = filterValidRounds(rounds, mapName);

  if (validRounds.length === 0) {
    return undefined;
  }

  // Count round wins
  const redWins = validRounds.filter(r => r.winner === 'red').length;
  const blueWins = validRounds.filter(r => r.winner === 'blue').length;

  // Simple case: one team won more rounds
  if (redWins > blueWins) {
    return 'red';
  } else if (blueWins > redWins) {
    return 'blue';
  }

  // Tied rounds - apply payload/attack-defend tiebreaker
  const isPayloadMap = mapName.startsWith('pl_') ||
                       mapName.startsWith('plr_') ||
                       mapName.startsWith('cp_steel');

  if (isPayloadMap && validRounds.length === 2) {
    const redRound = validRounds.find(r => r.winner === 'red');
    const blueRound = validRounds.find(r => r.winner === 'blue');

    if (redRound && blueRound && redRound.roundDuration > 0 && blueRound.roundDuration > 0) {
      // Payload tiebreaker logic:
      // 1. On payload, each team plays offense once
      // 2. When Red wins their round: Blue was attacking, score = caps Blue got
      // 3. When Blue wins their round: Red was attacking, score = caps Red got
      // 4. Team that allowed fewer caps wins (better defense)
      // 5. If caps are equal, team that finished faster wins

      // Get the score from each round (caps the attacking team got)
      const redRoundBlueScore = redRound.teamScores.blue.score; // Blue was attacking in Red's round
      const blueRoundRedScore = blueRound.teamScores.red.score; // Red was attacking in Blue's round

      // Compare defensive performance (lower is better - fewer caps allowed)
      if (redRoundBlueScore < blueRoundRedScore) {
        // Red allowed fewer caps than Blue did → Red wins
        return 'red';
      } else if (blueRoundRedScore < redRoundBlueScore) {
        // Blue allowed fewer caps than Red did → Blue wins
        return 'blue';
      } else {
        // Same number of caps allowed - compare durations (faster wins)
        if (redRound.roundDuration < blueRound.roundDuration) {
          return 'red';
        } else if (blueRound.roundDuration < redRound.roundDuration) {
          return 'blue';
        } else {
          // Exact tie
          return undefined;
        }
      }
    }
  }

  // No clear winner (tie)
  return undefined;
}
