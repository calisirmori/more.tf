import React from 'react';

interface RoundTeamStats {
  score: number;
  kills: number;
  damage: number;
  ubers: number;
}

interface RoundData {
  roundNumber: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  winner?: 'red' | 'blue' | 'unknown';
  score: {
    red: number;
    blue: number;
  };
  teamStats?: {
    red: RoundTeamStats;
    blue: RoundTeamStats;
  };
  midfight?: 'red' | 'blue' | null;
  overtime?: boolean;
}

interface RoundSectionProps {
  rounds: RoundData[];
  playerNames: Record<string, string>;
  gameTotalPlayers?: any[];
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getScoreBg = (winner?: string) => {
  if (winner === 'red') return 'bg-tf-red';
  if (winner === 'blue') return 'bg-tf-blue';
  return 'bg-warmscale-7';
};

const getMidfightBg = (midfight?: string | null) => {
  if (midfight === 'red') return 'bg-tf-red';
  if (midfight === 'blue') return 'bg-tf-blue';
  return 'bg-warmscale-7';
};

const getMidfightText = (midfight?: string | null) => {
  if (midfight === 'red') return 'RED';
  if (midfight === 'blue') return 'BLU';
  return '-';
};

const RoundSection: React.FC<RoundSectionProps> = ({ rounds }) => {
  if (!rounds || rounds.length === 0) {
    return null;
  }

  return (
    <div className="rounded overflow-hidden flex justify-center">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-[80%] border-collapse bg-warmscale-82 relative text-xs mx-auto">
          {/* Header */}
          <thead className="bg-warmscale-9 border-b border-warmscale-7">
            <tr>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Round
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Length
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Score
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-blue-300">
                BLU K
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-red-300">
                RED K
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-blue-300">
                BLU UC
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-red-300">
                RED UC
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-blue-300">
                BLU DA
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-red-300">
                RED DA
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-warmscale-2">
                Midfights
              </th>
            </tr>
          </thead>

          {/* Rounds */}
          <tbody>
            {rounds.map((round, index) => {
              const rowBg = index % 2 === 0 ? '' : 'bg-warmscale-8/50';

              return (
                <tr
                  key={round.roundNumber}
                  className="border-b border-warmscale-8 transition-colors hover:bg-warmscale-7/30"
                >
                  {/* Round Number */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {round.roundNumber}
                  </td>

                  {/* Length */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {formatDuration(round.duration)}
                  </td>

                  {/* Score */}
                  <td className={`px-2 py-1 font-bold text-white text-xs text-center border-r border-warmscale-5/30 ${getScoreBg(round.winner)}`}>
                    {round.score.blue} - {round.score.red}
                  </td>

                  {/* BLU Kills */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {round.teamStats?.blue.kills || 0}
                  </td>

                  {/* RED Kills */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {round.teamStats?.red.kills || 0}
                  </td>

                  {/* BLU Ubers */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {round.teamStats?.blue.ubers || 0}
                  </td>

                  {/* RED Ubers */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {round.teamStats?.red.ubers || 0}
                  </td>

                  {/* BLU Damage */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {round.teamStats?.blue.damage || 0}
                  </td>

                  {/* RED Damage */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {round.teamStats?.red.damage || 0}
                  </td>

                  {/* Midfights */}
                  <td className={`px-2 py-1 text-center ${getMidfightBg(round.midfight)}`}>
                    <span className="text-[10px] font-bold text-white uppercase">
                      {getMidfightText(round.midfight)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoundSection;
