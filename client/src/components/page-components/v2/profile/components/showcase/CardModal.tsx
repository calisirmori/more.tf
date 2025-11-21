/**
 * CardModal Component
 * Displays detailed card information in a modal overlay
 */

import { useState } from 'react';
import PlayerCard from '../../../../../shared-components/PlayerCard';
import { ShowcaseCard, RARITY_STYLES } from './types';
import { calculateOverall } from '../../../../../../utils/classWeights';

interface CardModalProps {
  card: ShowcaseCard;
  onClose: () => void;
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-warmscale-7 rounded-lg p-4 sm:p-6 max-w-4xl w-full border border-warmscale-5 my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
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
              cardUrl={card.cardUrl}
              holo={card.holo}
              enable3DTilt={true}
              animated={true}
              imageClassName="w-full h-auto rounded-lg"
            />
          </div>

          {/* Card Details */}
          <div className="md:pr-8 max-w-md mx-auto md:max-w-none md:mx-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-warmscale-1 mb-2 sm:mb-3">
              {card.rglname}
            </h2>

            {/* Compact Info Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-y-2 text-xs sm:text-sm md:text-base mb-3">
              <div>
                <span className="text-warmscale-4">Season:</span>{' '}
                <span className="text-warmscale-1 font-medium">
                  {card.seasonname}
                </span>
              </div>
              <div>
                <span className="text-warmscale-4">League:</span>{' '}
                <span className="text-warmscale-1 font-medium">{card.league}</span>
              </div>
              <div>
                <span className="text-warmscale-4">Format:</span>{' '}
                <span className="text-warmscale-1 font-medium">{card.format}</span>
              </div>
              <div>
                <span className="text-warmscale-4">Class:</span>{' '}
                <span className="text-warmscale-1 font-medium capitalize">
                  {card.class}
                </span>
              </div>
              <div>
                <span className="text-warmscale-4">Division:</span>{' '}
                <span className="text-warmscale-1 font-medium capitalize">
                  {card.division}
                </span>
              </div>
              <div>
                <span className="text-warmscale-4">Rarity:</span>{' '}
                <span
                  className={`font-bold bg-gradient-to-r ${RARITY_STYLES.gradientColors[card.rarity as keyof typeof RARITY_STYLES.gradientColors]} bg-clip-text text-transparent capitalize`}
                >
                  {card.rarity}
                </span>
              </div>
            </div>

            {/* Overall Rating */}
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
                        The overall rating is calculated using all six stats, with
                        each stat weighted differently based on its impact on
                        competitive performance.
                      </div>
                      <div className="text-warmscale-3 text-xs leading-relaxed">
                        <div className="font-semibold text-warmscale-2 mb-1">
                          Stats:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-warmscale-2">CBT</span>{' '}
                            = {card.class !== 'medic' ? 'Kills' : 'Assists'}
                          </div>
                          <div>
                            <span className="font-medium text-warmscale-2">EFF</span>{' '}
                            = {card.class !== 'medic' ? 'K/D' : 'A/D'}
                          </div>
                          <div>
                            <span className="font-medium text-warmscale-2">SPT</span>{' '}
                            = {card.class !== 'medic' ? 'Assists' : 'Ubers'}
                          </div>
                          <div>
                            <span className="font-medium text-warmscale-2">
                              {card.class !== 'medic' ? 'DMG' : 'HLG'}
                            </span>{' '}
                            = {card.class !== 'medic' ? 'Damage' : 'Healing'}
                          </div>
                          <div>
                            <span className="font-medium text-warmscale-2">SRV</span> =
                            Deaths
                          </div>
                          <div>
                            <span className="font-medium text-warmscale-2">EVA</span> =
                            DTM
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-warmscale-1 text-3xl sm:text-4xl font-bold">
                {calculateOverall({
                  class: card.class,
                  cbt: card.cbt,
                  eff: card.eff,
                  eva: card.eva,
                  imp: card.dmg,
                  spt: card.spt,
                  srv: card.srv,
                }).toFixed(1)}
              </div>
            </div>

            {/* Gift Indicator */}
            {card.gifted_from && (
              <div className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-600/30 rounded mb-3">
                <svg
                  className="w-5 h-5 text-purple-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                {card.gifter_avatar && (
                  <img
                    src={`https://avatars.cloudflare.steamstatic.com/${card.gifter_avatar}_medium.jpg`}
                    alt=""
                    className="w-8 h-8 rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <div className="text-purple-300 text-sm">
                    Gift from{' '}
                    <a
                      href={`/profile/${card.gifted_from}`}
                      className="text-purple-400 hover:text-purple-300 font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {card.gifter_name || card.gifted_from}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-2 gap-2 p-4 bg-warmscale-8 rounded border border-warmscale-6 text-sm">
              <div>
                <span className="text-warmscale-3">CBT:</span>{' '}
                <span className="text-warmscale-1 font-bold">{card.cbt}</span>
              </div>
              <div>
                <span className="text-warmscale-3">EFF:</span>{' '}
                <span className="text-warmscale-1 font-bold">{card.eff}</span>
              </div>
              <div>
                <span className="text-warmscale-3">SPT:</span>{' '}
                <span className="text-warmscale-1 font-bold">{card.spt}</span>
              </div>
              <div>
                <span className="text-warmscale-3">
                  {card.class !== 'medic' ? 'DMG' : 'HLG'}:
                </span>{' '}
                <span className="text-warmscale-1 font-bold">{card.dmg}</span>
              </div>
              <div>
                <span className="text-warmscale-3">SRV:</span>{' '}
                <span className="text-warmscale-1 font-bold">{card.srv}</span>
              </div>
              <div>
                <span className="text-warmscale-3">EVA:</span>{' '}
                <span className="text-warmscale-1 font-bold">{card.eva}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
