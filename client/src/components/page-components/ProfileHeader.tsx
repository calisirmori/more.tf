import React from 'react';

interface ProfileHeaderProps {
  playerSteamInfo: {
    avatarfull: string;
    personaname: string;
  };
  rglInfo: {
    name?: string;
    currentTeams?: {
      highlander?: { id: string; tag: string } | null;
      sixes?: { id: string; tag: string } | null;
    };
  };
  playerId: string;
  inventoryCount?: number;
  isOwnProfile?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  playerSteamInfo,
  rglInfo,
  playerId,
  inventoryCount = 0,
  isOwnProfile = false,
}) => {
  return (
    <div className="w-full bg-warmscale-8 py-8">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16">
        <div className="w-full justify-between md:flex">
          <div className="flex items-center max-md:justify-center ">
            <img
              src={playerSteamInfo.avatarfull}
              alt=""
              className="rounded-md sm:h-24 max-sm:h-16"
            />
            <div className="ml-5 mb-3  font-cantarell ">
              <div className="text-lightscale-2 font-bold sm:text-5xl max-sm:text-3xl">
                {playerSteamInfo.personaname}{' '}
              </div>
              <div className="sm:mt-2">
                <div className="text-warmscale-1 font-semibold sm:text-lg flex">
                  #{rglInfo.name}
                  <a
                    href={`https://rgl.gg/Public/Team.aspx?t=${
                      rglInfo.currentTeams?.highlander?.id || ''
                    }&r=24`}
                    className="ml-1 hover:text-tf-orange"
                  >
                    {rglInfo.currentTeams?.highlander?.tag &&
                      '(' + rglInfo.currentTeams.highlander.tag + ')'}
                  </a>
                  <a
                    href={`https://rgl.gg/Public/Team.aspx?t=${
                      rglInfo.currentTeams?.sixes?.id || ''
                    }&r=24`}
                    className="hover:text-tf-orange"
                  >
                    {rglInfo.currentTeams?.sixes?.tag &&
                      '(' + rglInfo.currentTeams.sixes.tag + ')'}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            id="links"
            className="flex flex-wrap gap-2 items-center max-md:justify-center max-md:mt-3"
          >
            {inventoryCount > 0 && (
              <a
                className="relative rounded-sm flex items-center gap-1.5 cursor-pointer hover:bg-tf-orange hover:text-warmscale-9 transition-all duration-200 border-2 border-tf-orange bg-tf-orange/20 h-10 drop-shadow px-3 text-tf-orange font-bold font-cantarell shadow-lg shadow-tf-orange/20 whitespace-nowrap"
                href={`/inventory/${playerId}`}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path
                    fillRule="evenodd"
                    d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isOwnProfile ? 'My Inventory' : 'View Inventory'}
                </span>
                <span className="sm:hidden">Inventory</span>
                <span>({inventoryCount})</span>
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-tf-orange to-orange-600 text-warmscale-9 text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-md">
                  NEW
                </span>
              </a>
            )}
            <a
              target="_blank"
              href={`https://demos.tf/profiles/${playerId}`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-2 sm:px-3 text-lightscale-2 font-bold font-cantarell text-sm sm:text-base whitespace-nowrap"
              rel="noreferrer"
            >
              <span className="hidden sm:inline">demos.tf</span>
              <span className="sm:hidden">demos</span>
            </a>
            <a
              target="_blank"
              href={`https://steamcommunity.com/profiles/${playerId}`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-1.5 sm:p-2 text-lightscale-2 font-bold font-cantarell"
              rel="noreferrer"
            >
              <img src="\steam-icon.png" alt="" className="h-5 sm:h-7" />
            </a>
            <a
              target="_blank"
              href={`https://etf2l.org/search/${playerId}/`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-1.5 sm:p-2 text-lightscale-2 font-bold font-cantarell"
              rel="noreferrer"
            >
              <img src="\etf2l-icon.jpg" alt="" className="h-5 sm:h-7" />
            </a>
            <a
              target="_blank"
              href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${playerId}&r=24`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-1.5 sm:p-2 text-lightscale-2 font-bold font-cantarell"
              rel="noreferrer"
            >
              <img src="../../../site icons/rgl.png" alt="" className="h-5 sm:h-7" />
            </a>
            <a
              target="_blank"
              href={`https://ozfortress.com/users?utf8=✓&q=${playerId}&button=`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-1.5 sm:p-2 text-lightscale-2 font-bold font-cantarell"
              rel="noreferrer"
            >
              <img src="\oz-icon.svg" alt="" className="h-5 sm:h-7" />
            </a>
            <a
              target="_blank"
              href={`https://fbtf.tf/users?utf8=✓&q=${playerId}&button=`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-1.5 sm:p-2 text-lightscale-2 font-bold font-cantarell"
              rel="noreferrer"
            >
              <img src="\FB-icon.png" alt="" className="h-5 sm:h-7" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
