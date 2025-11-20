import React from 'react';

interface MedicStatsProps {
  roundNumber: number;
  duration?: number; // in seconds
  playerPerformance?: Record<string, { kills: number; deaths: number; damage: number; heals: number }>;
  teamStats?: {
    red: { ubers: number };
    blue: { ubers: number };
  };
  playerNames: Record<string, string>;
  gameTotalPlayers?: any[];
}

interface MedicData {
  steamId: string;
  name: string;
  team: 'red' | 'blue';
  healing: number;
  healsPerMinute: number;
  charges: number;
  drops: number;
}

const MedicStats: React.FC<MedicStatsProps> = ({
  roundNumber,
  duration,
  playerPerformance,
  teamStats,
  playerNames,
  gameTotalPlayers,
}) => {
  if (!playerPerformance || !gameTotalPlayers || !duration) {
    return null;
  }

  // Find all medics from gameTotalPlayers
  const medics = gameTotalPlayers.filter((p) => p.primaryClass === 'medic');

  if (medics.length === 0) {
    return null;
  }

  // Group medics by team
  const redMedics: MedicData[] = [];
  const blueMedics: MedicData[] = [];

  medics.forEach((medic) => {
    const perfData = playerPerformance[medic.steamId];
    if (!perfData || perfData.heals === 0) return; // Skip medics who didn't heal this round

    const medicData: MedicData = {
      steamId: medic.steamId,
      name: playerNames[medic.steamId] || medic.name || 'Unknown',
      team: medic.team,
      healing: perfData.heals,
      healsPerMinute: Math.round((perfData.heals / duration) * 60),
      charges: 0, // Will be calculated below
      drops: medic.drops || 0,
    };

    if (medic.team === 'red') {
      redMedics.push(medicData);
    } else if (medic.team === 'blue') {
      blueMedics.push(medicData);
    }
  });

  // Distribute ubers among medics on each team based on healing proportion
  if (teamStats) {
    // Red team
    const redTotalHealing = redMedics.reduce((sum, m) => sum + m.healing, 0);
    if (redTotalHealing > 0) {
      redMedics.forEach((medic) => {
        const proportion = medic.healing / redTotalHealing;
        medic.charges = Math.round(teamStats.red.ubers * proportion);
      });
    }

    // Blue team
    const blueTotalHealing = blueMedics.reduce((sum, m) => sum + m.healing, 0);
    if (blueTotalHealing > 0) {
      blueMedics.forEach((medic) => {
        const proportion = medic.healing / blueTotalHealing;
        medic.charges = Math.round(teamStats.blue.ubers * proportion);
      });
    }
  }

  // Sort by healing
  redMedics.sort((a, b) => b.healing - a.healing);
  blueMedics.sort((a, b) => b.healing - a.healing);

  const renderMedicSection = (medic: MedicData, teamColor: 'red' | 'blue') => {
    const bgColor = teamColor === 'red' ? 'bg-tf-red' : 'bg-tf-blue';
    const headerBg = teamColor === 'red' ? 'bg-tf-red/80' : 'bg-tf-blue/80';

    return (
      <div key={medic.steamId} className="flex-1 min-w-0">
        {/* Header */}
        <div className={`${headerBg} px-4 py-2 text-center`}>
          <div className="text-lightscale-0 font-bold text-lg">{medic.name}</div>
        </div>

        {/* Stats Grid */}
        <div className="bg-warmscale-8 border-x border-b border-warmscale-6 px-4 py-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-lightscale-2">Healing</span>
              <span className="text-lightscale-0 font-semibold">{medic.healing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-lightscale-2">Heals Per Minute</span>
              <span className="text-lightscale-0 font-semibold">{medic.healsPerMinute}/m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-lightscale-2">Charges(total)</span>
              <span className="text-lightscale-0 font-semibold">{medic.charges}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-lightscale-2">Drops</span>
              <span className="text-lightscale-0 font-semibold">{medic.drops}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-bold text-lightscale-0 mb-3 border-b border-warmscale-6 pb-2">
        Medic Statistics
      </h4>

      {/* Medic Sections */}
      <div className="flex gap-4">
        {/* Blue Medic(s) */}
        {blueMedics.length > 0 && (
          <div className="flex-1">
            {blueMedics.map((medic) => renderMedicSection(medic, 'blue'))}
          </div>
        )}

        {/* Red Medic(s) */}
        {redMedics.length > 0 && (
          <div className="flex-1">
            {redMedics.map((medic) => renderMedicSection(medic, 'red'))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicStats;
