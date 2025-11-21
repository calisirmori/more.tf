/**
 * ProfileHeader Component
 * Main header component that displays player information with background image,
 * avatar, badges, social links, and tab navigation
 */

import ProfileAvatar from './ProfileAvatar';
import ProfileBadges from './ProfileBadges';
import SocialLinks from './SocialLinks';
import ProfileTabs from './ProfileTabs';
import { ProfileTab, SteamProfile } from '../types';

interface ProfileHeaderProps {
  profile: {
    steamName: string;
    avatarUrl: string;
    flag?: string;
    badge1?: string;
    badge2?: string;
    badge3?: string;
    youtubeUrl?: string;
    twitchUrl?: string;
  };
  playerId: string;
  currentTab: ProfileTab;
  backgroundImageUrl?: string;
}

export default function ProfileHeader({
  profile,
  playerId,
  currentTab,
  backgroundImageUrl = "https://images.steamusercontent.com/ugc/22838588343528740/2DC75BCCF3383C46478F6645741FAF8B6D1C58B4/",
}: ProfileHeaderProps) {

  return (
    <div
      className="w-full relative rounded-t-md max-md:h-40 md:h-80 bg-cover bg-center bg-no-repeat z-10"
      style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
    >
      {/* Overlay for darkening background */}
      <div className="absolute inset-0 rounded-t-md bg-black bg-opacity-50 -z-10" />

      {/* Main Content */}
      <div className="w-full h-full flex items-end">
        <div className="w-full flex-col">
          {/* Player Name, Badges, and Social Links */}
          <div className="max-md:ml-28 md:ml-48 md:mb-3 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="max-md:text-2xl md:text-6xl font-medium text-lightscale-2">
                {profile.steamName}
              </h1>
              <ProfileBadges badges={[profile.badge1, profile.badge2, profile.badge3]} />
            </div>

            <SocialLinks
              playerId={playerId}
              youtubeUrl={profile.youtubeUrl}
              twitchUrl={profile.twitchUrl}
            />
          </div>

          {/* Tab Navigation */}
          <ProfileTabs playerId={playerId} currentTab={currentTab} />

          {/* Avatar with Flag */}
          <div className="absolute max-md:left-8 md:left-12 bottom-7">
            <ProfileAvatar
              avatarUrl={profile.avatarUrl}
              countryCode={profile.flag}
              alt={profile.steamName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
