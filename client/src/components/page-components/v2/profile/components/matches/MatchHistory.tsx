/**
 * MatchHistory Component
 * Displays recent match history with detailed statistics
 */

import { useState } from 'react';
import { Match } from './types';
import ExpandableMatchRow from './ExpandableMatchRow';

interface MatchHistoryProps {
  matches: Match[];
  playerId: string;
}

export default function MatchHistory({ matches, playerId }: MatchHistoryProps) {
  const [currentTime] = useState(() => Math.round(Date.now() / 1000));
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!matches || matches.length === 0) {
    return null;
  }

  const handleToggle = (logid: string) => {
    setExpandedLogId(expandedLogId === logid ? null : logid);
  };

  return (
    <div className="w-full mb-4">
      <div className="bg-warmscale-8 py-3 px-4 rounded-md font-cantarell drop-shadow-sm">
        {/* Header */}
        <div className="flex justify-between">
          <a
            href={`/profile/${playerId}/matches`}
            className="text-lg text-lightscale-1 font-semibold hover:underline"
          >
            Matches
          </a>
          <a
            href={`/profile/${playerId}/matches`}
            className="text-lg text-lightscale-1 font-semibold"
          >
            <svg
              strokeWidth={5.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="stroke-warmscale-2 cursor-pointer h-6 mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </a>
        </div>

        {/* Table Header */}
        <div className="flex items-center h-8 border-b border-warmscale-7 text-xs font-semibold text-lightscale-8 mt-3">
          <div className="w-8 flex-shrink-0"></div>
          <div className="w-12 flex-shrink-0"></div>
          <div className="w-8 border-l border-warmscale-7 flex-shrink-0"></div>
          <div className="flex-1 border-l border-warmscale-7 pl-3">Map</div>
          <div className="w-20 border-l border-warmscale-7 pl-3 max-lg:hidden">
            K/D/A
          </div>
          <div className="w-14 border-l border-warmscale-7 pl-3 max-lg:hidden">
            DPM
          </div>
          <div className="w-14 border-l border-warmscale-7 pl-3 max-lg:hidden">
            DTM
          </div>
          <div className="w-12 border-l border-warmscale-7 pl-3 max-lg:hidden">
            FMT
          </div>
          <div className="w-24 border-l border-warmscale-7 pl-3 pr-2 text-right">
            Time
          </div>
        </div>

        {/* Match Rows */}
        <div>
          {matches.slice(0, 15).map((match, index) => (
            <ExpandableMatchRow
              key={match.logid}
              match={match}
              currentTime={currentTime}
              isLast={index === 14 || index === matches.length - 1}
              index={index}
              playerId={playerId}
              isExpanded={expandedLogId === match.logid}
              onToggle={() => handleToggle(match.logid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
