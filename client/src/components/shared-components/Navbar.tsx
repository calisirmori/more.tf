import moretfWhiteLogo from "../../assets/moretf-white-medium.png";
import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import searchByUsername from "./searchUsername";






type SearchResult = {
  rows: Array<{ id64: string }>;
};

type SteamInfo = {
  response: {
    players: Array<{ steamid: string }>;
  };
};

type TimerType = ReturnType<typeof setTimeout> | null;

const Navbar = () => {
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timer, setTimer] = useState<any>(null);
  const [searchInternalData, setSearchInternalData] = useState<any>([]);
  const [searchSteamData, setSearchSteamData] = useState<any>(null);
  const [logsData, setLogsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileID, setProfileID] = useState<any>(null);

  // Function to toggle the menu's state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getCookies = () => {
    const cookies = document.cookie.split(';').reduce((cookieObject:any, cookieString) => {
      const [cookieName, cookieValue] = cookieString.trim().split('=');
      cookieObject[cookieName] = cookieValue;
      return cookieObject;
    }, {});
  
    setProfileID(cookies);
  };
  
  const loginButton = <div className="flex justify-center items-center">
  <a href="/api/myprofile">
    <div className="flex justify-center items-center border rounded-md h-8 px-3 border-warmscale-3 bg-warmscale-6 bg-opacity-20 hover:border-warmscale-2 hover:bg-opacity-60 hover:cursor-pointer duration-200">
      {profileID !== null && <svg height="18" viewBox="0 0 24 24" className="fill-lightscale-2 mr-2">
        <path d="M23.938 12c0 6.595-5.353 11.938-11.957 11.938A11.95 11.95 0 0 1 .476 15.254l4.583 1.892a3.382 3.382 0 0 0 6.696-.823l4.067-2.898a4.512 4.512 0 0 0 4.611-4.5 4.511 4.511 0 0 0-9.02 0v.057l-2.85 4.125a3.37 3.37 0 0 0-2.094.583L.062 11.042C.553 4.895 5.7.062 11.981.062 18.585.062 23.938 5.405 23.938 12zm-16.38 6.176l-1.469-.607a2.541 2.541 0 0 0 1.31 1.242 2.544 2.544 0 0 0 3.32-1.367 2.51 2.51 0 0 0 .005-1.94A2.53 2.53 0 0 0 7.48 14.1l1.516.625a1.862 1.862 0 0 1 1.006 2.44 1.87 1.87 0 0 1-2.445 1.012zm8.365-6.253c-1.656 0-3.004-1.348-3.004-2.999s1.348-2.999 3.004-2.999 3.004 1.348 3.004 3-1.343 2.998-3.004 2.998zm.005-.75a2.254 2.254 0 0 0 0-4.505 2.257 2.257 0 0 0-2.258 2.251 2.263 2.263 0 0 0 2.258 2.253z"></path>
      </svg>}
      <div className="text-lightscale-2 hover:text-lightscale-0 duration-200 font-semibold text-xs">{profileID !== null ? "LOGIN" : "PROFILE"}</div>
    </div>
  </a>
  </div>;

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
          setLogsData(logID);
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

  useEffect(() => {
    getCookies();
    return () => timer && clearTimeout(timer);
  }, [timer]);
  
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

  const searchBar = <div className="">
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
        {logsData !== null && <div>
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
      </div>
    </div>}
  </div>;

  return (
    <div className="relative h-28">
      <div className="bg-warmscale-9 px-3 top-0 font-cantarell w-full absolute z-50 drop-shadow-sm border-b border-warmscale-7/70">
      <div className="h-14 flex justify-between ">
        <div className="flex justify-center  items-center w-fit">
          <div className="md:hidden mr-2">
              <button
                onClick={toggleMenu} // Set the onClick handler
                className="p-2 rounded-md focus:outline-none focus:bg-warmscale-7/70"
                aria-label="Open menu"
              >
                {/* SVG for hamburger icon */}
                <svg
                  className="h-6 w-6 stroke-lightscale-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"

                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={`M4 6h16M4 12h${isMenuOpen ? '7' : '16'} m-7 6h7`}
                  />
                </svg>
              </button>
            </div>

            {/* This is the menu that gets toggled */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden`}>
              <div className="absolute w-screen h-[400px] bg-warmscale-82 top-0 left-0 py-2 px-3 drop-shadow border-b-2 border-warmscale-7/70">
              <button
                onClick={toggleMenu} // Set the onClick handler
                className="p-2 rounded-md focus:outline-none focus:bg-warmscale-7/70"
                aria-label="Open menu"
              >
                {/* SVG for hamburger icon */}
                <svg
                  className="h-6 w-6 stroke-lightscale-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"

                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={`M4 6h16M4 12h${isMenuOpen ? '7' : '16'} m-7 6h7`}
                  />
                </svg>
              </button>
                <div className="w-full flex justify-center">
                  <div className="mt-4">
                    {searchBar}
                  </div>
                </div>
                <div className="">
                  <div className=" text-lightscale-5 text-lg font-semibold  hover:text-lightscale-1 mt-10 duration-200 flex justify-center">
                    <a href="/season-16-summary" className="">SEASON SUMMARY</a>
                  </div>
                  <div className=" text-lightscale-5  text-lg  font-semibold  hover:text-lightscale-1 mt-6 duration-200 flex justify-center">
                    <a href="https://discord.gg/Zb5BEUy9Fb" target="_blank" className="">CONTACT</a>
                  </div>
                </div>
              </div>
            </div>
          <a className="flex hover:opacity-80 duration-200" href="/">
            <img
              className="object-contain h-9 max-md:h-8 max-md:mr-2 "
              src="/new-logo-big.png"
              alt="icon"
            />
            <img
              className="object-contain h-8 max-md:h-8 max-md:scale-0 max-md:w-0 md:ml-2"
              src={moretfWhiteLogo}
              alt="logo"
            />
          </a>
          <div className=" text-lightscale-5 text-sm font-semibold md:ml-20 max-md:ml-10 max-sm:ml-0 max-sm:scale-0 max-sm:w-0 hover:text-lightscale-1 duration-200">
            <a href="/season-16-summary" className="">SEASON SUMMARY</a>
          </div>
          <div className=" text-lightscale-5  text-sm  font-semibold md:ml-10 max-md:ml-5 max-sm:ml-0  max-sm:scale-0 max-sm:w-0 hover:text-lightscale-1 duration-200">
            <a href="https://discord.gg/Zb5BEUy9Fb" target="_blank" className="">CONTACT</a>
          </div>
        </div>
        
        <div className="flex justify-end gap-5 items-center">
          <div className="max-md:scale-0 max-md:w-0 ml-3">
            {searchBar}
          </div>
          {loginButton}
        </div>
      </div>
      </div>

    </div>
    // <div className="w-full  ">
    //   <div className="flex bg-warmscale-9 bg-opacity-60 px-4 pb-2 pt-2 flex-wrap justify-between w-full">
    //     <a className="flex items-center justify-center" href="/">
    //       <img className="object-contain ml-2 h-10 max-md:h-8" src="/new-logo-big.png" alt="icon"  />
    //       <img className="object-contain ml-2 mb-1 max-md:h-8" src={moretfWhiteLogo} alt="logo" />
    //     </a>
    //     {/* <div className="flex items-center pt-1">
    //       <input className="bg-grayscale-9 h-9 text-white border border-grayscale-4 rounded-l-sm w-96 duration-300 max-lg:w-72 max-md:w-40 max-sm:w-0 max-sm:border-0" type="text" />
    //       <button className="bg-grayscale-6 h-9 px-4 rounded-r-sm text-white font-medium">SEARCH</button>
    //     </div> */}
    //     <div className="flex text-white font-semibold text-2xl px-3 gap-8 pt-1.5 font-cantarell max-md:text-lg">
    //       <a href="/season-16-summary">S16 LIVE</a>
    //       <a href="/api/myprofile">Profile</a>
    //     </div>
    //   </div>
    //   <div className=" bg-gradient-to-b from-warmscale-9 to-transparent opacity-60 h-4  text-xs flex justify-center font-semibold font-cantarell"></div>
    // </div>
  );
};

export default Navbar;
