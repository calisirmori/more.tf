/**
 * ExpandableMatchRow Component
 * Match row with expandable dropdown for quick log summary
 */

import { useState } from 'react';
import { Match, MATCH_RESULT_STYLES, MatchResult } from './types';
import {
  formatMapName,
  formatMatchTitle,
  formatMatchLength,
  formatTimeAgo,
  formatFormatAbbr,
} from './utils';
import LogSummaryView from './LogSummaryView';
import LoadingSpinner from '../../../../../shared-components/LoadingSpinner';

interface LogSummary {
  logId: number;
  map: string;
  title: string;
  duration: number;
  durationFormatted: string;
  startTime: number;
  endTime: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  winner: 'Red' | 'Blue' | 'tie';
  finalScore: {
    red: number;
    blue: number;
  };
  rounds: {
    total: number;
    redWins: number;
    blueWins: number;
  };
  teams: {
    red: any;
    blue: any;
  };
  playerCount: {
    total: number;
    red: number;
    blue: number;
  };
}

interface ExpandableMatchRowProps {
  match: Match;
  currentTime: number;
  isLast: boolean;
  index: number;
  playerId?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ExpandableMatchRow({
  match,
  currentTime,
  isLast,
  index,
  playerId,
  isExpanded,
  onToggle,
}: ExpandableMatchRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleExpand = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Tell parent to toggle this row
    onToggle();

    // If expanding for the first time and no data, fetch it
    if (!isExpanded && !summary && !isLoading) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v2/log/${match.logid}/summary`);

        if (!response.ok) {
          throw new Error('Failed to fetch log summary');
        }

        const data = await response.json();
        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load summary');
        console.error('Error fetching log summary:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      {/* Match Row */}
      <div
        className={`flex items-center h-11 hover:bg-warmscale-85 ${
          !isLast && 'border-b'
        } border-warmscale-7 relative`}
      >
        {/* Expand/Collapse Arrow */}
        <div
          className="w-8 flex justify-center flex-shrink-0 cursor-pointer hover:bg-warmscale-7 h-full items-center"
          onClick={handleToggleExpand}
        >
          <svg
            className={`w-4 h-4 text-lightscale-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Class Icon */}
        <div className="w-12 flex justify-center flex-shrink-0">
          <img
            src={`/class icons/Leaderboard_class_${match.class}.png`}
            alt={match.class}
            className="h-7"
          />
        </div>

        {/* W/L/T Indicator */}
        <div className="w-8 border-l border-warmscale-7 flex justify-center flex-shrink-0">
          <div
            className={`${
              MATCH_RESULT_STYLES[match.match_result as MatchResult]
            } w-5 h-5 flex items-center justify-center text-xs font-bold rounded-sm`}
          >
            {match.match_result}
          </div>
        </div>

        {/* Map and Title */}
        <a
          href={`/log/${match.logid}`}
          className="flex-1 border-l border-warmscale-7 pl-3 text-lightscale-1 font-cantarell min-w-0 truncate hover:text-tf-orange"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-medium">{formatMapName(match.map)}</span>
          <span className="ml-1 text-sm text-lightscale-6">
            ({formatMatchTitle(match.title)})
          </span>
        </a>

        {/* K/D/A */}
        <div className="w-20 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs flex-shrink-0 max-lg:hidden">
          {match.kills}/{match.deaths}/{match.assists}
        </div>

        {/* DPM or Heals */}
        <div className="w-14 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs flex-shrink-0 max-lg:hidden">
          {match.class === 'medic' ? match.heals : match.dpm}
        </div>

        {/* DTM */}
        <div className="w-14 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs flex-shrink-0 max-lg:hidden">
          {match.dtm}
        </div>

        {/* Format */}
        <div className="w-12 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs text-lightscale-5 flex-shrink-0 max-lg:hidden">
          {formatFormatAbbr(match.format)}
        </div>

        {/* Time */}
        <div className="w-24 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 pr-2 text-xs flex-shrink-0 text-right">
          <div className="text-lightscale-4">
            {formatMatchLength(match.match_length)}
          </div>
          <div className="whitespace-nowrap">
            {formatTimeAgo(match.date, currentTime)}
          </div>
        </div>
      </div>

      {/* Expanded Summary Section */}
      {isExpanded && (
        <div className="bg-warmscale-9">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" text="Loading summary..." />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <p className="text-red-400 text-sm">Error: {error}</p>
            </div>
          )}

          {!isLoading && !error && summary && (
            <LogSummaryView summary={summary} currentPlayerId={playerId} />
          )}
        </div>
      )}
    </div>
  );
}
