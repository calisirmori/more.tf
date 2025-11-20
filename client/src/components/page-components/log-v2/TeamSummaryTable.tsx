import React from 'react';

interface TeamSummaryData {
  team: 'Red' | 'Blue';
  kills: number;
  damage: number;
  charges: number;
  drops: number;
  caps: number;
  midfights: number;
}

interface TeamSummaryTableProps {
  redTeam: TeamSummaryData;
  blueTeam: TeamSummaryData;
}

const TeamSummaryTable: React.FC<TeamSummaryTableProps> = ({ redTeam, blueTeam }) => {
  const teams = [redTeam, blueTeam];

  return (
    <div className="rounded overflow-hidden flex justify-center">
      <div className="overflow-x-auto custom-scrollbar w-full md:w-auto">
        <table className="border-collapse w-full md:w-auto">
          <thead className="bg-warmscale-7/30">
            <tr className="bg-warmscale-82">
              <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wide text-warmscale-1">
                Team
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wide text-warmscale-1">
                Kills
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wide text-warmscale-1">
                Damage
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wide text-warmscale-1">
                Charges
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wide text-warmscale-1">
                Drops
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wide text-warmscale-1">
                Caps
              </th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wide text-warmscale-1">
                Midfights
              </th>
            </tr>
          </thead>
          <tbody className="bg-warmscale-8">
            {teams.map((teamData, index) => {
              // Use TF2 team colors
              const teamBgClass = teamData.team === 'Red'
                ? 'bg-[#B8383B]' // TF2 Red
                : 'bg-[#5885A2]'; // TF2 Blue

              return (
                <tr
                  key={teamData.team}
                  className="border-b border-warmscale-7 last:border-b-0"
                >
                  {/* Team Cell */}
                  <td className={`px-2 md:px-4 py-2 md:py-3 font-bold text-white text-xs md:text-sm text-center ${teamBgClass}`}>
                    {teamData.team === 'Red' ? 'RED' : 'BLU'}
                  </td>

                  {/* Stats Cells */}
                  <td className="px-2 md:px-4 py-2 md:py-3 text-white text-xs md:text-sm tabular-nums text-center">
                    {teamData.kills}
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-white text-xs md:text-sm tabular-nums text-center">
                    {teamData.damage}
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-white text-xs md:text-sm tabular-nums text-center">
                    {teamData.charges}
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-white text-xs md:text-sm tabular-nums text-center">
                    {teamData.drops}
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-white text-xs md:text-sm tabular-nums text-center">
                    {teamData.caps}
                  </td>
                  <td className="px-2 md:px-4 py-2 md:py-3 text-white text-xs md:text-sm tabular-nums text-center">
                    {teamData.midfights}
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

export default TeamSummaryTable;
