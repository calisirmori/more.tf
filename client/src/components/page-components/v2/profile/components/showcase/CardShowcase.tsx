/**
 * CardShowcase Component
 * Displays a grid of player's favorited cards with modal details
 */

import { useEffect, useState } from 'react';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import PlayerCard from '../../../../../shared-components/PlayerCard';
import CardModal from './CardModal';
import { ShowcaseCard, RARITY_STYLES } from './types';

interface CardShowcaseProps {
  steamId: string;
}

export default function CardShowcase({ steamId }: CardShowcaseProps) {
  const [cards, setCards] = useState<ShowcaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<ShowcaseCard | null>(null);

  useEffect(() => {
    fetchCards();
  }, [steamId]);

  const fetchCards = async () => {
    try {
      setLoading(true);

      // Try to fetch favorited cards first
      const favoritesResponse: any = await fetch(
        `/api/card-inventory/favorites/${steamId}`,
        FetchResultTypes.JSON
      );

      if (
        favoritesResponse &&
        favoritesResponse.favorites &&
        favoritesResponse.favorites.length > 0
      ) {
        // Sort by favorite_slot to display in correct order
        const sortedFavorites = favoritesResponse.favorites.sort(
          (a: ShowcaseCard, b: ShowcaseCard) => a.favorite_slot - b.favorite_slot
        );
        setCards(sortedFavorites);
      } else {
        // If no favorited cards, fetch the 5 most recent cards
        const inventoryResponse: any = await fetch(
          `/api/card-inventory/inventory/${steamId}?limit=5&offset=0&sort=acquired_desc`,
          FetchResultTypes.JSON
        );

        if (inventoryResponse && inventoryResponse.cards) {
          setCards(inventoryResponse.cards);
        } else {
          setCards([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
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

  // Don't show the section if there are no cards
  if (cards.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-warmscale-8 rounded-md px-4 py-3 mb-4 drop-shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="text-lg text-lightscale-1 font-semibold font-cantarell">
            Card Showcase
          </div>
          <a
            href={`/inventory/${steamId}`}
            className="text-sm text-warmscale-3 hover:text-tf-orange font-cantarell transition-colors"
          >
            View All →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {cards.map((card) => {
            const rarity = card.rarity as keyof typeof RARITY_STYLES.borderColors;

            return (
              <div
                key={card.id}
                className="group relative cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                {/* Rarity Glow on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${RARITY_STYLES.gradientColors[rarity]} opacity-0 group-hover:opacity-30 rounded-lg blur-sm transition-opacity duration-200`}
                />

                {/* Card Container */}
                <div
                  className={`relative ${RARITY_STYLES.backgroundColors[rarity]} rounded-lg p-2 border-2 ${RARITY_STYLES.borderColors[rarity]} transition-all duration-200 transform group-hover:scale-105`}
                >
                  {/* Gift Indicator */}
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
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}
