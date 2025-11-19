import React, { useEffect, useState } from "react";
import PlayerCard from "./PlayerCard";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

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
}

interface ProfileCardShowcaseProps {
  steamid: string;
}

const ProfileCardShowcase: React.FC<ProfileCardShowcaseProps> = ({ steamid }) => {
  const [favoritedCards, setFavoritedCards] = useState<ShowcaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<ShowcaseCard | null>(null);

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

      if (response && response.cards) {
        setFavoritedCards(response.cards);
      } else {
        setFavoritedCards([]);
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
    common: 'border-gray-600'
  };

  const rarityBackgroundColors: Record<string, string> = {
    legendary: 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20',
    epic: 'bg-gradient-to-br from-purple-900/20 to-pink-900/20',
    rare: 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20',
    uncommon: 'bg-gradient-to-br from-green-900/20 to-emerald-900/20',
    common: 'bg-warmscale-7'
  };

  const rarityColors: Record<string, string> = {
    legendary: 'from-yellow-400 to-orange-500',
    epic: 'from-purple-400 to-pink-500',
    rare: 'from-blue-400 to-cyan-500',
    uncommon: 'from-green-400 to-emerald-500',
    common: 'from-gray-400 to-gray-500'
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

        <div className="grid grid-cols-5 gap-3">
          {favoritedCards.map((card) => (
            <div
              key={card.id}
              className="group relative cursor-pointer"
              onClick={() => setSelectedCard(card)}
            >
              {/* Rarity border glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[card.rarity]} opacity-0 group-hover:opacity-30 rounded-lg blur-sm transition-opacity duration-200`}></div>

              {/* Card container with colored border and background */}
              <div className={`relative ${rarityBackgroundColors[card.rarity]} rounded-lg p-2 border-2 ${rarityBorderColors[card.rarity]} transition-all duration-200 transform group-hover:scale-105`}>
                <PlayerCard
                  cardUrl={card.cardUrl}
                  holo={card.holo}
                  enable3DTilt={false}
                  imageClassName="w-full h-auto rounded"
                />

                {/* Card info */}
                <div className="mt-2 text-xs">
                  <div className="text-warmscale-2 truncate text-center">{card.seasonname}</div>
                  <div className="flex justify-center items-center mt-1">
                    <span className="text-warmscale-1 font-bold">{card.overall}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Card Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-warmscale-7 rounded-lg p-6 max-w-4xl w-full border border-warmscale-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-6">
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
              <div>
                <h2 className="text-3xl font-bold text-warmscale-1 mb-4 font-cantarell">
                  {selectedCard.seasonname}
                </h2>
                <div className="space-y-3 font-cantarell">
                  <div>
                    <span className="text-warmscale-3">Class:</span>
                    <span className="text-warmscale-1 ml-2 capitalize">{selectedCard.class}</span>
                  </div>
                  <div>
                    <span className="text-warmscale-3">Division:</span>
                    <span className="text-warmscale-1 ml-2 capitalize">{selectedCard.division}</span>
                  </div>
                  <div>
                    <span className="text-warmscale-3">Rarity:</span>
                    <span className={`ml-2 font-bold bg-gradient-to-r ${rarityColors[selectedCard.rarity]} bg-clip-text text-transparent capitalize`}>
                      {selectedCard.rarity}
                    </span>
                  </div>
                  <div>
                    <span className="text-warmscale-3">Overall Rating:</span>
                    <span className="text-warmscale-1 ml-2 font-bold text-xl">{selectedCard.overall}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCard(null)}
                  className="mt-6 bg-warmscale-6 hover:bg-warmscale-5 text-warmscale-1 px-6 py-2 rounded border border-warmscale-4 transition-colors font-cantarell"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCardShowcase;
