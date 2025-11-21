/**
 * ProfileStats Component
 * Displays overall match statistics including total matches and win rate
 */

interface ProfileStatsProps {
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
}

export default function ProfileStats({
  totalMatches,
  totalWins,
  totalLosses,
  totalTies,
}: ProfileStatsProps) {
  const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
  const hasMoreWins = totalWins > totalLosses;

  return (
    <div className="w-full mb-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Total Matches Card */}
        <div className="bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm">
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline">
              <div className="text-tf-orange text-xl font-semibold font-cantarell">
                {totalMatches}
              </div>
              <div className="text-lightscale-1 text-xl ml-1 font-semibold font-cantarell">
                Matches
              </div>
            </div>
          </div>
          <div className="bg-tf-orange h-2 mt-3 rounded-sm" />
        </div>

        {/* Win Rate Card */}
        <div className="bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-baseline">
              <div
                className={`${
                  hasMoreWins ? 'text-green-600' : 'text-red-600'
                } text-xl font-semibold font-cantarell`}
              >
                {winRate.toFixed(1)}%
              </div>
              <div className="text-lightscale-1 text-xl ml-2 font-semibold font-cantarell">
                Win Rate
              </div>
            </div>

            {/* W-L-T Record */}
            <div className="text-lightscale-7 text-sm font-cantarell font-semibold">
              <span className="text-green-500">{totalWins}</span>
              {' - '}
              <span className="text-red-600">{totalLosses}</span>
              {' - '}
              <span className="text-stone-600">{totalTies}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-warmscale-7 h-2 mt-3 rounded-sm drop-shadow-sm">
            <div
              className={`${
                hasMoreWins ? 'bg-green-600' : 'bg-red-600'
              } h-2 rounded-sm transition-all duration-300`}
              style={{
                width: `${Math.min(winRate, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
