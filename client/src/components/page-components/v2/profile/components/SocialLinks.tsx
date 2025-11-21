/**
 * SocialLinks Component
 * Displays social media and league links with consistent styling
 */

import { useState } from 'react';

interface SocialLink {
  href: string;
  icon: string;
  alt: string;
  bgColor: string;
  borderColor: string;
  hoverBgColor: string;
}

interface SocialLinksProps {
  playerId: string;
  youtubeUrl?: string;
  twitchUrl?: string;
  onCopyLink?: () => void;
}

export default function SocialLinks({ playerId, youtubeUrl, twitchUrl, onCopyLink }: SocialLinksProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://more.tf/profile/${playerId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopyLink?.();
  };

  const leagueLinks: SocialLink[] = [
    {
      href: `https://ozfortress.com/users?utf8=✓&q=${playerId}&button=`,
      icon: '/websiteIcons/ozf.png',
      alt: 'OZFortress',
      bgColor: 'bg-warmscale-7',
      borderColor: 'border-warmscale-8',
      hoverBgColor: 'hover:bg-warmscale-8',
    },
    {
      href: `https://rgl.gg/Public/PlayerProfile?p=${playerId}&r=24`,
      icon: '/websiteIcons/rgl.png',
      alt: 'RGL',
      bgColor: 'bg-warmscale-7',
      borderColor: 'border-warmscale-8',
      hoverBgColor: 'hover:bg-warmscale-8',
    },
    {
      href: `https://etf2l.org/search/${playerId}/`,
      icon: '/websiteIcons/etf2l-white.png',
      alt: 'ETF2L',
      bgColor: 'bg-[#233240]',
      borderColor: 'border-[#141f29]',
      hoverBgColor: 'hover:bg-[#141f29]',
    },
    {
      href: `https://steamcommunity.com/profiles/${playerId}`,
      icon: '/websiteIcons/steam-icon.svg',
      alt: 'Steam',
      bgColor: 'bg-[#133562]',
      borderColor: 'border-[#162942]',
      hoverBgColor: 'hover:bg-[#162942]',
    },
  ];

  const socialMediaLinks: SocialLink[] = [];

  if (youtubeUrl) {
    socialMediaLinks.push({
      href: youtubeUrl,
      icon: '/websiteIcons/youtube-icon.svg',
      alt: 'YouTube',
      bgColor: 'bg-[#ff0033]',
      borderColor: 'border-[#9c001f]',
      hoverBgColor: 'hover:bg-[#9c001f]',
    });
  }

  if (twitchUrl) {
    socialMediaLinks.push({
      href: twitchUrl,
      icon: '/websiteIcons/twitch-icon.svg',
      alt: 'Twitch',
      bgColor: 'bg-[#6441A4]',
      borderColor: 'border-[#513488]',
      hoverBgColor: 'hover:bg-[#513488]',
    });
  }

  const allLinks = [...leagueLinks, ...socialMediaLinks];

  const renderLink = (link: SocialLink) => (
    <a
      key={link.alt}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-9 h-9 border ${link.borderColor} ${link.bgColor} ${link.hoverBgColor} bg-opacity-80 rounded-sm duration-300 flex justify-center items-center cursor-pointer`}
    >
      <img src={link.icon} alt={link.alt} className="w-5 h-5 object-contain" />
    </a>
  );

  return (
    <>
      {/* Desktop - Inline Links */}
      <div className="gap-2 mr-3 -mb-7 hidden md:flex">
        {allLinks.map(renderLink)}

        {/* Share Button */}
        <div
          onClick={handleCopyLink}
          className="w-9 h-9 border border-lightscale-5/20 hover:border-lightscale-5/30 bg-lightscale-5/10 hover:bg-lightscale-5/20 duration-300 rounded-sm flex justify-center items-center cursor-pointer relative"
        >
          <img src="/websiteIcons/share-icon.svg" alt="Share" className="w-5 h-5" />
          {copied && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-lightscale-0 text-xs px-2 py-1 rounded">
              Copied!
            </div>
          )}
        </div>
      </div>

      {/* Mobile - Dropdown */}
      <div className="relative md:hidden">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-2 py-1.5 mb-1 text-sm bg-lightscale-5/10 text-lightscale-0 border border-lightscale-5/20 rounded-sm mr-3"
        >
          Links ▾
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-44 bg-warmscale-8 border border-lightscale-5/20 rounded-sm shadow-md p-2 z-50">
            <div className="flex flex-wrap gap-2 justify-center">
              {allLinks.map(renderLink)}

              {/* Share Button - Mobile */}
              <div
                onClick={handleCopyLink}
                className="w-9 h-9 border border-lightscale-5/20 hover:border-lightscale-5/30 bg-lightscale-5/10 hover:bg-lightscale-5/20 duration-300 rounded-sm flex justify-center items-center cursor-pointer relative"
              >
                <img src="/websiteIcons/share-icon.svg" alt="Share" className="w-5 h-5" />
                {copied && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-lightscale-0 text-xs px-2 py-1 rounded">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
