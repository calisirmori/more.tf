/**
 * LogV2 - Version 2 Log Display Component
 * Clean, organized component for displaying TF2 match logs
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../../../shared-components/Navbar';
import Footer from '../../../shared-components/Footer';
import PageContainer from '../../../shared-components/PageContainer';
import LoadingSpinner from '../../../shared-components/LoadingSpinner';
import LogHeader from './LogHeader';
import StatsTable from './StatsTable';
import TeamSummaryTable from './TeamSummaryTable';
import RoundSection from './RoundSection';
import MedicStatsSection from './MedicStatsSection';
import KillsByClassSection from './KillsByClassSection';
import TimeBar from './TimeBar';
import TimelineSection from './TimelineSection';
import PlayByPlaySection from './PlayByPlaySection';
import {
  calculateCumulativeStats,
  calculateCumulativeTeamStats,
  getElapsedTime,
  calculateCumulativeHealingTargets,
} from '../../../../utils/timeBasedStats';

type TabType = 'box-score' | 'charts' | 'play-by-play' | 'timeline';

interface TeamSummary {
  team: 'red' | 'blue';
  score: number;
  kills: number;
  deaths: number;
  damage: number;
  healing: number;
  ubers: number;
  drops: number;
  kd: number;
  dpm: number;
  hpm: number;
}

interface LogV2Data {
  summary?: {
    logId: number;
    map: string;
    title: string;
    startTimeFormatted: string;
    duration: number;
    winner?: string;
    finalScore: {
      red: number;
      blue: number;
    };
    teams?: {
      red: TeamSummary;
      blue: TeamSummary;
    };
  };
  gameTotals?: {
    players: any[];
  };
  [key: string]: any;
}

export default function LogV2() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [logData, setLogData] = useState<LogV2Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startIntervalIndex, setStartIntervalIndex] = useState<number>(0);
  const [endIntervalIndex, setEndIntervalIndex] = useState<number>(-1); // -1 means not initialized
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [playByPlayLoading, setPlayByPlayLoading] = useState(false);

  // Get active tab from URL, default to 'box-score'
  const activeTab = (searchParams.get('tab') as TabType) || 'box-score';

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    const fetchLogData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If accessing timeline directly, fetch full data (includes timeBasedData)
        // Otherwise, fetch full data as well for now
        const response = await fetch(`/api/v2/log/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch log: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setLogData(data);

        // Initialize to full game range when data loads
        if (data.timeBasedData?.totalIntervals) {
          setStartIntervalIndex(0);
          setEndIntervalIndex(data.timeBasedData.totalIntervals - 1);
        }
      } catch (err) {
        console.error('Error fetching log data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLogData();
    }
  }, [id]);

  // Fetch timeline data when timeline tab is clicked if not already loaded
  useEffect(() => {
    const fetchTimelineData = async () => {
      // Only fetch if timeline tab is active and timeBasedData is not yet loaded
      if (activeTab === 'timeline' && logData && !logData.timeBasedData) {
        try {
          setTimelineLoading(true);
          const response = await fetch(`/api/v2/log/${id}/timebased`);

          if (!response.ok) {
            throw new Error(`Failed to fetch timeline data: ${response.status} ${response.statusText}`);
          }

          const timeBasedData = await response.json();

          // Merge timeline data into existing log data
          setLogData((prevData) => ({
            ...prevData!,
            timeBasedData: timeBasedData.timeBasedData,
          }));

          // Initialize interval range
          if (timeBasedData.timeBasedData?.totalIntervals) {
            setStartIntervalIndex(0);
            setEndIntervalIndex(timeBasedData.timeBasedData.totalIntervals - 1);
          }
        } catch (err) {
          console.error('Error fetching timeline data:', err);
        } finally {
          setTimelineLoading(false);
        }
      }
    };

    if (activeTab === 'timeline' && !loading) {
      fetchTimelineData();
    }
  }, [activeTab, id, logData, loading]);

  // Fetch play-by-play data when play-by-play tab is clicked if not already loaded
  useEffect(() => {
    const fetchPlayByPlayData = async () => {
      // Only fetch if play-by-play tab is active and otherData is not yet loaded
      if (activeTab === 'play-by-play' && logData && !logData.otherData) {
        try {
          setPlayByPlayLoading(true);
          const response = await fetch(`/api/v2/log/${id}/otherdata`);

          if (!response.ok) {
            throw new Error(`Failed to fetch play-by-play data: ${response.status} ${response.statusText}`);
          }

          const otherDataResponse = await response.json();

          // Merge play-by-play data into existing log data
          setLogData((prevData) => ({
            ...prevData!,
            otherData: otherDataResponse.otherData,
          }));
        } catch (err) {
          console.error('Error fetching play-by-play data:', err);
        } finally {
          setPlayByPlayLoading(false);
        }
      }
    };

    if (activeTab === 'play-by-play' && !loading) {
      fetchPlayByPlayData();
    }
  }, [activeTab, id, logData, loading]);

  // Calculate time-filtered stats based on selected interval range
  const filteredStats = useMemo(() => {
    if (!logData?.timeBasedData || !logData?.gameTotals || endIntervalIndex < 0) {
      return null;
    }

    const cumulativePlayerStats = calculateCumulativeStats(
      logData.timeBasedData,
      startIntervalIndex,
      endIntervalIndex,
      logData.gameTotals.players
    );

    const cumulativeTeamStats = calculateCumulativeTeamStats(
      logData.timeBasedData,
      startIntervalIndex,
      endIntervalIndex
    );

    const elapsedTime = getElapsedTime(
      logData.timeBasedData,
      startIntervalIndex,
      endIntervalIndex
    );

    const healingTargets = calculateCumulativeHealingTargets(
      logData.timeBasedData,
      startIntervalIndex,
      endIntervalIndex
    );

    // Create filtered matchups object for medic heal targets
    const filteredMatchups = {
      ...logData.matchups,
      players: logData.gameTotals.players.map((p: any) => {
        const medicHealTargets = healingTargets.get(p.steamId);

        if (!medicHealTargets) {
          return { steamId: p.steamId, vsPlayers: {} };
        }

        // Convert healing targets to matchups format
        const vsPlayers: Record<string, any> = {};
        Object.entries(medicHealTargets).forEach(([targetSteamId, healing]) => {
          vsPlayers[targetSteamId] = { healing };
        });

        return {
          steamId: p.steamId,
          vsPlayers,
        };
      }),
    };

    return {
      players: cumulativePlayerStats,
      teams: cumulativeTeamStats,
      elapsedTime,
      matchups: filteredMatchups,
    };
  }, [logData, startIntervalIndex, endIntervalIndex]);

  const handleRangeChange = (newStart: number, newEnd: number) => {
    setStartIntervalIndex(newStart);
    setEndIntervalIndex(newEnd);
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <div className="min-h-screen pb-32">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading log data..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Data Display */}
          {!loading && !error && logData && logData.summary && logData.gameTotals && (
            <div className="">
              {/* Log Header */}
              <LogHeader
                logId={logData.summary.logId}
                map={logData.summary.map}
                title={logData.summary.title}
                startTime={logData.summary.startTimeFormatted}
                duration={logData.summary.duration}
                blueScore={logData.summary.finalScore.blue}
                redScore={logData.summary.finalScore.red}
                winner={logData.summary.winner as 'Red' | 'Blue' | undefined}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />

              {/* Box Score Content */}
              {activeTab === 'box-score' && filteredStats && (
                <>
                  {/* Stats Table */}
                  <StatsTable
                players={logData.gameTotals.players.map((p: any) => {
                  const filtered = filteredStats.players.find((fp) => fp.steamId === p.steamId);
                  const kills = filtered?.kills || 0;
                  const deaths = filtered?.deaths || 0;
                  const assists = filtered?.assists || 0;
                  const damage = filtered?.damage || 0;
                  const damageTaken = filtered?.damageTaken || 0;
                  const healing = filtered?.healing || 0;
                  const timeInMinutes = filteredStats.elapsedTime / 60;

                  return {
                    steamId: p.steamId,
                    name: p.name,
                    team: p.team === 'red' ? 'Red' : 'Blue',
                    primaryClass: p.primaryClass,
                    kills,
                    deaths,
                    assists,
                    damage,
                    damageTaken,
                    dpm: timeInMinutes > 0 ? damage / timeInMinutes : 0,
                    dtm: timeInMinutes > 0 ? damageTaken / timeInMinutes : 0,
                    kd: deaths > 0 ? kills / deaths : kills,
                    kda: deaths > 0 ? (kills + assists) / deaths : (kills + assists),
                    healing,
                    airshots: filtered?.airshots || 0,
                    headshots: filtered?.headshots || 0,
                    backstabs: filtered?.backstabs || 0,
                    capturePointsCapped: filtered?.capturePointsCapped || 0,
                  };
                })}
              />

              {/* Team Summary Table */}
              {logData.summary?.teams && (
                <div className="bg-warmscale-8/40 border-b border-warmscale-5 p-4">
                  <TeamSummaryTable
                    redTeam={{
                      team: 'Red',
                      kills: filteredStats.teams.red.kills,
                      damage: filteredStats.teams.red.damage,
                      charges: filteredStats.teams.red.ubers,
                      drops: filteredStats.teams.red.drops,
                      caps: 0, // TODO: Add caps data when available
                      midfights: logData.otherData?.rounds?.filter((r: any) => r.midfight === 'red').length || 0,
                    }}
                    blueTeam={{
                      team: 'Blue',
                      kills: filteredStats.teams.blue.kills,
                      damage: filteredStats.teams.blue.damage,
                      charges: filteredStats.teams.blue.ubers,
                      drops: filteredStats.teams.blue.drops,
                      caps: 0, // TODO: Add caps data when available
                      midfights: logData.otherData?.rounds?.filter((r: any) => r.midfight === 'blue').length || 0,
                    }}
                  />
                </div>
              )}

              {/* Rounds Section */}
              {logData.otherData?.rounds && logData.otherData.rounds.length > 0 && (
                <div className="bg-warmscale-8 border-b border-warmscale-5 p-4">
                  <RoundSection
                    rounds={logData.otherData.rounds}
                    playerNames={logData.playerNames || {}}
                    gameTotalPlayers={logData.gameTotals.players}
                  />
                </div>
              )}

              {/* Medic Statistics Section */}
              {logData.otherData?.medicStats && (
                <div className="bg-warmscale-8/40 border-b border-warmscale-5 p-4">
                  <MedicStatsSection
                    medicStats={logData.otherData.medicStats}
                    players={logData.gameTotals.players.map((p: any) => {
                      const filtered = filteredStats.players.find((fp) => fp.steamId === p.steamId);
                      return {
                        ...p,
                        healing: filtered?.healing || 0,
                        drops: filtered?.drops || 0,
                        totalPlaytimeSeconds: filteredStats.elapsedTime,
                      };
                    })}
                    playerNames={logData.playerNames || {}}
                    matchups={filteredStats.matchups}
                  />
                </div>
              )}

              {/* Kills By Class Section */}
              {logData.matchups && (
                <KillsByClassSection
                  matchups={logData.matchups}
                  players={logData.gameTotals.players}
                  playerNames={logData.playerNames || {}}
                />
              )}
                </>
              )}

              {/* Timeline Tab Content */}
              {activeTab === 'timeline' && (
                <>
                  {timelineLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" text="Loading timeline data..." />
                    </div>
                  ) : logData.timeBasedData ? (
                    <TimelineSection
                      timeBasedData={logData.timeBasedData}
                      players={logData.gameTotals.players}
                    />
                  ) : (
                    <div className="bg-warmscale-8/40 border-b border-warmscale-5 p-4">
                      <p className="text-lightscale-3">Timeline data is not available for this log.</p>
                    </div>
                  )}
                </>
              )}

              {/* Play-by-Play Tab Content */}
              {activeTab === 'play-by-play' && (
                <>
                  {playByPlayLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" text="Loading play-by-play data..." />
                    </div>
                  ) : logData.otherData ? (
                    <PlayByPlaySection
                      killstreaks={logData.otherData.killstreaks || []}
                      chat={logData.otherData.chat || []}
                      ubers={logData.otherData.ubers || []}
                      playerNames={logData.playerNames || {}}
                      matchDuration={logData.summary?.duration || 0}
                      matchStartTime={logData.otherData.rounds?.[0]?.startTime || 0}
                    />
                  ) : (
                    <div className="bg-warmscale-8/40 border-b border-warmscale-5 p-4">
                      <p className="text-lightscale-3">Play-by-play data is not available for this log.</p>
                    </div>
                  )}
                </>
              )}

              {/* Debug JSON (Collapsible) */}
              <details className="bg-warmscale-8 border border-warmscale-6 rounded-lg p-6">
                <summary className="text-xl font-bold text-lightscale-0 cursor-pointer hover:text-orange-400 transition-colors">
                  Raw JSON Response (Click to expand)
                </summary>
                <div className="mt-4">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(logData, null, 2)
                      )
                    }
                    className="mb-4 px-4 py-2 bg-warmscale-7 hover:bg-warmscale-6 border border-warmscale-5 rounded-md text-lightscale-2 text-sm font-semibold transition-colors duration-200"
                  >
                    Copy JSON
                  </button>
                  <pre className="bg-warmscale-9 border border-warmscale-7 rounded-lg p-4 overflow-x-auto custom-scrollbar">
                    <code className="text-lightscale-2 text-sm font-mono">
                      {JSON.stringify(logData, null, 2)}
                    </code>
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Time Bar - Only show on box-score tab when data is loaded and has time-based data */}
      {!loading && !error && activeTab === 'box-score' && logData?.timeBasedData && endIntervalIndex >= 0 && (
        <TimeBar
          matchStartTime={logData.timeBasedData.matchStartTime}
          matchEndTime={logData.timeBasedData.matchEndTime}
          matchDurationSeconds={logData.timeBasedData.matchDurationSeconds}
          startIntervalIndex={startIntervalIndex}
          endIntervalIndex={endIntervalIndex}
          totalIntervals={logData.timeBasedData.totalIntervals}
          rounds={logData.otherData?.rounds || []}
          onRangeChange={handleRangeChange}
        />
      )}

      <Footer />
    </>
  );
}
