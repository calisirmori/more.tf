import { useState, useEffect } from "react";
import Navbar from "../shared-components/Navbar";
import Footer from "../shared-components/Footer";

interface HistoryItem {
  backgroundPosition: { x: number; y: number };
  primaryColor: string;
  darkColor: string;
  lightColor: string;
  accentColor: string;
}

interface League {
  league: string;
}

interface Format {
  format: string;
}

interface Season {
  seasonid: number;
  seasonname: string;
  active: boolean;
}

interface PlayerData {
  id64: string;
  division: string;
  class: string;
  format: string;
  cbt: number;
  eff: number;
  eva: number;
  imp: number;
  spt: number;
  srv: number;
  rglname?: string;
  player_name?: string;
  generated?: boolean;
  generatedUrl?: string;
}

const SeasonCardManager = () => {
  // Step workflow
  const [currentStep, setCurrentStep] = useState<'design' | 'selection' | 'preview'>('design');

  // Selection state
  const [leagues, setLeagues] = useState<League[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

  // Design state
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 50, y: 50 });
  const [primaryColor, setPrimaryColor] = useState('#D4822A');
  const [darkColor, setDarkColor] = useState('#2C2418');
  const [lightColor, setLightColor] = useState('#E8DCC4');
  const [accentColor, setAccentColor] = useState('#D4822A');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showMockData, setShowMockData] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  // Bucket status state
  const [bucketStatus, setBucketStatus] = useState<{
    bucketExists: boolean;
    cardCount: number;
    bucketUrl: string;
  } | null>(null);

  // Saved design from database
  const [savedDesign, setSavedDesign] = useState<{
    primary_color: string;
    dark_color: string;
    light_color: string;
    accent_color: string;
    bg_position_x: number;
    bg_position_y: number;
    updated_at?: string;
  } | null>(null);

  const randomizeBackground = () => {
    setBackgroundPosition({
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    });
  };

  const randomizeAll = () => {
    // Save current state to history before randomizing
    const currentState: HistoryItem = {
      backgroundPosition,
      primaryColor,
      darkColor,
      lightColor,
      accentColor,
    };

    setHistory(prev => [currentState, ...prev].slice(0, 14));

    // Randomize position
    const newPosition = {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    };
    setBackgroundPosition(newPosition);

    // Generate random primary color and auto-generate scheme
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setPrimaryColor(randomHex);
    generateColorScheme(randomHex);
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setBackgroundPosition(item.backgroundPosition);
    setPrimaryColor(item.primaryColor);
    setDarkColor(item.darkColor);
    setLightColor(item.lightColor);
    setAccentColor(item.accentColor);
  };

  // Fetch leagues when entering selection step
  useEffect(() => {
    if (currentStep === 'selection') {
      fetchLeagues();
    }
  }, [currentStep]);

  // Fetch formats when league is selected
  useEffect(() => {
    if (selectedLeague && currentStep === 'selection') {
      fetchFormats(selectedLeague);
      setSelectedFormat('');
      setSelectedSeason(null);
    }
  }, [selectedLeague]);

  // Fetch seasons when format is selected
  useEffect(() => {
    if (selectedLeague && selectedFormat && currentStep === 'selection') {
      fetchSeasons(selectedLeague, selectedFormat);
      setSelectedSeason(null);
    }
  }, [selectedFormat]);

  // Load player data when season is selected (but don't auto-navigate)
  useEffect(() => {
    if (selectedLeague && selectedFormat && selectedSeason) {
      fetchPlayerData(selectedLeague, selectedFormat, selectedSeason);
    }
  }, [selectedSeason]);

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/season-cards/leagues');
      const data = await response.json();
      setLeagues(data);
    } catch (err) {
      console.error('Error fetching leagues:', err);
    }
  };

  const fetchFormats = async (league: string) => {
    try {
      const response = await fetch(`/api/season-cards/formats/${league}`);
      const data = await response.json();
      setFormats(data);
    } catch (err) {
      console.error('Error fetching formats:', err);
    }
  };

  const fetchSeasons = async (league: string, format: string) => {
    try {
      const response = await fetch(`/api/season-cards/seasons/${league}/${format}`);
      const data = await response.json();
      setSeasons(data);
    } catch (err) {
      console.error('Error fetching seasons:', err);
    }
  };

  const fetchPlayerData = async (league: string, format: string, seasonid: number) => {
    try {
      // Load player data
      const response = await fetch(`/api/season-cards/player-data/${seasonid}`);
      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setPlayerData(data);
        if (data.length > 0) {
          setSelectedPlayer(data[0]);
        }
      } else {
        console.error('Invalid player data format:', data);
        setPlayerData([]);
        alert('Error loading player data. Please try again.');
      }

      // Try to load saved design for this season
      try {
        const designResponse = await fetch(`/api/season-cards/design/${league}/${format}/${seasonid}`);
        const designData = await designResponse.json();

        // Check if this is a saved design (has updated_at) or just default values
        if (designData && designData.updated_at) {
          // Save the historical design from database
          setSavedDesign(designData);

          // Also load it into the current UI state
          setPrimaryColor(designData.primary_color);
          setDarkColor(designData.dark_color);
          setLightColor(designData.light_color);
          setAccentColor(designData.accent_color);
          setBackgroundPosition({
            x: designData.bg_position_x,
            y: designData.bg_position_y
          });
          console.log('Loaded saved design for this season');
        } else {
          console.log('No saved design found for this season, keeping current design');
          setSavedDesign(null);
        }
      } catch (designErr) {
        console.log('No saved design found for this season, keeping current design');
        setSavedDesign(null);
      }

      // Fetch bucket status
      try {
        const bucketResponse = await fetch(`/api/season-cards/bucket-status/${seasonid}`);
        const bucketData = await bucketResponse.json();
        setBucketStatus(bucketData);
      } catch (bucketErr) {
        console.error('Error fetching bucket status:', bucketErr);
        setBucketStatus(null);
      }
    } catch (err) {
      console.error('Error fetching player data:', err);
      setPlayerData([]);
      alert('Failed to load player data. Please check the console for details.');
    }
  };

  const clearBucket = async () => {
    if (!selectedSeason) return;

    if (!confirm(`Are you sure you want to delete all ${bucketStatus?.cardCount || 0} generated cards for this season? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/season-cards/clear-bucket/${selectedSeason}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // Refresh bucket status
        const bucketResponse = await fetch(`/api/season-cards/bucket-status/${selectedSeason}`);
        const bucketData = await bucketResponse.json();
        setBucketStatus(bucketData);
      } else {
        alert('Failed to clear bucket');
      }
    } catch (err) {
      console.error('Error clearing bucket:', err);
      alert('Failed to clear bucket. Please try again.');
    }
  };

  // Auto-generate color scheme from primary color
  const generateColorScheme = (primaryColor: string) => {
    // Convert hex to RGB
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Generate dark version (darker shade)
    const darkR = Math.floor(r * 0.2);
    const darkG = Math.floor(g * 0.2);
    const darkB = Math.floor(b * 0.2);
    const dark = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

    // Generate light version (lighter but more saturated - 50% blend instead of 70%)
    const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.5));
    const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.5));
    const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.5));
    const light = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;

    setDarkColor(dark);
    setLightColor(light);
    setAccentColor(primaryColor);
  };

  const downloadCardAsPng = async () => {
    if (!selectedPlayer && !showMockData) {
      alert('No player selected');
      return;
    }

    try {
      // Prepare player data for the server
      const playerData = showMockData ? {
        id64: 'mock_player',
        division: selectedPlayer?.division || 'advanced',
        class: selectedPlayer?.class || 'soldier',
        format: selectedPlayer?.format || 'highlander',
        cbt: selectedPlayer?.cbt || 85,
        eff: selectedPlayer?.eff || 88,
        eva: selectedPlayer?.eva || 79,
        imp: selectedPlayer?.imp || 91,
        spt: selectedPlayer?.spt || 78,
        srv: selectedPlayer?.srv || 92,
        rglname: selectedPlayer?.rglname || 'PLAYER'
      } : selectedPlayer;

      // Send request to server to generate PNG
      const response = await fetch('/api/generate/generate-single-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: playerData,
          primaryColor,
          darkColor,
          lightColor,
          accentColor,
          bgPositionX: backgroundPosition.x,
          bgPositionY: backgroundPosition.y,
          seasonInfo: selectedLeague && selectedFormat && selectedSeason ? {
            league: selectedLeague,
            format: selectedFormat,
            seasonid: selectedSeason,
            seasonname: seasons.find(s => s.seasonid === selectedSeason)?.seasonname || ''
          } : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate card');
      }

      // Get the PNG blob
      const blob = await response.blob();

      // Download it
      const link = document.createElement('a');
      const fileName = playerData?.rglname
        ? `${playerData.rglname}_card.png`
        : `season_card_${selectedSeason}.png`;

      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error('Error downloading card:', error);
      alert('Failed to download card as PNG. Check console for details.');
    }
  };

  const generateAllCards = async (useSavedDesign: boolean = false) => {
    if (!selectedLeague || !selectedFormat || !selectedSeason) {
      alert('Missing season information');
      return;
    }

    // Determine which design to use
    let designToUse;
    if (useSavedDesign && savedDesign) {
      // Use the saved design from database
      designToUse = {
        primaryColor: savedDesign.primary_color,
        darkColor: savedDesign.dark_color,
        lightColor: savedDesign.light_color,
        accentColor: savedDesign.accent_color,
        bgPositionX: savedDesign.bg_position_x,
        bgPositionY: savedDesign.bg_position_y,
      };
    } else {
      // Use the current UI state
      designToUse = {
        primaryColor,
        darkColor,
        lightColor,
        accentColor,
        bgPositionX: backgroundPosition.x,
        bgPositionY: backgroundPosition.y,
      };
    }

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: playerData.length });

    try {
      const response = await fetch('/api/generate/generate-season-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          league: selectedLeague,
          format: selectedFormat,
          seasonid: selectedSeason,
          ...designToUse,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start card generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.status === 'progress' || data.status === 'error') {
              // Update progress
              setGenerationProgress({ current: data.current, total: data.total });

              // Mark player as generated
              if (data.player) {
                setPlayerData(prev => prev.map(p =>
                  p.id64 === data.player.id64
                    ? { ...p, generated: data.status === 'progress', generatedUrl: data.player.url }
                    : p
                ));
              }
            } else if (data.status === 'completed') {
              alert(`Card generation completed! ${data.successCount} cards generated successfully.`);
              setIsGenerating(false);

              // Refresh bucket status and saved design after completion
              if (selectedSeason && selectedLeague && selectedFormat) {
                try {
                  const bucketResponse = await fetch(`/api/season-cards/bucket-status/${selectedSeason}`);
                  const bucketData = await bucketResponse.json();
                  setBucketStatus(bucketData);

                  const designResponse = await fetch(`/api/season-cards/design/${selectedLeague}/${selectedFormat}/${selectedSeason}`);
                  const designData = await designResponse.json();
                  if (designData && designData.updated_at) {
                    setSavedDesign(designData);
                  }
                } catch (refreshErr) {
                  console.error('Failed to refresh status:', refreshErr);
                }
              }
            } else if (data.status === 'fatal_error') {
              throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('Failed to parse progress update:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Card generation error:', error);
      alert('Failed to generate cards. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-warmscale-7 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[68vh]">
        <h1 className="text-white text-4xl font-bold mb-8">Season Card Manager</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SECTION */}
          <div className="bg-warmscale-6 p-6 rounded-lg shadow-lg border border-warmscale-5">
            {/* STEP 1: Design */}
            {currentStep === 'design' && (
              <>
                <h2 className="text-white text-2xl font-bold mb-4">Design Card</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={randomizeBackground}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-lg"
              >
                Randomize Background
              </button>
              <div className="text-warmscale-2 text-sm">
                <p>Position: {backgroundPosition.x}%, {backgroundPosition.y}%</p>
              </div>

              <div className="border-t border-warmscale-5 pt-4 mt-2">
                <h3 className="text-white text-lg font-semibold mb-3">Color Scheme</h3>

                {/* Auto-generate from primary */}
                <div className="mb-4 p-3 bg-warmscale-7 rounded-lg">
                  <label className="text-warmscale-2 text-sm mb-2 block">Quick Generate (Primary Color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        generateColorScheme(e.target.value);
                      }}
                      className="w-12 h-12 rounded cursor-pointer border-2 border-warmscale-5"
                    />
                    <span className="text-warmscale-2 text-xs">Pick a color to auto-generate scheme</span>
                  </div>
                </div>

                {/* Individual color controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border-2 border-warmscale-5"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-warmscale-2 text-xs">Dark Background</span>
                      <span className="text-white font-mono text-sm">{darkColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border-2 border-warmscale-5"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-warmscale-2 text-xs">Character Icons</span>
                      <span className="text-white font-mono text-sm">{lightColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border-2 border-warmscale-5"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-warmscale-2 text-xs">Confetti Items</span>
                      <span className="text-white font-mono text-sm">{accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('selection')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg mt-4"
              >
                Next: Select Season
              </button>
            </div>
              </>
            )}

            {/* STEP 2: League/Format/Season Selection */}
            {currentStep === 'selection' && (
              <>
                <h2 className="text-white text-2xl font-bold mb-4">Select Season</h2>
                <div className="flex flex-col gap-4">
                  {/* League Selection */}
                  <div>
                    <label className="text-warmscale-2 text-sm mb-2 block">League</label>
                    <select
                      value={selectedLeague}
                      onChange={(e) => setSelectedLeague(e.target.value)}
                      className="w-full px-4 py-2 bg-warmscale-7 text-white border border-warmscale-5 rounded-lg focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select League</option>
                      {leagues.map((league) => (
                        <option key={league.league} value={league.league}>
                          {league.league}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Format Selection */}
                  <div>
                    <label className="text-warmscale-2 text-sm mb-2 block">Format</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      disabled={!selectedLeague}
                      className="w-full px-4 py-2 bg-warmscale-7 text-white border border-warmscale-5 rounded-lg focus:outline-none focus:border-orange-500 disabled:opacity-50"
                    >
                      <option value="">Select Format</option>
                      {formats.map((format) => (
                        <option key={format.format} value={format.format}>
                          {format.format}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Season Selection */}
                  <div>
                    <label className="text-warmscale-2 text-sm mb-2 block">Season</label>
                    <select
                      value={selectedSeason || ''}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      disabled={!selectedFormat}
                      className="w-full px-4 py-2 bg-warmscale-7 text-white border border-warmscale-5 rounded-lg focus:outline-none focus:border-orange-500 disabled:opacity-50"
                    >
                      <option value="">Select Season</option>
                      {seasons.map((season) => (
                        <option key={season.seasonid} value={season.seasonid}>
                          {season.seasonname} {season.active && '(Active)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setCurrentStep('design')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex-1"
                    >
                      Back to Design
                    </button>
                    <button
                      onClick={() => setCurrentStep('preview')}
                      disabled={!selectedSeason}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Preview
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Player Preview */}
            {currentStep === 'preview' && (
              <>
                <h2 className="text-white text-2xl font-bold mb-4">
                  {selectedLeague} {selectedFormat} - Season {selectedSeason}
                </h2>

                {/* Bucket Status and Saved Settings */}
                <div className="mb-4 p-4 bg-warmscale-7 rounded-lg space-y-3">
                  <div className="text-white font-semibold text-lg">Season Information</div>

                  {/* S3 Bucket Status */}
                  <div className="flex items-center justify-between p-3 bg-warmscale-6 rounded">
                    <div>
                      <div className="text-warmscale-2 text-sm">S3 Bucket Status</div>
                      <div className="text-white font-semibold">
                        {bucketStatus?.bucketExists ? (
                          <span className="text-green-400">
                            {bucketStatus.cardCount} cards generated
                          </span>
                        ) : (
                          <span className="text-gray-400">No cards generated yet</span>
                        )}
                      </div>
                    </div>
                    {bucketStatus?.bucketExists && bucketStatus.cardCount > 0 && (
                      <button
                        onClick={clearBucket}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                      >
                        Clear Bucket
                      </button>
                    )}
                  </div>

                  {/* Saved Card Design Settings */}
                  <div className="p-3 bg-warmscale-6 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-warmscale-2 text-sm">Saved Card Design</div>
                      {savedDesign?.updated_at && (
                        <div className="text-xs text-warmscale-3">
                          Last saved: {new Date(savedDesign.updated_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {savedDesign ? (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border border-warmscale-5" style={{ backgroundColor: savedDesign.primary_color }}></div>
                          <span className="text-warmscale-2">Primary: {savedDesign.primary_color}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border border-warmscale-5" style={{ backgroundColor: savedDesign.dark_color }}></div>
                          <span className="text-warmscale-2">Dark: {savedDesign.dark_color}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border border-warmscale-5" style={{ backgroundColor: savedDesign.light_color }}></div>
                          <span className="text-warmscale-2">Light: {savedDesign.light_color}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border border-warmscale-5" style={{ backgroundColor: savedDesign.accent_color }}></div>
                          <span className="text-warmscale-2">Accent: {savedDesign.accent_color}</span>
                        </div>
                        <div className="col-span-2 text-warmscale-2">
                          Background Position: {savedDesign.bg_position_x}%, {savedDesign.bg_position_y}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-warmscale-3 text-xs">
                        No saved design yet. Generate cards to save the current design.
                      </div>
                    )}
                  </div>
                </div>

                {playerData.length === 0 ? (
                  <div className="text-warmscale-2 text-center py-8">
                    No player data found for this season.
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
                      {playerData.map((player) => (
                      <div
                        key={player.id64}
                        className={`p-3 rounded-lg transition-colors flex items-center gap-3 ${
                          selectedPlayer?.id64 === player.id64
                            ? 'bg-orange-500 text-white'
                            : 'bg-warmscale-7 text-warmscale-2'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={player.generated || false}
                          readOnly
                          className="w-5 h-5 pointer-events-none"
                        />
                        <button
                          onClick={() => setSelectedPlayer(player)}
                          className="flex-1 text-left"
                        >
                          <div className="font-bold">{player.rglname || player.player_name || `Player ${player.id64}`}</div>
                          <div className="text-xs">{player.division} - {player.class}</div>
                        </button>
                        {player.generated && player.generatedUrl && (
                          <a
                            href={player.generatedUrl}
                            download={`${player.rglname || player.id64}_card.png`}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                    </div>

                    {isGenerating && (
                      <div className="mt-4 p-4 bg-warmscale-7 rounded-lg">
                        <div className="text-warmscale-2 text-sm mb-2">
                          Generating cards: {generationProgress.current} / {generationProgress.total}
                        </div>
                        <div className="w-full bg-warmscale-5 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Generation buttons */}
                    {bucketStatus?.bucketExists && bucketStatus.cardCount > 0 && savedDesign ? (
                      <div className="mt-4 space-y-3">
                        <div className="text-warmscale-2 text-sm text-center">
                          Cards already exist. Choose an option:
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => generateAllCards(true)}
                            disabled={isGenerating}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGenerating ? 'Generating...' : 'Regenerate with Same Design'}
                          </button>
                          <button
                            onClick={() => generateAllCards(false)}
                            disabled={isGenerating}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGenerating ? 'Generating...' : 'Regenerate with New Design'}
                          </button>
                        </div>
                        <div className="text-xs text-warmscale-3 text-center">
                          Same Design uses the saved design from database. New Design uses your current preview settings.
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => generateAllCards(false)}
                        disabled={isGenerating}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                      >
                        {isGenerating ? 'Generating Cards...' : 'Generate All Cards'}
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setCurrentStep('selection')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors mt-4"
                >
                  Back to Season Selection
                </button>
              </>
            )}
          </div>

          {/* RIGHT SECTION - Card Preview */}
          <div className="bg-warmscale-6 p-6 rounded-lg shadow-lg border border-warmscale-5">
            {/* History */}
            {history.length > 0 && currentStep !== 'preview' && (
              <div className="mb-4">
                <h3 className="text-warmscale-2 text-sm mb-2">History</h3>
                <div className="flex gap-2 flex-wrap">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => restoreFromHistory(item)}
                      className="w-8 h-8 rounded border-2 border-warmscale-5 hover:border-orange-500 transition-colors cursor-pointer"
                      style={{ backgroundColor: item.primaryColor }}
                      title={`Restore ${item.primaryColor}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-2xl font-bold">Card Preview</h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-warmscale-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMockData}
                    onChange={(e) => setShowMockData(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm">Show Mock Data</span>
                </label>
                {currentStep !== 'preview' && (
                  <button
                    onClick={randomizeAll}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    title="Randomize everything"
                  >
                    <span className="text-xl">🎲</span>
                    Randomize All
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={downloadCardAsPng}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors mb-4 w-full"
              title="Download current card as PNG"
            >
              Download as PNG
            </button>
            <div className="flex justify-center items-center">
              <div className="relative" style={{ width: '300px', height: '410px' }}>
                <svg
                  viewBox="0 0 900 1227"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                  key={`${primaryColor}-${darkColor}-${lightColor}-${accentColor}`}
                >
                  <defs>
                    <mask id="cardMask">
                      <g transform="translate(0, 1227) scale(0.1, -0.1)">
                        <path
                          d="M4444 11919 c-53 -58 -218 -178 -304 -220 -105 -51 -262 -58 -415
-18 -61 16 -151 68 -187 107 -96 105 -109 114 -147 109 -20 -3 -56 -12 -81
-20 -25 -8 -78 -22 -119 -32 -63 -14 -227 -88 -256 -116 -5 -5 -20 -9 -35 -9
-14 0 -43 -14 -64 -30 -22 -17 -44 -30 -49 -30 -8 0 -104 -57 -203 -120 -92
-59 -442 -319 -463 -343 -7 -10 -18 -17 -23 -17 -9 0 -42 -25 -98 -74 -72 -62
-487 -361 -560 -401 -10 -6 -24 -16 -31 -22 -47 -36 -329 -177 -409 -203 -30
-9 -81 -26 -112 -36 l-58 -18 0 -4291 c0 -4209 0 -4292 19 -4345 40 -113 72
-156 161 -214 38 -25 86 -52 107 -60 21 -8 67 -25 103 -38 36 -13 70 -27 75
-30 17 -11 225 -78 240 -78 8 0 29 -6 47 -14 18 -8 62 -23 98 -35 65 -20 105
-33 170 -56 41 -15 98 -32 240 -74 290 -86 310 -92 350 -106 19 -7 62 -21 95
-30 33 -10 83 -28 110 -40 28 -13 106 -42 174 -65 68 -23 131 -45 140 -50 30
-16 256 -100 268 -100 7 0 27 -6 45 -14 18 -8 53 -22 78 -31 25 -10 73 -30
107 -46 35 -16 68 -29 76 -29 7 0 21 -6 32 -14 11 -7 45 -21 75 -31 74 -24
379 -181 512 -264 109 -67 206 -123 243 -140 11 -5 31 -21 44 -35 31 -33 51
-33 81 -1 82 87 608 372 930 505 30 12 59 26 65 31 5 5 15 9 22 9 7 0 37 12
66 26 28 14 84 36 123 49 40 13 80 28 90 33 11 6 39 18 64 27 44 17 65 26 143
59 21 9 44 16 51 16 8 0 27 7 42 15 16 8 37 15 46 15 10 0 32 6 50 14 18 8 62
23 98 35 36 11 90 30 120 41 49 19 88 31 195 60 17 5 84 27 150 49 66 22 143
48 170 56 28 9 64 22 80 30 17 7 55 20 85 29 30 9 98 30 150 46 52 17 120 38
150 47 79 23 162 50 190 61 14 6 54 18 90 28 125 34 265 111 348 191 7 7 29
47 49 90 l37 78 3 4271 4 4272 -23 24 c-13 14 -41 32 -63 40 -98 39 -154 63
-215 93 -145 71 -268 140 -318 178 -29 22 -70 49 -90 61 -42 23 -108 69 -238
164 -47 34 -87 62 -90 62 -3 0 -50 35 -106 78 -55 42 -112 85 -126 94 -13 9
-28 21 -31 26 -8 12 -195 148 -257 187 -44 28 -105 69 -334 226 -36 25 -72 48
-80 52 -8 4 -28 16 -45 27 -16 11 -37 23 -45 26 -8 4 -46 21 -85 40 -153 72
-241 104 -340 124 -91 19 -135 23 -135 13 0 -12 -89 -104 -119 -123 -13 -8
-33 -22 -45 -31 -83 -62 -229 -95 -372 -86 -63 5 -97 13 -150 38 -62 29 -130
74 -159 105 -5 6 -30 26 -55 44 -25 19 -60 49 -78 67 -38 38 -61 41 -88 12z"
                          fill="white"
                        />
                      </g>
                    </mask>

                    {/* Color replacement filter */}
                    <filter id="colorTint" colorInterpolationFilters="sRGB">
                      {/* Step 1: Convert to grayscale to detect brightness levels */}
                      <feColorMatrix type="matrix"
                        values="0.2126 0.7152 0.0722 0 0
                                0.2126 0.7152 0.0722 0 0
                                0.2126 0.7152 0.0722 0 0
                                0      0      0      1 0"
                        result="grayscale" />

                      {/* Step 2: Use discrete to separate into 3 brightness ranges */}
                      <feComponentTransfer in="SourceGraphic" result="originalAlpha">
                        <feFuncA type="identity" />
                      </feComponentTransfer>

                      {/* Remap grayscale values to our three colors */}
                      <feComponentTransfer in="grayscale">
                        <feFuncR type="discrete" tableValues={`${parseInt(darkColor.slice(1, 3), 16)/255} ${parseInt(accentColor.slice(1, 3), 16)/255} ${parseInt(lightColor.slice(1, 3), 16)/255}`} />
                        <feFuncG type="discrete" tableValues={`${parseInt(darkColor.slice(3, 5), 16)/255} ${parseInt(accentColor.slice(3, 5), 16)/255} ${parseInt(lightColor.slice(3, 5), 16)/255}`} />
                        <feFuncB type="discrete" tableValues={`${parseInt(darkColor.slice(5, 7), 16)/255} ${parseInt(accentColor.slice(5, 7), 16)/255} ${parseInt(lightColor.slice(5, 7), 16)/255}`} />
                      </feComponentTransfer>
                    </filter>

                    {/* Primary color tint filter for crystals */}
                    <filter id="primaryTint" colorInterpolationFilters="sRGB">
                      {/* First desaturate to remove orange base */}
                      <feColorMatrix type="saturate" values="0" result="gray" />
                      {/* Then apply primary color */}
                      <feFlood floodColor={primaryColor} result="flood" />
                      <feComposite in="flood" in2="SourceAlpha" operator="in" result="color" />
                      <feBlend in="color" in2="gray" mode="multiply" result="tinted" />
                      {/* Lighten it a bit */}
                      <feComponentTransfer in="tinted">
                        <feFuncR type="linear" slope="1.5" />
                        <feFuncG type="linear" slope="1.5" />
                        <feFuncB type="linear" slope="1.5" />
                      </feComponentTransfer>
                    </filter>
                  </defs>

                  {/* Background pattern revealed through mask */}
                  <g mask="url(#cardMask)">
                    <image
                      href="/pattern.jpg"
                      x={-backgroundPosition.x * 6}
                      y={-backgroundPosition.y * 6}
                      width="1500"
                      height="1800"
                      preserveAspectRatio="xMidYMid slice"
                      filter="url(#colorTint)"
                    />

                    {/* Dark overlay for better text readability */}
                    {showMockData && (
                      <rect x="0" y="0" width="900" height="1227" fill="rgba(0, 0, 0, 0.5)" />
                    )}
                  </g>

                  {/* Mock Data Overlay - Images and Text */}
                  {showMockData && (
                    <g>
                      {/* Border Image - Advanced */}
                      <image href={`/player cards/borders/${selectedPlayer?.division || 'advanced'}.png`} x="0" y="0" width="900" height="1227" preserveAspectRatio="xMidYMid meet" />

                      {/* Class Portrait */}
                      <image href={`/player cards/class-portraits/${selectedPlayer?.class || 'soldier'}.png`} x="0" y="0" width="900" height="1227" preserveAspectRatio="xMidYMid meet" />

                      {/* Gradient Overlay */}
                      <image href="/player cards/gradients.png" x="0" y="0" width="900" height="1227" preserveAspectRatio="xMidYMid meet" />

                      {/* Class Icon (centered bottom) */}
                      <image href={`/player cards/class-icons/${selectedPlayer?.class || 'soldier'}.png`} x="410" y="1090" width="80" height="80" />

                      {/* Logo */}
                      <image href="/player cards/logo.png" x="0" y="0" width="900" height="1227" preserveAspectRatio="xMidYMid meet" />

                      {/* Crystals Overlay for Invite Division */}
                      {selectedPlayer?.division === 'invite' && (
                        <image href="/player cards/crystals.png" x="0" y="0" width="900" height="1227" preserveAspectRatio="xMidYMid meet" filter="url(#primaryTint)" />
                      )}

                      {/* Division Medal */}
                      <image href={`/player cards/division-medals/${selectedPlayer?.division || 'invite'}.png`} x="180" y="460" width="120" height="120" />

                      {/* Overall Badge */}
                      <text x="240" y="280" fontSize="35" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">OVERALL</text>
                      <text x="240" y="315" fontSize="26" fill="#CCCCCC" textAnchor="middle" fontFamily="Roboto Mono">{(selectedPlayer?.format || 'HIGHLANDER').toUpperCase()}</text>
                      <text x="240" y="420" fontSize="110" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">
                        {selectedPlayer ? Math.round(((selectedPlayer.cbt*2) + (selectedPlayer.eff*0.5) + (selectedPlayer.eva*0.5) + (selectedPlayer.imp*2) + selectedPlayer.spt + selectedPlayer.srv) / 7.0) : 87}
                      </text>

                      {/* Division line under overall */}
                      <line x1="175" y1="450" x2="305" y2="450" stroke="#FFFFFF" strokeWidth="6" />

                      {/* Player Name */}
                      <text x="450" y="690" fontSize="100" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto">
                        {selectedPlayer?.rglname?.toUpperCase() || 'PLAYER'}
                      </text>

                      {/* Horizontal divider */}
                      <line x1="160" y1="720" x2="740" y2="720" stroke="#FFFFFF" strokeWidth="6" />

                      {/* Stats - Left Column */}
                      <text x="360" y="820" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">{selectedPlayer?.cbt || 85}</text>
                      <text x="212" y="820" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">CBT</text>

                      <text x="360" y="920" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">{selectedPlayer?.spt || 78}</text>
                      <text x="212" y="920" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">SPT</text>

                      <text x="360" y="1020" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">{selectedPlayer?.srv || 92}</text>
                      <text x="212" y="1020" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">SRV</text>

                      {/* Vertical divider */}
                      <line x1="450" y1="740" x2="450" y2="1040" stroke="#FFFFFF" strokeWidth="6" />

                      {/* Stats - Right Column */}
                      <text x="560" y="820" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">EFF</text>
                      <text x="712" y="820" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">{selectedPlayer?.eff || 88}</text>

                      <text x="560" y="920" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">DMG</text>
                      <text x="712" y="920" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">{selectedPlayer?.imp || 91}</text>

                      <text x="560" y="1020" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">EVA</text>
                      <text x="712" y="1020" fontSize="80" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" fontFamily="Roboto Mono">{selectedPlayer?.eva || 79}</text>

                      {/* Bottom divider */}
                      <line x1="300" y1="1060" x2="600" y2="1060" stroke="#FFFFFF" strokeWidth="6" />
                    </g>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SeasonCardManager;
