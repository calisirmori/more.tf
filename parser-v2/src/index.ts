/**
 * Main Parser V2 Entry Point
 * Orchestrates the entire parsing pipeline
 */

import { tokenize, validateLogFormat } from './tokenizer';
import { parseEvents } from './parsers';
import { MatchAggregator } from './aggregators/match';
import { ParseResult, ParsedMatch } from './types/match';

export const PARSER_VERSION = '2.0.0';

export interface ParseOptions {
  logId: number;
  map?: string;
  title?: string;
}

/**
 * Parse a TF2 log file
 * @param logContent - Raw log file content as string
 * @param options - Parse options (logId, map, title)
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
          source: 'database', // Will be overridden by caller
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

    // Step 4: Aggregate match data
    const matchAgg = new MatchAggregator(
      options.logId,
      options.map || 'unknown',
      options.title || 'Unknown Match'
    );

    for (const event of events) {
      try {
        matchAgg.processEvent(event);
      } catch (err) {
        errors.push({
          level: 'warning',
          message: `Error processing event: ${err instanceof Error ? err.message : String(err)}`,
          context: { event: event.type },
        });
      }
    }

    // Step 5: Finalize
    const parseTime = Date.now() - startTime;
    const matchData = matchAgg.finalize(events, parseTime, tokens.length);

    // Add collected errors and warnings
    matchData.parserMetadata.errors = errors;
    matchData.parserMetadata.warnings = warnings;

    // Step 6: Return result
    return {
      success: true,
      data: matchData,
      errors,
      warnings,
      metadata: {
        parseTime,
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
 * Quick log validation without full parsing
 */
export function validateLog(logContent: string): { valid: boolean; error?: string } {
  return validateLogFormat(logContent);
}

// Export types
export * from './types/events';
export * from './types/player';
export * from './types/match';
export * from './types/schemas';
