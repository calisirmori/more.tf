import { fetch, FetchResultTypes } from '@sapphire/fetch';
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Player {
  id64: string;
  name: string;
  avatar: string;
}

interface LogData {
  logid: number;
  title: string;
  map: string;
  date: number;
}

interface SearchResponse {
  rows: Player[];
}

interface LogResponse {
  rows: LogData[];
}

interface TimeAgoProps {
  date: number;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ date }) => {
  const dateFromData = new Date(date * 1000);
  const now = new Date();
  const timeDiff = now.getTime() - dateFromData.getTime();

  const diffInMinutes = Math.floor(timeDiff / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  let timeAgo: string;
  if (diffInDays >= 1) {
    timeAgo = new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }).format(dateFromData);
  } else if (diffInHours >= 1) {
    timeAgo = `${diffInHours}hr${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  return <div className="text-lightscale-4 text-xs">date: {timeAgo}</div>;
};

const SearchBox: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [logData, setLogData] = useState<LogData | number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract log ID from search input
  const extractLogId = (input: string): string | null => {
    const parts = input.split('#');
    const match = parts[0].match(/\b\d+\b/);
    return match ? match[0] : null;
  };

  // Perform search
  const performSearch = useCallback(async (input: string): Promise<void> => {
    const trimmedInput = input.trim().toLowerCase();

    // Clear results if input is too short
    if (trimmedInput.length <= 2) {
      setPlayers([]);
      setLogData(null);
      return;
    }

    setIsLoading(true);

    try {
      // Check if input is a log ID
      const logId = extractLogId(trimmedInput);

      if (logId && logId.length > 4 && logId.length <= 7) {
        const response = (await fetch(
          `/api/log-search/${logId}`,
          FetchResultTypes.JSON
        )) as LogResponse;

        if (response?.rows?.length > 0) {
          setLogData(response.rows[0]);
          setPlayers([]);
        } else {
          setLogData(parseInt(logId));
          setPlayers([]);
        }
        return;
      }

      // Search for players by username
      const response = (await fetch(
        `/api/username-search/${trimmedInput}`,
        FetchResultTypes.JSON
      )) as SearchResponse;

      if (response?.rows?.length > 0) {
        setPlayers(response.rows);
        setLogData(null);
      } else {
        setPlayers([]);
        setLogData(null);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setPlayers([]);
      setLogData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(newSearchTerm);
    }, 500);
  };

  // Handle Enter key press
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === 'Enter') {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      performSearch(searchTerm);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setPlayers([]);
        setLogData(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const hasResults = players.length > 0 || logData !== null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="flex justify-center border rounded-md border-warmscale-6 bg-warmscale-6 bg-opacity-20 focus-within:bg-opacity-30 focus-within:border-warmscale-5 duration-200">
        <div className="flex justify-center items-center mx-2">
          {!isLoading ? (
            <div className="h-4 w-4">
              <svg height="18" viewBox="0 0 24 24" className="fill-warmscale-4">
                <path d="M23.785 21.937L18.12 16.27a.554.554 0 0 0-.397-.163h-.616a9.683 9.683 0 0 0 2.362-6.348c0-5.363-4.346-9.709-9.71-9.709S.05 4.396.05 9.759s4.346 9.709 9.709 9.709a9.683 9.683 0 0 0 6.348-2.362v.616c0 .15.06.29.163.397l5.667 5.666c.22.22.574.22.794 0l1.054-1.054a.56.56 0 0 0 0-.794zM9.76 17.227c-4.126 0-7.468-3.342-7.468-7.468S5.633 2.29 9.759 2.29s7.468 3.342 7.468 7.468-3.342 7.468-7.468 7.468z" />
              </svg>
            </div>
          ) : (
            <div
              className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-warmscale-4 rounded-full"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          className="form-input py-2 h-8 w-60 bg-warmscale-6 bg-opacity-0 pl-1 outline-none text-sm font-cantarell focus:text-lightscale-3 text-lightscale-4 font-semibold placeholder-warmscale-2"
        />
        <div className="flex justify-center items-center text-warmscale-4 pr-4 text-xl select-none mb-1">
          <div>/</div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {hasResults && (
        <div className="absolute z-50 left-1 mt-1 max-h-96 w-72 backdrop-blur-md bg-warmscale-82/80 border border-warmscale-8/80 rounded-sm drop-shadow-lg p-2 font-cantarell">
          {/* Player Results */}
          {players.length > 0 && (
            <div>
              <div className="text-sm text-lightscale-4 font-semibold pl-2 mt-1">
                Players
              </div>
              <div className="h-[1px] w-full bg-warmscale-7/70 my-1.5" />
              <div>
                {players.map((player, index) => (
                  <div
                    className="p-2 hover:bg-warmscale-5/30 rounded-sm"
                    key={`${player.id64}-${index}`}
                  >
                    <a href={`/profile/${player.id64}`}>
                      <div className="flex items-center">
                        <img
                          src={`https://avatars.cloudflare.steamstatic.com/${player.avatar}_medium.jpg`}
                          alt={player.name}
                          className="h-8 rounded-sm"
                        />
                        <div className="text-lightscale-2 font-semibold ml-3 w-52 truncate">
                          {player.name}
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Results */}
          {logData !== null && (
            <div>
              <div className="text-sm text-lightscale-4 font-semibold pl-2 mt-1">
                Logs
              </div>
              <div className="h-[1px] w-full bg-warmscale-7/70 my-1.5" />

              {typeof logData === 'object' && logData.logid !== undefined ? (
                <a
                  href={`/log/${logData.logid}`}
                  className="flex hover:bg-warmscale-5/30 rounded-sm p-2"
                >
                  <div className="w-full">
                    <div className="text-lightscale-2 text-sm font-semibold w-48 truncate">
                      {logData.title}
                    </div>
                    <div className="text-lightscale-4 text-xs">
                      map: {logData.map}
                    </div>
                    <TimeAgo date={logData.date} />
                  </div>
                </a>
              ) : (
                <a
                  href={`/log/${logData}`}
                  className="flex hover:bg-warmscale-5/30 rounded-sm p-2"
                >
                  <div className="w-full">
                    <div className="text-lightscale-2 text-sm font-semibold w-48 truncate">
                      {`# ${logData}`}
                    </div>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
