/**
 * Main Parser V2 Entry Point
 * Industry-standard TF2 log parser with 10-second interval bucketing
 *
 * Output Structure:
 * 1. Game Totals - Summarized statistics for the entire match
 * 2. Comparative Stats - Player-by-player comparative statistics
 * 3. Time-Based Data - All events organized into 10-second buckets
 * 4. Other Data - Non-time-sensitive info (chat, players, rounds)
 */

import { tokenize, validateLogFormat } from './tokenizer';
import { parseEvents } from './parsers';
import { GameTotalsAggregator } from './aggregators/game-totals';
import { RoundAggregator } from './aggregators/round';
import { OtherDataAggregator } from './aggregators/other-data';
import { ComparativeStatsAggregator } from './aggregators/comparative-stats';
import { MatchupStatsAggregator } from './aggregators/matchup-stats';
import { UberTracker } from './aggregators/uber-tracker';
import { KillstreakTracker } from './aggregators/killstreak-tracker';
import { MedicStatsAggregator } from './aggregators/medic-stats';
import { createTimeBuckets, formatRelativeTime, BUCKET_INTERVAL_SECONDS } from './utils/time-buckets';
import { generateIntervalStats } from './utils/interval-stats';
import { ParseResult, ParsedLog, TimeBucket } from './types/output';
import { GameEvent } from './types/events';

export const PARSER_VERSION = '2.0.0';

export interface ParseOptions {
  logId: number;
  map?: string;
  title?: string;
  bucketInterval?: number; // seconds, default 10
}

/**
 * Parse a TF2 log file
 * @param logContent - Raw log file content as string
 * @param options - Parse options (logId, map, title, bucketInterval)
 * @returns ParseResult with match data or errors
 */
export async function parseLog(
  logContent: string,
  options: ParseOptions
): Promise<ParseResult> {
  const startTime = Date.now();
  const errors: ParseResult['errors'] = [];
  const warnings: ParseResult['warnings'] = [];

  try {
    // Step 1: Validate log format
    const validation = validateLogFormat(logContent);
    if (!validation.valid) {
      return {
        success: false,
        errors: [
          {
            level: 'fatal',
            message: validation.error || 'Invalid log format',
          },
        ],
        warnings: [],
        metadata: {
          parseTime: Date.now() - startTime,
          linesProcessed: 0,
          version: PARSER_VERSION,
          source: 'database',
        },
      };
    }

    // Step 2: Tokenize
    const tokens = tokenize(logContent);

    if (tokens.length === 0) {
      return {
        success: false,
        errors: [
          {
            level: 'fatal',
            message: 'No valid tokens found in log file',
          },
        ],
        warnings: [],
        metadata: {
          parseTime: Date.now() - startTime,
          linesProcessed: 0,
          version: PARSER_VERSION,
          source: 'database',
        },
      };
    }

    // Step 3: Parse events
    const events = parseEvents(tokens);

    if (events.length === 0) {
      warnings.push({
        message: 'No events could be parsed from tokens',
        lineNumber: 0,
      });
    }

    // Step 4: Separate time-based events from other events
    const timeBasedEvents = filterTimeBasedEvents(events);

    // Step 5: Create aggregators
    const gameTotalsAgg = new GameTotalsAggregator(
      options.logId,
      options.map || 'unknown',
      options.title || 'Unknown Match'
    );

    const roundAgg = new RoundAggregator();
    const otherDataAgg = new OtherDataAggregator();
    const matchupStatsAgg = new MatchupStatsAggregator();
    const uberTracker = new UberTracker();
    const killstreakTracker = new KillstreakTracker();
    const medicStatsAgg = new MedicStatsAggregator();

    // Step 6: Process all events
    for (const event of events) {
      try {
        gameTotalsAgg.processEvent(event);
        roundAgg.processEvent(event);
        otherDataAgg.processEvent(event);
        matchupStatsAgg.processEvent(event);
        uberTracker.processEvent(event);
        killstreakTracker.processEvent(event);
        medicStatsAgg.processEvent(event);
      } catch (err) {
        errors.push({
          level: 'warning',
          message: `Error processing event: ${err instanceof Error ? err.message : String(err)}`,
          context: { event: event.type },
        });
      }
    }

    // Step 7: Create time buckets from time-based events
    const bucketInterval = options.bucketInterval || BUCKET_INTERVAL_SECONDS;
    const timeBucketed = createTimeBuckets(timeBasedEvents, bucketInterval);

    // Step 8: Finalize all aggregators
    const rounds = roundAgg.getRounds();
    const gameTotals = gameTotalsAgg.finalize(rounds);
    const otherData = otherDataAgg.finalize();

    // Step 8.2: Merge detailed round stats from RoundAggregator into otherData.rounds
    for (let i = 0; i < otherData.rounds.length; i++) {
      const detailedRound = rounds.find(r => r.roundNumber === otherData.rounds[i].roundNumber);
      if (detailedRound) {
        // Override with correct timing data from RoundAggregator
        otherData.rounds[i].startTime = detailedRound.roundBegin;
        otherData.rounds[i].endTime = detailedRound.roundEnd;
        otherData.rounds[i].duration = detailedRound.roundDuration;
        otherData.rounds[i].winner = detailedRound.winner !== 'unknown' ? detailedRound.winner : undefined;

        // Merge stats
        otherData.rounds[i].teamStats = {
          red: detailedRound.teamScores.red,
          blue: detailedRound.teamScores.blue,
        };
        otherData.rounds[i].playerPerformance = detailedRound.playerPerformance;
        otherData.rounds[i].firstCap = detailedRound.firstCap;
        otherData.rounds[i].midfight = detailedRound.firstCap; // Midfight winner = first cap
        otherData.rounds[i].overtime = detailedRound.overtime;
      }
    }

    // Step 8.3: Filter out incomplete rounds (those without teamStats)
    // These are rounds that started but never completed or weren't tracked by RoundAggregator
    otherData.rounds = otherData.rounds.filter(round => round.teamStats !== undefined);

    // Step 8.1: Filter out players who didn't actually participate
    // Players who connect but never spawn show up with:
    // - All stats as 0
    // - primaryClass as 'undefined'
    // - totalPlaytimeSeconds as 0
    gameTotals.players = gameTotals.players.filter(player =>
      player.totalPlaytimeSeconds > 0 &&
      player.primaryClass !== 'undefined'
    );

    // Step 8.5: Build player name map (single source of truth)
    const playerNamesMap: Record<string, string> = {};
    gameTotals.players.forEach(player => {
      playerNamesMap[player.steamId] = player.name;
    });

    // Step 8.6: Build top-level summary (comprehensive match overview)
    // Format timestamps
    const formatTimestamp = (timestamp: number): string => {
      const date = new Date(timestamp * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    // Calculate team stats
    const redPlayers = gameTotals.players.filter(p => p.team === 'red');
    const bluePlayers = gameTotals.players.filter(p => p.team === 'blue');

    const redTeamStats = gameTotals.teams.red;
    const blueTeamStats = gameTotals.teams.blue;

    const summary: any = {
      logId: gameTotals.logId,
      map: gameTotals.map,
      title: gameTotals.title,
      duration: gameTotals.duration,
      durationFormatted: formatDuration(gameTotals.duration),
      startTime: gameTotals.startTime,
      endTime: gameTotals.endTime,
      startTimeFormatted: formatTimestamp(gameTotals.startTime),
      endTimeFormatted: formatTimestamp(gameTotals.endTime),
      winner: gameTotals.winner,
      finalScore: {
        red: redTeamStats.score,
        blue: blueTeamStats.score,
      },
      rounds: {
        total: gameTotals.rounds.total,
        redWins: gameTotals.rounds.redWins,
        blueWins: gameTotals.rounds.blueWins,
      },
      teams: {
        red: {
          team: 'red' as const,
          score: redTeamStats.score,
          kills: redTeamStats.kills,
          deaths: redTeamStats.deaths,
          damage: redTeamStats.damage,
          healing: redTeamStats.healing,
          ubers: redTeamStats.ubers,
          drops: redTeamStats.drops,
          kd: parseFloat((redTeamStats.deaths > 0 ? redTeamStats.kills / redTeamStats.deaths : redTeamStats.kills).toFixed(2)),
          dpm: gameTotals.duration > 0 ? Math.round((redTeamStats.damage / gameTotals.duration) * 60) : 0,
          hpm: gameTotals.duration > 0 ? Math.round((redTeamStats.healing / gameTotals.duration) * 60) : 0,
        },
        blue: {
          team: 'blue' as const,
          score: blueTeamStats.score,
          kills: blueTeamStats.kills,
          deaths: blueTeamStats.deaths,
          damage: blueTeamStats.damage,
          healing: blueTeamStats.healing,
          ubers: blueTeamStats.ubers,
          drops: blueTeamStats.drops,
          kd: parseFloat((blueTeamStats.deaths > 0 ? blueTeamStats.kills / blueTeamStats.deaths : blueTeamStats.kills).toFixed(2)),
          dpm: gameTotals.duration > 0 ? Math.round((blueTeamStats.damage / gameTotals.duration) * 60) : 0,
          hpm: gameTotals.duration > 0 ? Math.round((blueTeamStats.healing / gameTotals.duration) * 60) : 0,
        },
      },
      playerCount: {
        total: gameTotals.players.length,
        red: redPlayers.length,
        blue: bluePlayers.length,
      },
    };

    // Step 8.7: Generate comparative stats (for player arrays and leaders)
    const comparativeStatsSummary = ComparativeStatsAggregator.generate(
      gameTotals.logId,
      gameTotals.map,
      gameTotals.title,
      gameTotals.duration,
      gameTotals.startTime,
      gameTotals.endTime,
      gameTotals.winner,
      gameTotals.players,
      gameTotals.duration
    );

    // Merge comparative stats into the main summary
    summary.teams.red.players = comparativeStatsSummary.red.players;
    summary.teams.red.avgKills = comparativeStatsSummary.red.avgKills;
    summary.teams.red.avgDeaths = comparativeStatsSummary.red.avgDeaths;
    summary.teams.red.avgDamage = comparativeStatsSummary.red.avgDamage;
    summary.teams.red.avgHealing = comparativeStatsSummary.red.avgHealing;

    summary.teams.blue.players = comparativeStatsSummary.blue.players;
    summary.teams.blue.avgKills = comparativeStatsSummary.blue.avgKills;
    summary.teams.blue.avgDeaths = comparativeStatsSummary.blue.avgDeaths;
    summary.teams.blue.avgDamage = comparativeStatsSummary.blue.avgDamage;
    summary.teams.blue.avgHealing = comparativeStatsSummary.blue.avgHealing;

    // Matchup stats (player vs player, player vs class)
    const matchupStats = matchupStatsAgg.finalize();

    // Step 9: Format time buckets for interval stats generation
    const formattedBuckets: TimeBucket[] = timeBucketed.buckets.map((bucket) => ({
      bucketIndex: bucket.bucketIndex,
      startTime: bucket.startTime,
      endTime: bucket.endTime,
      relativeStartTime: formatRelativeTime(bucket.startTime, timeBucketed.matchStartTime),
      relativeEndTime: formatRelativeTime(bucket.endTime, timeBucketed.matchStartTime),
      events: bucket.events,
    }));

    // Step 9.5: Generate interval stats (10-second intervals)
    const intervalStatsData = generateIntervalStats(formattedBuckets, 10);

    // Step 10: Build final output
    const parsedLog: ParsedLog = {
      parserVersion: PARSER_VERSION,
      parseTime: Date.now() - startTime,
      source: 'database',

      // Player name map (single source of truth)
      playerNames: playerNamesMap,

      // Summary (lightweight reference with primary stats)
      summary,

      // Section 1: Game Totals
      gameTotals,

      // Section 2: Matchup Stats
      matchups: matchupStats,

      // Section 3: Time-Based Data (interval-based stats only, no raw events)
      timeBasedData: {
        intervalSeconds: intervalStatsData.intervalSeconds,
        totalIntervals: intervalStatsData.totalIntervals,
        matchStartTime: timeBucketed.matchStartTime,
        matchEndTime: timeBucketed.matchEndTime,
        matchDurationSeconds: timeBucketed.matchDurationSeconds,
        intervals: intervalStatsData.intervals,
      },

      // Section 4: Other Data
      otherData: {
        ...otherData,
        ubers: uberTracker.getUbers(),
        killstreaks: killstreakTracker.getKillstreaks(),
        medicStats: medicStatsAgg.getAllMedicStats(),
      },

      // Errors and warnings
      errors,
      warnings,
    };

    // Step 11: Return result
    return {
      success: true,
      data: parsedLog,
      errors,
      warnings,
      metadata: {
        parseTime: Date.now() - startTime,
        linesProcessed: tokens.length,
        version: PARSER_VERSION,
        source: 'database',
      },
    };
  } catch (err) {
    return {
      success: false,
      errors: [
        {
          level: 'fatal',
          message: `Unexpected parser error: ${err instanceof Error ? err.message : String(err)}`,
          context: err instanceof Error ? { stack: err.stack } : undefined,
        },
      ],
      warnings,
      metadata: {
        parseTime: Date.now() - startTime,
        linesProcessed: 0,
        version: PARSER_VERSION,
        source: 'database',
      },
    };
  }
}

/**
 * Filter events to only include time-based events
 * Time-based events are those that happen during the match
 * Non-time-based: player connections, chat (handled separately)
 */
function filterTimeBasedEvents(events: GameEvent[]): GameEvent[] {
  const nonTimeBasedTypes = new Set([
    'player_connected',
    'player_disconnected',
    // Note: chat is included in time-based for completeness
    // but also stored separately in otherData
  ]);

  return events.filter((event) => !nonTimeBasedTypes.has(event.type));
}

/**
 * Quick log validation without full parsing
 */
export function validateLog(logContent: string): { valid: boolean; error?: string } {
  return validateLogFormat(logContent);
}

// Export types
export * from './types/events';
export * from './types/output';
export * from './types/summary';
export { analyzeLogEvents, printAnalysisReport, getEventPattern, getPatternsByCategory, ALL_EVENT_PATTERNS } from './utils/event-analyzer';
export type { EventPattern } from './utils/event-analyzer';
export { createTimeBuckets, getBucketForTimestamp, getBucketsInRange, getBucketStats, getAllBucketStats } from './utils/time-buckets';
export type { TimeBucketedData, BucketStats } from './utils/time-buckets';
export { generateLogSummary, getOneLineSummary, getPrettySummary } from './utils/log-summary';
export { generateIntervalStats, getStatsForTimeRange } from './utils/interval-stats';
export type { IntervalStatsData, PlayerIntervalStats, TeamIntervalStats } from './utils/interval-stats';
