import React, { useState } from 'react';
import MedicStats from './MedicStats';

interface RoundTeamStats {
  score: number;
  kills: number;
  damage: number;
  ubers: number;
}

interface RoundPlayerPerformance {
  kills: number;
  deaths: number;
  damage: number;
  heals: number;
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
  playerPerformance?: Record<string, RoundPlayerPerformance>;
  firstCap?: 'red' | 'blue' | null;
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

const RoundRow: React.FC<{
  round: RoundData;
  playerNames: Record<string, string>;
  gameTotalPlayers?: any[];
}> = ({ round, playerNames, gameTotalPlayers }) => {
  const [expanded, setExpanded] = useState(false);

  const getWinnerBg = (winner?: string) => {
    if (winner === 'red') return 'bg-tf-red';
    if (winner === 'blue') return 'bg-tf-blue';
    return 'bg-warmscale-7';
  };

  const getMidfightBg = (midfight?: string | null) => {
    if (midfight === 'red') return 'bg-tf-red';
    if (midfight === 'blue') return 'bg-tf-blue';
    return 'bg-warmscale-7';
  };

  const getWinnerText = (winner?: string) => {
    if (winner === 'red') return 'RED';
    if (winner === 'blue') return 'BLU';
    return '-';
  };

  const getMidfightText = (midfight?: string | null) => {
    if (midfight === 'red') return 'RED';
    if (midfight === 'blue') return 'BLU';
    return '-';
  };

  // Get player performance sorted by kills
  const playerPerformance = round.playerPerformance
    ? Object.entries(round.playerPerformance)
        .map(([steamId, stats]) => ({
          steamId,
          name: playerNames[steamId] || 'Unknown',
          team: gameTotalPlayers?.find((p) => p.steamId === steamId)?.team || 'unknown',
          ...stats,
        }))
        .sort((a, b) => b.kills - a.kills)
    : [];

  return (
    <div className="mb-1">
      {/* Collapsed Header */}
      <div
        className="grid grid-cols-[60px_70px_90px_60px_60px_50px_50px_80px_80px_80px_40px] gap-1 px-2 py-2 cursor-pointer transition-colors bg-warmscale-8 hover:bg-warmscale-7 text-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-center font-semibold text-lightscale-0">{round.roundNumber}</div>
        <div className="text-center text-lightscale-1">{formatDuration(round.duration)}</div>
        <div className={`text-center font-bold text-lightscale-0 px-1 py-0.5 rounded ${getWinnerBg(round.winner)}`}>
          {round.score.blue} - {round.score.red}
        </div>
        <div className="text-center text-lightscale-1">{round.teamStats?.blue.kills || 0}</div>
        <div className="text-center text-lightscale-1">{round.teamStats?.red.kills || 0}</div>
        <div className="text-center text-lightscale-1">{round.teamStats?.blue.ubers || 0}</div>
        <div className="text-center text-lightscale-1">{round.teamStats?.red.ubers || 0}</div>
        <div className="text-center text-lightscale-1">{round.teamStats?.blue.damage || 0}</div>
        <div className="text-center text-lightscale-1">{round.teamStats?.red.damage || 0}</div>
        <div className={`text-center font-bold text-lightscale-0 px-1 py-0.5 rounded ${getMidfightBg(round.midfight)}`}>
          {getMidfightText(round.midfight)}
        </div>
        <div className="text-center text-lightscale-2 text-xs">{expanded ? '\u25BC' : '\u25B6'}</div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="bg-warmscale-8/50 border-l-4 border-orange-500 px-6 py-4">
          {/* Player Stats Table */}
          {playerPerformance.length > 0 && (
            <div className="mb-6">
              <table className="w-full text-sm">
                <thead className="border-b border-warmscale-6">
                  <tr className="text-lightscale-2">
                    <th className="text-left py-2 px-3">Team</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-center py-2 px-3">Kills</th>
                    <th className="text-center py-2 px-3">Deaths</th>
                    <th className="text-center py-2 px-3">Damage</th>
                    <th className="text-center py-2 px-3">Heals</th>
                  </tr>
                </thead>
                <tbody>
                  {playerPerformance.map((player, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        player.team === 'red'
                          ? 'bg-tf-red/30'
                          : player.team === 'blue'
                          ? 'bg-tf-blue/30'
                          : 'bg-warmscale-7/30'
                      } border-b border-warmscale-7/50`}
                    >
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                            player.team === 'red'
                              ? 'bg-tf-red text-white'
                              : player.team === 'blue'
                              ? 'bg-tf-blue text-white'
                              : 'bg-warmscale-6 text-lightscale-0'
                          }`}
                        >
                          {player.team.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-lightscale-0">{player.name}</td>
                      <td className="py-2 px-3 text-center text-lightscale-1 font-semibold">
                        {player.kills}
                      </td>
                      <td className="py-2 px-3 text-center text-lightscale-1">{player.deaths}</td>
                      <td className="py-2 px-3 text-center text-lightscale-1">{player.damage}</td>
                      <td className="py-2 px-3 text-center text-lightscale-1">{player.heals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Medic Statistics */}
          <MedicStats
            roundNumber={round.roundNumber}
            duration={round.duration}
            playerPerformance={round.playerPerformance}
            teamStats={round.teamStats}
            playerNames={playerNames}
            gameTotalPlayers={gameTotalPlayers}
          />

          {/* Events Section - Placeholder */}
          <div className="mt-4">
            <h4 className="text-lg font-bold text-lightscale-0 mb-3 border-b border-warmscale-6 pb-2">
              Events
            </h4>
            <div className="text-lightscale-2 text-sm italic">
              Event timeline coming soon...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RoundSection: React.FC<RoundSectionProps> = ({ rounds, playerNames, gameTotalPlayers }) => {
  if (!rounds || rounds.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[60px_70px_90px_60px_60px_50px_50px_80px_80px_80px_40px] gap-1 px-2 py-2 mb-1 bg-warmscale-7 rounded border-b-2 border-orange-500 text-xs">
        <div className="text-center font-bold text-lightscale-0">Round</div>
        <div className="text-center font-bold text-lightscale-0">Length</div>
        <div className="text-center font-bold text-lightscale-0">Score</div>
        <div className="text-center font-bold text-blue-300">BLU K</div>
        <div className="text-center font-bold text-red-300">RED K</div>
        <div className="text-center font-bold text-blue-300">BLU UC</div>
        <div className="text-center font-bold text-red-300">RED UC</div>
        <div className="text-center font-bold text-blue-300">BLU DA</div>
        <div className="text-center font-bold text-red-300">RED DA</div>
        <div className="text-center font-bold text-lightscale-0">Midfights</div>
        <div className="text-center font-bold text-lightscale-0"></div>
      </div>

      {/* Rounds */}
      {rounds.map((round) => (
        <RoundRow
          key={round.roundNumber}
          round={round}
          playerNames={playerNames}
          gameTotalPlayers={gameTotalPlayers}
        />
      ))}
    </div>
  );
};

export default RoundSection;
