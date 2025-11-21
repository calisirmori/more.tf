/**
 * MatchesTab Component
 * Displays player match history with expandable log summaries
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ExpandableMatchRow from '../matches/ExpandableMatchRow';
import { Match } from '../matches/types';
import LoadingSpinner from '../../../../../shared-components/LoadingSpinner';

export default function MatchesTab() {
  const { playerId } = useParams<{ playerId: string }>();
  const [currentTime] = useState(() => Math.round(Date.now() / 1000));
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Fetch match data when component mounts
  useEffect(() => {
    const fetchMatches = async () => {
      if (!playerId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/profile-data/${playerId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch match data');
        }

        const data = await response.json();
        setMatches(data.matchHistory || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load matches');
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading matches..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-lightscale-4">No match history found</p>
      </div>
    );
  }

  const handleToggle = (logid: string) => {
    setExpandedLogId(expandedLogId === logid ? null : logid);
  };

  return (
    <div className="w-full mb-4">
      <div className="bg-warmscale-8 py-3 px-4 rounded-md font-cantarell drop-shadow-sm">
        {/* Header */}
        <div className="mb-3">
          <h2 className="text-lg text-lightscale-1 font-semibold">
            Match History
          </h2>
          <p className="text-sm text-lightscale-5 mt-1">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} found
          </p>
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
          {matches.map((match, index) => (
            <ExpandableMatchRow
              key={match.logid}
              match={match}
              currentTime={currentTime}
              isLast={index === matches.length - 1}
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
