import React, { useState } from 'react';
import { getClassOrder } from '../../../../constants/tf2';

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
  const [tooltipData, setTooltipData] = useState<{ text: string; x: number; y: number } | null>(null);

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

    const handleMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>) => {
      if (tooltip) {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipData({
          text: tooltip,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
        });
      }
    };

    const handleMouseLeave = () => {
      setTooltipData(null);
    };

    return (
      <th
        className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide transition-all border-r border-warmscale-5/30 ${className} ${
          isSortable ? 'cursor-pointer hover:text-orange-400' : ''
        } ${isActive ? 'text-orange-400' : 'text-warmscale-3'}`}
        onClick={() => {
          console.log('CLICKED!', key);
          if (key) handleSort(key);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label} {isSortable && (isActive ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅')}
      </th>
    );
  };

  const getCellClassName = (columnKey: SortKey, rowIndex: number) => {
    const baseClass = "px-2 py-1 text-white text-xs tabular-nums transition-colors text-center border-r border-warmscale-5/30";
    const isActive = sortKey === columnKey;

    if (isActive) {
      // Alternating orange background for sorted column
      const orangeBg = rowIndex % 2 === 0 ? 'bg-tf-orange/[4%]' : 'bg-tf-orange/[5%]';
      return `${baseClass} ${orangeBg}`;
    }

    // Alternating row background when not in sorted column
    const rowBg = rowIndex % 2 === 0 ? '' : 'bg-warmscale-8/50';
    return `${baseClass} ${rowBg}`;
  };

  return (
    <>
      <div className="bg-warmscale-8 border-b border-warmscale-5 p-4">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-[90%] border-collapse bg-warmscale-82 relative text-xs mx-auto">
            <thead className="bg-warmscale-9 border-b border-warmscale-7">
              <tr>
                <th onClick={() => handleSort('team')} className={`relative px-2 py-1 text-left text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'team' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  TEAM
                  {sortKey === 'team' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase border-r border-warmscale-5/30 text-warmscale-2">PLAYER</th>
                <th onClick={() => handleSort('primaryClass')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'primaryClass' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  C
                  {sortKey === 'primaryClass' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('kills')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'kills' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  K
                  {sortKey === 'kills' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('deaths')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'deaths' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  D
                  {sortKey === 'deaths' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('assists')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'assists' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  A
                  {sortKey === 'assists' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('damage')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'damage' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  BA
                  {sortKey === 'damage' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('dpm')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'dpm' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  DPM
                  {sortKey === 'dpm' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('kda')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'kda' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  K+A/D
                  {sortKey === 'kda' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('kd')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'kd' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  K/D
                  {sortKey === 'kd' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('damageTaken')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'damageTaken' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  DT
                  {sortKey === 'damageTaken' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('dtm')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'dtm' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  DTM
                  {sortKey === 'dtm' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('headshots')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'headshots' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  HS
                  {sortKey === 'headshots' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th onClick={() => handleSort('backstabs')} className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase cursor-pointer border-r border-warmscale-5/30 hover:text-orange-400 ${sortKey === 'backstabs' ? 'text-orange-400' : 'text-warmscale-2'}`}>
                  OB
                  {sortKey === 'backstabs' && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => {
                const rowBg = index % 2 === 0 ? '' : 'bg-warmscale-8/50';
                const classCellClass = sortKey === 'primaryClass'
                  ? `px-2 py-1 text-center transition-colors border-r border-warmscale-5/30 ${index % 2 === 0 ? 'bg-orange-500/5' : 'bg-orange-500/8'}`
                  : `px-2 py-1 text-center transition-colors border-r border-warmscale-5/30 ${rowBg}`;

                return (
                  <tr
                    key={player.steamId}
                    className="border-b border-warmscale-8 transition-colors hover:bg-warmscale-7/30"
                  >
                    {/* Team */}
                    <td
                      className={`px-2 py-1 text-center transition-colors border-r border-warmscale-5/30 ${
                        player.team === 'Blue' ? 'bg-tf-blue' : 'bg-tf-red'
                      } ${sortKey === 'team' ? 'ring-2 ring-inset ring-orange-400' : ''}`}
                    >
                      <span className="text-[10px] font-bold text-white uppercase">
                        {player.team === 'Blue' ? 'BLU' : 'RED'}
                      </span>
                    </td>

                    {/* Player Name */}
                    <td className={`px-2 py-1 transition-colors border-r border-warmscale-5/30 text-left ${rowBg}`}>
                      <span className="text-white font-medium text-xs truncate block">
                        {player.name}
                      </span>
                    </td>

                    {/* Class Icon */}
                    <td className={classCellClass}>
                      <img
                        src={getClassIcon(player.primaryClass)}
                        alt={player.primaryClass}
                        className="w-4 h-4 mx-auto"
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


    </>
  );
};

export default StatsTable;
