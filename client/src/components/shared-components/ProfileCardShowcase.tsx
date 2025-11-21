import React, { useEffect, useState } from 'react';
import PlayerCard from './PlayerCard';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { calculateOverall } from '../../utils/classWeights';

interface ShowcaseCard {
  id: number;
  cardUrl: string;
  holo: boolean;
  rarity: string;
  seasonname: string;
  division: string;
  class: string;
  overall: number;
  favorite_slot: number;
  gifted_from: string | null;
  gifter_name: string | null;
  gifter_avatar: string | null;
  // Individual stats
  cbt: number;
  eff: number;
  eva: number;
  dmg: number;
  spt: number;
  srv: number;
  rglname: string;
  format: string;
  league: string;
}

interface ProfileCardShowcaseProps {
  steamid: string;
}

const ProfileCardShowcase: React.FC<ProfileCardShowcaseProps> = ({
  steamid,
}) => {
  const [favoritedCards, setFavoritedCards] = useState<ShowcaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<ShowcaseCard | null>(null);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  useEffect(() => {
    fetchFavoritedCards();
  }, [steamid]);

  const fetchFavoritedCards = async () => {
    try {
      setLoading(true);
      const response: any = await fetch(
        `/api/card-inventory/favorites/${steamid}`,
        FetchResultTypes.JSON
      );

      if (response && response.favorites && response.favorites.length > 0) {
        // Sort by favorite_slot to display in correct order
        const sortedFavorites = response.favorites.sort(
          (a: ShowcaseCard, b: ShowcaseCard) =>
            a.favorite_slot - b.favorite_slot
        );
        setFavoritedCards(sortedFavorites);
      } else {
        // If no favorited cards, fetch the 5 most recent cards
        const inventoryResponse: any = await fetch(
          `/api/card-inventory/inventory/${steamid}?limit=5&offset=0&sort=acquired_desc`,
          FetchResultTypes.JSON
        );

        if (inventoryResponse && inventoryResponse.cards) {
          setFavoritedCards(inventoryResponse.cards);
        } else {
          setFavoritedCards([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch favorited cards:', error);
      setFavoritedCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Rarity colors for borders
  const rarityBorderColors: Record<string, string> = {
    legendary: 'border-yellow-500',
    epic: 'border-purple-500',
    rare: 'border-blue-500',
    uncommon: 'border-green-500',
    common: 'border-gray-600',
  };

  const rarityBackgroundColors: Record<string, string> = {
    legendary: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20',
    epic: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
    rare: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
    uncommon: 'bg-gradient-to-br from-green-900/20 to-emerald-900/20',
    common: 'bg-warmscale-7',
  };

  const rarityColors: Record<string, string> = {
    legendary: 'from-yellow-400 to-orange-500',
    epic: 'from-purple-400 to-pink-500',
    rare: 'from-blue-400 to-cyan-500',
    uncommon: 'from-green-400 to-emerald-500',
    common: 'from-gray-400 to-gray-500',
  };

  if (loading) {
    return (
      <div className="bg-warmscale-8 rounded-md px-4 py-3 mb-4">
        <div className="text-lg text-lightscale-1 mb-3 font-semibold font-cantarell">
          Card Showcase
        </div>
        <div className="text-center py-8 text-warmscale-3">Loading...</div>
      </div>
    );
  }

  if (favoritedCards.length === 0) {
    return null; // Don't show the section if there are no favorited cards
  }

  return (
    <>
      <div className="bg-warmscale-8 rounded-md px-4 py-3 mb-4 drop-shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="text-lg text-lightscale-1 font-semibold font-cantarell">
            Card Showcase
          </div>
          <a
            href={`/inventory/${steamid}`}
            className="text-sm text-warmscale-3 hover:text-tf-orange font-cantarell"
          >
            View All →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {favoritedCards.map((card) => (
            <div
              key={card.id}
              className="group relative cursor-pointer"
              onClick={() => setSelectedCard(card)}
            >
              {/* Rarity border glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${rarityColors[card.rarity]} opacity-0 group-hover:opacity-30 rounded-lg blur-sm transition-opacity duration-200`}
              ></div>

              {/* Card container with colored border and background */}
              <div
                className={`relative ${rarityBackgroundColors[card.rarity]} rounded-lg p-2 border-2 ${rarityBorderColors[card.rarity]} transition-all duration-200 transform group-hover:scale-105`}
              >
                {/* Gift indicator */}
                {card.gifted_from && (
                  <div
                    className="absolute top-1 left-1 z-10 p-1 rounded-full bg-purple-600/90 text-white"
                    title={`Gift from ${card.gifter_name || card.gifted_from}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </div>
                )}
                <PlayerCard
                  cardUrl={card.cardUrl}
                  holo={card.holo}
                  enable3DTilt={false}
                  imageClassName="w-full h-auto rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Card Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-warmscale-7 rounded-lg p-4 sm:p-6 max-w-4xl w-full border border-warmscale-5 my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - always visible */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-warmscale-3 hover:text-warmscale-1 transition-colors z-10"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {/* Card Image */}
              <div>
                <PlayerCard
                  cardUrl={selectedCard.cardUrl || undefined}
                  holo={selectedCard.holo}
                  enable3DTilt={true}
                  animated={true}
                  imageClassName="w-full h-auto rounded-lg"
                />
              </div>

              {/* Card Details */}
              <div className="md:pr-8 max-w-md mx-auto md:max-w-none md:mx-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-warmscale-1 mb-2 sm:mb-3">
                  {selectedCard.rglname}
                </h2>

                {/* Compact info grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm md:text-base mb-3">
                  <div>
                    <span className="text-warmscale-4">Season:</span>{' '}
                    <span className="text-warmscale-1 font-medium">
                      {selectedCard.seasonname}
                    </span>
                  </div>
                  <div>
                    <span className="text-warmscale-4">League:</span>{' '}
                    <span className="text-warmscale-1 font-medium">
                      {selectedCard.league}
                    </span>
                  </div>
                  <div>
                    <span className="text-warmscale-4">Format:</span>{' '}
                    <span className="text-warmscale-1 font-medium">
                      {selectedCard.format}
                    </span>
                  </div>
                  <div>
                    <span className="text-warmscale-4">Class:</span>{' '}
                    <span className="text-warmscale-1 font-medium capitalize">
                      {selectedCard.class}
                    </span>
                  </div>
                  <div>
                    <span className="text-warmscale-4">Division:</span>{' '}
                    <span className="text-warmscale-1 font-medium capitalize">
                      {selectedCard.division}
                    </span>
                  </div>
                  <div>
                    <span className="text-warmscale-4">Rarity:</span>{' '}
                    <span
                      className={`font-bold bg-gradient-to-r ${rarityColors[selectedCard.rarity]} bg-clip-text text-transparent capitalize`}
                    >
                      {selectedCard.rarity}
                    </span>
                  </div>
                </div>

                {/* Overall rating - more prominent */}
                <div className="mb-3 p-2 sm:p-3 bg-warmscale-8 rounded border border-warmscale-6 text-center relative">
                  <div className="flex items-end justify-center gap-2 text-warmscale-4 text-xs sm:text-sm">
                    <span>Overall Rating</span>
                    <div className="relative">
                      <button
                        onMouseEnter={() => setShowFormulaTooltip(true)}
                        onMouseLeave={() => setShowFormulaTooltip(false)}
                        onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                        className="text-warmscale-4 hover:text-warmscale-2 transition-colors"
                        aria-label="Rating formula info"
                      >
                        <svg
                          className="w-4 h-4 -mb-0.5 -ml-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {showFormulaTooltip && (
                        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm p-3 bg-warmscale-9 border border-warmscale-6 rounded shadow-lg text-left">
                          <div className="text-warmscale-1 font-bold text-xs mb-2">
                            Overall Rating
                          </div>
                          <div className="text-warmscale-3 text-xs leading-relaxed mb-3">
                            The overall rating is calculated using all six stats, with each stat weighted differently based on its impact on competitive performance.
                          </div>
                          <div className="text-warmscale-3 text-xs leading-relaxed">
                            <div className="font-semibold text-warmscale-2 mb-1">Stats:</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium text-warmscale-2">CBT</span> = {selectedCard.class !== 'medic' ? 'Kills' : 'Assists'}
                              </div>
                              <div>
                                <span className="font-medium text-warmscale-2">EFF</span> = {selectedCard.class !== 'medic' ? 'K/D' : 'A/D'}
                              </div>
                              <div>
                                <span className="font-medium text-warmscale-2">SPT</span> = {selectedCard.class !== 'medic' ? 'Assists' : 'Ubers'}
                              </div>
                              <div>
                                <span className="font-medium text-warmscale-2">{selectedCard.class !== 'medic' ? 'DMG' : 'HLG'}</span> = {selectedCard.class !== 'medic' ? 'Damage' : 'Healing'}
                              </div>
                              <div>
                                <span className="font-medium text-warmscale-2">SRV</span> = Deaths
                              </div>
                              <div>
                                <span className="font-medium text-warmscale-2">EVA</span> = DTM
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-warmscale-1 text-3xl sm:text-4xl font-bold">
                    {calculateOverall({
                      class: selectedCard.class,
                      cbt: selectedCard.cbt,
                      eff: selectedCard.eff,
                      eva: selectedCard.eva,
                      imp: selectedCard.dmg,
                      spt: selectedCard.spt,
                      srv: selectedCard.srv
                    }).toFixed(1)}
                  </div>
                </div>

                <div>
                  {/* Gift indicator */}
                  {selectedCard.gifted_from && (
                    <div className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-600/30 rounded">
                      <svg
                        className="w-5 h-5 text-purple-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      {selectedCard.gifter_avatar && (
                        <img
                          src={`https://avatars.cloudflare.steamstatic.com/${selectedCard.gifter_avatar}_medium.jpg`}
                          alt=""
                          className="w-8 h-8 rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-purple-300 text-sm">
                          Gift from{' '}
                          <a
                            href={`/profile/${selectedCard.gifted_from}`}
                            className="text-purple-400 hover:text-purple-300 font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {selectedCard.gifter_name ||
                              selectedCard.gifted_from}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stats Grid - hidden on mobile since visible on card */}
                  <div className="hidden md:grid grid-cols-2 gap-2 mt-4 p-4 bg-warmscale-8 rounded border border-warmscale-6 text-sm">
                    <div>
                      <span className="text-warmscale-3">CBT:</span>{' '}
                      <span className="text-warmscale-1 font-bold">
                        {selectedCard.cbt}
                      </span>
                    </div>
                    <div>
                      <span className="text-warmscale-3">EFF:</span>{' '}
                      <span className="text-warmscale-1 font-bold">
                        {selectedCard.eff}
                      </span>
                    </div>
                    <div>
                      <span className="text-warmscale-3">SPT:</span>{' '}
                      <span className="text-warmscale-1 font-bold">
                        {selectedCard.spt}
                      </span>
                    </div>
                    <div>
                      <span className="text-warmscale-3">{selectedCard.class !== 'medic' ? 'DMG' : 'HLG'}:</span>{' '}
                      <span className="text-warmscale-1 font-bold">
                        {selectedCard.dmg}
                      </span>
                    </div>
                    <div>
                      <span className="text-warmscale-3">SRV:</span>{' '}
                      <span className="text-warmscale-1 font-bold">
                        {selectedCard.srv}
                      </span>
                    </div>
                    <div>
                      <span className="text-warmscale-3">EVA:</span>{' '}
                      <span className="text-warmscale-1 font-bold">
                        {selectedCard.eva}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCardShowcase;
