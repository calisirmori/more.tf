import React from 'react';

interface MedicStats {
  medicSteamId: string;
  medicName: string;
  team: string;
  totalUbersBuilt: number;
  avgTimeToBuild: number;
  totalUbersUsed: number;
  avgTimeBeforeUsing: number;
  avgUberLength: number;
  nearFullChargeDeaths: number;
  deathsAfterCharge: number;
  majorAdvantagesLost: number;
  biggestAdvantageLost: number;
}

interface MedicStatsSectionProps {
  medicStats?: MedicStats[];
  players: any[];
  playerNames: Record<string, string>;
  matchups?: any;
}

const getClassIcon = (className: string) => {
  const normalizedClass = className.toLowerCase();
  return `/class icons/Leaderboard_class_${normalizedClass}.png`;
};

const MedicStatsSection: React.FC<MedicStatsSectionProps> = ({ medicStats, players, playerNames, matchups }) => {
  if (!medicStats || medicStats.length === 0) {
    return null;
  }

  // Group by team
  const redMedics = medicStats.filter((m) => m.team === 'red');
  const blueMedics = medicStats.filter((m) => m.team === 'blue');

  const renderMedicSection = (medic: any) => {
    // Get medic's actual player data for healing stats
    const medicPlayer = players.find((p) => p.steamId === medic.medicSteamId);
    const totalHealing = medicPlayer?.healing || 0;
    const totalMinutes = (medicPlayer?.totalPlaytimeSeconds || 0) / 60;
    const hpm = totalMinutes > 0 ? (totalHealing / totalMinutes).toFixed(0) : '0';
    const drops = medicPlayer?.drops || 0;

    // Get heal targets from matchups
    const healTargets: any[] = [];
    if (matchups?.players) {
      const medicMatchup = matchups.players.find((p: any) => p.steamId === medic.medicSteamId);
      if (medicMatchup?.vsPlayers && totalHealing > 0) {
        Object.entries(medicMatchup.vsPlayers).forEach(([steamId, stats]: [string, any]) => {
          if (stats.healing > 0) {
            const player = players.find((p) => p.steamId === steamId);
            healTargets.push({
              steamId,
              name: playerNames[steamId] || 'Unknown',
              class: player?.primaryClass || 'unknown',
              healing: stats.healing,
              percentage: ((stats.healing / totalHealing) * 100).toFixed(1),
            });
          }
        });
        healTargets.sort((a, b) => b.healing - a.healing);
      }
    }

    const teamBgClass = medic.team === 'red' ? 'bg-tf-red' : 'bg-tf-blue';
    const teamDividerClass = medic.team === 'red' ? 'border-tf-red' : 'border-tf-blue';

    return (
      <div key={medic.medicSteamId} className="w-full md:w-[280px] bg-warmscale-9 border border-warmscale-5 rounded-sm overflow-hidden">
        <h2 className={`font-semibold text-center py-1.5 border-b border-warmscale-5 text-white text-sm ${teamBgClass}`}>
          {medic.medicName}
        </h2>
        <div className="px-3 py-2">
          <div className="flex flex-col gap-y-1 text-xs text-warmscale-1">
            <div className="flex justify-between">
              <span>Healing</span>
              <span className="font-semibold">{totalHealing} ({hpm}/m)</span>
            </div>
            <div className="flex justify-between">
              <span>Charges</span>
              <span>Medigun: {medic.totalUbersUsed || 0} (100%)</span>
            </div>
            <div className="flex justify-between">
              <span>Drops</span>
              <span>{drops}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg time to build</span>
              <span>{medic.avgTimeToBuild ? `${Math.round(medic.avgTimeToBuild)}s` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Near full charge deaths</span>
              <span>{medic.nearFullChargeDeaths || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg uber length</span>
              <span>{medic.avgUberLength ? `${medic.avgUberLength.toFixed(1)}s` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Deaths after charge</span>
              <span>{medic.deathsAfterCharge || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Major advantages lost</span>
              <span>{medic.majorAdvantagesLost || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Biggest advantage lost</span>
              <span>{medic.biggestAdvantageLost ? `${Math.round(medic.biggestAdvantageLost)}s` : '-'}</span>
            </div>
          </div>

          {healTargets.length > 0 && (
            <>
              <div className={`border-t-2 ${teamDividerClass} mt-3 mb-2`}></div>
              <table className="w-full text-xs text-warmscale-1">
                <thead>
                  <tr className="border-b border-warmscale-7">
                    <th className="text-left pb-0.5 text-[10px]">Name</th>
                    <th className="text-center pb-0.5 text-[10px]">Class</th>
                    <th className="text-right pb-0.5 text-[10px]">Heals</th>
                    <th className="text-right pb-0.5 text-[10px]">%</th>
                  </tr>
                </thead>
                <tbody>
                  {healTargets.map((t) => (
                    <tr key={t.steamId}>
                      <td className="py-0.5 pr-2 truncate max-w-[80px]">{t.name}</td>
                      <td className="py-0.5 text-center">
                        <img
                          src={getClassIcon(t.class)}
                          alt={t.class}
                          className="inline-block w-4 h-4"
                        />
                      </td>
                      <td className="py-0.5 text-right">{t.healing}</td>
                      <td className="py-0.5 text-right">{t.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {blueMedics.map((m) => renderMedicSection(m))}
      {redMedics.map((m) => renderMedicSection(m))}
    </div>
  );
};

export default MedicStatsSection;
