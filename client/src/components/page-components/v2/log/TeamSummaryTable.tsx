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
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-[60%] border-collapse bg-warmscale-82 relative text-xs mx-auto">
          <thead className="bg-warmscale-9 border-b border-warmscale-7">
            <tr>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Team
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Kills
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Damage
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Charges
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Drops
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide border-r border-warmscale-5/30 text-warmscale-2">
                Caps
              </th>
              <th className="px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-warmscale-2">
                Midfights
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((teamData, index) => {
              // Use TF2 team colors
              const teamBgClass = teamData.team === 'Red'
                ? 'bg-tf-red'
                : 'bg-tf-blue';
              const rowBg = index % 2 === 0 ? '' : 'bg-warmscale-8/50';

              return (
                <tr
                  key={teamData.team}
                  className="border-b border-warmscale-8 transition-colors hover:bg-warmscale-7/30"
                >
                  {/* Team Cell */}
                  <td className={`px-2 py-1 text-center border-r border-warmscale-5/30 ${teamBgClass}`}>
                    <span className="text-[10px] font-bold text-white uppercase">
                      {teamData.team === 'Red' ? 'RED' : 'BLU'}
                    </span>
                  </td>

                  {/* Stats Cells */}
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {teamData.kills}
                  </td>
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {teamData.damage}
                  </td>
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {teamData.charges}
                  </td>
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {teamData.drops}
                  </td>
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center border-r border-warmscale-5/30 ${rowBg}`}>
                    {teamData.caps}
                  </td>
                  <td className={`px-2 py-1 text-white text-xs tabular-nums text-center ${rowBg}`}>
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
