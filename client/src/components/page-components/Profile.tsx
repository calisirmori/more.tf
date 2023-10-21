import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

const Profile = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const playerId = idArray[4];

  const [playerSteamInfo, setPlayerSteamInfo] = useState<any>({});
  const [matchesPlayedInfo, setMatchesPlayedInfo] = useState<any>([]);
  const [rglInfo, setRglInfo] = useState<any>({});
  const [activity, setActivity] = useState<any>({});
  const [teamMatesList, setTeamMatesList] = useState<any>([]);
  const [teamMatesSteamInfo, setTeamMatesSteamInfo] = useState<any>([]);
  const [perClassPlaytimeData, setPerClassPlaytimeData] = useState<any>([]);
  const [formatData, setFormatData] = useState<any>([]);
  const [mapDisparityData, setMapDisparityData] = useState<any>([]);

  useEffect(() => {
    steamInfoCallProfile();
    matchesInfoCall();
    rglInfoCall();
    calendar();
    peersCall();
    perClassPlaytimeCall();
    formatDisparity();
    mapDisparity();
  }, []);

  async function steamInfoCallProfile() {
    let response: any = {}; // Initialize with an empty object
    try {
      response = await fetch(
        `/api/steam-info/${playerId}`,
        FetchResultTypes.JSON
      );
      setPlayerSteamInfo(response.response.players[0]);
    } catch (error) {
      console.log(error);
      console.log(response);
      response.personaname = "Steam Error";
      response.avatarfull = "Steam Error";
      setPlayerSteamInfo(response);
    }
  }

  async function steamInfoCall(currentPlayer: string) {
    let response: any;
    try {
      response = await fetch(
        `/api/steam-info/${currentPlayer}`,
        FetchResultTypes.JSON
      );
    } catch (error) {
      console.log(error);
    }
    return response;
  }

  async function matchesInfoCall() {
    const response: any = await fetch(
      `/api/match-history/${playerId}&class-played=none&map=none&after=none&format=none&order=none&limit=15`,
      FetchResultTypes.JSON
    );
    setMatchesPlayedInfo(response.rows);
  }

  async function rglInfoCall() {
    const response: any = await fetch(
      `/api/rgl-profile/${playerId}`,
      FetchResultTypes.JSON
    );
    setRglInfo(response);
  }

  async function peersCall() {
    const response: any = await fetch(
      `/api/peers-search/${playerId}`,
      FetchResultTypes.JSON
    );
    teamMateSteamCalls(response.rows);
    setTeamMatesList(response.rows);
  }

  async function calendar() {
    
    const response: any = await fetch(
      `/api/calendar/${playerId}`,
      FetchResultTypes.JSON
    );

    activityMaker(response.rows);
  }


  let totalMatches = 0;
  let totalMatchLosses = 0;
  let totalMatchWins = 0;
  let totalMatchTies = 0;

  for (let index = 0; index < formatData.length; index++) {
    totalMatches += parseInt(formatData[index].w);
    totalMatchWins += parseInt(formatData[index].w);
    totalMatches += parseInt(formatData[index].l);
    totalMatchLosses += parseInt(formatData[index].l);
    totalMatches += parseInt(formatData[index].t);
    totalMatchTies += parseInt(formatData[index].t);
  }

  async function formatDisparity() {
    const response: any = await fetch(
      `/api/per-format-stats/${playerId}`,
      FetchResultTypes.JSON
    );
    setFormatData(response.rows);
  }
  
  async function mapDisparity() {
    const response: any = await fetch(
      `/api/per-map-stats/${playerId}`,
      FetchResultTypes.JSON
    );
        
    let unsortedArray = response.rows;
    let currentMapObject: any = {};

    for (let i = 0; i < unsortedArray.length ; i++){
      let mapName = unsortedArray[i].map.split('_')[1];

      if(currentMapObject[mapName] === undefined){
        currentMapObject = {...currentMapObject, [mapName] :unsortedArray[i]}
        
      } else {
        currentMapObject[mapName].w = parseInt(unsortedArray[i].w) + parseInt(currentMapObject[mapName].w)
        currentMapObject[mapName].l = parseInt(unsortedArray[i].l) + parseInt(currentMapObject[mapName].l)
        currentMapObject[mapName].t = parseInt(unsortedArray[i].t) + parseInt(currentMapObject[mapName].t)
        currentMapObject[mapName].time = parseInt(unsortedArray[i].time) + parseInt(currentMapObject[mapName].time)
      }
    }
    setMapDisparityData(Object.values(currentMapObject));
  }
  
  async function perClassPlaytimeCall() {
    const response: any = await fetch(
      `/api/per-class-stats/${playerId}`,
      FetchResultTypes.JSON
    );
    setPerClassPlaytimeData(response.rows);
  }

  async function teamMateSteamCalls(playerList: any) {
    let currentList: any = [];

    for (let index = 0; index < 5; index++) {
      const response: any = await steamInfoCall(playerList[index].id64);
      currentList.push(response.response.players[0]);
    }
    setTeamMatesSteamInfo(currentList);
  }

  const currentWeekIndex = Math.floor(Date.now() / 1000 / 604800);
  const daysOfTheWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  let currentListOfWeeks = [];
  for (let index = 0; index < 17; index++) {
    currentListOfWeeks.push(currentWeekIndex - 15 + index);
  }

  function activityMaker(inputArray: any) {
    let activityObject: any = {};

    let dayOfTheWeekFinder: any = {
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
      0: "sunday",
      1: "monday",
    };
    inputArray.map((match: any) => {
      let weekIndex = (Math.ceil((match.date + 86400*2) / 604800));
      let dayIndex = (Math.ceil((match.date + 86400*2) / 86400)) % 7;

      if (activityObject[weekIndex] === undefined) {
        activityObject[weekIndex] = {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0,
        };
        activityObject[weekIndex][dayOfTheWeekFinder[dayIndex]]++;
      } else {
        activityObject[weekIndex][dayOfTheWeekFinder[dayIndex]]++;
      }
    });
    setActivity(activityObject);
  }

  return (
    <div className=" bg-warmscale-7 min-h-screen pb-3">
      <Navbar />
      <div className="relative w-full">
        <div className="flex justify-center w-full items-center mt-10 bg-warmscale-8 py-8">
          <div className="w-[76rem] flex justify-between">
            <div className="flex items-center">
              <img
                src={playerSteamInfo.avatarfull}
                alt=""
                className="rounded-md h-24"
              />
              <div className="ml-5 mb-3  font-cantarell ">
                <div className="text-lightscale-2 font-bold text-5xl">
                  {playerSteamInfo.personaname}{" "}
                </div>
                <div className="text-warmscale-1 font-semibold text-lg mt-2 flex">
                  #{rglInfo.name}
                  <a
                    href={`https://rgl.gg/Public/Team.aspx?t=${
                      rglInfo.currentTeams !== undefined &&
                      rglInfo.currentTeams.highlander !== null &&
                      rglInfo.currentTeams.highlander.id
                    }&r=24`}
                    className="ml-1 hover:text-tf-orange"
                  >
                    {rglInfo.currentTeams !== undefined &&
                      rglInfo.currentTeams.highlander !== null &&
                      "(" + rglInfo.currentTeams.highlander.tag + ")"}
                  </a>
                  <a
                    href={`https://rgl.gg/Public/Team.aspx?t=${
                      rglInfo.currentTeams !== undefined &&
                      rglInfo.currentTeams.sixes !== null &&
                      rglInfo.currentTeams.sixes.id
                    }&r=24`}
                    className="hover:text-tf-orange"
                  >
                    {rglInfo.currentTeams !== undefined &&
                      rglInfo.currentTeams.sixes !== null &&
                      "(" + rglInfo.currentTeams.sixes.tag + ")"}
                  </a>
                </div>
              </div>
            </div>
            <div id="links" className="flex gap-2 items-center">
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
          <div className="w-[76rem] flex justify-between mt-4">
            <div id="summary" className="w-[50rem]">
              <div id="" className="grid grid-cols-2 h-20 gap-4">
                <div className="h-full bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm">
                  <div className="flex justify-between items-baseline">
                    <div className="flex">
                      <div className="text-tf-orange text-xl font-semibold font-cantarell">
                        {totalMatches}
                      </div>
                      <div className="text-lightscale-1 text-xl ml-1 font-semibold font-cantarell">
                        Matches
                      </div>
                    </div>
                  </div>
                  <div className="bg-tf-orange h-2 mt-3 rounded-sm"></div>
                </div>
                <div className="h-full bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex">
                      <div className={`${totalMatchWins > totalMatchLosses ? "text-green-600" : "text-red-600"} text-xl font-semibold font-cantarell`}>
                        {Math.round(totalMatchWins/totalMatches*1000)/10}%
                      </div>
                      <div className="text-lightscale-1 text-xl ml-2 font-semibold font-cantarell">
                        Win Rate
                      </div>
                    </div>
                    <div className=" text-lightscale-7 text-sm font-cantarell font-semibold">
                      {" "}
                      <span className="text-green-500">{totalMatchWins}</span> - 
                      <span className="text-red-600">{totalMatchLosses}</span> - 
                      <span className="text-stone-600">{totalMatchTies}</span>
                    </div>
                  </div>
                  <div className="bg-warmscale-7 h-2 mt-3 rounded-sm drop-shadow-sm">
                    <div className={`${totalMatchWins > totalMatchLosses ? "bg-green-600" : "bg-red-600"} h-2 rounded-sm`} style={{width:`${totalMatchWins/totalMatches*100}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="bg-warmscale-8 mt-4 py-3 px-4 rounded-md font-cantarell drop-shadow-sm">
                <div className="flex justify-between">
                  <a href={`/profile/${playerId}/matches`} className="text-lg text-lightscale-1 font-semibold hover:underline">
                    Matches
                  </a>
                  <a href={`/profile/${playerId}/matches`} className="text-lg text-lightscale-1 font-semibold">
                    <svg
                      strokeWidth={5.5}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className=" stroke-warmscale-2 cursor-pointer h-6  mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </a>
                </div>
                <div className="mt-3">
                  {matchesPlayedInfo.map((match: any, index: any) => {
                    while (index < 15) {
                      return (
                        <a
                          href={`/log/${match.logid}`}
                          className={`flex h-11 items-center hover:bg-warmscale-85 cursor-pointer ${
                            index !== 14 && "border-b"
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
                            <div className="border-l border-warmscale-7 ml-3 py-1 text-lightscale-1 font-cantarell h-full w-72 flex items-center">
                              <div className="ml-2">
                                {match.map
                                  .split("_")[1]
                                  .charAt(0)
                                  .toUpperCase() +
                                  match.map.split("_")[1].slice(1)}
                              </div>
                              <div className="ml-1 text-sm text-lightscale-6 w-72 truncate">
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
                                  {match.kills}{" "}
                                  <span className="mx-0.5">/</span>
                                  {match.deaths}
                                  <span className="mx-0.5">/</span>
                                  {match.assists}
                                </div>
                              </div>
                              {match.class !== "medic" ? <div className="w-8">
                                <div className="text-xs text-right text-lightscale-8">
                                  DPM
                                </div>
                                <div className="text-xs text-right">
                                  {match.dpm}
                                </div>
                              </div> :
                              <div className="w-8">
                              <div className="text-xs text-right text-lightscale-8">
                                HLS
                              </div>
                              <div className="text-xs text-right">
                                {match.heals}
                              </div>
                            </div>}
                              
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
                                {match.format === "other" ? "OTH" : match.format.toUpperCase()}
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
                                {Math.round(Date.now() / 1000) - match.date >
                                86400
                                  ? new Date(
                                      match.date * 1000
                                    ).toLocaleDateString()
                                  : Math.round(
                                      (Math.round(Date.now() / 1000) -
                                        match.date) /
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
              </div>
              <div className="w-full bg-warmscale-8 mt-4 rounded-md px-4 py-2 drop-shadow-sm">
                <div className="flex justify-between">
                  <div className="text-lg text-lightscale-1 font-semibold">
                    Most Played Classes
                  </div>
                  
                </div>
                <div className=" font-cantarell">
                  {perClassPlaytimeData.map(
                    (classPlayed: any, index: number) => {
                      const topMatchesWithAnyClass =
                        parseInt(perClassPlaytimeData[0].w) +
                        parseInt(perClassPlaytimeData[0].t) +
                        parseInt(perClassPlaytimeData[0].l);
                      if (classPlayed.class !== null && index < 5) {
                        const totalGamesWithClass =
                          parseInt(classPlayed.w) +
                          parseInt(classPlayed.t) +
                          parseInt(classPlayed.l);
                        return (
                          <div
                            className={`py-3 flex justify-between items-center ${
                              index <
                                Math.min(perClassPlaytimeData.length - 1, 4) &&
                              "border-b"
                            } border-warmscale-7`}
                          >
                            <img
                              src={`../../../class icons/Leaderboard_class_${classPlayed.class}.png`}
                              alt=""
                              className="h-10"
                            />
                            <div className="ml-4 flex items-center">
                              <div className="text-right w-8 text-lightscale-1 font-semibold mb-0.5">
                                {totalGamesWithClass}
                              </div>
                              <div className="ml-2 h-2 w-48 bg-warmscale-5 rounded-sm">
                                <div
                                  className="h-2 bg-tf-orange rounded-sm"
                                  style={{
                                    width: `${
                                      (totalGamesWithClass /
                                        topMatchesWithAnyClass) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-4 flex items-center">
                              <div className="text-right w-14 text-lightscale-1 font-semibold mb-0.5">
                                {Math.round(
                                  (classPlayed.w /
                                    totalGamesWithClass) *
                                    1000
                                ) / 10}
                                %
                              </div>
                              <div className="ml-2 h-2 w-48 bg-warmscale-5 rounded-sm">
                                <div
                                  className={`h-2 ${
                                    parseInt(classPlayed.w) > parseInt(classPlayed.l)
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${
                                      (classPlayed.w /
                                        totalGamesWithClass) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-right w-32 text-lightscale-1 font-semibold mb-0.5">
                              {(classPlayed.time / 3600).toFixed(1)}hrs
                            </div>
                          </div>
                        );
                      }
                    }
                  )}
                </div>
              </div>
            </div>
            <div className="w-[25rem] h-screen ml-4 rounded-md drop-shadow-sm">
              <div className="w-full py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
              <div className="flex justify-between">
                  <div className="text-lg text-lightscale-1 mb-1 font-semibold">
                    Maps
                  </div>
                  
                </div>
                  {mapDisparityData.map((currentMap:any, index:number) =>{
                    const mapWins = parseInt(currentMap.w);
                    const mapLosses = parseInt(currentMap.l);
                    const mapTies = parseInt(currentMap.t);
                    const currentmapSum = mapWins + mapLosses + mapTies;
                    if(index < 7){
                      if(currentMap.map !== null){
                        return(
                          <div className={`flex relative justify-between items-center font-cantarell text-lightscale-1 h-14 ${index<6 && "border-b border-warmscale-7"}`}>
                            <div className="">{currentMap.map.length > 0 && currentMap.map.split("_")[1].charAt(0).toUpperCase() + currentMap.map.split("_")[1].slice(1)} <span className="text-lightscale-6 text-sm">({currentmapSum})</span> </div>
                            <div className="text-right">
                              <div className="font-semibold">{Math.round(mapWins/currentmapSum*1000)/10}%</div>
                              <div className="text-xs flex font-semibold text-lightscale-9">
                                <div className="text-green-500 text-opacity-70">{mapWins}</div>-
                                <div className="text-red-500 text-opacity-70">{mapLosses}</div>-
                                <div className="text-stone-500 text-opacity-70">{mapTies}</div>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    }
                  })}
                <div className="text-sm flex justify-center text-warmscale-3 font-semibold -mt-2">
                  <div className="flex items-center mr-1">
                    <svg fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  Take payload win percentages ligthly, its not accurate
                  </div>
              </div>
              <div className="w-full flex items-center py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
                <div className="w-full">
                <div className="text-lg text-lightscale-1 flex justify-between mb-1 font-semibold">
                  <div>Formats</div>
                  <div className="flex gap-2 items-center text-xs text-lightscale-6">
                    <div>HL: {formatData[0] !== undefined && Math.round((parseInt(formatData[0].w)+parseInt(formatData[0].l)+parseInt(formatData[0].t))/totalMatches*1000)/10}%</div>
                    <div>6S: {formatData[1] !== undefined && Math.round((parseInt(formatData[1].w)+parseInt(formatData[1].l)+parseInt(formatData[1].t))/totalMatches*1000)/10}%</div>
                    <div>OTH: {formatData[2] !== undefined && Math.round((parseInt(formatData[2].w)+parseInt(formatData[2].l)+parseInt(formatData[2].t))/totalMatches*1000)/10}%</div>
                  </div>
                </div>
                <div>{formatData.map((currentFormat: any) => {
                  const formatWins = parseInt(currentFormat.w);
                  const formatLosses = parseInt(currentFormat.l);
                  const formatTies = parseInt(currentFormat.t);
                  const currentFormatSum = formatWins + formatLosses + formatTies;
                  if(currentFormat.format !== null){
                    return(
                      <div className="flex text-right w-full items-center">
                        <div className="text-lightscale-2 w-10 mr-2 font-cantarell font-semibold text-sm">
                          {currentFormat.format !== null && (currentFormat.format === "other" ? "OTH" : currentFormat.format.toUpperCase())}
                        </div>
                        <div className="h-2 group bg-warmscale-7 rounded-sm w-full flex hover:h-6 my-2 hover:my-0 duration-75">
                          <div className="bg-green-500 group-hover:bg-opacity-100 relative flex items-center justify-center h-full rounded-l-sm bg-opacity-70" style={{width : `${(formatWins / totalMatches)*100}%`}}>
                            <div className={`scale-0 bg-warmscale-6 px-1.5 rounded-sm text-green-300 text-opacity-70 font-semibold text-sm py-0.5 ${formatWins !== 0 && "group-hover:scale-100"}  bottom-8 absolute left-1/2 transform -translate-x-1/2`}>
                              {formatWins}
                              <div className="h-2 w-2 flex justify-center  items-center bg-warmscale-6 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                            </div>
                          </div>
                          <div className="bg-red-500 group-hover:bg-opacity-100 relative flex items-center justify-center h-full bg-opacity-70" style={{width : `${(formatLosses / totalMatches)*100}%`}}>
                            <div className={`scale-0 bg-warmscale-6 px-1.5 rounded-sm text-red-300 text-opacity-70 font-semibold text-sm py-0.5 ${formatLosses !== 0 && "group-hover:scale-100"}  bottom-8 absolute left-1/2 transform -translate-x-1/2`}>
                              {formatLosses}
                              <div className="h-2 w-2 flex justify-center  items-center bg-warmscale-6 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                            </div>
                          </div>
                          <div className="bg-stone-500 group-hover:bg-opacity-100 relative flex items-center justify-center h-full rounded-r-sm bg-opacity-70" style={{width : `${(formatTies / totalMatches)*100}%`}}>
                            <div className={`scale-0 bg-warmscale-6 px-1.5 rounded-sm text-stone-300 text-opacity-70 font-semibold text-sm py-0.5 ${formatTies !== 0 && "group-hover:scale-100"}  bottom-8 absolute left-1/2 transform -translate-x-1/2`}>
                              {formatTies}
                              <div className="h-2 w-2 flex justify-center  items-center bg-warmscale-6 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  })}
                </div>
                </div>
              </div>
              <div
                id="activity"
                className="w-full bg-warmscale-8 py-2 px-3.5 rounded-md font-cantarell"
              >
                <div className="text-lg text-lightscale-1 mb-1 font-semibold">
                  Activity
                </div>
                <div className="flex my-2">
                  <div className=" text-xs font-semibold text-end text-lightscale-4 mr-1.5">
                    <div>MON</div>
                    <div className="my-1">TUE</div>
                    <div>WED</div>
                    <div className="my-1">THU</div>
                    <div>FRI</div>
                    <div className="my-1">SAT</div>
                    <div>SUN</div>
                    
                  </div>
                  {currentListOfWeeks.map((currentWeek) => {
                    return (
                      <div className=" flex-col flex-wrap">
                        {activity[currentWeek] !== undefined &&
                          daysOfTheWeek.map((day, index) => {
                            const today = Math.ceil(Date.now() / 1000 / 86400);
                            if ((currentWeek - 1) * 7 + index < today + 3) {
                              return (
                                <div className="relative h-4 w-4 group rounded-sm bg-warmscale-4 mb-1 mr-1 text-lightscale-2">
                                  <div className="absolute bg-lightscale-8 rounded-sm text-xs px-2 py-0.5 bottom-6 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-center w-40 z-40">
                                    {activity[currentWeek][day]} games on{" "}
                                    {new Date(
                                      ((currentWeek - 1) * 7 + index -2) *
                                        86400 *
                                        1000
                                    ).toLocaleDateString()}
                                    <div className="h-2 w-2 flex justify-center items-center bg-lightscale-8 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                  </div>
                                  <div
                                    className={`bg-tf-orange h-4 w-4 rounded-sm`}
                                    style={{
                                      opacity: `${
                                        Math.round(activity[currentWeek][day]*1.5) + "0%"
                                      }`,
                                    }}
                                  ></div>
                                </div>
                              );
                            }
                          })}
                        {activity[currentWeek] === undefined &&
                          daysOfTheWeek.map((day, index) => {
                            return (
                              <div className={`${((currentWeek - 1) * 7 + index) *86400 *1000 > Date.now() + 86400000 ? "bg-warmscale-80" : "bg-warmscale-4 group"} relative h-4 w-4  rounded-sm mb-1 mr-1 text-lightscale-2`}>
                                <div className={` absolute bg-warmscale-1 rounded-sm text-xs px-2 py-0.5 bottom-6 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-center w-36 z-40`}>
                                  0 games{" "}
                                  {new Date(
                                    ((currentWeek - 1) * 7 + index -2) *
                                      86400 *
                                      1000
                                  ).toLocaleDateString()}
                                  <div className="h-2 w-2 flex justify-center items-center bg-warmscale-1 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="w-full bg-warmscale-8 py-2 px-3.5 rounded-md mt-4 font-cantarell">
                <div className="flex justify-between">
                  <div className="text-lg text-lightscale-1 font-semibold">
                    Teammates
                  </div>
                </div>
                <div>
                  {teamMatesList.map((teammate: any, index: number) => {
                    if (index < 5 && teamMatesSteamInfo[index] !== undefined) {
                      const teammateLoses = parseInt(teammate.l);
                      const teammateWins = parseInt(teammate.w);
                      return (
                        <div
                          className={`flex py-2.5 items-center ${
                            index < 4 && "border-b"
                          } border-warmscale-7 ml-1`}
                        >
                          <img
                            src={teamMatesSteamInfo[index].avatarfull}
                            className="h-8 rounded-md"
                            alt=""
                          />
                          <a
                            href={`/profile/${teammate.id64}`}
                            className="ml-2 text-lightscale-2 font-semibold text-lg w-32 truncate"
                          >
                            {teamMatesSteamInfo[index].personaname}
                          </a>
                          <div className="flex items-center ml-4">
                            <div className="text-lightscale-1 font-semibold text-right text-xs w-8">
                              {Math.round(
                                (teammateWins /
                                  teammate.count) *
                                  100
                              )}
                              %
                            </div>
                            <div className="w-14 h-2 ml-1.5 rounded-sm bg-warmscale-5">
                              <div
                                className={`h-full ${
                                  parseInt(teammate.l) > parseInt(teammate.w)
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                } rounded-sm`}
                                style={{
                                  width: `${Math.round(
                                    (teammateWins /
                                      teammate.count) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center ml-5">
                            <div className="text-lightscale-1 font-semibold text-xs">
                              {teammate.count}
                            </div>
                            <div className="w-14 h-2 ml-1.5 rounded-sm bg-warmscale-5">
                              <div
                                className={`h-full bg-tf-orange rounded-sm`}
                                style={{
                                  width: `${Math.round(
                                    (teammate.count / teamMatesList[0].count) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
