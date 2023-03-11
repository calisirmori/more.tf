import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { classList } from "../ClassNames";

const Matches = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const playerId = idArray[4];

  const [classSearched, setClassSearched] = useState<any>("none");
  const [mapInput, setMapInput] = useState<any>("none");
  const [mapSeached, setMapSearched] = useState<any>("none");
  const [dateSearched, setDateSearched] = useState<any>("none");
  const [formatSearched, setFormatSearched] = useState<any>("none");
  const [sortBySearch, setSortBySearched] = useState<any>("none");
  const [limit, setLimit] = useState<any>("none");
  const todaysEpoch = Math.round(Date.now() / 1000);

  const statNames:any = {
    none: "Date",
    kills: "Kills",
    assists: "Assists",
    deaths: "Deaths",
    dpm: "DPM",
    dtm: "DTM",
    heals: "Heals",
  };

  const formatNames:any = {
    none: "Any",
    HL: "Highlander",
    "6s": "Sixes",
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if(mapInput.length > 2){
        setMapSearched(mapInput.toLowerCase())
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [mapInput])
  

  function dateNameFinder(currentDate:string){
    const currentEpoch = parseInt(currentDate);
    if( currentDate === "none"){
      return ("All Time");
    } else if ((todaysEpoch - 604800 -10000) < currentEpoch) {
      return("1 Week")
    } else if ((todaysEpoch - 2629743 -10000) < currentEpoch) {
      return("1 Month")
    } else if ((todaysEpoch - 2629743* 3 -10000) < currentEpoch) {
      return("3 Months")
    } else if ((todaysEpoch - 2629743* 6 -10000) < currentEpoch) {
      return("6 Months")
    } else if ((todaysEpoch - 31556926 -10000) < currentEpoch) {
      return("12 Months")
    }
  }

  useEffect(() => {
    steamInfoCallProfile();
    matchesInfoCall();
  }, []);

  useEffect(() => {
    matchesInfoCall();
  }, [classSearched, sortBySearch, formatSearched, dateSearched,mapSeached]);

  const [profileData, setProfileData] = useState<any>({});
  const [logsData, setLogsData] = useState<any>([]);
  const [currentLogsView, setCurrentLogsView] = useState<any>(1);
  const [pageSearch, setPageSearch] = useState<any>(0);

  async function steamInfoCallProfile() {
    const response: any = await fetch(
      `/api/steam-info/${playerId}`,
      FetchResultTypes.JSON
    );
    setProfileData(response.response.players[0]);
  }

  async function matchesInfoCall() {
    const response: any = await fetch(
      `/api/match-history/${playerId}&class-played=${classSearched}&map=${mapSeached}&after=${dateSearched}&format=${formatSearched}&order=${sortBySearch}&limit=${limit}`,
      FetchResultTypes.JSON
    );
    setLogsData(response.rows);
  }

  return (
    <div className="bg-warmscale-7 min-h-screen pt-3">
      <Navbar />
      <div className="flex justify-center w-full items-center mt-10 bg-warmscale-8 py-8">
        <div className="w-[76rem] flex justify-between">
          <div className="flex items-center">
            <img
              src={profileData.avatarfull}
              alt=""
              className="rounded-md h-24"
            />
            <div className="ml-5 mb-3  font-cantarell ">
              <a
                href={`/profile/${playerId}`}
                className="text-lightscale-2 font-bold text-5xl hover:underline">
                {profileData.personaname}{" "}
              </a>
            </div>
          </div>
          <div id="links" className="flex gap-2 items-center">
            <a
              href={`/profile/${playerId}`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
            >
              Profile
            </a>
            <a
              target="_blank"
              href={`https://steamcommunity.com/profiles/${playerId}`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
            >
              Steam
            </a>
            <a
              target="_blank"
              href={`https://demos.tf/profiles/${playerId}`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
            >
              demos.tf
            </a>
            <a
              target="_blank"
              href={`https://etf2l.org/search/${playerId}/`}
              className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow text-lightscale-2 font-bold font-cantarell"
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
            >
              <img src="../../../site icons/rgl.png" alt="" className="h-7" />
            </a>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="w-[76rem]">
          <div className="mt-3 flex justify-between mx-5">
            <div className="flex gap-5 ">
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
                      {classSearched !== "none"
                        ? classList[classSearched].name
                        : "Any"}
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
                        {selectOptions(setClassSearched, "Any Class (Default)", "none")}
                        {selectOptions(setClassSearched, "Scout", "scout")}
                        {selectOptions(setClassSearched, "Soldier", "soldier")}
                        {selectOptions(setClassSearched, "Pyro", "pyro")}
                        {selectOptions(setClassSearched, "Demoman", "demoman")}
                        {selectOptions(
                          setClassSearched,
                          "Heavy",
                          "heavyweapons"
                        )}
                        {selectOptions(
                          setClassSearched,
                          "Engineer",
                          "engineer"
                        )}
                        {selectOptions(setClassSearched, "Medic", "medic")}
                        {selectOptions(setClassSearched, "Sniper", "sniper")}
                        {selectOptions(setClassSearched, "Spy", "spy")}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
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
                        {selectOptions(setFormatSearched, "Any (Default)", "none")}
                        {selectOptions(setFormatSearched, "Highlander", "HL")}
                        {selectOptions(setFormatSearched, "Sixes", "6s")}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div>
                <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-0.5 pl-1">
                  Date
                </div>
                <Menu
                  as="div"
                  id="date-search"
                  className="relative inline-block text-left font-cantarell"
                >
                  <div>
                    <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-warmscale-85 px-3 py-2 text-sm font-semibold text-lightscale-2 shadow-sm ring-1 ring-inset ring-warmscale-82 hover:bg-warmscale-82">
                      {dateNameFinder(dateSearched)}
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
                        {selectOptions(setDateSearched, "All time (Default)", "none")}
                        {selectOptions(
                          setDateSearched,
                          "1 Week",
                          (todaysEpoch - 604800).toString()
                        )}
                        {selectOptions(
                          setDateSearched,
                          "1 Month",
                          (todaysEpoch - 2629743).toString()
                        )}
                        {selectOptions(
                          setDateSearched,
                          "3 Months",
                          (todaysEpoch - 2629743 * 3).toString()
                        )}
                        {selectOptions(
                          setDateSearched,
                          "6 Months",
                          (todaysEpoch - 2629743 * 6).toString()
                        )}
                        {selectOptions(
                          setDateSearched,
                          "12 Months",
                          (todaysEpoch - 31556926).toString()
                        )}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div>
                <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-0.5 pl-1">
                  Map
                </div>
                <input value={mapInput === "none" ? "" : mapInput} onChange={(e)=>{setMapInput(e.target.value.length === 0 ? "none" : e.target.value)}} type="text" className="rounded-sm bg-warmscale-85 ring-1 ring-warmscale-82 h-8 mt-0.5 text-lightscale-2 pl-2 font-semibold font-cantarell focus:outline-none"/>
                
              </div>  
            </div>
            <div>
              <div>
                <div className="text-sm font-cantarell text-lightscale-6 font-semibold mb-0.5 pl-1">
                  Sort By
                </div>
                <Menu
                  as="div"
                  id="sort-by"
                  className="relative inline-block text-left font-cantarell"
                >
                  <div>
                    <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-warmscale-85 px-3 py-2 text-sm font-semibold text-lightscale-2 shadow-sm ring-1 ring-inset ring-warmscale-82 hover:bg-warmscale-82">
                      {statNames[sortBySearch]}
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
                        {selectOptions(setSortBySearched, "Date (Default)", "none")}
                        {selectOptions(setSortBySearched, "Kills", "kills")}
                        {selectOptions(setSortBySearched, "Assists", "assists")}
                        {selectOptions(setSortBySearched, "Deaths", "deaths")}
                        {selectOptions(setSortBySearched, "DPM", "dpm")}
                        {selectOptions(setSortBySearched, "DTM", "dtm")}
                        {selectOptions(setSortBySearched, "Heals", "heals")}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          <div className="bg-warmscale-8 mt-4 py-3 px-4 rounded-md font-cantarell drop-shadow-sm mb-6">
            <div className="mt-0">
              {logsData.length === 0 && <div className="text-lightscale-8 text-md font-semibold text-center mt-2">NO MATCHING LOGS FOR THESE FILTERS</div> }
              {logsData.map((match: any, index: any) => {
                while (
                  index >= 25 * (currentLogsView - 1) &&
                  index < 25 * currentLogsView
                ) {
                  return (
                    <a
                      href={`/log/${match.logid}`}
                      className={`flex h-11 items-center hover:bg-warmscale-85 cursor-pointer ${
                        index !== 24 && "border-b"
                      } justify-between border-warmscale-7`}
                    >
                      <div className="flex items-center my-1">
                        <img
                          src={`../../../class icons/Leaderboard_class_${match.class}.png`}
                          alt=""
                          className="h-7 ml-3"
                        />
                        <div className="border-l border-warmscale-7 ml-3 py-1.5 h-full">
                          <div
                            className={`${
                              match.match_result === "W"
                                ? "bg-green-600"
                                : match.match_result === "L"
                                ? "bg-red-600"
                                : "bg-stone-500"
                            } w-5 h-5 flex ml-3 items-center justify-center text-xs font-bold rounded-sm`}
                          >
                            {match.match_result}
                          </div>
                        </div>
                        <div className="border-l border-warmscale-7 ml-3 py-1 text-lightscale-1 font-cantarell h-full w-full flex items-center">
                          <div className="ml-2">
                            {match.map.split("_")[1].charAt(0).toUpperCase() +
                              match.map.split("_")[1].slice(1)}
                          </div>
                          <div className="ml-1 text-sm text-lightscale-6 w-full truncate">
                            (
                            {match.title.includes("serveme")
                              ? match.title.slice(23)
                              : match.title}
                            )
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center p">
                        <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 gap-7 flex ml-3 pl-3 h-full">
                          <div className="w-[4.5rem]">
                            <div className="text-xs text-right text-lightscale-8">
                              K/D/A
                            </div>
                            <div className="text-xs text-right">
                              {match.kills} <span className="mx-0.5">/</span>
                              {match.deaths}
                              <span className="mx-0.5">/</span>
                              {match.assists}
                            </div>
                          </div>
                          {match.class !== "medic" ? (
                            <div className="w-8">
                              <div className="text-xs text-right text-lightscale-8">
                                DPM
                              </div>
                              <div className="text-xs text-right">
                                {match.dpm}
                              </div>
                            </div>
                          ) : (
                            <div className="w-8">
                              <div className="text-xs text-right text-lightscale-8">
                                HLS
                              </div>
                              <div className="text-xs text-right">
                                {match.heals}
                              </div>
                            </div>
                          )}

                          <div className="w-8">
                            <div className="text-xs text-right text-lightscale-8">
                              DTM
                            </div>
                            <div className="text-xs text-right">
                              {match.dtm}
                            </div>
                          </div>
                        </div>
                        <div className="border-l text-lightscale-1 font-cantarell font-semibold border-warmscale-7 ml-3 py-2 h-full">
                          <div className="ml-3 text-xs text-lightscale-5">
                            {match.format === "HL" ? "HL" : "6S"}
                          </div>
                        </div>
                        <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 w-24 ml-3 pl-3 h-full pr-3">
                          <div className="text-xs text-right text-lightscale-4">
                            {Math.floor(match.match_length / 60)}:
                            {match.match_length % 60 < 10
                              ? "0" + (match.match_length % 60)
                              : match.match_length % 60}
                          </div>
                          <div className="text-xs text-right">
                            {Math.round(Date.now() / 1000) - match.date > 86400
                              ? new Date(match.date * 1000).toLocaleDateString()
                              : Math.round(
                                  (Math.round(Date.now() / 1000) - match.date) /
                                    3600
                                ) + " hrs ago"}
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                }
              })}
            </div>
            <div className="flex justify-between font-cantarell ml-2 mt-2 mb-1">
              <div className="flex">
                {currentLogsView - 5 > 1 && (
                  <div
                    onClick={() => {
                      setCurrentLogsView(1);
                    }}
                    className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5  text-lightscale-8 text-sm font-semibold px-2 border border-opacity-50 border-tf-orange-dark"
                  >
                    {" "}
                    {1}{" "}
                  </div>
                )}
                {currentLogsView - 5 > 1 && (
                  <div className="select-none flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border-y border-opacity-50 border-tf-orange-dark">
                    {" "}
                    ...{" "}
                  </div>
                )}
                {currentLogsView > 1 && (
                  <div
                    onClick={() => {
                      setCurrentLogsView(currentLogsView - 1);
                    }}
                    className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border border-opacity-50 border-tf-orange-dark"
                  >
                    {" "}
                    {currentLogsView - 1}{" "}
                  </div>
                )}
                <div className="flex justify-center items-center py-0.5 text-tf-orange text-sm font-semibold px-2 border border-tf-orange">
                  {" "}
                  {currentLogsView}{" "}
                </div>
                {currentLogsView < Math.ceil(logsData.length / 25) && (
                  <div
                    onClick={() => {
                      setCurrentLogsView(currentLogsView + 1);
                    }}
                    className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border-y border-r border-opacity-50 border-tf-orange-dark"
                  >
                    {" "}
                    {currentLogsView + 1}{" "}
                  </div>
                )}
                {currentLogsView + 7 < logsData.length / 25 && (
                  <div className="select-none flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border-y border-opacity-50 border-tf-orange-dark">
                    {" "}
                    ...{" "}
                  </div>
                )}
                {currentLogsView + 7 < logsData.length / 25 && (
                  <div
                    onClick={() => {
                      setCurrentLogsView(Math.ceil(logsData.length / 25));
                    }}
                    className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5  text-lightscale-8 text-sm font-semibold px-2 border border-opacity-50 border-tf-orange-dark"
                  >
                    {" "}
                    {Math.ceil(logsData.length / 25)}{" "}
                  </div>
                )}
              </div>
              <div className="flex mr-2">
                <input
                  value={pageSearch}
                  onChange={(e) => {
                    setPageSearch(e.target.value);
                  }}
                  type="number"
                  min="1"
                  max={Math.ceil(logsData.length / 25)}
                  className="w-14 bg-warmscale-6 text-sm font-semibold rounded-l-md pl-2 text-lightscale-2 font-cantarell"
                />
                <div
                  onClick={() => {
                    setCurrentLogsView(
                      parseInt(pageSearch) < Math.ceil(logsData.length / 25)
                        ? parseInt(pageSearch)
                        : Math.ceil(logsData.length / 25)
                    );
                  }}
                  className="bg-tf-orange px-2 text-sm font-semibold flex justify-center items-center rounded-r-md text-warmscale-7 cursor-pointer"
                >
                  GO
                </div>
              </div>
            </div>
          </div>
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
            active ? "bg-warmscale-8 text-lightscale-1" : "text-lightscale-1",
            "block px-4 py-2 text-sm cursor-pointer"
          )}
        >
          {currentOption}
        </div>
      )}
    </Menu.Item>
  );
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default Matches;
