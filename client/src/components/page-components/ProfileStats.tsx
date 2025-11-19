import React from 'react';

interface ProfileStatsProps {
  totalMatches: number;
  totalMatchWins: number;
  totalMatchLosses: number;
  totalMatchTies: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  totalMatches,
  totalMatchWins,
  totalMatchLosses,
  totalMatchTies,
}) => {
  return (
    <div className="w-full">
      <div className="grid md:grid-cols-2 max-md:grid-rows-2 md:h-20 gap-4">
        <div
          id="winrate"
          className="h-full bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm"
        >
          <div className="flex justify-between items-baseline">
            <div className="flex">
              <div className="text-tf-orange text-xl font-semibold font-cantarell">
                {totalMatches}
              </div>
              <div className="text-lightscale-1 text-xl ml-1 font-semibold font-cantarell">
                Matches
              </div>
            </div>
          </div>
          <div className="bg-tf-orange h-2 mt-3 rounded-sm"></div>
        </div>
        <div
          id="winrate"
          className="h-full bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="flex">
              <div
                className={`${
                  totalMatchWins > totalMatchLosses
                    ? 'text-green-600'
                    : 'text-red-600'
                } text-xl font-semibold font-cantarell`}
              >
                {Math.round((totalMatchWins / totalMatches) * 1000) / 10}%
              </div>
              <div className="text-lightscale-1 text-xl ml-2 font-semibold font-cantarell">
                Win Rate
              </div>
            </div>
            <div className=" text-lightscale-7 text-sm font-cantarell font-semibold">
              {' '}
              <span className="text-green-500">{totalMatchWins}</span> -
              <span className="text-red-600">{totalMatchLosses}</span> -
              <span className="text-stone-600">{totalMatchTies}</span>
            </div>
          </div>
          <div className="bg-warmscale-7 h-2 mt-3 rounded-sm drop-shadow-sm">
            <div
              className={`${
                totalMatchWins > totalMatchLosses
                  ? 'bg-green-600'
                  : 'bg-red-600'
              } h-2 rounded-sm`}
              style={{
                width: `${(totalMatchWins / totalMatches) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
