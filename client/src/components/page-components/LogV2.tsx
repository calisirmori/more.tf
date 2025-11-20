import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../shared-components/Navbar';
import Footer from '../shared-components/Footer';
import PageContainer from '../shared-components/PageContainer';
import LogHeader from './log-v2/LogHeader';
import StatsTable from './log-v2/StatsTable';
import TeamSummaryTable from './log-v2/TeamSummaryTable';
import RoundSection from './log-v2/RoundSection';

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

const LogV2 = () => {
  const { id } = useParams<{ id: string }>();
  const [logData, setLogData] = useState<LogV2Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/v2/log/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch log: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setLogData(data);
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

  return (
    <>
      <Navbar />
      <PageContainer>
        <div className="min-h-screen">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-lightscale-2">Loading log data...</p>
              </div>
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
              />

              {/* Stats Table */}
              <StatsTable
                players={logData.gameTotals.players.map((p: any) => ({
                  steamId: p.steamId,
                  name: p.name,
                  team: p.team === 'red' ? 'Red' : 'Blue',
                  primaryClass: p.primaryClass,
                  kills: p.kills,
                  deaths: p.deaths,
                  assists: p.assists,
                  damage: p.damage,
                  damageTaken: p.damageTaken,
                  dpm: p.damage / (logData.summary!.duration / 60),
                  dtm: p.damageTaken / (logData.summary!.duration / 60),
                  kd: p.deaths > 0 ? p.kills / p.deaths : p.kills,
                  kda: p.deaths > 0 ? (p.kills + p.assists) / p.deaths : (p.kills + p.assists),
                  healing: p.healing || 0,
                  airshots: p.airshots || 0,
                  headshots: p.headshots || 0,
                  backstabs: p.backstabs || 0,
                  capturePointsCapped: p.capturePointsCapped || 0,
                }))}
              />

              {/* Team Summary Table */}
              {logData.summary?.teams && (
                <div className="w-full md:w-auto md:mx-auto bg-warmscale-8/30 border-y border-warmscale-5 p-4">
                  <TeamSummaryTable
                    redTeam={{
                      team: 'Red',
                      kills: logData.summary.teams.red.kills,
                      damage: logData.summary.teams.red.damage,
                      charges: logData.summary.teams.red.ubers,
                      drops: logData.summary.teams.red.drops,
                      caps: 0, // TODO: Add caps data when available
                      midfights: 0, // TODO: Add midfights data when available
                    }}
                    blueTeam={{
                      team: 'Blue',
                      kills: logData.summary.teams.blue.kills,
                      damage: logData.summary.teams.blue.damage,
                      charges: logData.summary.teams.blue.ubers,
                      drops: logData.summary.teams.blue.drops,
                      caps: 0, // TODO: Add caps data when available
                      midfights: 0, // TODO: Add midfights data when available
                    }}
                  />
                </div>
              )}

              {/* Rounds Section */}
              {logData.otherData?.rounds && logData.otherData.rounds.length > 0 && (
                <div className="w-fit mx-auto">
                  <RoundSection
                    rounds={logData.otherData.rounds}
                    playerNames={logData.playerNames || {}}
                    gameTotalPlayers={logData.gameTotals.players}
                  />
                </div>
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
      <Footer />
    </>
  );
};

export default LogV2;
