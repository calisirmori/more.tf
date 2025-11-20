import React, { useState } from 'react';

interface LogHeaderProps {
  logId: number;
  map: string;
  title: string;
  startTime: string;
  duration: number;
  blueScore: number;
  redScore: number;
  winner?: 'Red' | 'Blue';
}

type TabType = 'box-score' | 'charts' | 'play-by-play';

const LogHeader: React.FC<LogHeaderProps> = ({
  logId,
  map,
  title,
  startTime,
  duration,
  blueScore,
  redScore,
  winner,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('charts');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} mins`;
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);

      // Use user's locale for date and time formatting
      const dateFormatter = new Intl.DateTimeFormat(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });

      const timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: undefined, // Let browser decide based on locale
      });

      const formattedDate = dateFormatter.format(date);
      const formattedTime = timeFormatter.format(date);

      return `${formattedDate}, ${formattedTime}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  const isBlueWinner = winner?.toLowerCase() === 'blue';
  const isRedWinner = winner?.toLowerCase() === 'red';

  return (
    <div className="bg-warmscale-85 rounded-t-lg overflow-hidden p-4 md:p-0">
      {/* Title Section */}
      <div className="text-center py-3 md:py-6 md:px-6 mb-4 md:mb-0">
        <h1 className="text-sm md:text-lg font-bold text-orange-500 tracking-wide mb-2 uppercase">
          {title || `LOG #${logId}: BLU VS RED`}
        </h1>
        <p className="text-gray-400 text-xs md:text-sm font-normal">
          {map.toUpperCase()} • {formatDateTime(startTime)} • {formatDuration(duration)}
        </p>
      </div>

      {/* Score Section */}
      <div className="mb-4 md:px-6 md:pb-6 md:mb-0">
        <div className="flex items-stretch rounded overflow-hidden">
          {/* Blue Team */}
          <div className="flex-1 bg-[#5885A2] px-2 py-3 md:px-8 md:py-5 flex flex-col md:flex-row items-center justify-center md:justify-between border-b-4 border-[#3D5A6E] gap-1 md:gap-0">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex w-12 h-12 rounded-full border-4 border-white/40 items-center justify-center">
                <div className="w-6 h-6 bg-white/60 rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-3xl font-bold text-white tracking-wider">BLU</span>
                {isBlueWinner && (
                  <span className="text-[9px] md:text-xs font-bold text-yellow-300 tracking-wide">WINNER</span>
                )}
              </div>
            </div>
            <span className="text-3xl md:text-7xl font-bold text-white tabular-nums">
              {blueScore}
            </span>
          </div>

          {/* FINAL Label */}
          <div className="px-2 py-3 md:px-10 md:py-5 bg-warmscale-85 flex items-center justify-center">
            <span className="text-gray-400 font-bold text-[9px] md:text-sm tracking-[0.2em] whitespace-nowrap">
              FINAL
            </span>
          </div>

          {/* Red Team */}
          <div className="flex-1 bg-[#B8383B] px-2 py-3 md:px-8 md:py-5 flex flex-col md:flex-row items-center justify-center md:justify-between border-b-4 border-[#8B2C2E] gap-1 md:gap-0">
            <span className="text-3xl md:text-7xl font-bold text-white tabular-nums order-2 md:order-1">
              {redScore}
            </span>
            <div className="flex items-center gap-2 md:gap-4 order-1 md:order-2">
              <div className="flex flex-col items-end">
                <span className="text-base md:text-3xl font-bold text-white tracking-wider">RED</span>
                {isRedWinner && (
                  <span className="text-[9px] md:text-xs font-bold text-yellow-300 tracking-wide">WINNER</span>
                )}
              </div>
              <div className="hidden md:flex w-12 h-12 rounded-full border-4 border-white/40 items-center justify-center">
                <div className="w-6 h-6 bg-white/60 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-warmscale-85">
        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full bg-warmscale-7 border border-warmscale-6 text-lightscale-2 text-sm font-bold py-3 px-3 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="box-score">BOX SCORE</option>
            <option value="charts">CHARTS</option>
            <option value="play-by-play">PLAY-BY-PLAY</option>
          </select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex">
          <button
            onClick={() => setActiveTab('box-score')}
            className={`flex-1 py-5 text-sm font-bold tracking-wider uppercase transition-colors relative ${
              activeTab === 'box-score'
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            BOX SCORE
            {activeTab === 'box-score' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-5 text-sm font-bold tracking-wider uppercase transition-colors relative ${
              activeTab === 'charts'
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            CHARTS
            {activeTab === 'charts' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('play-by-play')}
            className={`flex-1 py-5 text-sm font-bold tracking-wider uppercase transition-colors relative ${
              activeTab === 'play-by-play'
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            PLAY-BY-PLAY
            {activeTab === 'play-by-play' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogHeader;
