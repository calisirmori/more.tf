/**
 * TimelineSection Component
 * Displays a timeline chart showing player stats over time
 */

import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PlayerInfo {
  steamId: string;
  name: string;
  team: 'red' | 'blue';
  primaryClass: string;
}

interface TimeBasedData {
  intervalSeconds: number;
  totalIntervals: number;
  matchStartTime: number;
  matchEndTime: number;
  matchDurationSeconds: number;
  intervals: Array<{
    intervalIndex: number;
    startTime: number;
    endTime: number;
    relativeStartTime: string;
    relativeEndTime: string;
    durationSeconds: number;
    players: Array<{
      steamId: string;
      kills: number;
      deaths: number;
      assists: number;
      damage: number;
      damageTaken: number;
      healing: number;
      ubers: number;
      drops: number;
    }>;
  }>;
}

interface TimelineSectionProps {
  timeBasedData: TimeBasedData;
  players: PlayerInfo[];
}

// Balanced colors for each player - less saturated
const PLAYER_COLORS = [
  '#E57373', // Soft Red
  '#64B5F6', // Soft Blue
  '#FFD54F', // Soft Yellow
  '#81C784', // Soft Green
  '#FF8A65', // Soft Orange
  '#BA68C8', // Soft Purple
  '#F06292', // Soft Pink
  '#4FC3F7', // Soft Cyan
  '#AED581', // Soft Lime
  '#EC407A', // Soft Deep Pink
  '#FFB74D', // Soft Amber
  '#4DD0E1', // Soft Turquoise
  '#FF7043', // Soft Deep Orange
  '#AB47BC', // Soft Violet
  '#9CCC65', // Soft Light Green
  '#FFA726', // Soft Orange Accent
  '#26C6DA', // Soft Aqua
  '#D4E157', // Soft Yellow Green
];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type StatType = 'kills' | 'deaths' | 'damage' | 'healing';

const getClassIcon = (className: string): string => {
  const normalizedClass = className.toLowerCase();
  return `/class icons/Leaderboard_class_${normalizedClass}.png`;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, playerData, statType }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-warmscale-9 border border-warmscale-6 rounded px-3 py-2 shadow-lg">
        <p className="text-lightscale-2 text-xs font-semibold mb-2">
          Time: {label}
        </p>
        <div className="space-y-1">
          {payload
            .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
            .slice(0, 8)
            .map((entry: any, index: number) => {
              const player = playerData.find((p: any) => p.steamId === entry.dataKey);
              return (
                <div key={index} className="flex items-center gap-2">
                  {player && (
                    <img
                      src={getClassIcon(player.primaryClass)}
                      alt={player.primaryClass}
                      className="w-4 h-4"
                    />
                  )}
                  <p
                    className="text-xs flex-1"
                    style={{ color: entry.color }}
                  >
                    {entry.name}: {entry.value}
                  </p>
                </div>
              );
            })}
          {payload.length > 8 && (
            <p className="text-xs text-lightscale-4 mt-1">
              +{payload.length - 8} more...
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Custom dot component for showing class icons at the end of lines
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey, playerClass, isLastPoint } = props;

  if (!isLastPoint) return null;

  return (
    <g>
      {/* Static icon at line endpoint */}
      <image
        x={cx - 8}
        y={cy - 8}
        width={16}
        height={16}
        href={getClassIcon(playerClass)}
      />
    </g>
  );
};

export default function TimelineSection({ timeBasedData, players }: TimelineSectionProps) {
  const [statType, setStatType] = useState<StatType>('kills');
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  // Process data for chart - calculate cumulative stats over time
  const chartData = useMemo(() => {
    const data: any[] = [];
    const cumulativeStats: { [steamId: string]: number } = {};

    // Initialize cumulative stats for all players
    players.forEach((player) => {
      cumulativeStats[player.steamId] = 0;
    });

    // Get the match start time from the first interval to calculate relative time
    const matchStartTime = timeBasedData.intervals[0]?.startTime || 0;

    // Process each interval
    timeBasedData.intervals.forEach((interval, index) => {
      // Calculate elapsed time from match start
      const elapsedSeconds = interval.startTime - matchStartTime;

      const timePoint: any = {
        time: formatTime(elapsedSeconds),
        timeSeconds: elapsedSeconds,
      };

      // Update cumulative stats for each player at this interval
      interval.players.forEach((playerStats) => {
        const statValue = playerStats[statType] || 0;
        cumulativeStats[playerStats.steamId] =
          (cumulativeStats[playerStats.steamId] || 0) + statValue;
      });

      // Add all player stats to this time point
      players.forEach((player) => {
        timePoint[player.steamId] = cumulativeStats[player.steamId] || 0;
      });

      data.push(timePoint);
    });

    return data;
  }, [timeBasedData, players, statType]);

  // Sort players by team (Blue first, then Red) for legend organization
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (a.team === b.team) return 0;
      return a.team === 'blue' ? -1 : 1;
    });
  }, [players]);

  // Get stat label
  const getStatLabel = () => {
    switch (statType) {
      case 'kills': return 'Kills';
      case 'deaths': return 'Deaths';
      case 'damage': return 'Damage';
      case 'healing': return 'Healing';
    }
  };

  return (
    <div className="bg-warmscale-8 p-4 select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-lightscale-0">Timeline - {getStatLabel()} Over Time</h2>

        {/* Stat Type Selector */}
        <div className="flex gap-2">
          {(['kills', 'deaths', 'damage', 'healing'] as StatType[]).map((type) => (
            <button
              key={type}
              onClick={() => setStatType(type)}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors ${
                statType === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-warmscale-7 text-lightscale-3 hover:bg-warmscale-6'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <style>
        {`
          .recharts-layer.recharts-line-curve {
            transition: stroke-opacity 2s ease-in-out !important;
          }
          .recharts-line path {
            transition: stroke-opacity 2s ease-in-out !important;
          }
        `}
      </style>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[150px_1fr] gap-4">
          {/* Players - Left sidebar */}
          <div className="flex flex-col gap-4">
            {/* Blue Team */}
            <div>
              <h3 className="text-sm font-bold text-tf-blue mb-2 uppercase tracking-wide">BLU TEAM</h3>
              <div className="space-y-1">
                {sortedPlayers
                  .filter((p) => p.team === 'blue')
                  .map((player, index) => {
                    const playerIndex = sortedPlayers.findIndex(p => p.steamId === player.steamId);
                    const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
                    const isHovered = hoveredPlayer === player.steamId;
                    return (
                      <div
                        key={player.steamId}
                        className={`flex items-center bg-warmscale-85 hover:bg-warmscale-5 gap-2 py-0.5 px-2 rounded-sm cursor-pointer transition-all`}
                        style={{
                          borderLeft: `3px solid ${color}`,
                        }}
                        onMouseEnter={() => setHoveredPlayer(player.steamId)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                      >
                        <img
                          src={getClassIcon(player.primaryClass)}
                          alt={player.primaryClass}
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <span className="text-lightscale-2 text-xs truncate">{player.name}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Red Team */}
            <div>
              <h3 className="text-sm font-bold text-tf-red mb-2 uppercase tracking-wide">RED TEAM</h3>
              <div className="space-y-1">
                {sortedPlayers
                  .filter((p) => p.team === 'red')
                  .map((player, index) => {
                    const playerIndex = sortedPlayers.findIndex(p => p.steamId === player.steamId);
                    const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
                    const isHovered = hoveredPlayer === player.steamId;
                    return (
                      <div
                        key={player.steamId}
                        className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-all ${
                          isHovered ? 'bg-warmscale-6' : 'hover:bg-warmscale-7'
                        }`}
                        style={{
                          borderLeft: `3px solid ${color}`,
                        }}
                        onMouseEnter={() => setHoveredPlayer(player.steamId)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                      >
                        <img
                          src={getClassIcon(player.primaryClass)}
                          alt={player.primaryClass}
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <span className="text-lightscale-2 text-xs truncate">{player.name}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                {/* Animate the entire chart appearing from left to right */}
                <defs>
                  <clipPath id="clip-animation">
                    <rect x="0" y="0" width="100%" height="100%">
                      <animate
                        attributeName="width"
                        from="0%"
                        to="100%"
                        dur="2s"
                        fill="freeze"
                      />
                    </rect>
                  </clipPath>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#999' }}
                />
                <YAxis
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#999' }}
                  label={{ value: getStatLabel(), angle: -90, position: 'insideLeft', fill: '#999' }}
                />
                <Tooltip content={<CustomTooltip playerData={sortedPlayers} statType={statType} />} />

                {/* Render a line for each player */}
                {sortedPlayers.map((player, index) => {
                  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
                  const isLastPointMap: { [key: number]: boolean } = {};
                  chartData.forEach((point, idx) => {
                    isLastPointMap[idx] = idx === chartData.length - 1;
                  });

                  // Calculate opacity based on hover state
                  const isHovered = hoveredPlayer === player.steamId;
                  const opacity = hoveredPlayer === null ? 1 : isHovered ? 1 : 0.1;

                  return (
                    <Line
                      key={player.steamId}
                      type="monotone"
                      dataKey={player.steamId}
                      name={player.name}
                      stroke={color}
                      strokeWidth={2}
                      strokeOpacity={opacity}
                      dot={(props: any) => (
                        <CustomDot
                          {...props}
                          playerClass={player.primaryClass}
                          isLastPoint={props.index === chartData.length - 1}
                        />
                      )}
                      activeDot={{ r: 4 }}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
