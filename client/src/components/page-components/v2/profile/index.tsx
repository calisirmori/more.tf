/**
 * ProfileV2 - Main Profile Page Component
 * Clean, well-organized profile page with proper data fetching and state management
 */

import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../../../shared-components/Navbar';
import Footer from '../../../shared-components/Footer';
import PageContainer from '../../../shared-components/PageContainer';
import ProfileHeader from './components/ProfileHeader';
import OverviewTab from './components/tabs/OverviewTab';
import MatchesTab from './components/tabs/MatchesTab';
import PeersTab from './components/tabs/PeersTab';
import ActivityTab from './components/tabs/ActivityTab';
import GalleryTab from './components/tabs/GalleryTab';
import { ProfileTab } from './types';
import { processActivityData } from './components/activity/utils';
import { ActivityData } from './components/activity/types';

interface ProfileData {
  playerSteamInfo: {
    steamid: string;
    personaname: string;
    avatarfull: string;
    avatar: string;
    loccountrycode?: string;
  };
  rglInfo?: {
    name?: string;
  };
  perFormatStats?: any[];
  matchHistory?: any[];
  perClassStats?: any[];
  playerCard?: any[];
  perMapStats?: any[];
  activity?: any[];
  peers?: any[];
  enemies?: any[];
  teamMatesSteamInfo?: any;
}

export default function ProfileV2() {
  const { playerId } = useParams<{ playerId: string }>();
  const location = useLocation();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine current tab from URL path
  const pathParts = location.pathname.split('/');
  const currentTab = (pathParts[pathParts.length - 1] || 'overview') as ProfileTab;

  useEffect(() => {
    if (!playerId) {
      setError('Invalid player ID');
      setLoading(false);
      return;
    }

    fetchProfileData();
  }, [playerId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/profile-data/${playerId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Profile data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total stats from format data
  const calculateTotalStats = () => {
    if (!profileData?.perFormatStats) {
      return { totalMatches: 0, totalWins: 0, totalLosses: 0, totalTies: 0 };
    }

    let totalWins = 0;
    let totalLosses = 0;
    let totalTies = 0;

    profileData.perFormatStats.forEach((format) => {
      totalWins += format.format_wins || 0;
      totalLosses += format.format_losses || 0;
      totalTies += format.format_ties || 0;
    });

    const totalMatches = totalWins + totalLosses + totalTies;

    return { totalMatches, totalWins, totalLosses, totalTies };
  };

  const stats = calculateTotalStats();

  // Process activity data
  const processedActivity: ActivityData = profileData?.activity
    ? processActivityData(profileData.activity)
    : {};

  const renderTabContent = () => {
    if (!playerId) return null;

    switch (currentTab) {
      case 'overview':
        return (
          <OverviewTab
            playerId={playerId}
            stats={stats}
            matchHistory={profileData?.matchHistory || []}
            classStats={profileData?.perClassStats || []}
            playerCardData={profileData?.playerCard || []}
            mapStats={profileData?.perMapStats || []}
            formatStats={profileData?.perFormatStats || []}
            activity={processedActivity}
            teammates={profileData?.peers || []}
            enemies={profileData?.enemies || []}
            peerSteamInfo={profileData?.teamMatesSteamInfo || {}}
          />
        );
      case 'matches':
        return <MatchesTab />;
      case 'peers':
        return <PeersTab />;
      case 'activity':
        return <ActivityTab />;
      case 'gallery':
        return <GalleryTab />;
      default:
        return (
          <OverviewTab
            playerId={playerId}
            stats={stats}
            matchHistory={profileData?.matchHistory || []}
            classStats={profileData?.perClassStats || []}
            playerCardData={profileData?.playerCard || []}
            mapStats={profileData?.perMapStats || []}
            formatStats={profileData?.perFormatStats || []}
            activity={processedActivity}
            teammates={profileData?.peers || []}
            enemies={profileData?.enemies || []}
            peerSteamInfo={profileData?.teamMatesSteamInfo || {}}
          />
        );
    }
  };

  if (!playerId) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-lightscale-2 text-xl">Invalid profile link</p>
          </div>
        </PageContainer>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-lightscale-2 text-xl">Loading profile...</p>
          </div>
        </PageContainer>
        <Footer />
      </>
    );
  }

  if (error || !profileData) {
    return (
      <>
        <Navbar />
        <PageContainer>
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-500 text-xl">{error || 'Failed to load profile'}</p>
          </div>
        </PageContainer>
        <Footer />
      </>
    );
  }

  // Transform API data to component format
  const profile = {
    steamName: profileData.playerSteamInfo.personaname,
    avatarUrl: profileData.playerSteamInfo.avatarfull,
    flag: profileData.playerSteamInfo.loccountrycode,
    // These would come from your database when implemented
    badge1: undefined,
    badge2: undefined,
    badge3: undefined,
    youtubeUrl: undefined,
    twitchUrl: undefined,
  };

  return (
    <>
      <Navbar />
      <PageContainer>
        <div className="w-full">
          <ProfileHeader
            profile={profile}
            playerId={playerId}
            currentTab={currentTab}
          />

          <div className="">
            {renderTabContent()}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
}
