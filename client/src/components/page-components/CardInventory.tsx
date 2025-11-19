import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../shared-components/Navbar";
import Footer from "../shared-components/Footer";
import PlayerCard from "../shared-components/PlayerCard";

interface InventoryCard {
  id: number;
  card_steamid: string;
  seasonid: number;
  acquired_at: string;
  is_favorited: boolean;
  favorite_slot: number | null;
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
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("season_desc");

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
        sort: sortBy
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedSeason !== 'all') params.append('season', selectedSeason);
      if (selectedRarity !== 'all') params.append('rarity', selectedRarity);
      if (selectedFormat !== 'all') params.append('format', selectedFormat);

      const response = await fetch(`/api/card-inventory/inventory/${steamid}?${params}`, {
        signal: abortController.signal
      });
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
  }, [steamid, searchQuery, selectedSeason, selectedRarity, selectedFormat, sortBy, page]);

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
    }

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [steamid, fetchInventory, fetchStats]);

  const rarityColors: Record<string, string> = {
    legendary: 'from-yellow-500 to-orange-600',
    epic: 'from-purple-500 to-pink-600',
    rare: 'from-blue-500 to-cyan-600',
    uncommon: 'from-green-500 to-emerald-600',
    common: 'from-gray-500 to-gray-600'
  };

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

  if (loading && cards.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-warmscale-8 flex items-center justify-center">
          <div className="text-warmscale-2 text-2xl">Loading inventory...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-warmscale-8 py-8">
        <div className="container mx-auto px-4 max-w-[1800px]">

          {/* Header with Stats */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-warmscale-1 mb-4">Card Inventory</h1>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                <div className="bg-warmscale-7 rounded-lg p-4 border border-warmscale-6">
                  <div className="text-warmscale-3 text-sm">Total Cards</div>
                  <div className="text-2xl font-bold text-warmscale-1">{stats.total_cards}</div>
                </div>
                <div className="bg-warmscale-7 rounded-lg p-4 border border-warmscale-6">
                  <div className="text-warmscale-3 text-sm">Seasons</div>
                  <div className="text-2xl font-bold text-warmscale-1">{stats.unique_seasons}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
                  <div className="text-yellow-200 text-sm">Legendary</div>
                  <div className="text-2xl font-bold text-yellow-100">{stats.legendary_count}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-purple-200 text-sm">Epic</div>
                  <div className="text-2xl font-bold text-purple-100">{stats.epic_count}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="text-blue-200 text-sm">Rare</div>
                  <div className="text-2xl font-bold text-blue-100">{stats.rare_count}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-green-200 text-sm">Uncommon</div>
                  <div className="text-2xl font-bold text-green-100">{stats.uncommon_count}</div>
                </div>
                <div className="bg-warmscale-7 rounded-lg p-4 border border-warmscale-6">
                  <div className="text-warmscale-3 text-sm">Common</div>
                  <div className="text-2xl font-bold text-warmscale-1">{stats.common_count}</div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-warmscale-7 rounded-lg p-6 mb-6 border border-warmscale-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  className="w-full bg-warmscale-8 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
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
                  className="w-full bg-warmscale-8 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
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
                  className="w-full bg-warmscale-8 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
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
                  className="w-full bg-warmscale-8 text-warmscale-1 border border-warmscale-5 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="season_desc">Newest Season</option>
                  <option value="season_asc">Oldest Season</option>
                  <option value="acquired_desc">Recently Acquired</option>
                  <option value="acquired_asc">First Acquired</option>
                  <option value="rating_desc">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">
            {cards && cards.length > 0 ? cards.map((card) => (
              <div
                key={card.id}
                className="group relative cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                {/* Rarity border glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[card.rarity]} opacity-0 group-hover:opacity-30 rounded-lg blur-sm transition-opacity duration-200`}></div>

                {/* Card container with colored border and background */}
                <div className={`relative ${rarityBackgroundColors[card.rarity]} rounded-lg p-2 border-2 ${rarityBorderColors[card.rarity]} transition-all duration-200 transform group-hover:scale-105`}>
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
                    <div className="text-warmscale-2 truncate font-semibold">{card.rglname || 'Unknown'}</div>
                    <div className="text-warmscale-3 truncate">{card.seasonname}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-xs font-bold bg-gradient-to-r ${rarityColors[card.rarity]} bg-clip-text text-transparent`}>
                        {card.rarity.toUpperCase()}
                      </span>
                      <span className="text-warmscale-1 font-bold">{card.overall}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-warmscale-3">
                {loading ? 'Loading cards...' : 'No cards found in inventory'}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="bg-warmscale-7 hover:bg-warmscale-6 disabled:opacity-50 disabled:cursor-not-allowed text-warmscale-1 px-6 py-2 rounded border border-warmscale-5 transition-colors"
            >
              Previous
            </button>
            <span className="flex items-center text-warmscale-2">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="bg-warmscale-7 hover:bg-warmscale-6 disabled:opacity-50 disabled:cursor-not-allowed text-warmscale-1 px-6 py-2 rounded border border-warmscale-5 transition-colors"
            >
              Next
            </button>
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
                    <h2 className="text-3xl font-bold text-warmscale-1 mb-4">{selectedCard.rglname}</h2>
                    <div className="space-y-3">
                      <div>
                        <span className="text-warmscale-3">Season:</span>
                        <span className="text-warmscale-1 ml-2">{selectedCard.seasonname}</span>
                      </div>
                      <div>
                        <span className="text-warmscale-3">League:</span>
                        <span className="text-warmscale-1 ml-2">{selectedCard.league}</span>
                      </div>
                      <div>
                        <span className="text-warmscale-3">Format:</span>
                        <span className="text-warmscale-1 ml-2">{selectedCard.format}</span>
                      </div>
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
                        <span className="text-warmscale-3">Overall:</span>
                        <span className="text-warmscale-1 ml-2 text-2xl font-bold">{selectedCard.overall}</span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-4 bg-warmscale-8 rounded border border-warmscale-6">
                        <div><span className="text-warmscale-3">CBT:</span> <span className="text-warmscale-1 font-bold">{selectedCard.cbt}</span></div>
                        <div><span className="text-warmscale-3">EFF:</span> <span className="text-warmscale-1 font-bold">{selectedCard.eff}</span></div>
                        <div><span className="text-warmscale-3">SPT:</span> <span className="text-warmscale-1 font-bold">{selectedCard.spt}</span></div>
                        <div><span className="text-warmscale-3">DMG:</span> <span className="text-warmscale-1 font-bold">{selectedCard.dmg}</span></div>
                        <div><span className="text-warmscale-3">SRV:</span> <span className="text-warmscale-1 font-bold">{selectedCard.srv}</span></div>
                        <div><span className="text-warmscale-3">EVA:</span> <span className="text-warmscale-1 font-bold">{selectedCard.eva}</span></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCard(null)}
                      className="mt-6 w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 rounded transition-colors"
                    >
                      Close
                    </button>
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
