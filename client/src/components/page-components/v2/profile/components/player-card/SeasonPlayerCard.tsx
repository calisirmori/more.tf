/**
 * SeasonPlayerCard Component
 * Displays the player's seasonal card with format toggle and stat explanations
 */

import { useState, useEffect } from 'react';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import PlayerCard from '../../../../../shared-components/PlayerCard';
import { PlayerCardData, SeasonCard, CardFormat } from './types';

interface SeasonPlayerCardProps {
  playerId: string;
  playerCardData: PlayerCardData[];
}

export default function SeasonPlayerCard({
  playerId,
  playerCardData,
}: SeasonPlayerCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<CardFormat>('HL');
  const [currentCard, setCurrentCard] = useState<PlayerCardData | null>(null);
  const [s3Card, setS3Card] = useState<SeasonCard | null>(null);

  const hasMultipleFormats = playerCardData.length === 2;

  useEffect(() => {
    selectCardByFormat();
  }, [playerCardData, selectedFormat]);

  useEffect(() => {
    if (currentCard) {
      fetchS3Card();
    }
  }, [currentCard]);

  const selectCardByFormat = () => {
    if (!playerCardData || playerCardData.length === 0) {
      setCurrentCard(null);
      return;
    }

    if (playerCardData.length === 1) {
      setCurrentCard(playerCardData[0]);
      return;
    }

    // Multiple formats - select based on selectedFormat
    const card = playerCardData.find((c) => c.format === selectedFormat);
    setCurrentCard(card || playerCardData[0]);
  };

  const fetchS3Card = async () => {
    if (!currentCard?.seasonid) {
      setS3Card(null);
      return;
    }

    try {
      const response: any = await fetch(
        `/api/profile-s3-card/${playerId}/${currentCard.seasonid}`,
        FetchResultTypes.JSON
      );

      if (response?.exists && response?.cardUrl) {
        setS3Card({
          exists: true,
          cardUrl: response.cardUrl,
          holo: response.holo || false,
        });
      } else {
        setS3Card(null);
      }
    } catch (error) {
      console.error('Failed to fetch S3 card:', error);
      setS3Card(null);
    }
  };

  if (!currentCard || !s3Card?.cardUrl) {
    return null;
  }

  const isMedic = currentCard.class === 'medic';

  return (
    <div className="w-full py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
      <div className="flex justify-between items-center">
        <div className="text-lg text-lightscale-1 mb-1 font-semibold">
          Player Card | {currentCard.format}
        </div>

        {/* Format Toggle */}
        {hasMultipleFormats && (
          <div className="flex -mr-1 justify-center items-center gap-2 text-lg font-cantarell font-semibold text-lightscale-8">
            <div
              onClick={() => setSelectedFormat('HL')}
              className={`cursor-pointer transition-all ${
                selectedFormat === 'HL'
                  ? 'text-tf-orange'
                  : 'text-lg opacity-50 hover:opacity-100'
              }`}
            >
              HL
            </div>
            <div
              onClick={() => setSelectedFormat('6S')}
              className={`cursor-pointer transition-all ${
                selectedFormat === '6S'
                  ? 'text-tf-orange'
                  : 'text-lg opacity-50 hover:opacity-100'
              }`}
            >
              6S
            </div>
          </div>
        )}
      </div>

      {/* Card Display */}
      <div className="w-full justify-center flex h-[440px]">
        <div className="flex items-center justify-center min-w-[20rem] w-[20rem] px-3.5">
          <PlayerCard
            cardUrl={s3Card.cardUrl}
            holo={s3Card.holo}
            enable3DTilt={true}
          />
        </div>
      </div>

      {/* Stat Explanations */}
      <div className="text-xs flex justify-center text-warmscale-3 font-semibold mt-2">
        <div className="">
          <div>CBT (Combat) = {isMedic ? 'ASSISTS' : 'KILLS'}</div>
          <div>SPT (Support) = {isMedic ? 'UBERS' : 'ASSISTS'}</div>
          <div>SRV (Survival) = DEATHS</div>
        </div>
        <div className="ml-7">
          <div>EFF (EFFICIENCY) = {isMedic ? 'A/D' : 'K/D'}</div>
          <div>
            {isMedic ? 'HLG (HEALING)' : 'DMG (DAMAGE)'} ={' '}
            {isMedic ? 'HEALS' : 'DAMAGE'}
          </div>
          <div>EVA (EVASION) = DTM</div>
        </div>
      </div>
    </div>
  );
}
