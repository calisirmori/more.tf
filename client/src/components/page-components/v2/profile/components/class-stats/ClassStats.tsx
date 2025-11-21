/**
 * ClassStats Component
 * Displays most played classes with win rates and playtime
 */

import { ClassStat } from './types';

interface ClassStatsProps {
  classStats: ClassStat[];
}

export default function ClassStats({ classStats }: ClassStatsProps) {
  // Filter valid classes and limit to top 5
  const validClasses = classStats.filter(
    (stat) => stat.class !== null && stat.time !== null
  );

  if (validClasses.length === 0) {
    return null;
  }

  // Calculate max matches for progress bar scaling
  const maxMatches = validClasses.reduce((max, stat) => {
    const total = parseInt(stat.w) + parseInt(stat.t) + parseInt(stat.l);
    return Math.max(max, total);
  }, 0);

  return (
    <div className="w-full mb-4">
      <div className="bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm">
        <div className="text-lg text-lightscale-1 mb-3 font-semibold">
          Most Played Classes
        </div>

        <div className="space-y-3 font-cantarell">
          {validClasses.slice(0, 5).map((classStat) => {
            const totalMatches =
              parseInt(classStat.w) +
              parseInt(classStat.t) +
              parseInt(classStat.l);
            const winRate =
              totalMatches > 0
                ? ((parseInt(classStat.w) / totalMatches) * 100).toFixed(1)
                : '0.0';
            const hours = ((classStat.time || 0) / 3600).toFixed(1);
            const progressWidth = maxMatches > 0 ? (totalMatches / maxMatches) * 100 : 0;

            return (
              <div key={classStat.class} className="flex items-center gap-3">
                {/* Class Icon */}
                <img
                  src={`/class icons/Leaderboard_class_${classStat.class}.png`}
                  alt={classStat.class || ''}
                  className="h-9 flex-shrink-0"
                />

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <div>
                      <span className="text-lightscale-1 font-semibold">
                        {totalMatches}
                      </span>
                      <span className="text-lightscale-6 ml-1">matches</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          parseFloat(winRate) > 50
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {winRate}%
                      </span>
                      <span className="text-lightscale-6">{hours}hrs</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-warmscale-7 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-tf-orange rounded-sm transition-all duration-300"
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
