/**
 * OverviewSidebar Component
 * Right column sidebar with player card, maps, formats, etc.
 */

import MapStats from '../maps/MapStats';
import FormatStats from '../formats/FormatStats';
import ActivityCalendar from '../activity/ActivityCalendar';
import Peers from '../peers/Peers';
import { PlayerCardData } from '../player-card/types';
import { MapStat } from '../maps/types';
import { FormatStat } from '../formats/types';
import { ActivityData } from '../activity/types';
import { Peer, PeerSteamInfo } from '../peers/types';

interface OverviewSidebarProps {
  playerId: string;
  playerCardData: PlayerCardData[];
  mapStats: MapStat[];
  formatStats: FormatStat[];
  totalMatches: number;
  activity: ActivityData;
  teammates: Peer[];
  enemies: Peer[];
  peerSteamInfo: PeerSteamInfo;
}

export default function OverviewSidebar({
  playerId,
  playerCardData,
  mapStats,
  formatStats,
  totalMatches,
  activity,
  teammates,
  enemies,
  peerSteamInfo,
}: OverviewSidebarProps) {
  return (
    <div className="w-full">
      <MapStats
        mapStats={mapStats}
        hasPlayerCard={false}
      />
      <FormatStats formatData={formatStats} totalMatches={totalMatches} />
      <ActivityCalendar activity={activity} playerId={playerId} />
      <Peers
        teammates={teammates}
        enemies={enemies}
        steamInfo={peerSteamInfo}
        playerId={playerId}
      />
    </div>
  );
}
