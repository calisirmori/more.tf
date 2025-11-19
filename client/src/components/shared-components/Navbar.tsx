import moretfWhiteLogo from '../../assets/moretf-white-medium.png';
import { useState, useEffect, useRef, useCallback } from 'react';
import SearchBox from './searchUsername';

interface ActiveSeasons {
  RGL: {
    HL?: { seasonid: number; seasonname: string };
    '6S'?: { seasonid: number; seasonname: string };
  };
  OZF: {
    HL?: { seasonid: number; seasonname: string };
    '6S'?: { seasonid: number; seasonname: string };
  };
}

interface UserProfile {
  userid: string;
  personaname: string;
  avatarfull: string;
}

// Define NavLink and MobileNavLink outside component to avoid recreation on every render
const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="text-lightscale-4 text-sm font-semibold hover:text-lightscale-0 transition-colors duration-200"
  >
    {children}
  </a>
);

const MobileNavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className="block text-lightscale-3 text-lg font-semibold hover:text-lightscale-0 transition-colors duration-200 py-3 text-center"
  >
    {children}
  </a>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileID, setProfileID] = useState<any>({});
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const isDevelopment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  const backendUrl = isDevelopment ? 'http://localhost:3000' : '';
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !target.closest('.mobile-menu-button')
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCookies = () => {
    const cookies = document.cookie
      .split(';')
      .reduce((cookieObject: any, cookieString) => {
        const [cookieName, cookieValue] = cookieString.trim().split('=');
        cookieObject[cookieName] = cookieValue;
        return cookieObject;
      }, {});
    setProfileID(cookies);
    return cookies;
  };

  const fetchUserProfileFallback = useCallback(async (userid: string) => {
    const cachedProfile = localStorage.getItem(`userProfile_${userid}`);
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        const cacheAge = Date.now() - parsed.timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) {
          setUserProfile(parsed.data);
          return;
        }
      } catch (e) {
        // Invalid cache
      }
    }

    try {
      const response = await fetch(`/api/steam-info?ids=${userid}`);
      const data = await response.json();
      if (data.response?.players?.[0]) {
        const profile = {
          userid,
          personaname: data.response.players[0].personaname,
          avatarfull: data.response.players[0].avatarfull,
        };
        setUserProfile(profile);
        localStorage.setItem(
          `userProfile_${userid}`,
          JSON.stringify({
            data: profile,
            timestamp: Date.now(),
          })
        );
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();

      if (data.authenticated && data.user) {
        setProfileID({ userid: data.user.id });
        setUserProfile({
          userid: data.user.id,
          personaname: data.user.displayName,
          avatarfull: data.user.avatar,
        });
      } else {
        const cookies = getCookies();
        if (cookies.userid) {
          setProfileID({ userid: cookies.userid });
          fetchUserProfileFallback(cookies.userid);
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      const cookies = getCookies();
      if (cookies.userid) {
        fetchUserProfileFallback(cookies.userid);
      }
    }
  }, [fetchUserProfileFallback]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (profileID.userid && !userProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCurrentUser();
    }
  }, [profileID, userProfile, fetchCurrentUser]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-warmscale-9 border-b border-warmscale-7/70 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center gap-2 md:gap-8">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden mobile-menu-button p-2 rounded-md hover:bg-warmscale-8 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5 stroke-lightscale-4 transition-all duration-200"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>

            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity duration-200"
            >
              <img
                className="h-8 object-contain"
                src="/new-logo-big.png"
                alt="more.tf"
              />
              <img
                className="h-7 object-contain hidden md:block"
                src={moretfWhiteLogo}
                alt="more.tf"
              />
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/season-summaries">SEASON SUMMARIES</NavLink>
              <NavLink href="/leaderboard">LEADERBOARD</NavLink>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search Box - Desktop */}
            <div className="hidden md:block">
              <SearchBox />
            </div>

            {/* Auth Section */}
            {profileID.userid === undefined ? (
              <a href={`${backendUrl}/api/auth/steam`}>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-warmscale-5 bg-warmscale-7/30 hover:bg-warmscale-6/50 hover:border-warmscale-4 transition-all duration-200">
                  <svg
                    height="16"
                    viewBox="0 0 24 24"
                    className="fill-lightscale-3"
                  >
                    <path d="M23.938 12c0 6.595-5.353 11.938-11.957 11.938A11.95 11.95 0 0 1 .476 15.254l4.583 1.892a3.382 3.382 0 0 0 6.696-.823l4.067-2.898a4.512 4.512 0 0 0 4.611-4.5 4.511 4.511 0 0 0-9.02 0v.057l-2.85 4.125a3.37 3.37 0 0 0-2.094.583L.062 11.042C.553 4.895 5.7.062 11.981.062 18.585.062 23.938 5.405 23.938 12zm-16.38 6.176l-1.469-.607a2.541 2.541 0 0 0 1.31 1.242 2.544 2.544 0 0 0 3.32-1.367 2.51 2.51 0 0 0 .005-1.94A2.53 2.53 0 0 0 7.48 14.1l1.516.625a1.862 1.862 0 0 1 1.006 2.44 1.87 1.87 0 0 1-2.445 1.012zm8.365-6.253c-1.656 0-3.004-1.348-3.004-2.999s1.348-2.999 3.004-2.999 3.004 1.348 3.004 3-1.343 2.998-3.004 2.998zm.005-.75a2.254 2.254 0 0 0 0-4.505 2.257 2.257 0 0 0-2.258 2.251 2.263 2.263 0 0 0 2.258 2.253z"></path>
                  </svg>
                  <span className="text-lightscale-2 font-semibold text-xs">
                    LOGIN
                  </span>
                </button>
              </a>
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-warmscale-8 transition-colors duration-200"
                >
                  {userProfile && (
                    <>
                      <img
                        src={userProfile.avatarfull}
                        alt={userProfile.personaname}
                        className="w-8 h-8 rounded-full border-2 border-warmscale-6"
                      />
                      <span className="text-lightscale-2 font-semibold text-sm hidden lg:block max-w-[150px] truncate">
                        {userProfile.personaname}
                      </span>
                      <svg
                        className={`w-4 h-4 fill-lightscale-3 transition-transform duration-200 hidden lg:block ${
                          isProfileMenuOpen ? 'rotate-180' : ''
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-warmscale-8 border border-warmscale-6 rounded-lg shadow-xl overflow-hidden">
                    <a
                      href={`/profile/${profileID.userid}`}
                      className="flex items-center gap-3 px-4 py-3 text-lightscale-2 hover:bg-warmscale-7 hover:text-lightscale-0 transition-colors duration-200 border-b border-warmscale-6"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      <span className="font-semibold text-sm">Profile</span>
                    </a>
                    <a
                      href={`${backendUrl}/api/logout`}
                      className="flex items-center gap-3 px-4 py-3 text-lightscale-2 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 010-2h1V4H5v10h1a1 1 0 010 2H4a1 1 0 01-1-1V3zm8.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L12.586 9H7a1 1 0 100 2h5.586l-1.293 1.293z" />
                      </svg>
                      <span className="font-semibold text-sm">Logout</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-14 left-0 right-0 bg-warmscale-9 border-b border-warmscale-7 shadow-lg transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? 'max-h-[400px] opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          <div className="mb-4">
            <SearchBox />
          </div>
          <MobileNavLink
            href="/season-summaries"
            onClick={() => setIsMenuOpen(false)}
          >
            SEASON SUMMARIES
          </MobileNavLink>
          <MobileNavLink
            href="/leaderboard"
            onClick={() => setIsMenuOpen(false)}
          >
            LEADERBOARD
          </MobileNavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
