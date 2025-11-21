/**
 * ProfileTabs Component
 * Tab navigation for profile sections with mobile dropdown support
 */

import { useNavigate } from 'react-router-dom';
import { ProfileTab, PROFILE_TABS } from '../types';

interface ProfileTabsProps {
  playerId: string;
  currentTab: ProfileTab;
}

export default function ProfileTabs({ playerId, currentTab }: ProfileTabsProps) {
  const navigate = useNavigate();

  const handleTabClick = (tab: ProfileTab) => {
    if (tab !== currentTab) {
      navigate(`/v2/profile/${playerId}/${tab}`, { replace: true });
    }
  };

  return (
    <div className="w-full  h-16 bg-warmscale-85 border-b-2 border-warmscale-6">
      {/* Desktop Tabs */}
      <div className="hidden sm:grid sm:ml-28 md:ml-48 h-16 grid-cols-5 text-lightscale-5 font-medium text-lg">
        {PROFILE_TABS.map((tab) => (
          <div
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`capitalize flex justify-center items-center border-b-2 h-16 px-4 transition-colors duration-200
              ${
                currentTab === tab
                  ? 'border-tf-orange cursor-default font-bold text-lightscale-2'
                  : 'border-transparent hover:border-tf-orange cursor-pointer'
              }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="sm:hidden ml-28 mb-3 px-2 flex justify-center items-center h-full">
        <select
          value={currentTab}
          onChange={(e) => handleTabClick(e.target.value as ProfileTab)}
          className="bg-warmscale-8 text-lightscale-2 px-4 py-2 rounded-sm border border-lightscale-5/20"
        >
          {PROFILE_TABS.map((tab) => (
            <option key={tab} value={tab} className="text-xs">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
