import React from 'react';

interface LogHeaderProps {
  logId: number;
  map: string;
  title: string;
  startTime: string;
  duration: number;
  blueScore: number;
  redScore: number;
  winner?: 'Red' | 'Blue';
  activeTab: 'box-score' | 'charts' | 'play-by-play';
  onTabChange: (tab: 'box-score' | 'charts' | 'play-by-play') => void;
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
  activeTab,
  onTabChange,
}) => {

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
    <div className="bg-warmscale-85 rounded-t-lg overflow-hidden p-2 md:p-0">
      {/* Title Section */}
      <div className="text-center py-2 md:py-3 md:px-4 mb-2 md:mb-0">
        <h1 className="text-xs md:text-base font-bold text-orange-500 tracking-wide mb-1 uppercase">
          {title || `LOG #${logId}: BLU VS RED`}
        </h1>
        <p className="text-gray-400 text-[10px] md:text-xs font-normal">
          {map.toUpperCase()} • {formatDateTime(startTime)} • {formatDuration(duration)}
        </p>
      </div>

      {/* Score Section */}
      <div className="mb-2 md:px-4 md:pb-3 md:mb-0">
        <div className="flex items-stretch rounded overflow-hidden">
          {/* Blue Team */}
          <div className="flex-1 bg-tf-blue px-2 py-2 md:px-6 md:py-3 flex flex-col md:flex-row items-center justify-center md:justify-between border-b-2 border-[#3D5A6E] gap-1 md:gap-0">
            <div className="flex items-center gap-1 md:gap-3">
              <div className="hidden md:flex w-8 h-8 rounded-full border-2 border-white/40 items-center justify-center">
                <div className="w-4 h-4 bg-white/60 rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-xl font-bold text-white tracking-wider">BLU</span>
                {isBlueWinner && (
                  <span className="text-[8px] md:text-[10px] font-bold text-yellow-300 tracking-wide">WINNER</span>
                )}
              </div>
            </div>
            <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">
              {blueScore}
            </span>
          </div>

          {/* FINAL Label */}
          <div className="px-2 py-2 md:px-6 md:py-3 bg-warmscale-85 flex items-center justify-center">
            <span className="text-gray-400 font-bold text-[8px] md:text-xs tracking-[0.2em] whitespace-nowrap">
              FINAL
            </span>
          </div>

          {/* Red Team */}
          <div className="flex-1 bg-tf-red px-2 py-2 md:px-6 md:py-3 flex flex-col md:flex-row items-center justify-center md:justify-between border-b-2 border-[#8B2C2E] gap-1 md:gap-0">
            <span className="text-2xl md:text-4xl font-bold text-white tabular-nums order-2 md:order-1">
              {redScore}
            </span>
            <div className="flex items-center gap-1 md:gap-3 order-1 md:order-2">
              <div className="flex flex-col items-end">
                <span className="text-sm md:text-xl font-bold text-white tracking-wider">RED</span>
                {isRedWinner && (
                  <span className="text-[8px] md:text-[10px] font-bold text-yellow-300 tracking-wide">WINNER</span>
                )}
              </div>
              <div className="hidden md:flex w-8 h-8 rounded-full border-2 border-white/40 items-center justify-center">
                <div className="w-4 h-4 bg-white/60 rounded-full"></div>
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
            onChange={(e) => onTabChange(e.target.value as TabType)}
            className="w-full bg-warmscale-7 border border-warmscale-6 text-lightscale-2 text-xs font-bold py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="box-score">BOX SCORE</option>
            <option value="charts">CHARTS</option>
            <option value="play-by-play">PLAY-BY-PLAY</option>
          </select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex">
          <button
            onClick={() => onTabChange('box-score')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors relative ${
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
            onClick={() => onTabChange('charts')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors relative ${
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
            onClick={() => onTabChange('play-by-play')}
            className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-colors relative ${
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
