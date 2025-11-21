/**
 * ClassTrendsCircle Component
 * Circular visualization of class distribution and performance
 */

import { useState, useMemo } from 'react';
import { ClassStat } from '../class-stats/types';
import { FormatStat } from '../formats/types';

interface ClassTrendsCircleProps {
  classStats: ClassStat[];
  formatStats: FormatStat[];
}

export default function ClassTrendsCircle({ classStats, formatStats }: ClassTrendsCircleProps) {
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);
  const [hoveredFormat, setHoveredFormat] = useState<string | null>(null);

  // Calculate angles for each class segment
  const classSegments = useMemo(() => {
    // Calculate total matches and prepare segments
    const segments = classStats
      .filter(stat => stat.class !== null)
      .map((stat) => {
        const wins = parseInt(stat.w);
        const losses = parseInt(stat.l);
        const ties = parseInt(stat.t);
        const matches = wins + losses + ties;
        const winRate = matches > 0 ? (wins / matches) * 100 : 0;

        return {
          class: stat.class!,
          matches,
          wins,
          losses,
          ties,
          winRate,
          time: stat.time || 0,
        };
      });

    const totalMatches = segments.reduce((sum, seg) => sum + seg.matches, 0);
    let currentAngle = 0; // Start at 12 o'clock (0 degrees)

    return segments.map((segment) => {
      const percentage = totalMatches > 0 ? (segment.matches / totalMatches) * 100 : 0;
      const segmentAngle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;
      currentAngle = endAngle;

      return {
        ...segment,
        startAngle,
        endAngle,
        percentage,
      };
    });
  }, [classStats]);

  const getClassIcon = (className: string) => {
    return `/class icons/Leaderboard_class_${className}.png`;
  };

  const getClassColor = (className: string) => {
    const colors: Record<string, string> = {
      scout: '#8B4789', // Purple/Pink - Scout's speed
      soldier: '#5B7C5B', // Army Green - Military theme
      pyro: '#B85450', // Fire Red - Flames
      demoman: '#5C4A3A', // Dark Brown - Demolitions
      heavy: '#8B6F47', // Tan/Brown - Heavy weapons
      engineer: '#D4A547', // Yellow/Gold - Construction
      medic: '#9B4D4D', // Medical Red - Health
      sniper: '#8B7355', // Tan/Khaki - Outdoorsman
      spy: '#476B8B', // Steel Blue - Sophisticated
    };
    return colors[className.toLowerCase()] || '#5A5A5A';
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    // Adjust by -90 to make 0 degrees point upward (12 o'clock)
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  const createRingPath = (centerX: number, centerY: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
    const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', outerStart.x, outerStart.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  };

  // Process format stats
  const formatSegments = useMemo(() => {
    const segments = formatStats
      .filter(stat => stat.format !== null)
      .map((stat) => {
        const wins = stat.format_wins;
        const losses = stat.format_losses;
        const ties = stat.format_ties;
        const matches = wins + losses + ties;
        const winRate = matches > 0 ? (wins / matches) * 100 : 0;

        return {
          format: stat.format!,
          matches,
          wins,
          losses,
          ties,
          winRate,
        };
      });

    const totalMatches = segments.reduce((sum, seg) => sum + seg.matches, 0);
    let currentAngle = 0; // Start at 12 o'clock (0 degrees)

    return segments.map((segment) => {
      const percentage = totalMatches > 0 ? (segment.matches / totalMatches) * 100 : 0;
      const segmentAngle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;
      currentAngle = endAngle;

      return {
        ...segment,
        startAngle,
        endAngle,
        percentage,
      };
    });
  }, [formatStats]);

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      '6s': '#5B7FA6', // Competitive Blue
      'hl': '#B85C3E', // Team Fortress Orange
      'fours': '#8B6BA8', // Purple
      'other': '#7A7A7A', // Neutral Gray
    };
    return colors[format.toLowerCase()] || '#6A6A6A';
  };

  const centerX = 175;
  const centerY = 175;
  const outerRingOuter = 160;
  const outerRingInner = 105;
  const formatRingOuter = 95;
  const formatRingInner = 50;

  return (
    <div className="w-full bg-warmscale-8 rounded-md px-4 py-3 mb-4 font-cantarell">
      <div className="text-lg text-lightscale-1 mb-3 font-semibold">Trends</div>

      {/* SVG Circle Chart */}
      <div className="flex justify-center">
        <svg width="350" height="350" viewBox="0 0 350 350" className="max-w-full">
          {/* Outer Ring - Class Distribution by Matches */}
          {classSegments.map((segment, index) => {
            const midAngle = (segment.startAngle + segment.endAngle) / 2;
            const iconRadius = (outerRingOuter + outerRingInner) / 2;
            const winRateRadius = outerRingInner - 10;

            return (
              <g key={`outer-${segment.class}`}>
                <path
                  d={createRingPath(centerX, centerY, outerRingInner, outerRingOuter, segment.startAngle, segment.endAngle)}
                  fill={getClassColor(segment.class)}
                  stroke={segment.winRate > 50 ? '#4ade80' : segment.winRate < 45 ? '#f87171' : '#1a1a1a'}
                  strokeWidth="3"
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredClass(segment.class);
                    setHoveredFormat(null);
                  }}
                  onMouseLeave={() => setHoveredClass(null)}
                />
                {/* Class Icon */}
                {segment.percentage > 5 && (
                  <image
                    href={getClassIcon(segment.class)}
                    x={polarToCartesian(centerX, centerY, iconRadius, midAngle).x - 16}
                    y={polarToCartesian(centerX, centerY, iconRadius, midAngle).y - 16}
                    width="32"
                    height="32"
                    className="pointer-events-none"
                  />
                )}
                {/* Win Rate Label */}
                {segment.percentage > 8 && (
                  <text
                    x={polarToCartesian(centerX, centerY, winRateRadius, midAngle).x}
                    y={polarToCartesian(centerX, centerY, winRateRadius, midAngle).y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs font-bold pointer-events-none ${
                      segment.winRate > 50 ? 'fill-green-400' : 'fill-red-400'
                    }`}
                  >
                    {segment.winRate.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Format Ring - Format Distribution */}
          {formatSegments.map((segment) => {
            const midAngle = (segment.startAngle + segment.endAngle) / 2;
            const labelRadius = (formatRingOuter + formatRingInner) / 2;

            return (
              <g key={`format-${segment.format}`}>
                <path
                  d={createRingPath(centerX, centerY, formatRingInner, formatRingOuter, segment.startAngle, segment.endAngle)}
                  fill={getFormatColor(segment.format)}
                  fillOpacity={0.9}
                  stroke={segment.winRate > 50 ? '#4ade80' : segment.winRate < 45 ? '#f87171' : '#1a1a1a'}
                  strokeWidth="3"
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredFormat(segment.format);
                    setHoveredClass(null);
                  }}
                  onMouseLeave={() => setHoveredFormat(null)}
                />
                {/* Format Label + Win Rate */}
                {segment.percentage > 15 && (
                  <g>
                    <text
                      x={polarToCartesian(centerX, centerY, labelRadius, midAngle).x}
                      y={polarToCartesian(centerX, centerY, labelRadius, midAngle).y - 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-lightscale-1 text-sm font-semibold pointer-events-none"
                    >
                      {segment.format.toUpperCase()}
                    </text>
                    <text
                      x={polarToCartesian(centerX, centerY, labelRadius, midAngle).x}
                      y={polarToCartesian(centerX, centerY, labelRadius, midAngle).y + 8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-xs font-bold pointer-events-none ${
                        segment.winRate > 50 ? 'fill-green-400' : 'fill-red-400'
                      }`}
                    >
                      {segment.winRate.toFixed(0)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Center Circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={formatRingInner - 5}
            fill="#0a0a0a"
            stroke="#2a2a2a"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Hover Stats Display - Additional Details */}
      <div className="mt-4 min-h-[2.5rem] bg-warmscale-7 rounded-md px-4 py-2">
        {hoveredClass ? (
          (() => {
            const segment = classSegments.find(s => s.class === hoveredClass);
            if (!segment) return null;
            return (
              <div className="text-center">
                <div className="text-lightscale-1 font-semibold capitalize">
                  {segment.class}:{' '}
                  <span className="text-green-500">{segment.wins}W</span>
                  <span className="text-lightscale-5"> - </span>
                  <span className="text-red-500">{segment.losses}L</span>
                  <span className="text-lightscale-5"> - </span>
                  <span className="text-lightscale-5">{segment.ties}T</span>
                  <span className="text-lightscale-5 ml-3">({segment.matches} matches)</span>
                </div>
              </div>
            );
          })()
        ) : hoveredFormat ? (
          (() => {
            const segment = formatSegments.find(s => s.format === hoveredFormat);
            if (!segment) return null;
            return (
              <div className="text-center">
                <div className="text-lightscale-1 font-semibold uppercase">
                  {segment.format}:{' '}
                  <span className="text-green-500">{segment.wins}W</span>
                  <span className="text-lightscale-5"> - </span>
                  <span className="text-red-500">{segment.losses}L</span>
                  <span className="text-lightscale-5"> - </span>
                  <span className="text-lightscale-5">{segment.ties}T</span>
                  <span className="text-lightscale-5 ml-3">({segment.matches} matches)</span>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center text-lightscale-5 text-sm py-1">
            Hover for detailed breakdown
          </div>
        )}
      </div>
    </div>
  );
}
