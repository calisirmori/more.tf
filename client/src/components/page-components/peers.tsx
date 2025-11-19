import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import Navbar from '../shared-components/Navbar';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import Footer from '../shared-components/Footer';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { classList } from '../ClassNames';

type SortField =
  | 'teamate_count'
  | 'enemy_count'
  | 'winrate_with'
  | 'winrate_against';

const Peers = () => {
  const id = window.location.href;
  const idArray = id.split('/');
  const playerId = idArray[4];

  const [mapInput, setMapInput] = useState<any>('none');
  const [mapSearched, setMapSearched] = useState<any>('none');
  const [formatSearched, setFormatSearched] = useState<any>('none');
  const [classSearched, setClassSearched] = useState<any>('none');
  const [playerSteamInfo, setPlayerSteamInfo] = useState<any>({});
  const [peers, setPeers] = useState<any>([]);
  const [sortField, setSortField] = useState<SortField>('teamate_count');
  const [sortOrder, setSortOrder] = useState<any>(true);
  const [maxMatchesWith, setMaxMatchesWith] = useState<number>(0);
  const [maxMatchesAgainst, setMaxMatchesAgainst] = useState<number>(0);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [shouldSort, setShouldSort] = useState(false);
  const [displayCount, setDisplayCount] = useState(100);
  const [searchedPlayer, setSearchedPlayer] = useState<any>([]);
  const [seachOpen, setSearchOpen] = useState(true);

  const formatNames: any = {
    none: 'Any',
    HL: 'Highlander',
    '6s': 'Sixes',
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (mapInput.length > 2) {
        setMapSearched(mapInput.toLowerCase());
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [mapInput]);

  if (playerSteamInfo.avatarfull === undefined) {
    steamInfoCallProfile();
  }

  useEffect(() => {
    peersCall();
    sortPeers();
  }, [classSearched, dates, formatSearched, mapSearched]);

  useEffect(() => {
    sortPeers();
    setShouldSort(false);
  }, [sortField, sortOrder, shouldSort]);

  function header(
    setSortField: React.Dispatch<React.SetStateAction<SortField>>,
    sortField: string,
    sortVariable: any,
    name: string
  ) {
    return (
      <th
        onClick={() => {
          setSortField(sortVariable);
          if (sortField === sortVariable) {
            setSortOrder(!sortOrder);
          } else {
            setSortOrder(true);
          }
          setShouldSort(true);
        }}
        className="px-6 py-3 h-12 border-b  border-warmscale-6/40 text-left leading-4 text-lightscale-5 tracking-wider hover:text-lightscale-2 hover:cursor-pointer duration-200 group"
        style={{ width: '16%' }}
      >
        <div className="flex items-center">
          <div>{name}</div>
          {sortField !== sortVariable && (
            <svg
              fill="none"
              strokeWidth={3}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-4 mt-0.5 ml-0.5 stroke-warmscale-2 group-hover:stroke-lightscale-6 duration-200 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          )}
          {sortField === sortVariable && sortOrder && (
            <svg
              fill="none"
              strokeWidth={3}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-4 mt-0.5 ml-0.5 stroke-tf-orange w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3"
              />
            </svg>
          )}
          {sortField === sortVariable && !sortOrder && (
            <svg
              fill="none"
              strokeWidth={3}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-4 mt-0.5 ml-0.5 stroke-tf-orange w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18"
              />
            </svg>
          )}
        </div>
      </th>
    );
  }

  async function steamInfoCallProfile() {
    let response: any = {};
    try {
      response = await fetch(
        `/api/steam-info?ids=${playerId}`,
        FetchResultTypes.JSON
      );
      setPlayerSteamInfo(response.response.players[0]);
    } catch (error) {
      console.log(error);
      console.log(response);
      response.personaname = 'Steam Error';
      response.avatarfull = 'Steam Error';
      setPlayerSteamInfo(response);
    }
  }

  async function peersCall() {
    const startDateEpoch: any = dates.startDate
      ? new Date(dates.startDate).getTime()
      : null;
    const endDateEpoch: any = dates.endDate
      ? new Date(dates.endDate).getTime()
      : null;
    const playerClass = classSearched;
    const map = mapSearched;
    const startDate = Math.round(startDateEpoch / 1000);
    const endDate = Math.round(endDateEpoch / 1000);
    const format = formatSearched;

    const url = `/api/peers-page/${playerId}?class=${encodeURIComponent(
      playerClass
    )}&map=${encodeURIComponent(
      map
    )}&startDate=${startDate}&endDate=${endDate}&format=${encodeURIComponent(
      format
    )}`;

    try {
      const response: any = await fetch(url, FetchResultTypes.JSON);
      const peersData = response.rows;

      // Calculate the maximum matches with and against
      const maxWith = Math.max(
        ...peersData
          .filter((peer: any) => peer.teamate_count != null)
          .map((peer: any) => parseInt(peer.teamate_count))
      );

      const maxAgainst = Math.max(
        ...peersData
          .filter((peer: any) => peer.enemy_count != null)
          .map((peer: any) => parseInt(peer.enemy_count))
      );
      setMaxMatchesWith(maxWith);
      setMaxMatchesAgainst(maxAgainst);

      setPeers(peersData);
      setShouldSort(true);
    } catch (error) {
      console.error('Error fetching peers:', error);
    }
  }

  const sortPeers = () => {
    const sortedPeers = [...peers].sort((a, b) => {
      // Parse the counts as integers, default to 0 if null or non-numeric
      const valueA = parseInt(a[sortField]) || 0;
      const valueB = parseInt(b[sortField]) || 0;

      // Adjust the sorting order based on the sortOrder value
      if (sortOrder === true) {
        return valueB - valueA; // Descending order
      } else {
        return valueA - valueB; // Ascending order
      }
    });
    setPeers(sortedPeers);
  };

  const handleDateChange = (e: any) => {
    const newDates = { ...dates, [e.target.name]: e.target.value };
    setDates(newDates);
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timer, setTimer] = useState<any>(null);
  const [searchInternalData, setSearchInternalData] = useState<any>([]);
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

  const searchByUsername = async (input: string) => {
    input = input.toLocaleLowerCase();

    if (input.length <= 2) {
      setSearchInternalData(null);
      return 'Search term is too short';
    }
    setIsLoading(true); // Set loading to true when the search starts

    try {
      const response: any = await fetch(
        `/api/username-search/${input}`,
        FetchResultTypes.JSON
      );
      if (!response || !response.rows || response.rows.length === 0) {
        setSearchInternalData(null);
        return null;
      }

      setSearchInternalData(response.rows);
      setLogsData(null);
    } catch (error) {
      console.error('Search failed:', error);
      return null;
    } finally {
      setSearchOpen(true);
      setIsLoading(false); // Set loading to false when the search is complete
    }
  };

  const popoutRef: any = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event: any) {
      if (popoutRef.current && !popoutRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoutRef]);

  useEffect(() => {}, [searchedPlayer]);

  return (
    <div className=" bg-warmscale-7 min-h-screen" data-testid="peers-container">
      <Navbar />
      <div className="flex flex-col">
        <div className="relative w-full h-fit flex-grow">
          <div className="flex justify-center w-full items-center bg-warmscale-8 py-8">
            <div className="w-[76rem] justify-between px-2 md:flex">
              <div className="flex items-center max-md:justify-center ">
                <img
                  src={playerSteamInfo.avatarfull}
                  alt=""
                  className="rounded-md sm:h-24 max-sm:h-16"
                />
                <div className="ml-5 mb-3  font-cantarell ">
                  <a
                    href={`/profile/${playerId}`}
                    className="text-lightscale-2 font-bold sm:text-5xl max-sm:text-3xl hover:underline"
                  >
                    {playerSteamInfo.personaname}{' '}
                  </a>
                </div>
              </div>
              <div
                id="links"
                className="flex gap-2 items-center max-md:justify-center max-md:mt-3 "
              >
                <a
                  target="_blank"
                  href={`https://steamcommunity.com/profiles/${playerId}`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
                  rel="noreferrer"
                >
                  Steam
                </a>
                <a
                  target="_blank"
                  href={`https://demos.tf/profiles/${playerId}`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
                  rel="noreferrer"
                >
                  demos.tf
                </a>
                <a
                  target="_blank"
                  href={`https://etf2l.org/search/${playerId}/`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow text-lightscale-2 font-bold font-cantarell"
                  rel="noreferrer"
                >
                  <img
                    src="../../../site icons/etf2l.webp"
                    alt=""
                    className="h-8"
                  />
                </a>
                <a
                  target="_blank"
                  href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${playerId}&r=24`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
                  rel="noreferrer"
                >
                  <img
                    src="../../../site icons/rgl.png"
                    alt=""
                    className="h-7"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="w-full mt-4 flex justify-center items-center">
            <div>
              <div className="mb-4 flex flex-wrap justify-center gap-4 max-w-[90vw]">
                <div>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <div>
                      <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-1 pl-1">
                        Start Date
                      </div>
                      <input
                        type="date"
                        name="startDate"
                        value={dates.startDate}
                        onChange={handleDateChange}
                        className="px-4 py-1 border rounded-md font-cantarell font-semibold border-warmscale-85 hover:bg-warmscale-5 bg-warmscale-85 hover:cursor-pointer hover:border-tf-orange  focus:outline-tf-orange focus:border-0 outline-none text-lightscale-3 "
                        placeholder="Start Date"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-1 pl-1">
                        End Date
                      </div>
                      <input
                        type="date"
                        name="endDate"
                        value={dates.endDate}
                        onChange={handleDateChange}
                        className="px-4 py-1 border rounded-md font-cantarell border-warmscale-85 bg-warmscale-85 hover:bg-warmscale-5 hover:cursor-pointer hover:border-tf-orange font-semibold focus:outline-tf-orange focus:border-0 outline-none text-lightscale-3 "
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-0.5 pl-1">
                    Format
                  </div>
                  <Menu
                    as="div"
                    id="format-search"
                    className="relative inline-block text-left font-cantarell"
                  >
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-warmscale-85 px-3 py-2 text-sm font-semibold text-lightscale-2 shadow-sm ring-1 ring-inset ring-warmscale-82 hover:bg-warmscale-82">
                        {formatNames[formatSearched]}
                        <ChevronDownIcon
                          className="-mr-1 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-warmscale-85 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {selectOptions(
                            setFormatSearched,
                            'Any (Default)',
                            'none'
                          )}
                          {selectOptions(setFormatSearched, 'Highlander', 'HL')}
                          {selectOptions(setFormatSearched, 'Sixes', '6s')}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div>
                  <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-0.5 pl-1">
                    Class
                  </div>
                  <Menu
                    as="div"
                    id="class-search"
                    className="relative inline-block text-left font-cantarell"
                  >
                    <div>
                      <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-warmscale-85 px-3 py-2 text-sm font-semibold text-lightscale-2 shadow-sm ring-1 ring-inset ring-warmscale-82 hover:bg-warmscale-82">
                        {classSearched !== 'none'
                          ? classList[classSearched].name
                          : 'Any'}
                        <ChevronDownIcon
                          className="-mr-1 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-warmscale-85 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {selectOptions(
                            setClassSearched,
                            'Any Class (Default)',
                            'none'
                          )}
                          {selectOptions(setClassSearched, 'Scout', 'scout')}
                          {selectOptions(
                            setClassSearched,
                            'Soldier',
                            'soldier'
                          )}
                          {selectOptions(setClassSearched, 'Pyro', 'pyro')}
                          {selectOptions(
                            setClassSearched,
                            'Demoman',
                            'demoman'
                          )}
                          {selectOptions(
                            setClassSearched,
                            'Heavy',
                            'heavyweapons'
                          )}
                          {selectOptions(
                            setClassSearched,
                            'Engineer',
                            'engineer'
                          )}
                          {selectOptions(setClassSearched, 'Medic', 'medic')}
                          {selectOptions(setClassSearched, 'Sniper', 'sniper')}
                          {selectOptions(setClassSearched, 'Spy', 'spy')}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div>
                  <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-0.5 pl-1">
                    Map
                  </div>
                  <input
                    value={mapInput === 'none' ? '' : mapInput}
                    onChange={(e) => {
                      setMapInput(
                        e.target.value.length === 0 ? 'none' : e.target.value
                      );
                    }}
                    type="text"
                    className="rounded-sm bg-warmscale-85 ring-1 ring-warmscale-82 h-8 mt-0.5 text-lightscale-2 pl-2 font-semibold font-cantarell focus:outline-none"
                  />
                </div>
                <div className="max-w-full">
                  <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-0.5 pl-1">
                    Friend Search
                  </div>
                  <div className="flex justify-center border rounded-md border-warmscale-85 bg-warmscale-85 focus-within:border-warmscale-9 duration-200">
                    <div className="flex justify-center items-center mx-2">
                      {!isLoading && (
                        <div className="h-4 w-4">
                          <svg
                            height="18"
                            viewBox="0 0 24 24"
                            className=" fill-warmscale-4"
                          >
                            <path d="M23.785 21.937L18.12 16.27a.554.554 0 0 0-.397-.163h-.616a9.683 9.683 0 0 0 2.362-6.348c0-5.363-4.346-9.709-9.71-9.709S.05 4.396.05 9.759s4.346 9.709 9.709 9.709a9.683 9.683 0 0 0 6.348-2.362v.616c0 .15.06.29.163.397l5.667 5.666c.22.22.574.22.794 0l1.054-1.054a.56.56 0 0 0 0-.794zM9.76 17.227c-4.126 0-7.468-3.342-7.468-7.468S5.633 2.29 9.759 2.29s7.468 3.342 7.468 7.468-3.342 7.468-7.468 7.468z"></path>
                          </svg>
                        </div>
                      )}
                      {isLoading && (
                        <div
                          className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-warmscale-4 rounded-full "
                          role="status"
                          aria-label="loading"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      )}
                    </div>
                    <div
                      className=""
                      onClick={() => {
                        setSearchOpen(true);
                      }}
                    >
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Search"
                        className="form-input py-2 h-8 sm:w-60 max-w-full bg-warmscale-6 bg-opacity-0 pl-1 outline-none text-sm font-cantarell focus:text-lightscale-3 text-lightscale-4 font-semibold placeholder-warmscale-2"
                      />
                    </div>
                    <div className="flex justify-center items-center text-warmscale-4 pr-4 text-xl select-none mb-1">
                      <div>/</div>
                    </div>
                  </div>
                  {(logsData !== null ||
                    (searchInternalData !== null &&
                      searchInternalData.length !== 0)) &&
                    seachOpen && (
                      <div ref={popoutRef} className="relative font-cantarell">
                        <div className="absolute z-50 left-1 mt-1 max-h-96 w-72 backdrop-blur-md bg-warmscale-82/80 border border-warmscale-8/80 rounded-sm drop-shadow-lg p-2">
                          {searchInternalData !== null && (
                            <div>
                              <div className="text-sm text-lightscale-4 font-semibold pl-2 mt-1">
                                Players
                              </div>
                              <div className="h-[1px] w-full bg-warmscale-7/70 my-1.5"></div>
                              <div>
                                {searchInternalData.map(
                                  (player: any, index: any) => {
                                    return (
                                      <div
                                        className="p-2 hover:bg-warmscale-5/30 rounded-sm"
                                        key={index}
                                      >
                                        <div
                                          onClick={() => {
                                            setSearchedPlayer(player);
                                            setSearchOpen(false);
                                          }}
                                        >
                                          <div className="flex items-center">
                                            <img
                                              src={`https://avatars.cloudflare.steamstatic.com/${player.avatar}_medium.jpg`}
                                              alt=""
                                              className=" h-8 rounded-sm"
                                            />
                                            <div className="text-lightscale-2 font-semibold ml-3 w-52 truncate cursor-default">
                                              {player.name}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  {searchedPlayer.id64 !== undefined && (
                    <div className="flex items-center border border-warmscale-82 bg-warmscale-85/70 mt-2 w-fit py-1.5 px-3 rounded-md">
                      <img
                        src={`https://avatars.cloudflare.steamstatic.com/${searchedPlayer.avatar}_medium.jpg`}
                        alt=""
                        className=" h-5 rounded-sm"
                      />
                      <div className="text-lightscale-2 font-semibold ml-2 truncate cursor-default text-sm">
                        {searchedPlayer.name}
                      </div>
                      <svg
                        fill="none"
                        onClick={() => {
                          setSearchedPlayer([]);
                        }}
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="h-4 stroke-warmscale-2 hover:stroke-lightscale-2 cursor-pointer ml-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div className=" max-w-[90vw] overflow-x-auto ">
                <table className=" bg-warmscale-8 rounded-t-md ">
                  <thead>
                    <tr className="font-cantarell">
                      <th
                        className="px-6 py-3 lg:min-w-[245px]  border-b border-warmscale-6/40 text-left leading-4 text-lightscale-5 tracking-wider"
                        style={{ width: '15%' }}
                      >
                        Player
                      </th>
                      {header(
                        setSortField,
                        sortField,
                        'teamate_count',
                        'Matches With'
                      )}
                      <th
                        className="px-6 py-3 h-12 min-w-[130px] border-b border-warmscale-6/40 text-left leading-4 text-lightscale-5 tracking-wider"
                        style={{ width: '15%' }}
                      >
                        Win Rate
                      </th>
                      {header(
                        setSortField,
                        sortField,
                        'enemy_count',
                        'Matches Against'
                      )}
                      <th
                        className="px-6 py-3 h-12 border-b min-w-[130px] border-warmscale-6/40 text-left leading-4 text-lightscale-5 tracking-wider"
                        style={{ width: '15%' }}
                      >
                        Win Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-lightscale-5 overflow-scroll font-semibold font-cantarell bg-warmscale-85">
                    {peers.map((peer: any, index: any) => {
                      const isTheSearchedPlayer =
                        searchedPlayer.id64 !== undefined
                          ? searchedPlayer.id64 === peer.peer_id64
                            ? true
                            : false
                          : true;
                      if (index <= displayCount && isTheSearchedPlayer) {
                        const teamMateWins =
                          peer.teamate_wins !== null ? peer.teamate_wins : 0;
                        const teamMateMatches =
                          peer.teamate_count !== null ? peer.teamate_count : 0;
                        const currentPercent =
                          Math.round((teamMateWins / teamMateMatches) * 1000) /
                          10;
                        const teamMateWinRate = Number.isFinite(currentPercent)
                          ? currentPercent
                          : 0;

                        const enemyWins =
                          peer.enemy_wins !== null ? peer.enemy_wins : 0;
                        const enemyMatches =
                          peer.enemy_count !== null ? peer.enemy_count : 0;
                        const enemycurrentPercent =
                          Math.round((enemyWins / enemyMatches) * 1000) / 10;
                        const enemyWinRate = Number.isFinite(
                          enemycurrentPercent
                        )
                          ? enemycurrentPercent
                          : 0;
                        return (
                          <tr
                            className=" text-sm font-semibold text-end"
                            key={index}
                          >
                            <td className="px-6 py-2 border-b border-warmscale-7/50 flex items-center  ">
                              <div>
                                <img
                                  src={`https://avatars.cloudflare.steamstatic.com/${peer.avatar}.jpg`}
                                  alt=""
                                  className="h-8 min-w-[2rem] mr-2 "
                                />
                              </div>
                              <a
                                href={`/profile/${peer.peer_id64}`}
                                className="text-md hover:underline hover:text-tf-orange"
                              >
                                {peer.name}
                              </a>
                            </td>
                            <td className="pr-3  border-b border-warmscale-7/50 border-l ">
                              <div className="flex items-center">
                                <div className="min-w-[40px]">
                                  {teamMateMatches}
                                </div>
                                <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7">
                                  <div
                                    className="bg-tf-orange h-2 rounded-sm"
                                    style={{
                                      width: `${
                                        (teamMateMatches / maxMatchesWith) * 100
                                      }%`,
                                    }}
                                  >
                                    {' '}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="pr-3 pl-3 py-2 border-b border-warmscale-7/50 border-r">
                              <div className="flex items-center">
                                <div className="min-w-[40px]">
                                  {teamMateWinRate}%
                                </div>
                                <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7">
                                  <div
                                    className={`h-2 rounded-sm ${
                                      teamMateWinRate >= 50
                                        ? 'bg-green-500'
                                        : teamMateWinRate === 0
                                          ? 'bg-warmscale-5'
                                          : 'bg-red-500'
                                    }`}
                                    style={{
                                      width: `${teamMateWinRate}%`,
                                    }}
                                  >
                                    {' '}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="pr-3  py-2 border-b border-warmscale-7/50">
                              <div className="flex items-center">
                                <div className="min-w-[40px]">
                                  {enemyMatches}
                                </div>
                                <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7">
                                  <div
                                    className="bg-tf-orange h-2 rounded-l-sm"
                                    style={{
                                      width: `${
                                        (enemyMatches / maxMatchesAgainst) * 100
                                      }%`,
                                    }}
                                  >
                                    {' '}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="pr-3 pl-3 py-2 border-b border-warmscale-7/50 border-r">
                              <div className="flex items-center">
                                <div className="min-w-[40px]">
                                  {enemyWinRate}%
                                </div>
                                <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7 ">
                                  <div
                                    className={` h-2 rounded-sm ${
                                      enemyWinRate >= 50
                                        ? 'bg-green-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{
                                      width: `${enemyWinRate}%`,
                                    }}
                                  >
                                    {' '}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
              <div
                onClick={() =>
                  setDisplayCount(
                    displayCount < peers.length
                      ? displayCount + 100
                      : peers.length
                  )
                }
                className={`w-full relative bg-warmscale-8 rounded-b-md flex justify-center items-center py-1 ${
                  displayCount !== peers.length &&
                  'hover:bg-warmscale-6 hover:cursor-pointer group'
                }  `}
              >
                <svg
                  fill="none"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="h-8 stroke-warmscale-0 group-hover:stroke-lightscale-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
                <div className="absolute right-6 text-lightscale-4 font-cantarell font-semibold text-sm">
                  {displayCount < peers.length ? displayCount : peers.length}
                </div>
              </div>
              <div className=""></div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

function selectOptions(
  setClassSearched: React.Dispatch<React.SetStateAction<string>>,
  currentOption: string,
  currentOptionId: string
) {
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          onClick={() => setClassSearched(currentOptionId)}
          className={classNames(
            active ? 'bg-warmscale-8 text-lightscale-1' : 'text-lightscale-1',
            'block px-4 py-2 text-sm cursor-pointer'
          )}
        >
          {currentOption}
        </div>
      )}
    </Menu.Item>
  );
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}
export default Peers;
