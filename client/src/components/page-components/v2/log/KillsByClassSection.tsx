import React, { useState, useMemo } from 'react';

const CLASS_ORDER = [
  'scout',
  'soldier',
  'pyro',
  'demoman',
  'heavyweapons',
  'engineer',
  'medic',
  'sniper',
  'spy',
] as const;

type TF2Class = typeof CLASS_ORDER[number];

const getClassOrderIndex = (cls: string) => {
  const lower = cls?.toLowerCase();
  return CLASS_ORDER.indexOf(lower as TF2Class) === -1
    ? 999
    : CLASS_ORDER.indexOf(lower as TF2Class);
};

const getClassIcon = (className: string) => {
  const normalizedClass = className.toLowerCase();
  return `/class icons/Leaderboard_class_${normalizedClass}.png`;
};

interface Player {
  steamId: string;
  name: string;
  team: string;
  primaryClass: string;
}

interface ClassMatchup {
  kills: number;
  deaths: number;
  damage: number;
  damageTaken: number;
  assists: number;
  healing: number;
}

interface PlayerMatchupStats {
  steamId: string;
  vsClasses: Record<string, ClassMatchup>;
}

interface MatchupData {
  players: PlayerMatchupStats[];
}

interface Props {
  matchups: MatchupData;
  players: Player[];
  playerNames: Record<string, string>;
}

type Mode = 'kills' | 'assists' | 'deaths';
type SortKey = 'teamClass' | 'character' | 'name' | 'total' | TF2Class;
type SortDirection = 'asc' | 'desc' | 'default';

const KillsByClassSection: React.FC<Props> = ({ matchups, players, playerNames }) => {
  const [mode, setMode] = useState<Mode>('kills');
  const [sortKey, setSortKey] = useState<SortKey>('teamClass');
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');

  // Combine matchup data with player data
  const data = useMemo(() => {
    return players.map((player) => {
      const matchupStats = matchups.players.find((m) => m.steamId === player.steamId);
      const vsClasses = matchupStats?.vsClasses || {};

      return {
        steamId: player.steamId,
        name: playerNames[player.steamId] || player.name,
        team: player.team,
        character: player.primaryClass,
        vsClasses,
      };
    });
  }, [matchups, players, playerNames]);

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (sortDirection === 'default' || sortKey === 'teamClass') {
        const teamCompare = a.team.localeCompare(b.team);
        if (teamCompare !== 0) return teamCompare;
        return (
          getClassOrderIndex(a.character || '') -
          getClassOrderIndex(b.character || '')
        );
      }

      const getValue = (p: typeof a): number | string => {
        if (CLASS_ORDER.includes(sortKey as any)) {
          const classStats = p.vsClasses[sortKey];
          if (!classStats) return 0;
          return mode === 'kills' ? classStats.kills : mode === 'assists' ? classStats.assists : classStats.deaths;
        }
        if (sortKey === 'character') return getClassOrderIndex(p.character || '');
        if (sortKey === 'name') return p.name.toLowerCase();
        if (sortKey === 'total') {
          let total = 0;
          Object.values(p.vsClasses).forEach((classStats) => {
            total += mode === 'kills' ? classStats.kills : mode === 'assists' ? classStats.assists : classStats.deaths;
          });
          return total;
        }
        return '';
      };

      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return sorted;
  }, [data, mode, sortKey, sortDirection]);

  const renderSortableHeader = (key: SortKey, label: string | JSX.Element) => {
    const isActive = sortKey === key;

    const handleClick = () => {
      if (sortKey === key) {
        setSortDirection((prev) =>
          prev === 'default' ? 'desc' : prev === 'desc' ? 'asc' : 'default'
        );
        if (sortDirection === 'asc') setSortKey('teamClass');
      } else {
        setSortKey(key);
        setSortDirection('desc');
      }
    };

    const arrow = isActive
      ? sortDirection === 'asc'
        ? '▲'
        : sortDirection === 'desc'
        ? '▼'
        : ''
      : '';

    const borderClass = key === 'total' ? '' : 'border-r border-warmscale-5/30';

    return (
      <th
        className={`relative px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide transition-all cursor-pointer ${borderClass} hover:text-orange-400 ${
          isActive ? 'text-orange-400' : 'text-warmscale-2'
        }`}
        onClick={handleClick}
      >
        {typeof label === 'string' ? <span>{label}</span> : label}
        {arrow && <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[8px]">{arrow}</span>}
      </th>
    );
  };

  const renderTable = (isDesktop: boolean) => (
    <table
      className={`${
        isDesktop ? 'hidden lg:table' : 'lg:hidden min-w-[900px]'
      } w-[60%] border-collapse bg-warmscale-82 text-xs mx-auto`}
    >
      <thead className="bg-warmscale-9 border-b border-warmscale-7">
        <tr>
          <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2 w-12">
            Team
          </th>
          <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2 w-32">
            Player
          </th>
          {renderSortableHeader('character', 'C')}
          {CLASS_ORDER.map((cls) =>
            renderSortableHeader(
              cls,
              <img
                src={getClassIcon(cls)}
                alt={cls}
                className="w-4 h-4 mx-auto"
              />
            )
          )}
          {renderSortableHeader('total', 'Total')}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((p, i) => {
          const rowBg = i % 2 === 0 ? '' : 'bg-warmscale-8/50';

          // Calculate total
          let total = 0;
          Object.values(p.vsClasses).forEach((classStats) => {
            total += mode === 'kills' ? classStats.kills : mode === 'assists' ? classStats.assists : classStats.deaths;
          });

          return (
            <tr
              key={p.steamId}
              className="border-b border-warmscale-8 transition-colors hover:bg-warmscale-7/30"
            >
              {/* Team */}
              <td
                className={`px-2 py-1 text-center transition-colors border-r border-warmscale-5/30 ${
                  p.team === 'blue' ? 'bg-tf-blue' : 'bg-tf-red'
                }`}
              >
                <span className="text-[10px] font-bold text-white uppercase">
                  {p.team === 'red' ? 'RED' : 'BLU'}
                </span>
              </td>

              {/* Player Name */}
              <td className={`px-2 py-1 transition-colors border-r border-warmscale-5/30 ${rowBg}`}>
                <span className="text-white font-medium text-xs truncate block">
                  {p.name}
                </span>
              </td>

              {/* Class Icon */}
              <td className={`px-2 py-1 text-center transition-colors border-r border-warmscale-5/30 ${
                sortKey === 'character' ? 'bg-orange-500/5' : rowBg
              }`}>
                <img
                  src={getClassIcon(p.character || 'scout')}
                  alt={p.character ?? 'unknown'}
                  className="w-4 h-4 mx-auto"
                />
              </td>

              {/* Stats by class */}
              {CLASS_ORDER.map((cls) => {
                const classStats = p.vsClasses[cls];
                const value = classStats
                  ? mode === 'kills'
                    ? classStats.kills
                    : mode === 'assists'
                    ? classStats.assists
                    : classStats.deaths
                  : 0;
                const isActiveColumn = CLASS_ORDER.includes(sortKey as any) && sortKey === cls;

                return (
                  <td
                    key={cls}
                    className={`px-2 py-1 text-white text-xs text-center tabular-nums transition-colors border-r border-warmscale-5/30 ${
                      isActiveColumn ? 'bg-orange-500/5' : rowBg
                    }`}
                  >
                    {value}
                  </td>
                );
              })}

              {/* Total */}
              <td className={`px-2 py-1 text-white text-xs text-center font-semibold tabular-nums transition-colors ${
                sortKey === 'total' ? 'bg-orange-500/5' : rowBg
              }`}>
                {total}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  if (!matchups || !matchups.players || matchups.players.length === 0) {
    return null;
  }

  return (
    <div className="bg-warmscale-8 border-b border-warmscale-5 p-4">
      <div>
        {/* Mode buttons */}
        <div className="flex justify-center gap-1 mb-3">
          {(['kills', 'assists', 'deaths'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${
                mode === m
                  ? 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-500'
                  : 'bg-transparent text-warmscale-2 border-b-2 border-transparent hover:text-orange-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto custom-scrollbar relative">
          {renderTable(true)}
        </div>

        {/* Mobile scrollable table */}
        <div
          className="relative overflow-x-auto custom-scrollbar cursor-grab active:cursor-grabbing lg:hidden"
          onMouseDown={(e) => {
            const container = e.currentTarget;
            let startX = e.pageX;
            let scrollLeft = container.scrollLeft;

            const onMouseMove = (moveEvent: MouseEvent) => {
              const walk = moveEvent.pageX - startX;
              container.scrollLeft = scrollLeft - walk;
            };

            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        >
          {renderTable(false)}
        </div>
      </div>
    </div>
  );
};

export default KillsByClassSection;
