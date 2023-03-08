import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

const Profile = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const playerId = idArray[4];

  const [playerSteamInfo, setPlayerSteamInfo] = useState({});
  const [matchesPlayedInfo, setMatchesPlayedInfo] = useState([]);
  const [rglInfo, setRglInfo] = useState({});
  const [activity, setActivity] = useState({});
  const [teamMatesList, setTeamMatesList] = useState([]);
  const [teamMatesSteamInfo, setTeamMatesSteamInfo] = useState([]);

  useEffect(() => {
    steamInfoCallProfile();
    matchesInfoCall();
    rglInfoCall();
    calendar();
    peersCall();
  }, []);

  async function steamInfoCallProfile() {
    const response: any = await fetch(
      `http://localhost:8082/api/steam-info/${playerId}`,
      FetchResultTypes.JSON
    );
    setPlayerSteamInfo(response.response.players[0]);
  }

  async function steamInfoCall(currentPlayer: string) {
    const response: any = await fetch(
      `http://localhost:8082/api/steam-info/${currentPlayer}`,
      FetchResultTypes.JSON
    );
    return(response);
  }

  async function matchesInfoCall() {
    const response: any = await fetch(
      `http://localhost:8082/api/match-history/${playerId}&limit=15`,
      FetchResultTypes.JSON
    );
    setMatchesPlayedInfo(response.rows);
  }

  async function rglInfoCall() {
    const response: any = await fetch(
      `http://localhost:8082/api/rgl-profile/${playerId}`,
      FetchResultTypes.JSON
    );
    setRglInfo(response);
  }

  async function peersCall() {
    const response: any = await fetch(
      `http://localhost:8082/api/peers-search/${playerId}`,
      FetchResultTypes.JSON
    );
    teamMateSteamCalls(response.rows)
    setTeamMatesList(response.rows);
  }

  async function calendar() {
    const response: any = await fetch(
      `http://localhost:8082/api/calendar/${playerId}`,
      FetchResultTypes.JSON
    );

    activityMaker(response.rows);
  }

  async function teamMateSteamCalls(playerList: any){
    let currentList: any = [];

    for (let index = 0; index < 5; index++) {
      const response:any = await steamInfoCall(playerList[index].id64);
      currentList.push(response.response.players[0]);
    }
    setTeamMatesSteamInfo(currentList);
  }

  const currentWeekIndex = Math.ceil(Date.now() / 1000 / 604800);
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
    currentListOfWeeks.push(currentWeekIndex - 16 + index);
  }

  function activityMaker(inputArray: any) {
    let activityObject: any = {};

    let dayOfTheWeekFinder: any = {
      0: "tuesday",
      1: "wednesday",
      2: "thursday",
      3: "friday",
      4: "saturday",
      5: "sunday",
      6: "monday",
    };

    inputArray.map((match: any) => {
      let weekIndex = Math.ceil(match.date / 604800);
      let dayIndex = Math.ceil(match.date / 86400) % 7;

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
    <div className=" bg-warmscale-7 min-h-screen py-3">
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
                        {"64"}
                      </div>
                      <div className="text-lightscale-1 text-xl ml-1 font-semibold font-cantarell">
                        Matches
                      </div>
                    </div>
                    <div className=" text-lightscale-9 font-cantarell font-semibold">
                      First Match: Feb 20, 2014
                    </div>
                  </div>
                  <div className="bg-tf-orange h-2 mt-3 rounded-sm"></div>
                </div>
                <div className="h-full bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex">
                      <div className="text-red-600 text-xl font-semibold font-cantarell">
                        49.8%
                      </div>
                      <div className="text-lightscale-1 text-xl ml-2 font-semibold font-cantarell">
                        Win Rate
                      </div>
                    </div>
                    <div className=" text-lightscale-7 text-sm font-cantarell font-semibold">
                      {" "}
                      <span className="text-green-500">99</span> -{" "}
                      <span className="text-red-600">101</span>
                    </div>
                  </div>
                  <div className="bg-warmscale-7 h-2 mt-3 rounded-sm drop-shadow-sm">
                    <div className="bg-red-600 w-1/2 h-2 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div className="bg-warmscale-8 mt-4 py-3 px-4 rounded-md font-cantarell drop-shadow-sm">
                <div className="flex justify-between">
                  <div className="text-lg text-lightscale-1 font-semibold">
                    Matches
                  </div>
                  <div className="text-lg text-lightscale-1 font-semibold">
                    <svg
                      strokeWidth={5.5}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className=" stroke-warmscale-2 cursor-pointer h-6 mr-1 mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-3">
                  {matchesPlayedInfo.map((match, index) => {
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
                                  match.win === "W"
                                    ? "bg-green-600"
                                    : match.win === "L"
                                    ? "bg-red-600"
                                    : "bg-stone-500"
                                } w-5 h-5 flex ml-3 items-center justify-center text-xs font-bold rounded-sm`}
                              >
                                {match.win}
                              </div>
                            </div>
                            <div className="border-l border-warmscale-7 ml-3 py-1 text-lightscale-1 font-cantarell h-full w-60 flex items-center">
                              <div className="ml-2">
                                {match.map
                                  .split("_")[1]
                                  .charAt(0)
                                  .toUpperCase() +
                                  match.map.split("_")[1].slice(1)}
                              </div>
                              <div className="ml-1 text-sm text-lightscale-6">
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
                                  {match.kill} <span className="mx-0.5">/</span>
                                  {match.assist}
                                  <span className="mx-0.5">/</span>
                                  {match.death}
                                </div>
                              </div>
                              <div className="w-8">
                                <div className="text-xs text-right text-lightscale-8">
                                  DPM
                                </div>
                                <div className="text-xs text-right">
                                  {match.dpm}
                                </div>
                              </div>
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
                                {match.players > 15
                                  ? "HL"
                                  : match.players > 10
                                  ? "6S"
                                  : match.players > 6
                                  ? "4S"
                                  : "2S"}
                              </div>
                            </div>
                            <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 w-24 ml-3 pl-3 h-full pr-3">
                              <div className="text-xs text-right text-lightscale-4">
                                {Math.floor(match.length / 60)}:
                                {match.length % 60 < 10
                                  ? "0" + (match.length % 60)
                                  : match.length % 60}
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
                                    )}
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
                  <div className="text-lg text-lightscale-1 font-semibold">
                    <svg
                      strokeWidth={5.5}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className=" stroke-warmscale-2 cursor-pointer h-6 mr-1 mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[25rem] h-screen ml-4 rounded-md drop-shadow-sm">
              <div
                id="activity"
                className="w-full bg-warmscale-8 py-2 px-3.5 rounded-md h-48 font-cantarell"
              >
                <div className="text-lg text-lightscale-1 mb-1 font-semibold">
                  Activity
                </div>
                <div className="flex ">
                  <div className=" text-xs font-semibold text-end text-lightscale-4 mr-2">
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
                            if ((currentWeek - 1) * 7 + index + 4 < today) {
                              return (
                                <div className="relative h-4 w-4 group rounded-sm bg-warmscale-4 mb-1 mr-1 text-lightscale-2">
                                  <div className="absolute bg-warmscale-1 rounded-sm text-xs px-2 py-0.5 bottom-6 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-center w-40 z-40">
                                    {activity[currentWeek][day]} games on{" "}
                                    {new Date(
                                      ((currentWeek - 1) * 7 + index + 5) *
                                        86400 *
                                        1000
                                    ).toLocaleDateString()}
                                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-1 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                  </div>
                                  <div
                                    className="bg-tf-orange h-4 w-4 rounded-sm"
                                    style={{
                                      opacity: `${
                                        activity[currentWeek][day] + "0%"
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
                              <div className="relative h-4 w-4 group rounded-sm bg-warmscale-4 mb-1 mr-1 text-lightscale-2">
                                <div className="absolute bg-warmscale-1 rounded-sm text-xs px-2 py-0.5 bottom-6 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-center w-36 z-40">
                                  0 games{" "}
                                  {new Date(
                                    ((currentWeek - 1) * 7 + index + 5) *
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
                  <div className="text-lg text-lightscale-1 font-semibold">
                    <svg
                      strokeWidth={5.5}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className=" stroke-warmscale-2 cursor-pointer h-6 -mr-1 mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  {teamMatesList.map((teammate: any, index:number) =>{
                    if(index < 5 && teamMatesSteamInfo[index] !== undefined){
                      return(
                      <div className={`flex py-2.5 items-center ${index < 4 && "border-b"} border-warmscale-7 ml-1`}> 
                        <img src={teamMatesSteamInfo[index].avatarfull} className="h-8 rounded-md" alt="" />
                        <a href={`/profile/${teammate.id64}`} className="ml-2 text-lightscale-2 font-semibold text-lg w-32 truncate">{teamMatesSteamInfo[index].personaname}</a>
                        <div className="flex items-center ml-4">
                          <div className="text-lightscale-1 font-semibold text-xs">{Math.round(teammate.l/teammate.count*100)}%</div>
                          <div className="w-14 h-2 ml-1.5 rounded-sm bg-warmscale-5">
                            <div className={`h-full ${teammate.l > teammate.w ? "bg-red-500" : "bg-green-500"} rounded-sm`} style={{width: `${Math.round(Math.max(teammate.l,teammate.w)/teammate.count*100)}%`}}></div>
                          </div>
                        </div>
                        <div className="flex items-center ml-5">
                          <div className="text-lightscale-1 font-semibold text-xs">{teammate.count}</div>
                          <div className="w-14 h-2 ml-1.5 rounded-sm bg-warmscale-5">
                            <div className={`h-full bg-tf-orange rounded-sm`} style={{width: `${Math.round(teammate.count/teamMatesList[0].count*100)}%`}}></div>
                          </div>
                        </div>
                      </div>)
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
