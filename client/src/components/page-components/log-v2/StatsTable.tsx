import React, { useState } from 'react';
import { getClassOrder } from '../../../constants/tf2';
import Tooltip from '../../common/Tooltip';

interface PlayerStats {
  steamId: string;
  name: string;
  team: 'Red' | 'Blue';
  primaryClass: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  dpm: number;
  kd: number;
  kda: number;
  damageTaken: number;
  dtm: number;
  healing?: number;
  airshots?: number;
  headshots?: number;
  backstabs?: number;
  capturePointsCapped: number;
}

interface StatsTableProps {
  players: PlayerStats[];
}

type SortKey = keyof PlayerStats | null;

const StatsTable: React.FC<StatsTableProps> = ({ players }) => {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getClassIcon = (className: string) => {
    const normalizedClass = className.toLowerCase();
    return `/class icons/Leaderboard_class_${normalizedClass}.png`;
  };

  const handleSort = (key: SortKey) => {
    if (!key) return;

    if (sortKey === key) {
      // 3-click cycle: desc -> asc -> reset to team
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        // Reset to default (team + class sort)
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    // Default sort: by team, then by class order
    if (sortKey === null) {
      // First sort by team (Blue first, then Red)
      const teamCompare = a.team.localeCompare(b.team);
      if (teamCompare !== 0) return teamCompare;

      // Then sort by class order within each team
      return getClassOrder(a.primaryClass) - getClassOrder(b.primaryClass);
    }

    // Custom sort by selected column
    if (sortKey === 'team') {
      const teamCompare = sortDirection === 'asc'
        ? a.team.localeCompare(b.team)
        : b.team.localeCompare(a.team);

      // Secondary sort by class
      if (teamCompare === 0) {
        return getClassOrder(a.primaryClass) - getClassOrder(b.primaryClass);
      }
      return teamCompare;
    }

    if (sortKey === 'primaryClass') {
      const classCompare = getClassOrder(a.primaryClass) - getClassOrder(b.primaryClass);
      return sortDirection === 'asc' ? classCompare : -classCompare;
    }

    const aValue = a[sortKey];
    const bValue = b[sortKey];

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

  const HeaderCell = ({
    label,
    sortKey: key,
    className = '',
    tooltip,
  }: {
    label: string;
    sortKey?: SortKey;
    className?: string;
    tooltip?: string;
  }) => {
    const isActive = sortKey === key;
    const isSortable = key !== undefined;

    const content = (
      <div className="flex items-center justify-center gap-1">
        <span>{label}</span>
        {isSortable && (
          <div className="flex flex-col w-3 items-center justify-center">
            {isActive ? (
              sortDirection === 'asc' ? (
                <span className="text-orange-400 text-[10px]">▲</span>
              ) : (
                <span className="text-orange-400 text-[10px]">▼</span>
              )
            ) : (
              <span className="text-warmscale-5 opacity-50 text-[10px]">⇅</span>
            )}
          </div>
        )}
      </div>
    );

    return (
      <th
        className={`relative px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide transition-all ${className} ${
          isSortable ? 'cursor-pointer hover:text-orange-400' : ''
        } ${isActive ? 'text-orange-400' : 'text-warmscale-3'}`}
        onClick={() => key && handleSort(key)}
      >
        {tooltip ? (
          <Tooltip content={tooltip}>{content}</Tooltip>
        ) : (
          content
        )}
      </th>
    );
  };

  const getCellClassName = (columnKey: SortKey, rowIndex: number) => {
    const baseClass = "px-2 py-2 text-white text-sm tabular-nums transition-colors";
    const isActive = sortKey === columnKey;

    if (isActive) {
      return `${baseClass} bg-orange-500/10`;
    }

    // Alternating row background only when not in sorted column
    const rowBg = rowIndex % 2 === 0 ? '' : 'bg-warmscale-8/50';
    return `${baseClass} ${rowBg}`;
  };

  return (
    <div className="bg-warmscale-8 p-6">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-full border-collapse bg-warmscale-82 relative">
            <thead className="bg-warmscale-9 border-b border-warmscale-7">
              <tr>
                <HeaderCell label="TEAM" sortKey="team" className="w-16" tooltip="Team" />
                <HeaderCell label="PLAYER" className="min-w-[140px]" tooltip="Player Name" />
                <HeaderCell label="C" sortKey="primaryClass" className="w-10" tooltip="Class" />
                <HeaderCell label="K" sortKey="kills" tooltip="Kills" />
                <HeaderCell label="D" sortKey="deaths" tooltip="Deaths" />
                <HeaderCell label="A" sortKey="assists" tooltip="Assists" />
                <HeaderCell label="BA" sortKey="damage" tooltip="Damage Dealt" />
                <HeaderCell label="DPM" sortKey="dpm" tooltip="Damage Per Minute" />
                <HeaderCell label="K+A/D" sortKey="kda" tooltip="Kills + Assists / Deaths" />
                <HeaderCell label="K/D" sortKey="kd" tooltip="Kill/Death Ratio" />
                <HeaderCell label="DT" sortKey="damageTaken" tooltip="Damage Taken" />
                <HeaderCell label="DTM" sortKey="dtm" tooltip="Damage Taken Per Minute" />
                <HeaderCell label="HS" sortKey="headshots" tooltip="Headshots" />
                <HeaderCell label="OB" sortKey="backstabs" tooltip="Backstabs" />
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => {
                const rowBg = index % 2 === 0 ? '' : 'bg-warmscale-8/50';
                const teamCellClass = sortKey === 'team'
                  ? 'px-2 py-2 transition-colors bg-orange-500/10'
                  : `px-2 py-2 transition-colors ${rowBg}`;
                const classCellClass = sortKey === 'primaryClass'
                  ? 'px-2 py-2 text-center transition-colors bg-orange-500/10'
                  : `px-2 py-2 text-center transition-colors ${rowBg}`;

                return (
                  <tr
                    key={player.steamId}
                    className="border-b border-warmscale-8 transition-colors hover:bg-warmscale-7/30"
                  >
                    {/* Team */}
                    <td
                      className={`px-2 py-2 text-center transition-colors ${
                        player.team === 'Blue' ? 'bg-[#5885A2]' : 'bg-[#B8383B]'
                      } ${sortKey === 'team' ? 'ring-2 ring-inset ring-orange-400' : ''}`}
                    >
                      <span className="text-xs font-bold text-white uppercase">
                        {player.team === 'Blue' ? 'BLU' : 'RED'}
                      </span>
                    </td>

                    {/* Player Name */}
                    <td className={`px-2 py-2 transition-colors ${rowBg}`}>
                      <span className="text-white font-medium text-sm truncate block">
                        {player.name}
                      </span>
                    </td>

                    {/* Class Icon */}
                    <td className={classCellClass}>
                      <img
                        src={getClassIcon(player.primaryClass)}
                        alt={player.primaryClass}
                        className="w-5 h-5 mx-auto"
                      />
                    </td>

                    {/* Stats */}
                    <td className={getCellClassName('kills', index)}>{player.kills}</td>
                    <td className={getCellClassName('deaths', index)}>{player.deaths}</td>
                    <td className={getCellClassName('assists', index)}>{player.assists}</td>
                    <td className={getCellClassName('damage', index)}>{player.damage}</td>
                    <td className={getCellClassName('dpm', index)}>{Math.round(player.dpm)}</td>
                    <td className={getCellClassName('kda', index)}>{player.kda.toFixed(2)}</td>
                    <td className={getCellClassName('kd', index)}>{player.kd.toFixed(2)}</td>
                    <td className={getCellClassName('damageTaken', index)}>{player.damageTaken}</td>
                    <td className={getCellClassName('dtm', index)}>{Math.round(player.dtm)}</td>
                    <td className={getCellClassName('headshots', index)}>{player.headshots || 0}</td>
                    <td className={getCellClassName('backstabs', index)}>{player.backstabs || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default StatsTable;
