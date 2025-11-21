import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../shared-components/Navbar';
import Footer from '../shared-components/Footer';
import PlayerCard from '../shared-components/PlayerCard';
import Toast from '../shared-components/Toast';
import { trackCollectionView, trackCardClick, trackEvent } from '../../utils/analytics';
import { calculateOverall } from '../../utils/classWeights';

interface InventoryCard {
  id: number;
  card_steamid: string;
  seasonid: number;
  acquired_at: string;
  is_favorited: boolean;
  favorite_slot: number | null;
  gifted_from: string | null;
  gifter_name: string | null;
  gifter_avatar: string | null;
  class: string;
  division: string;
  format: string;
  cbt: number;
  spt: number;
  srv: number;
  eff: number;
  dmg: number;
  eva: number;
  seasonname: string;
  league: string;
  rglname: string;
  cardUrl: string | null;
  holo: boolean;
  rarity: string;
  overall: number;
}

interface InventoryStats {
  total_cards: string;
  unique_seasons: string;
  legendary_count: string;
  epic_count: string;
  rare_count: string;
  uncommon_count: string;
  common_count: string;
  favorited_count: string;
}

const CardInventory = () => {
  const { steamid } = useParams<{ steamid: string }>();
  const [cards, setCards] = useState<InventoryCard[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<InventoryCard | null>(null);
  const [isOwnInventory, setIsOwnInventory] = useState(false);
  const [shareModalCard, setShareModalCard] = useState<InventoryCard | null>(
    null
  );
  const [recipientSteamId, setRecipientSteamId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [sharing, setSharing] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [playerSearchResults, setPlayerSearchResults] = useState<any[]>([]);
  const [showPlayerResults, setShowPlayerResults] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const playerSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('season_desc');
  const [cardOwnerFilter, setCardOwnerFilter] = useState<
    'all' | 'my-cards' | 'gifted'
  >('all');

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const CARDS_PER_PAGE = 48;

  const fetchInventory = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: CARDS_PER_PAGE.toString(),
        offset: (page * CARDS_PER_PAGE).toString(),
        sort: sortBy,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedSeason !== 'all') params.append('season', selectedSeason);
      if (selectedRarity !== 'all') params.append('rarity', selectedRarity);
      if (selectedFormat !== 'all') params.append('format', selectedFormat);

      const response = await fetch(
        `/api/card-inventory/inventory/${steamid}?${params}`,
        {
          signal: abortController.signal,
        }
      );
      const data = await response.json();

      if (data.cards && data.pagination) {
        setCards(data.cards);
        setHasMore(data.pagination.hasMore);
      } else {
        setCards([]);
        setHasMore(false);
      }
    } catch (err: any) {
      // Don't update state if request was aborted
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching inventory:', err);
      setCards([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [
    steamid,
    searchQuery,
    selectedSeason,
    selectedRarity,
    selectedFormat,
    sortBy,
    page,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/card-inventory/stats/${steamid}`);
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [steamid]);

  useEffect(() => {
    if (steamid) {
      fetchInventory();
      fetchStats();
      checkIfOwnInventory();
      // Track collection view
      trackCollectionView(steamid);
    }

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [steamid, fetchInventory, fetchStats]);

  const checkIfOwnInventory = async () => {
    try {
      const response = await window.fetch('/api/me', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data && data.authenticated && data.user) {
        setIsOwnInventory(data.user.steamId === steamid);
      } else {
        setIsOwnInventory(false);
      }
    } catch (error) {
      console.log('Failed to check authentication:', error);
      setIsOwnInventory(false);
    }
  };

  const toggleFavorite = async (card: InventoryCard, slot?: number) => {
    try {
      const response = await fetch(`/api/card-inventory/favorite/${card.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ favoriteSlot: slot }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update favorite');
        return;
      }

      const data = await response.json();

      // Update the card in the local state
      setCards((prevCards) =>
        prevCards.map((c) =>
          c.id === card.id
            ? {
                ...c,
                is_favorited: data.is_favorited,
                favorite_slot: data.favorite_slot,
              }
            : c
        )
      );

      // Refresh stats to update favorited count
      fetchStats();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setToast({
        message: 'Failed to update favorite',
        type: 'error',
      });
    }
  };

  const searchPlayers = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setPlayerSearchResults([]);
      setShowPlayerResults(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/username-search/${encodeURIComponent(query.trim())}`
      );
      const data = await response.json();

      if (data && data.rows) {
        setPlayerSearchResults(data.rows);
        setShowPlayerResults(true);
      }
    } catch (err) {
      console.error('Error searching players:', err);
      setPlayerSearchResults([]);
    }
  };

  const handlePlayerSearchChange = (value: string) => {
    setPlayerSearchQuery(value);

    // Clear previous timeout
    if (playerSearchTimeoutRef.current) {
      clearTimeout(playerSearchTimeoutRef.current);
    }

    // Debounce search
    playerSearchTimeoutRef.current = setTimeout(() => {
      searchPlayers(value);
    }, 300);
  };

  const selectPlayer = (player: any) => {
    setRecipientSteamId(player.id64);
    setRecipientName(player.name);
    setPlayerSearchQuery(player.name);
    setShowPlayerResults(false);
  };

  const shareCard = async () => {
    if (!shareModalCard || !recipientSteamId.trim()) {
      setToast({
        message: 'Please enter a valid Steam ID or search for a player',
        type: 'warning',
      });
      return;
    }

    setSharing(true);
    try {
      const response = await fetch(
        `/api/card-inventory/gift/${shareModalCard.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ recipientSteamId: recipientSteamId.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setToast({
          message: data.error || 'Failed to share card',
          type: 'error',
        });
        setSharing(false);
        return;
      }

      // Show success message
      setShareSuccess(true);
      setToast({
        message: `Card shared successfully with ${recipientName || 'player'}!`,
        type: 'success',
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        setShareModalCard(null);
        setRecipientSteamId('');
        setRecipientName('');
        setPlayerSearchQuery('');
        setShareSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error sharing card:', err);
      setToast({
        message: 'Failed to share card',
        type: 'error',
      });
    } finally {
      setSharing(false);
    }
  };

  const rarityColors: Record<string, string> = {
    legendary: 'from-yellow-500 to-orange-600',
    epic: 'from-purple-500 to-pink-600',
    rare: 'from-blue-500 to-cyan-600',
    uncommon: 'from-green-500 to-emerald-600',
    common: 'from-gray-500 to-gray-600',
  };

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

  if (loading && cards.length === 0) {
    return (
      <>
        <Navbar />
        <div className="pt-16 bg-warmscale-7">
          <div className="mx-auto max-w-[1800px] px-6 md:px-12 lg:px-16 py-6">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-warmscale-2 text-2xl">
                Loading inventory...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="pt-16 bg-warmscale-7">
        {/* Header Section - Compact Single Line */}
        <div className="w-full bg-warmscale-8 border-b border-warmscale-6">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-12 lg:px-16 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-lightscale-1 font-cantarell">
                Inventory
              </h1>

              {/* Compact Stats */}
              {stats && (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-warmscale-7 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-warmscale-6">
                    <span className="text-warmscale-4 font-semibold font-cantarell whitespace-nowrap">
                      Total Cards
                    </span>
                    <span className="text-warmscale-1 font-bold font-cantarell">
                      {stats.total_cards}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-yellow-600/40">
                    <span className="text-yellow-300 font-semibold font-cantarell">
                      Legendary
                    </span>
                    <span className="text-yellow-100 font-bold font-cantarell">
                      {stats.legendary_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-purple-600/40">
                    <span className="text-purple-300 font-semibold font-cantarell">
                      Epic
                    </span>
                    <span className="text-purple-100 font-bold font-cantarell">
                      {stats.epic_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-blue-600/40">
                    <span className="text-blue-300 font-semibold font-cantarell">
                      Rare
                    </span>
                    <span className="text-blue-100 font-bold font-cantarell">
                      {stats.rare_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-green-600/40">
                    <span className="text-green-300 font-semibold font-cantarell">
                      Uncommon
                    </span>
                    <span className="text-green-100 font-bold font-cantarell">
                      {stats.uncommon_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-warmscale-7 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-warmscale-6">
                    <span className="text-warmscale-4 font-semibold font-cantarell">
                      Common
                    </span>
                    <span className="text-warmscale-2 font-bold font-cantarell">
                      {stats.common_count}
                    </span>
                  </div>
                  {cards.filter((c) => c.gifted_from).length > 0 && (
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded px-2 sm:px-3 py-1 sm:py-1.5 border border-purple-600/40">
                      <svg
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-purple-300 font-semibold font-cantarell">
                        Gifts
                      </span>
                      <span className="text-purple-100 font-bold font-cantarell">
                        {cards.filter((c) => c.gifted_from).length}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 py-6">
          {/* Filters */}
          <div className="bg-warmscale-8 rounded-md p-4 mb-6 drop-shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
              {/* Search */}
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search by player or season name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-6 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tf-orange font-cantarell"
                />
              </div>

              {/* Rarity Filter */}
              <div>
                <select
                  value={selectedRarity}
                  onChange={(e) => {
                    setSelectedRarity(e.target.value);
                    setPage(0);
                  }}
                  className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-6 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tf-orange font-cantarell"
                >
                  <option value="all">All Rarities</option>
                  <option value="legendary">Legendary</option>
                  <option value="epic">Epic</option>
                  <option value="rare">Rare</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="common">Common</option>
                </select>
              </div>

              {/* Format Filter */}
              <div>
                <select
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value);
                    setPage(0);
                  }}
                  className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-6 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tf-orange font-cantarell"
                >
                  <option value="all">All Formats</option>
                  <option value="HL">Highlander</option>
                  <option value="6s">Sixes</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                  }}
                  className="w-full bg-warmscale-7 text-warmscale-1 border border-warmscale-6 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tf-orange font-cantarell"
                >
                  <option value="season_desc">Newest Season</option>
                  <option value="season_asc">Oldest Season</option>
                  <option value="acquired_desc">Recently Acquired</option>
                  <option value="acquired_asc">First Acquired</option>
                  <option value="rating_desc">Highest Rating</option>
                </select>
              </div>
            </div>

            {/* Additional Filter: Card Owner Filter */}
            {isOwnInventory && (
              <div className="pt-3 border-t border-warmscale-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setCardOwnerFilter('all');
                      setPage(0);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-cantarell text-sm font-semibold ${
                      cardOwnerFilter === 'all'
                        ? 'bg-tf-orange text-warmscale-9'
                        : 'bg-warmscale-7 text-warmscale-2 hover:bg-warmscale-6 hover:text-warmscale-1'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    All Cards
                  </button>

                  <button
                    onClick={() => {
                      setCardOwnerFilter('my-cards');
                      setPage(0);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-cantarell text-sm font-semibold ${
                      cardOwnerFilter === 'my-cards'
                        ? 'bg-tf-orange text-warmscale-9'
                        : 'bg-warmscale-7 text-warmscale-2 hover:bg-warmscale-6 hover:text-warmscale-1'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Cards Only
                  </button>

                  <button
                    onClick={() => {
                      setCardOwnerFilter('gifted');
                      setPage(0);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors font-cantarell text-sm font-semibold ${
                      cardOwnerFilter === 'gifted'
                        ? 'bg-tf-orange text-warmscale-9'
                        : 'bg-warmscale-7 text-warmscale-2 hover:bg-warmscale-6 hover:text-warmscale-1'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    Gifted Cards
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">
            {cards && cards.length > 0 ? (
              cards
                .filter((card) => {
                  // Apply card owner filter
                  if (isOwnInventory) {
                    if (cardOwnerFilter === 'my-cards') {
                      return card.card_steamid === steamid;
                    } else if (cardOwnerFilter === 'gifted') {
                      return card.gifted_from !== null;
                    }
                  }
                  return true;
                })
                .map((card) => (
                  <div key={card.id} className="group relative">
                    {/* Rarity border glow on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${rarityColors[card.rarity]} opacity-0 group-hover:opacity-30 rounded-lg blur-sm transition-opacity duration-200`}
                    ></div>

                    {/* Card container with colored border and background */}
                    <div
                      className={`relative ${rarityBackgroundColors[card.rarity]} rounded-lg p-2 border-2 ${rarityBorderColors[card.rarity]} transition-all duration-200 transform group-hover:scale-105 cursor-pointer`}
                      onClick={() => {
                        setSelectedCard(card);
                        trackCardClick(card.id.toString(), card.card_steamid);
                        trackEvent('card_view_detail', {
                          card_id: card.id,
                          player_id: card.card_steamid,
                          season: card.seasonname,
                          rarity: card.rarity,
                          division: card.division,
                          class: card.class,
                          format: card.format,
                          is_holo: card.holo,
                          event_category: 'engagement'
                        });
                      }}
                    >
                      {/* Favorite indicator - top left */}
                      {card.is_favorited && card.favorite_slot && (
                        <div className="absolute top-1 left-1 z-10 bg-tf-orange text-warmscale-9 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                          {card.favorite_slot}
                        </div>
                      )}

                      {/* Favorite toggle button - top right (only for own inventory) */}
                      {/* Gift indicator */}
                      {card.gifted_from && (
                        <div
                          className="absolute top-1 left-1 z-10 p-1.5 rounded-full bg-purple-600/90 text-white"
                          title={`Gift from ${card.gifter_name || card.gifted_from}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                          </svg>
                        </div>
                      )}
                      {isOwnInventory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (card.is_favorited) {
                              toggleFavorite(card);
                            } else {
                              // Find next available slot
                              const usedSlots = cards
                                .filter(
                                  (c) => c.is_favorited && c.favorite_slot
                                )
                                .map((c) => c.favorite_slot!);
                              let nextSlot = 1;
                              for (let i = 1; i <= 5; i++) {
                                if (!usedSlots.includes(i)) {
                                  nextSlot = i;
                                  break;
                                }
                              }
                              toggleFavorite(card, nextSlot);
                            }
                          }}
                          className={`absolute top-1 right-1 z-10 p-1.5 rounded-full transition-all ${
                            card.is_favorited
                              ? 'bg-tf-orange text-warmscale-9'
                              : 'bg-warmscale-8/80 text-warmscale-3 hover:bg-warmscale-7 hover:text-tf-orange'
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill={card.is_favorited ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      )}
                      {card.cardUrl ? (
                        <PlayerCard
                          cardUrl={card.cardUrl}
                          holo={card.holo}
                          enable3DTilt={false}
                          imageClassName="w-full h-auto rounded"
                        />
                      ) : (
                        <div className="aspect-[3/4] bg-warmscale-6 rounded flex items-center justify-center text-warmscale-3">
                          No Image
                        </div>
                      )}

                      {/* Card info */}
                      <div className="mt-2 text-xs">
                        <div className="text-warmscale-2 truncate font-black">
                          {card.rglname || 'Unknown'}
                        </div>
                        <div className="text-warmscale-4 truncate text-[10px] font-semibold">
                          {card.seasonname}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span
                            className={`text-xs font-black uppercase bg-gradient-to-r ${rarityColors[card.rarity]} bg-clip-text text-transparent`}
                          >
                            {card.rarity}
                          </span>
                          <span className="text-warmscale-1 font-black">
                            {card.overall}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-full text-center py-12 text-warmscale-3">
                {loading ? 'Loading cards...' : 'No cards found in inventory'}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 font-cantarell">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="bg-warmscale-8 hover:bg-warmscale-7 disabled:opacity-50 disabled:cursor-not-allowed text-warmscale-1 px-6 py-2 rounded-md border border-warmscale-6 transition-colors font-semibold"
            >
              Previous
            </button>
            <span className="flex items-center text-warmscale-2 font-semibold">
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="bg-warmscale-8 hover:bg-warmscale-7 disabled:opacity-50 disabled:cursor-not-allowed text-warmscale-1 px-6 py-2 rounded-md border border-warmscale-6 transition-colors font-semibold"
            >
              Next
            </button>
          </div>

          {/* Selected Card Modal */}
          {selectedCard && (
            <div
              className="fixed inset-0 bg-black/80 z-50 overflow-y-auto"
              onClick={() => setSelectedCard(null)}
            >
              <div className="min-h-full flex items-center justify-center p-4">
                <div
                  className="bg-warmscale-7 rounded-lg p-4 sm:p-6 max-w-4xl w-full border border-warmscale-5 my-8 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Card Image */}
                  <div className="flex justify-center md:block">
                    <div className="w-64 md:w-full">
                      <PlayerCard
                        cardUrl={selectedCard.cardUrl || undefined}
                        holo={selectedCard.holo}
                        enable3DTilt={true}
                        animated={true}
                        imageClassName="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="md:pr-8 max-w-md mx-auto md:max-w-none md:mx-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-warmscale-1 mb-2 sm:mb-3">
                      {selectedCard.rglname}
                    </h2>

                    {/* Compact info grid on mobile */}
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

                    {isOwnInventory && (
                      <div className="mt-4 sm:mt-6">
                        <button
                          onClick={() => {
                            setShareModalCard(selectedCard);
                            setSelectedCard(null);
                          }}
                          className="w-full bg-tf-orange hover:bg-orange-600 text-warmscale-9 font-semibold py-2 sm:py-3 rounded transition-colors font-cantarell text-sm sm:text-base"
                        >
                          Share Card
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Card Modal */}
          {shareModalCard && (
            <div
              className="fixed inset-0 bg-black/80 z-50 overflow-y-auto"
              onClick={() => {
                setShareModalCard(null);
                setRecipientSteamId('');
              }}
            >
              <div className="min-h-full flex items-center justify-center p-4">
                <div
                  className="bg-warmscale-7 rounded-lg p-4 sm:p-6 max-w-md w-full border border-warmscale-5 my-8 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => {
                      setShareModalCard(null);
                      setRecipientSteamId('');
                    }}
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

                  <div className="pr-8">
                {shareSuccess ? (
                  // Success State
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 text-green-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-warmscale-1 mb-2 font-cantarell">
                      Card Shared Successfully!
                    </h3>
                    <p className="text-warmscale-3 text-sm font-cantarell">
                      {recipientName || 'Player'} has received the card
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-bold text-warmscale-1 mb-3 sm:mb-4 font-cantarell">
                      Share Card
                    </h2>
                    <p className="text-warmscale-3 mb-3 sm:mb-4 text-xs sm:text-sm font-cantarell">
                      Share {shareModalCard.rglname}'s{' '}
                      {shareModalCard.seasonname} card with another player. They
                      will receive a copy to keep forever.
                    </p>

                    {/* Player Search */}
                    <div className="mb-4 relative">
                      <label className="block text-warmscale-2 mb-2 text-sm font-semibold font-cantarell">
                        Search for Player
                      </label>
                      <input
                        type="text"
                        value={playerSearchQuery}
                        onChange={(e) =>
                          handlePlayerSearchChange(e.target.value)
                        }
                        onFocus={() => {
                          if (playerSearchResults.length > 0) {
                            setShowPlayerResults(true);
                          }
                        }}
                        placeholder="Search by name..."
                        className="w-full bg-warmscale-8 text-warmscale-1 border border-warmscale-6 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tf-orange font-cantarell"
                      />

                      {/* Search Results Dropdown */}
                      {showPlayerResults && playerSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-warmscale-8 border border-warmscale-6 rounded shadow-lg max-h-60 overflow-y-auto">
                          {playerSearchResults.map((player) => (
                            <div
                              key={player.id64}
                              onClick={() => selectPlayer(player)}
                              className="flex items-center gap-3 p-2 hover:bg-warmscale-7 cursor-pointer"
                            >
                              <img
                                src={`https://avatars.cloudflare.steamstatic.com/${player.avatar}_medium.jpg`}
                                alt=""
                                className="w-8 h-8 rounded"
                              />
                              <div className="flex-1 font-cantarell">
                                <div className="text-warmscale-1 text-sm font-semibold">
                                  {player.name}
                                </div>
                                <div className="text-warmscale-4 text-xs">
                                  {player.id64}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Or Divider */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-warmscale-6"></div>
                      <span className="text-warmscale-4 text-xs font-cantarell">
                        OR
                      </span>
                      <div className="flex-1 h-px bg-warmscale-6"></div>
                    </div>

                    {/* Manual Steam ID Input */}
                    <div className="mb-4">
                      <label className="block text-warmscale-2 mb-2 text-sm font-semibold font-cantarell">
                        Enter Steam ID Manually
                      </label>
                      <input
                        type="text"
                        value={recipientSteamId}
                        onChange={(e) => setRecipientSteamId(e.target.value)}
                        placeholder="76561198068401396"
                        className="w-full bg-warmscale-8 text-warmscale-1 border border-warmscale-6 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tf-orange font-cantarell"
                      />
                    </div>
                    <button
                      onClick={shareCard}
                      disabled={sharing || !recipientSteamId.trim()}
                      className="w-full bg-tf-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-warmscale-9 font-semibold py-2 sm:py-3 rounded transition-colors font-cantarell text-sm sm:text-base"
                    >
                      {sharing ? 'Sharing...' : 'Share Card'}
                    </button>
                  </>
                )}
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CardInventory;
