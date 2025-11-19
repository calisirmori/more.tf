import Navbar from '../shared-components/Navbar';
import PageContainer from '../shared-components/PageContainer';
import Footer from '../shared-components/Footer';
import React, { useEffect, useState } from 'react';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { trackLeaderboardView, trackEvent } from '../../utils/analytics';

interface LeaderboardPlayer {
  id64: string;
  rglname: string;
  class: string;
  division: string;
  cbt: number;
  spt: number;
  srv: number;
  eff: number;
  imp: number;
  eva: number;
  avg_score: number;
}

interface LeaderboardData {
  players: LeaderboardPlayer[];
  seasonid: number;
  format: string;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [currentClassFilter, setCurrentClassFilter] = useState<string>('all');
  const [highlander, setIsHighlander] = useState<boolean>(false);
  const [seasonName, setSeasonName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    // Track leaderboard view
    trackLeaderboardView(highlander ? 'Highlander' : 'Sixes');
  }, [highlander]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const response: any = await fetch(
        `/api/leaderboard-stats/${highlander ? 'HL' : '6s'}`,
        FetchResultTypes.JSON
      );

      setLeaderboardData(response);

      // Fetch season name
      if (response.seasonid) {
        fetchSeasonName(response.seasonid);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSeasonName(seasonid: number) {
    try {
      const response: any = await fetch(
        `/api/display-card-seasons`,
        FetchResultTypes.JSON
      );

      // Find the season name based on seasonid
      const format = highlander ? 'HL' : '6s';
      const season = response.RGL?.[format === 'HL' ? 'HL' : '6s'];
      if (season && season.seasonid === seasonid) {
        setSeasonName(season.seasonname || `Season ${seasonid}`);
      } else {
        setSeasonName(`Season ${seasonid}`);
      }
    } catch (error) {
      console.error('Failed to fetch season name:', error);
      setSeasonName(`Season ${seasonid}`);
    }
  }

  function classFilter(value: string) {
    setCurrentClassFilter(value);
    trackEvent('leaderboard_class_filter', {
      class: value,
      format: highlander ? 'Highlander' : 'Sixes',
      event_category: 'engagement'
    });
  }

  function findColor(division: string) {
    switch (division.toLowerCase()) {
      case 'invite':
        return 'bg-yellow-600';
      case 'advanced':
        return 'bg-rose-800';
      case 'main':
        return 'bg-fuchsia-600';
      case 'intermediate':
        return 'bg-violet-600';
      case 'amateur':
        return 'bg-blue-600';
      case 'newcomer':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  }

  const filteredPlayers = leaderboardData?.players.filter(
    (player) => player.class === currentClassFilter || currentClassFilter === 'all'
  ) || [];

  return (
    <div className="bg-warmscale-7 min-h-screen" data-testid="leaderboard-container">
      <Navbar />
      <PageContainer className="font-ubuntu pt-16">
        <div className="flex w-full items-center justify-center px-4">
          <div className="w-full max-w-[1400px]">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-lightscale-3 mb-2">
                LEADERBOARD
              </h1>
              <p className="text-lg sm:text-xl font-extrabold text-lightscale-6 mb-4">
                {seasonName || 'Loading...'}
              </p>

              {/* Format Toggle */}
              <div className="flex justify-center items-center gap-4 text-base sm:text-lg font-cantarell font-semibold">
                <button
                  onClick={() => {
                    setIsHighlander(true);
                    trackEvent('leaderboard_format_change', {
                      format: 'Highlander',
                      event_category: 'engagement'
                    });
                  }}
                  className={`px-4 py-2 rounded transition-all ${
                    highlander
                      ? 'text-tf-orange bg-tf-orange/20'
                      : 'text-lightscale-8 opacity-50 hover:opacity-100'
                  }`}
                >
                  HIGHLANDER
                </button>
                <button
                  onClick={() => {
                    setIsHighlander(false);
                    trackEvent('leaderboard_format_change', {
                      format: 'Sixes',
                      event_category: 'engagement'
                    });
                  }}
                  className={`px-4 py-2 rounded transition-all ${
                    !highlander
                      ? 'text-tf-orange bg-tf-orange/20'
                      : 'text-lightscale-8 opacity-50 hover:opacity-100'
                  }`}
                >
                  SIXES
                </button>
              </div>
            </div>

            {/* Filters and Legend */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
              {/* Class Filter */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base font-cantarell font-semibold text-lightscale-4">
                <span className="whitespace-nowrap">FILTER:</span>
                <select
                  className="bg-warmscale-8 ring-tf-orange outline-none text-lightscale-2 text-sm rounded-md focus:ring-tf-orange focus:border-tf-orange py-1.5 px-3 min-w-[160px]"
                  onChange={(event) => classFilter(event.target.value)}
                  value={currentClassFilter}
                >
                  <option value="all">ALL CLASSES</option>
                  <option value="scout">SCOUT</option>
                  <option value="soldier">SOLDIER</option>
                  <option value="pyro">PYRO</option>
                  <option value="demoman">DEMOMAN</option>
                  <option value="heavyweapons">HEAVY</option>
                  <option value="engineer">ENGINEER</option>
                  <option value="medic">MEDIC</option>
                  <option value="sniper">SNIPER</option>
                  <option value="spy">SPY</option>
                </select>
              </div>

              {/* Division Legend */}
              <div className="flex flex-wrap justify-center lg:justify-end gap-3 text-xs sm:text-sm font-cantarell font-semibold text-lightscale-4">
                <div className="flex items-center gap-1.5">
                  <span>INV</span>
                  <div className="h-3 w-3 bg-yellow-500 border border-yellow-600 rounded-sm"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>ADV</span>
                  <div className="h-3 w-3 bg-rose-800 border border-rose-900 rounded-sm"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>MAIN</span>
                  <div className="h-3 w-3 bg-fuchsia-600 border border-fuchsia-700 rounded-sm"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>IM</span>
                  <div className="h-3 w-3 bg-violet-600 border border-violet-700 rounded-sm"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>AM</span>
                  <div className="h-3 w-3 bg-blue-800 border border-blue-900 rounded-sm"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>NC</span>
                  <div className="h-3 w-3 bg-gray-600 border border-gray-700 rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Table Container */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-warmscale-2 text-xl">Loading...</div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow-lg">
                <div className="max-h-[670px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left bg-warmscale-8 bg-opacity-40">
                    <thead className="text-xs sm:text-sm md:text-base text-tf-orange border-t-2 border-warmscale-8 border-opacity-40 sticky top-0 z-40 bg-warmscale-8">
                      <tr>
                        <th className="w-3 px-0"></th>
                        <th scope="col" className="py-2 sm:py-3 pl-3 pr-2 sm:px-3 text-center w-10 sm:w-12">
                          #
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 text-left min-w-[100px] sm:min-w-[150px]">
                          NAME
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                          <div>
                            <div className="whitespace-nowrap">CBT</div>
                            <div className="text-[10px] sm:text-xs text-tf-orange-dark hidden sm:block">KILLS</div>
                          </div>
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                          <div>
                            <div className="whitespace-nowrap">SPT</div>
                            <div className="text-[10px] sm:text-xs text-tf-orange-dark hidden sm:block">ASSISTS</div>
                          </div>
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                          <div>
                            <div className="whitespace-nowrap">SRV</div>
                            <div className="text-[10px] sm:text-xs text-tf-orange-dark hidden sm:block">DEATHS</div>
                          </div>
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                          <div>
                            <div className="whitespace-nowrap">EFF</div>
                            <div className="text-[10px] sm:text-xs text-tf-orange-dark hidden sm:block">K/D</div>
                          </div>
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                          <div>
                            <div className="whitespace-nowrap">DMG</div>
                            <div className="text-[10px] sm:text-xs text-tf-orange-dark hidden sm:block">DAMAGE</div>
                          </div>
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-3 text-center">
                          <div>
                            <div className="whitespace-nowrap">EVA</div>
                            <div className="text-[10px] sm:text-xs text-tf-orange-dark hidden sm:block">DTM</div>
                          </div>
                        </th>
                        <th scope="col" className="py-2 sm:py-3 px-2 sm:px-4 text-center bg-warmscale-8 sticky right-0 z-50">
                          <div className="whitespace-nowrap">OVERALL</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-robotomono text-sm sm:text-base text-lightscale-6 font-semibold">
                      {filteredPlayers.map((player, index) => {
                        const divisionColor = findColor(player.division);
                        const rowNumber = index + 1;

                        return (
                          <tr
                            key={player.id64}
                            className={`border-t-2 ${
                              rowNumber % 2 === 0 && 'bg-warmscale-8 bg-opacity-20'
                            } border-warmscale-8 border-opacity-40`}
                          >
                            <td className="relative w-3 px-0">
                              <div className="flex gap-0.5 absolute top-2 left-0.5">
                                <div className={`w-0.5 sm:w-1 h-7 sm:h-8 rounded-full ${divisionColor}`}></div>
                                <div className={`w-0.5 sm:w-1 h-7 sm:h-8 rounded-full ${divisionColor}`}></div>
                              </div>
                            </td>
                            <td className="text-center text-sm sm:text-base md:text-xl text-lightscale-2 py-2 pl-3 pr-2 sm:px-3 w-10 sm:w-12">
                              {rowNumber}
                            </td>
                            <td className="py-2 px-2 min-w-[100px] sm:min-w-[150px]">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <img
                                  src={`../../../class icons/Leaderboard_class_${player.class}.png`}
                                  alt={player.class}
                                  className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 border-2 rounded-md border-warmscale-8 bg-warmscale-8 border-opacity-30 bg-opacity-20 object-contain flex-shrink-0"
                                />
                                <a
                                  href={`/profile/${player.id64}`}
                                  className="font-extrabold text-xs sm:text-sm md:text-lg text-lightscale-2 font-robotomono truncate hover:text-tf-orange transition-colors"
                                  onClick={() => trackEvent('leaderboard_player_click', {
                                    player_id: player.id64,
                                    player_name: player.rglname,
                                    rank: rowNumber,
                                    class: player.class,
                                    division: player.division,
                                    format: highlander ? 'Highlander' : 'Sixes',
                                    event_category: 'engagement'
                                  })}
                                >
                                  {player.rglname}
                                </a>
                              </div>
                            </td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                              {player.cbt}
                            </td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                              {player.spt}
                            </td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                              {player.srv}
                            </td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                              {player.eff}
                            </td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                              {player.imp}
                            </td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50 px-2 sm:px-3 text-xs sm:text-sm md:text-base">
                              {player.eva}
                            </td>
                            <td className="text-center font-extrabold text-sm sm:text-lg md:text-xl text-lightscale-2 border-l border-warmscale-8 border-opacity-50 bg-warmscale-8 sticky right-0 px-2 sm:px-4 py-2">
                              {Math.round(player.avg_score)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
};

export default Leaderboard;
