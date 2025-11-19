import React, { useMemo } from 'react';

interface Match {
  logid: string;
  class: string;
  match_result: string;
  map: string;
  title: string;
  kills: number;
  deaths: number;
  assists: number;
  dpm: number;
  heals: number;
  dtm: number;
  format: string;
  match_length: number;
  date: number;
}

interface MatchHistoryProps {
  matchesPlayedInfo: Match[];
  playerId: string;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({
  matchesPlayedInfo,
  playerId,
}) => {
  // Use state with lazy initializer to avoid impure function during render
  const [currentTime] = React.useState(() => Math.round(Date.now() / 1000));

  return (
    <div className="w-full mt-4">
      <div
        id="matches"
        className="bg-warmscale-8 py-3 px-4 rounded-md font-cantarell drop-shadow-sm"
      >
        <div className="flex justify-between">
          <a
            href={`/profile/${playerId}/matches`}
            className="text-lg text-lightscale-1 font-semibold hover:underline"
          >
            Matches
          </a>
          <a
            href={`/profile/${playerId}/matches`}
            className="text-lg text-lightscale-1 font-semibold"
          >
            <svg
              strokeWidth={5.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className=" stroke-warmscale-2 cursor-pointer h-6  mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </a>
        </div>

        {/* Header Row */}
        <div className="flex items-center h-8 border-b border-warmscale-7 text-xs font-semibold text-lightscale-8 mt-3">
          <div className="w-12 flex-shrink-0"></div>
          <div className="w-8 border-l border-warmscale-7 flex-shrink-0"></div>
          <div className="flex-1 border-l border-warmscale-7 pl-3">Map</div>
          <div className="w-20 border-l border-warmscale-7 pl-3 max-lg:hidden">
            K/D/A
          </div>
          <div className="w-14 border-l border-warmscale-7 pl-3 max-lg:hidden">
            DPM
          </div>
          <div className="w-14 border-l border-warmscale-7 pl-3 max-lg:hidden">
            DTM
          </div>
          <div className="w-12 border-l border-warmscale-7 pl-3 max-lg:hidden">
            FMT
          </div>
          <div className="w-24 border-l border-warmscale-7 pl-3 pr-2 text-right">
            Time
          </div>
        </div>

        <div>
          {matchesPlayedInfo.map((match: any, index: any) => {
            while (index < 15) {
              return (
                <a
                  key={match.logid}
                  href={`/log/${match.logid}`}
                  className={`flex items-center h-11 hover:bg-warmscale-85 cursor-pointer ${
                    index !== 14 && 'border-b'
                  } border-warmscale-7`}
                >
                  <div className="w-12 flex justify-center flex-shrink-0">
                    <img
                      src={`../../../class icons/Leaderboard_class_${match.class}.png`}
                      alt=""
                      className="h-7"
                    />
                  </div>
                  <div className="w-8 border-l border-warmscale-7 flex justify-center flex-shrink-0">
                    <div
                      className={`${
                        match.match_result === 'W'
                          ? 'bg-green-600'
                          : match.match_result === 'L'
                            ? 'bg-red-600'
                            : 'bg-stone-500'
                      } w-5 h-5 flex items-center justify-center text-xs font-bold rounded-sm`}
                    >
                      {match.match_result}
                    </div>
                  </div>
                  <div className="flex-1 border-l border-warmscale-7 pl-3 text-lightscale-1 font-cantarell min-w-0 truncate">
                    <span className="font-medium">
                      {match.map.split('_')[1] !== undefined
                        ? match.map.split('_')[1].charAt(0).toUpperCase() +
                          match.map.split('_')[1].slice(1)
                        : match.map}
                    </span>
                    <span className="ml-1 text-sm text-lightscale-6">
                      (
                      {match.title.includes('serveme')
                        ? match.title.slice(23)
                        : match.title}
                      )
                    </span>
                  </div>
                  <div className="w-20 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs flex-shrink-0 max-lg:hidden">
                    {match.kills}/{match.deaths}/{match.assists}
                  </div>
                  {match.class !== 'medic' ? (
                    <div className="w-14 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs flex-shrink-0 max-lg:hidden">
                      {match.dpm}
                    </div>
                  ) : (
                    <div className="w-14 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs flex-shrink-0 max-lg:hidden">
                      {match.heals}
                    </div>
                  )}
                  <div className="w-14 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs flex-shrink-0 max-lg:hidden">
                    {match.dtm}
                  </div>
                  <div className="w-12 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 text-xs text-lightscale-5 flex-shrink-0 max-lg:hidden">
                    {match.format === 'other'
                      ? 'OTH'
                      : match.format.toUpperCase()}
                  </div>
                  <div className="w-24 border-l text-lightscale-1 font-cantarell border-warmscale-7 pl-3 pr-2 text-xs flex-shrink-0 text-right">
                    <div className="text-lightscale-4">
                      {Math.floor(match.match_length / 60)}:
                      {match.match_length % 60 < 10
                        ? '0' + (match.match_length % 60)
                        : match.match_length % 60}
                    </div>
                    <div className="whitespace-nowrap">
                      {currentTime - match.date > 86400
                        ? new Date(match.date * 1000).toLocaleDateString()
                        : Math.round((currentTime - match.date) / 3600) +
                          ' hrs ago'}
                    </div>
                  </div>
                </a>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchHistory;
