/**
 * LogSummaryView Component
 * Displays quick view log summary in an expandable dropdown with player stats
 */

import React, { useState } from 'react';

interface PlayerSummary {
  steamId: string;
  steamId64: string;
  name: string;
  team: 'Red' | 'Blue';
  primaryClass: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  healing: number;
  kd: number;
  kda: number;
  dpm: number;
  hpm: number;
  playtimeMinutes: number;
}

interface TeamSummary {
  team: 'Red' | 'Blue';
  score: number;
  kills: number;
  deaths: number;
  damage: number;
  healing: number;
  ubers: number;
  drops: number;
  kd: number;
  dpm: number;
  hpm: number;
  players: PlayerSummary[];
}

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
    red: TeamSummary;
    blue: TeamSummary;
  };
  playerCount: {
    total: number;
    red: number;
    blue: number;
  };
}

interface LogSummaryViewProps {
  summary: LogSummary;
  currentPlayerId?: string;
}

type SortKey = keyof PlayerSummary | 'team' | null;

export default function LogSummaryView({ summary, currentPlayerId }: LogSummaryViewProps) {
  const { teams, finalScore, rounds, durationFormatted, winner } = summary;
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getClassIcon = (className: string) => {
    const normalizedClass = className.toLowerCase();
    return `/class icons/Leaderboard_class_${normalizedClass}.png`;
  };

  const handleSort = (key: SortKey) => {
    if (!key) return;

    if (sortKey === key) {
      // Toggle between desc -> asc -> reset
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Combine and sort players
  const allPlayers = [
    ...teams.blue.players.map(p => ({ ...p, team: 'Blue' as const })),
    ...teams.red.players.map(p => ({ ...p, team: 'Red' as const }))
  ];

  // Sort players based on current sort key
  const sortedPlayers = [...allPlayers].sort((a, b) => {
    // Default sort: by team (Blue first)
    if (sortKey === null) {
      return a.team.localeCompare(b.team);
    }

    if (sortKey === 'team') {
      return sortDirection === 'asc'
        ? a.team.localeCompare(b.team)
        : b.team.localeCompare(a.team);
    }

    const aValue = a[sortKey as keyof PlayerSummary];
    const bValue = b[sortKey as keyof PlayerSummary];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  return (
    <div className="bg-warmscale-9 border-t border-warmscale-7">
      {/* Match Info Header */}
      <div className="px-4 py-3 border-b border-warmscale-7">
        {/* Match metadata line */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs text-lightscale-4">
            <span className="text-lightscale-1 font-semibold">{summary.map}</span>
            <span className="mx-2 text-lightscale-6">•</span>
            <span>{durationFormatted}</span>
            <span className="mx-2 text-lightscale-6">•</span>
            <span>{rounds.total} round{rounds.total !== 1 ? 's' : ''}</span>
          </div>
          <a
            href={`/log/${summary.logId}`}
            className="text-xs text-tf-orange hover:text-orange-400 font-semibold"
          >
            View Full Log →
          </a>
        </div>

        {/* Team Score Header Boxes */}
        <div className="flex items-center gap-3">
          {/* BLU Team Box */}
          <div className="flex-1 bg-tf-blue rounded px-3 py-2 flex items-center justify-between">
            <span className="text-white text-lg font-bold">BLU</span>
            <div className="flex items-center gap-2">
              <div className="text-white text-3xl font-bold">{finalScore.blue}</div>
              {winner === 'Blue' && (
                <span className="text-yellow-400 text-xs font-bold">WINNER</span>
              )}
            </div>
          </div>

          {/* FINAL Badge */}
          <div className="px-3 py-1 bg-warmscale-7 rounded text-lightscale-3 text-xs font-bold">
            FINAL
          </div>

          {/* RED Team Box */}
          <div className="flex-1 bg-tf-red rounded px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-white text-3xl font-bold">{finalScore.red}</div>
              {winner === 'Red' && (
                <span className="text-yellow-400 text-xs font-bold">WINNER</span>
              )}
            </div>
            <span className="text-white text-lg font-bold">RED</span>
          </div>
        </div>
      </div>

      {/* Player Stats Table */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-warmscale-82 text-xs">
            <thead className="bg-warmscale-9 border-b border-warmscale-7">
              <tr>
                <th
                  onClick={() => handleSort('team')}
                  className={`px-2 py-1 text-left text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'team' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  TEAM {sortKey === 'team' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className={`px-2 py-1 text-left text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'name' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  PLAYER {sortKey === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('primaryClass')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'primaryClass' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  C {sortKey === 'primaryClass' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('kills')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'kills' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  K {sortKey === 'kills' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('deaths')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'deaths' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  D {sortKey === 'deaths' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('assists')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'assists' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  A {sortKey === 'assists' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('damage')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'damage' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  DMG {sortKey === 'damage' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('dpm')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'dpm' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  DPM {sortKey === 'dpm' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('kda')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'kda' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  K+A/D {sortKey === 'kda' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('kd')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase border-r border-warmscale-5/30 cursor-pointer hover:text-orange-400 ${
                    sortKey === 'kd' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  K/D {sortKey === 'kd' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  onClick={() => handleSort('healing')}
                  className={`px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer hover:text-orange-400 ${
                    sortKey === 'healing' ? 'text-orange-400' : 'text-warmscale-2'
                  }`}
                >
                  HEAL {sortKey === 'healing' && (sortDirection === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => {
                const isCurrentUser = currentPlayerId && player.steamId64 === currentPlayerId;
                const rowBg = index % 2 === 0 ? '' : 'bg-warmscale-8/50';
                const teamBgColor = player.team === 'Blue' ? 'bg-tf-blue' : 'bg-tf-red';

                // Highlight current user's row - subtle lighter background
                const highlightClass = isCurrentUser
                  ? 'bg-white/[15%]'
                  : '';

                // Helper function to get cell background with sort highlighting
                const getCellBg = (columnKey: SortKey) => {
                  if (sortKey === columnKey) {
                    return index % 2 === 0 ? 'bg-orange-500/5' : 'bg-orange-500/10';
                  }
                  return rowBg;
                };

                return (
                  <tr
                    key={player.steamId}
                    className={`border-b border-warmscale-8 ${highlightClass}`}
                  >
                    {/* Team */}
                    <td className={`px-2 py-1 text-center transition-colors border-r border-warmscale-5/30 ${teamBgColor}`}>
                      <span className="text-[10px] font-bold text-white uppercase">
                        {player.team === 'Blue' ? 'BLU' : 'RED'}
                      </span>
                    </td>

                    {/* Player Name */}
                    <td className={`px-2 py-1 transition-colors border-r border-warmscale-5/30 text-left ${getCellBg('name')}`}>
                      <span className="text-white font-medium text-xs truncate block max-w-[150px]">
                        {player.name}
                      </span>
                    </td>

                    {/* Class Icon */}
                    <td className={`px-2 py-1 text-center transition-colors border-r border-warmscale-5/30 ${getCellBg('primaryClass')}`}>
                      <img
                        src={getClassIcon(player.primaryClass)}
                        alt={player.primaryClass}
                        className="w-4 h-4 mx-auto"
                      />
                    </td>

                    {/* Kills */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${getCellBg('kills')}`}>
                      {player.kills}
                    </td>

                    {/* Deaths */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${getCellBg('deaths')}`}>
                      {player.deaths}
                    </td>

                    {/* Assists */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${getCellBg('assists')}`}>
                      {player.assists}
                    </td>

                    {/* Damage */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${getCellBg('damage')}`}>
                      {player.damage.toLocaleString()}
                    </td>

                    {/* DPM */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${getCellBg('dpm')}`}>
                      {Math.round(player.dpm)}
                    </td>

                    {/* KDA */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${getCellBg('kda')}`}>
                      {player.kda.toFixed(2)}
                    </td>

                    {/* K/D */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${getCellBg('kd')}`}>
                      {player.kd.toFixed(2)}
                    </td>

                    {/* Healing */}
                    <td className={`px-2 py-1 text-white text-xs tabular-nums text-center ${getCellBg('healing')}`}>
                      {player.healing > 0 ? player.healing.toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
