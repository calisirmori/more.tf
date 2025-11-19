import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../shared-components/Navbar';
import Footer from '../shared-components/Footer';
import PlayerCard from '../shared-components/PlayerCard';

interface PlayerCardData {
  seasonid: number;
  seasonName: string;
  league: string;
  format: string;
  displayName: string;
  cardUrl: string;
  thumbnailUrl: string;
  holo?: boolean;
  rarity?: string;
  division?: string;
  class?: string;
}

interface CardCollectionData {
  steamid: string;
  totalCards: number;
  cards: PlayerCardData[];
}

const CardCollection = () => {
  const { steamid } = useParams<{ steamid: string }>();
  const [cardData, setCardData] = useState<CardCollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PlayerCardData | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (steamid) {
      fetchPlayerCards();
    }
  }, [steamid]);

  const fetchPlayerCards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/player-cards/player/${steamid}`);
      const data = await response.json();

      // Sort cards by seasonid ascending (oldest on left, most recent on right)
      const sortedCards = [...data.cards].sort(
        (a, b) => a.seasonid - b.seasonid
      );
      setCardData({ ...data, cards: sortedCards });
    } catch (err) {
      console.error('Error fetching player cards:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-warmscale-8 flex items-center justify-center">
          <div className="text-warmscale-2 text-2xl">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!cardData || cardData.totalCards === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-warmscale-8 flex items-center justify-center">
          <div className="text-warmscale-2 text-2xl">No cards found</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-warmscale-8">
        <div className="relative w-full h-screen">
          <style>{`
            .card-transition {
              transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .selected-card {
              transition: transform 0.1s ease-out;
            }
          `}</style>

          {/* Card deck */}
          {cardData.cards.map((card, index) => {
            const isSelected = selectedCard?.seasonid === card.seasonid;

            // Calculate position based on cards remaining in deck
            let deckPosition = 0;
            let deckIndex = index; // Track this card's position in the deck
            if (!isSelected) {
              // Count how many cards are before this one in the deck (excluding selected)
              const cardsBeforeInDeck = cardData.cards
                .slice(0, index)
                .filter((c) => selectedCard?.seasonid !== c.seasonid).length;

              deckIndex = cardsBeforeInDeck;

              // Calculate total cards in deck (excluding selected)
              const totalInDeck = selectedCard
                ? cardData.cards.length - 1
                : cardData.cards.length;

              const center = (totalInDeck - 1) / 2;
              deckPosition = (cardsBeforeInDeck - center) * 80;
            }

            // Calculate hover effects for deck cards
            let hoverOffset = 0;
            let hoverLift = 0;
            if (!isSelected && hoveredCardIndex !== null) {
              // Find the hovered card's position in the deck
              const hoveredDeckIndex = cardData.cards
                .slice(0, hoveredCardIndex)
                .filter((c) => selectedCard?.seasonid !== c.seasonid).length;

              // Calculate distance from hovered card
              const distance = Math.abs(deckIndex - hoveredDeckIndex);

              if (deckIndex === hoveredDeckIndex) {
                // This is the hovered card - lift it up
                hoverLift = 20;
              } else if (distance <= 3) {
                // Push nearby cards away based on distance
                const pushStrength = Math.max(0, 30 - distance * 10);
                hoverOffset =
                  deckIndex > hoveredDeckIndex ? pushStrength : -pushStrength;
              }
            }

            // Calculate 3D tilt for selected card
            const cardTransform = isSelected
              ? 'translate(-50%, -50%)'
              : `translateX(calc(-50% + ${deckPosition + hoverOffset}px))`;

            return (
              <div
                key={card.seasonid}
                className={`absolute cursor-pointer ${isSelected ? 'selected-card' : 'card-transition'}`}
                style={{
                  left: '50%',
                  bottom: isSelected ? 'auto' : `${100 + hoverLift}px`,
                  top: isSelected ? '35%' : 'auto',
                  width: isSelected ? '240px' : '140px',
                  transform: isSelected
                    ? 'translate(-50%, -50%)'
                    : cardTransform,
                  zIndex: 100 + index,
                }}
                onMouseEnter={() => !isSelected && setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCard(null);
                  } else {
                    setSelectedCard(card);
                  }
                }}
              >
                <PlayerCard
                  cardUrl={card.cardUrl}
                  seasonid={card.seasonid}
                  seasonName={card.seasonName}
                  division={card.division}
                  playerClass={card.class}
                  holo={isSelected && (card.holo || false)}
                  enable3DTilt={false}
                  imageClassName="w-full h-auto block"
                />
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CardCollection;
