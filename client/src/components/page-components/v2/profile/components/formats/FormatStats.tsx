/**
 * FormatStats Component
 * Displays player's performance statistics across different TF2 formats
 */

import { FormatStat } from './types';

interface FormatStatsProps {
  formatData: FormatStat[];
  totalMatches: number;
}

export default function FormatStats({ formatData, totalMatches }: FormatStatsProps) {
  const getFormatLabel = (format: string): string => {
    if (format === 'other') return 'OTH';
    if (format === 'fours') return '4S';
    return format.toUpperCase();
  };

  if (formatData.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-warmscale-8 rounded-md px-4 py-3 mb-4 font-cantarell">
      <div className="text-lg text-lightscale-1 mb-3 font-semibold">Formats</div>
      <div className="space-y-2">
        {formatData.map((currentFormat) => {
          if (currentFormat.format === null) return null;

          const formatWins = currentFormat.format_wins;
          const formatLosses = currentFormat.format_losses;
          const formatTies = currentFormat.format_ties;
          const totalFormatMatches = formatWins + formatLosses + formatTies;
          const winRate =
            totalFormatMatches > 0
              ? ((formatWins / totalFormatMatches) * 100).toFixed(1)
              : '0.0';
          const playedPercentage =
            totalMatches > 0
              ? ((totalFormatMatches / totalMatches) * 100).toFixed(1)
              : '0.0';

          return (
            <div key={currentFormat.format} className="flex items-center py-1">
              {/* Format Label */}
              <div className="w-10 text-lightscale-2 font-semibold text-sm">
                {getFormatLabel(currentFormat.format)}
              </div>

              {/* Stats and Progress Bar */}
              <div className="flex-1 ml-3">
                {/* Match Count and Win Rate */}
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs">
                    <span className="text-lightscale-2 font-semibold">
                      {totalFormatMatches}
                    </span>
                    <span className="text-lightscale-6 ml-1">matches</span>
                    <span className="ml-1.5 text-tf-orange font-semibold">
                      {playedPercentage}%
                    </span>
                  </div>
                  <div className="text-xs text-lightscale-2 font-semibold">
                    {winRate}% WR
                  </div>
                </div>

                {/* W/L/T Progress Bar */}
                <div className="h-2 bg-warmscale-7 rounded-sm overflow-hidden flex">
                  {formatWins > 0 && (
                    <div
                      className="bg-green-500 h-full"
                      style={{
                        width: `${(formatWins / totalFormatMatches) * 100}%`,
                      }}
                      title={`${formatWins} wins`}
                    />
                  )}
                  {formatLosses > 0 && (
                    <div
                      className="bg-red-500 h-full"
                      style={{
                        width: `${(formatLosses / totalFormatMatches) * 100}%`,
                      }}
                      title={`${formatLosses} losses`}
                    />
                  )}
                  {formatTies > 0 && (
                    <div
                      className="bg-stone-500 h-full"
                      style={{
                        width: `${(formatTies / totalFormatMatches) * 100}%`,
                      }}
                      title={`${formatTies} ties`}
                    />
                  )}
                </div>

                {/* W/L/T Counts */}
                <div className="flex justify-between text-xs text-lightscale-7 mt-1">
                  <span className="text-green-500">{formatWins}W</span>
                  <span className="text-red-500">{formatLosses}L</span>
                  {formatTies > 0 && (
                    <span className="text-stone-500">{formatTies}T</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
