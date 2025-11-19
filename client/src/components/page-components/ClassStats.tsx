import React from 'react';

interface ClassData {
  class: string | null;
  time: number | null;
  w: string;
  t: string;
  l: string;
}

interface ClassStatsProps {
  perClassPlaytimeData: ClassData[];
}

const ClassStats: React.FC<ClassStatsProps> = ({ perClassPlaytimeData }) => {
  const currentMax = perClassPlaytimeData[0]?.time === null ? 1 : 0;
  const topMatchesWithAnyClass =
    parseInt(perClassPlaytimeData[currentMax]?.w || '0') +
    parseInt(perClassPlaytimeData[currentMax]?.t || '0') +
    parseInt(perClassPlaytimeData[currentMax]?.l || '0');

  return (
    <div className="w-full mt-4">
      <div
        id="playedclasses"
        className="bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm"
      >
        <div className="text-lg text-lightscale-1 mb-3 font-semibold">
          Most Played Classes
        </div>
        <div className="space-y-3 font-cantarell">
          {perClassPlaytimeData.map((classPlayed, index: number) => {
            if (
              classPlayed.class === null ||
              index >= 5 ||
              classPlayed.time === null
            ) {
              return null;
            }

            const totalGamesWithClass =
              parseInt(classPlayed.w) +
              parseInt(classPlayed.t) +
              parseInt(classPlayed.l);
            const winRate =
              totalGamesWithClass > 0
                ? (
                    (parseInt(classPlayed.w) / totalGamesWithClass) *
                    100
                  ).toFixed(1)
                : '0.0';
            const hours = (classPlayed.time / 3600).toFixed(1);

            return (
              <div key={classPlayed.class} className="flex items-center gap-3">
                <img
                  src={`../../../class icons/Leaderboard_class_${classPlayed.class}.png`}
                  alt={classPlayed.class}
                  className="h-9 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <div>
                      <span className="text-lightscale-1 font-semibold">
                        {totalGamesWithClass}
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
                  <div className="h-2 bg-warmscale-7 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-tf-orange rounded-sm"
                      style={{
                        width: `${(totalGamesWithClass / topMatchesWithAnyClass) * 100}%`,
                      }}
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
};

export default ClassStats;
