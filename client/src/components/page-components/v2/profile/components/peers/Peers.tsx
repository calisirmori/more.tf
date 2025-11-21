/**
 * Peers Component
 * Displays top teammates and enemies with toggle
 */

import { useState } from 'react';
import { Peer, PeerSteamInfo } from './types';

interface PeersProps {
  teammates: Peer[];
  enemies: Peer[];
  steamInfo: PeerSteamInfo;
  playerId: string;
}

export default function Peers({
  teammates,
  enemies,
  steamInfo,
  playerId,
}: PeersProps) {
  const [showTeammates, setShowTeammates] = useState(true);

  const displayedList = showTeammates ? teammates : enemies;
  const maxCount = displayedList[0]?.count || 1;

  if (teammates.length === 0 && enemies.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-warmscale-8 py-2 px-3.5 rounded-md mb-4 font-cantarell">
      {/* Header with toggle */}
      <div className="flex justify-between items-center gap-4 mb-2">
        <div
          onClick={() => setShowTeammates(true)}
          className={`text-lg text-lightscale-1 font-semibold border-b-2 w-full text-center py-1 rounded-sm hover:cursor-pointer hover:opacity-80 duration-200 ${
            showTeammates
              ? 'border-tf-orange'
              : 'bg-warmscale-85 bg-opacity-50 border-warmscale-7 text-warmscale-4'
          }`}
        >
          Teammates
        </div>
        <div
          onClick={() => setShowTeammates(false)}
          className={`text-lg text-lightscale-1 font-semibold border-b-2 w-full text-center py-1 rounded-sm hover:cursor-pointer hover:opacity-80 duration-200 ${
            !showTeammates
              ? 'border-tf-orange'
              : 'bg-warmscale-85 bg-opacity-50 border-warmscale-7 text-warmscale-4'
          }`}
        >
          Enemies
        </div>
        <a href={`/peers/${playerId}`} className="text-lg text-lightscale-1 font-semibold">
          <svg
            strokeWidth={5.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="stroke-warmscale-2 cursor-pointer h-6 mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </a>
      </div>

      {/* Peer List */}
      <div>
        {displayedList.slice(0, 5).map((peer, index) => {
          if (!steamInfo[peer.peer_id64]) return null;

          const wins = parseInt(peer.w.toString());
          const winRate = Math.round((wins / peer.count) * 100);
          const isWinning = wins > parseInt(peer.l.toString());

          return (
            <div
              key={peer.peer_id64}
              className={`flex py-2.5 items-center ${
                index < 4 ? 'border-b' : ''
              } border-warmscale-7 ml-1 mr-1`}
            >
              {/* Avatar */}
              <img
                src={steamInfo[peer.peer_id64].avatarfull}
                className="h-8 rounded-md"
                alt={steamInfo[peer.peer_id64].personaname}
              />

              {/* Name */}
              <a
                href={`/profile/${peer.peer_id64}`}
                className="flex-2 ml-2 text-lightscale-2 font-semibold text-lg w-32 truncate"
              >
                {steamInfo[peer.peer_id64].personaname}
              </a>

              {/* Win Rate Bar */}
              <div className="flex flex-1 items-center ml-4">
                <div className="text-lightscale-1 font-semibold text-right text-xs w-8">
                  {winRate}%
                </div>
                <div className="w-full h-2 ml-1.5 rounded-sm bg-warmscale-5">
                  <div
                    className={`h-full ${
                      isWinning ? 'bg-green-500' : 'bg-red-500'
                    } rounded-sm`}
                    style={{ width: `${winRate}%` }}
                  />
                </div>
              </div>

              {/* Match Count Bar */}
              <div className="flex flex-1 items-center ml-5">
                <div className="text-lightscale-1 font-semibold text-xs min-w-[20px] text-end">
                  {peer.count}
                </div>
                <div className="w-full h-2 ml-1.5 rounded-sm bg-warmscale-5">
                  <div
                    className="h-full bg-tf-orange rounded-sm"
                    style={{
                      width: `${Math.round((peer.count / maxCount) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
