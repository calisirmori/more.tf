/**
 * MapStats Component
 * Displays player's performance statistics per map
 */

import { useState } from 'react';
import { MapStat } from './types';

interface MapStatsProps {
  mapStats: MapStat[];
  hasPlayerCard: boolean;
}

export default function MapStats({ mapStats, hasPlayerCard }: MapStatsProps) {
  const [showMoreMaps, setShowMoreMaps] = useState(false);

  // Show 7 maps if expanded or no player card, otherwise show 1
  const displayCount = showMoreMaps || !hasPlayerCard ? 7 : 1;

  // Filter out null map names and limit display
  const visibleMaps = mapStats
    .filter((map) => map.map_name !== null)
    .slice(0, displayCount);

  if (mapStats.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
      <div className="flex justify-between">
        <div className="text-lg text-lightscale-1 mb-1 font-semibold">Maps</div>
      </div>

      {visibleMaps.map((map, index) => {
        const winRate = Math.round((map.wins / map.map_count) * 1000) / 10;
        const shouldShowBorder =
          (showMoreMaps || !hasPlayerCard) && index < visibleMaps.length - 1;

        return (
          <div
            key={map.map_name}
            className={`flex relative justify-between items-center font-cantarell text-lightscale-1 h-14 ${
              shouldShowBorder ? 'border-b border-warmscale-7' : ''
            }`}
          >
            {/* Map Name and Count */}
            <div>
              {map.map_name.charAt(0).toUpperCase() + map.map_name.slice(1)}{' '}
              <span className="text-lightscale-6 text-sm">({map.map_count})</span>
            </div>

            {/* Win Rate and W-L-T */}
            <div className="text-right">
              <div className="font-semibold">{winRate}%</div>
              <div className="text-xs flex font-semibold text-lightscale-9">
                <div className="text-green-500 text-opacity-70">{map.wins}</div>-
                <div className="text-red-500 text-opacity-70">{map.losses}</div>-
                <div className="text-stone-500 text-opacity-70">{map.ties}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Expand/Collapse Button */}
      {hasPlayerCard && (
        <div className="flex justify-center">
          {!showMoreMaps ? (
            <svg
              fill="none"
              stroke="currentColor"
              className="h-5 stroke-warmscale-2 hover:cursor-pointer"
              onClick={() => setShowMoreMaps(true)}
              strokeWidth={3.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          ) : (
            <svg
              fill="none"
              stroke="currentColor"
              className="h-5 stroke-warmscale-2 hover:cursor-pointer"
              onClick={() => setShowMoreMaps(false)}
              strokeWidth={3.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
