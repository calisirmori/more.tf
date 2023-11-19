import { fetch, FetchResultTypes } from "@sapphire/fetch";
import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';

type SearchResult = {
  rows: Array<{ id64: string }>;
};

type SteamInfo = {
  response: {
    players: Array<{ steamid: string }>;
  };
};

const SearchBox = () => {
    
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timer, setTimer] = useState<any>(null);
  const [searchInternalData, setSearchInternalData] = useState<any>([]);
  const [searchSteamData, setSearchSteamData] = useState<any>(null);
  const [logsData, setLogsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {

    return () => timer && clearTimeout(timer);
  }, [timer]);

  const handleSearch = async (term: string): Promise<void> => {
    const result = await searchByUsername(term);

  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    clearTimeout(timer);
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setTimer(setTimeout(() => handleSearch(newSearchTerm), 1000));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      clearTimeout(timer);
      handleSearch(searchTerm);
    }
  };

  function extractLogId(inputValue:any) {
    const parts = inputValue.split('#');
    const match = parts[0].match(/\b\d+\b/); // This will match the first numerical value
    return match ? match[0] : null; // Return the match if it exists
  }

  function TimeAgo({ date }:any) {
    // Calculate the time difference in milliseconds
    const dateFromData:any = new Date(date*1000);
    const now:any = new Date();
    const timeDiff:any = now - dateFromData;
  
    // Convert time difference to different units
    const diffInMinutes = Math.floor(timeDiff / 60000); // 60*1000
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
  
    // Format the output based on the time difference
    let timeAgo;
    if (diffInDays >= 1) {
      // If the date is more than or equal to a day ago, format it as MM/DD/YYYY
      timeAgo = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }).format(dateFromData);
    } else if (diffInHours >= 1) {
      // If the date is less than a day but more than or equal to an hour ago, show hours ago
      timeAgo = `${diffInHours}hr${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      // If the date is less than an hour ago, show minutes ago
      timeAgo = `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
    }
  
    return <div className="text-lightscale-4 text-xs">date: {timeAgo}</div>;
  }

  const searchByUsername = async (input: string): Promise<Record<string, unknown> | string | null> => {

    input = input.toLocaleLowerCase();

    if (input.length <= 2) {
      setSearchInternalData(null);
      setSearchSteamData(null);
      return "Search term is too short";
    }
    setIsLoading(true); // Set loading to true when the search starts

    const logID = await extractLogId(input);

    if (logID !== null && logID.length > 4 && logID.length <= 7) {
      const response: any = await fetch(
        `/api/log-search/${logID}`,
        FetchResultTypes.JSON
        );
        if (!response || !response.rows || response.rows.length === 0) {
          console.log(logID)
          setLogsData( parseInt(logID) );
          return null;
        }
        setSearchInternalData(null);
        setSearchSteamData(null);
        setLogsData(response.rows[0]);
    }

    try {
      const response: any = await fetch(
        `/api/username-search/${input}`,
        FetchResultTypes.JSON
      );

      if (!response || !response.rows || response.rows.length === 0) {
        setSearchInternalData(null);
        setSearchSteamData(null);
        return null;
      }

      setSearchInternalData(response.rows);
      setLogsData(null);

      const steamIds = response.rows.map((row:any) => row.id64);
      const steamInfo: SteamInfo = await fetch(
        `/api/steam-info?ids=${steamIds.join(',')}`,
        FetchResultTypes.JSON
      );

      const finalObject = steamInfo.response.players.reduce((obj:any, player:any) => {
        obj[player.steamid] = player;
        return obj;
      }, {});

      setSearchSteamData(finalObject);
      return finalObject;

    } catch (error) {
      console.error('Search failed:', error);
      return null;

    } finally {
      setIsLoading(false); // Set loading to false when the search is complete
    }
  };


  return (
    <div className="">
    <div className="flex justify-center border rounded-md border-warmscale-6 bg-warmscale-6 bg-opacity-20 focus-within:bg-opacity-30 focus-within:border-warmscale-5 duration-200">
      <div className="flex justify-center items-center mx-2">
        {!isLoading && <div className="h-4 w-4">
          <svg height="18" viewBox="0 0 24 24" className=" fill-warmscale-4"><path d="M23.785 21.937L18.12 16.27a.554.554 0 0 0-.397-.163h-.616a9.683 9.683 0 0 0 2.362-6.348c0-5.363-4.346-9.709-9.71-9.709S.05 4.396.05 9.759s4.346 9.709 9.709 9.709a9.683 9.683 0 0 0 6.348-2.362v.616c0 .15.06.29.163.397l5.667 5.666c.22.22.574.22.794 0l1.054-1.054a.56.56 0 0 0 0-.794zM9.76 17.227c-4.126 0-7.468-3.342-7.468-7.468S5.633 2.29 9.759 2.29s7.468 3.342 7.468 7.468-3.342 7.468-7.468 7.468z"></path>
          </svg>
        </div>}
        {isLoading && <div className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-warmscale-4 rounded-full " role="status" aria-label="loading">
          <span className="sr-only">Loading...</span>
        </div>}
      </div>
      <div className=''>
        <input
          type='text'
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder='Search'
          className='form-input py-2 h-8 w-60 bg-warmscale-6 bg-opacity-0 pl-1 outline-none text-sm font-cantarell focus:text-lightscale-3 text-lightscale-4 font-semibold placeholder-warmscale-2' />
      </div>
      <div className="flex justify-center items-center text-warmscale-4 pr-4 text-xl select-none mb-1">
        <div>/</div>
      </div>
    </div>
    {(logsData !== null || searchSteamData !== null) && <div className="relative font-cantarell">
      <div className="absolute z-50 left-1 mt-1 max-h-96 w-72 backdrop-blur-md bg-warmscale-82/80 border border-warmscale-8/80 rounded-sm drop-shadow-lg p-2">
        {searchSteamData !== null && <div>
          <div className="text-sm text-lightscale-4 font-semibold pl-2 mt-1">Players</div>
          <div className="h-[1px] w-full bg-warmscale-7/70 my-1.5"></div>
          <div>
            {searchSteamData !== null && searchInternalData.map((player: any, index: any) => {
              if (searchSteamData[player.id64] !== undefined) {
                return (<div className="p-2 hover:bg-warmscale-5/30 rounded-sm" key={index}>
                  <a href={`/profile/${player.id64}`}>
                    <div className="flex items-center">
                      <img src={searchSteamData[player.id64].avatarfull} alt="" className=" h-8 rounded-sm" />
                      <div className="text-lightscale-2 font-semibold ml-3 w-52 truncate">{searchSteamData[player.id64].personaname}</div>
                    </div>
                  </a>
                </div>);
              }
            })}
          </div>
        </div>}
        {!Number.isInteger(logsData) && logsData !== null && <div>
          <div className="text-sm text-lightscale-4 font-semibold pl-2 mt-1">Logs</div>
          <div className="h-[1px] w-full bg-warmscale-7/70 my-1.5"></div>
          {logsData.logid !== undefined && <a href={`/log/${logsData.logid}`} className="flex hover:bg-warmscale-5/30 rounded-sm p-2">
            <div className="w-full">
              <div className="text-lightscale-2 text-sm font-semibold w-48 truncate">{logsData.title}</div>
              <div className="text-lightscale-4 text-xs">map: {logsData.map}</div>
              <TimeAgo date={logsData.date} />
            </div>
          </a>}
          <div></div>
        </div>}
        {Number.isInteger(logsData) && logsData !== null && <div>
          <a href={`/log/${logsData}`} className="flex hover:bg-warmscale-5/30 rounded-sm p-2">
            <div className="w-full">
              <div className="text-lightscale-2 text-sm font-semibold w-48 truncate"># {logsData}</div>
            </div>
          </a>
          <div></div>
        </div>}
      </div>
    </div>}
  </div>
  )
};

export default SearchBox;