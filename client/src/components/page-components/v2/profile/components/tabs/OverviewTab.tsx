/**
 * OverviewTab Component
 * Displays player overview statistics and information
 */

import CardShowcase from '../showcase/CardShowcase';
import ProfileStats from '../stats/ProfileStats';
import MatchHistory from '../matches/MatchHistory';
import ClassStats from '../class-stats/ClassStats';
import OverviewSidebar from './OverviewSidebar';
import { Match } from '../matches/types';
import { ClassStat } from '../class-stats/types';
import { PlayerCardData } from '../player-card/types';
import { MapStat } from '../maps/types';
import { FormatStat } from '../formats/types';
import { ActivityData } from '../activity/types';
import { Peer, PeerSteamInfo } from '../peers/types';

interface OverviewTabProps {
  playerId: string;
  stats: {
    totalMatches: number;
    totalWins: number;
    totalLosses: number;
    totalTies: number;
  };
  matchHistory: Match[];
  classStats: ClassStat[];
  playerCardData: PlayerCardData[];
  mapStats: MapStat[];
  formatStats: FormatStat[];
  activity: ActivityData;
  teammates: Peer[];
  enemies: Peer[];
  peerSteamInfo: PeerSteamInfo;
}

export default function OverviewTab({
  playerId,
  stats,
  matchHistory,
  classStats,
  playerCardData,
  mapStats,
  formatStats,
  activity,
  teammates,
  enemies,
  peerSteamInfo,
}: OverviewTabProps) {
  return (
    <div className="w-full xl:flex xl:gap-4 bg-warmscale-8/40 rounded-b-lg p-4">
      {/* Left Column */}
      <div className="xl:w-2/3 w-full">
        <CardShowcase steamId={playerId} />
        <ProfileStats
          totalMatches={stats.totalMatches}
          totalWins={stats.totalWins}
          totalLosses={stats.totalLosses}
          totalTies={stats.totalTies}
        />
        <MatchHistory matches={matchHistory} playerId={playerId} />
        <ClassStats classStats={classStats} />
      </div>

      {/* Right Column (Sidebar) */}
      <div className="xl:w-1/3 w-full max-xl:mt-4">
        <OverviewSidebar
          playerId={playerId}
          playerCardData={playerCardData}
          mapStats={mapStats}
          formatStats={formatStats}
          totalMatches={stats.totalMatches}
          activity={activity}
          teammates={teammates}
          enemies={enemies}
          peerSteamInfo={peerSteamInfo}
        />
      </div>
    </div>
  );
}
