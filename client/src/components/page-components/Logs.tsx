import React, { useEffect, useState } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

const Logs = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const logId = idArray[4];

  const [tab, setTab] = useState("scoreboard");
  const [apiResponse, setResponse] = useState({});
  const [scoreboard, setScoreboard] = useState([]);
  const [currentScoreboardSort, setScoreboardSort] = useState("team");
  const [sortType, setSortType] = useState("hl");

  useEffect(() => {
    apiCall();
  }, []);

  async function apiCall() {
    try {
      const response: Object = await fetch(
        `http://localhost:8081/api/log/${logId}`,
        FetchResultTypes.JSON
      );
      setResponse(response);
      setScoreboard(Object.entries(response.players));
    } catch (error) {
      // SEND TO ERROR PAGE
    }
  }

  function scoreboardSorter(sortBy: String) {
    let sortedArray: Array<Array<Object>> = [];
    let unsortedArray: Array<Array<Object>> = scoreboard;

    if (sortBy === currentScoreboardSort) {
      if (sortType === "hl") {
        setSortType("lh");
        setScoreboardSort(sortBy);
        while (unsortedArray.length > 0) {
          let max = Number.MAX_SAFE_INTEGER;
          let currentMax = 0;
          for (
            let searchIndex = 0;
            searchIndex < unsortedArray.length;
            searchIndex++
          ) {
            if (unsortedArray[searchIndex][1][sortBy] <= max) {
              currentMax = searchIndex;
              max = unsortedArray[searchIndex][1][sortBy];
            }
          }
          sortedArray.push(unsortedArray[currentMax]);
          unsortedArray.splice(currentMax, 1);
        }
      } else if (sortType === "lh") {
        setSortType("team");
        setScoreboardSort("team");
        for (
          let playerIndex = 0;
          playerIndex < unsortedArray.length;
          playerIndex++
        ) {
          if (unsortedArray[playerIndex][1].team === "red") {
            sortedArray.push(unsortedArray[playerIndex]);
          } else {
            sortedArray.unshift(unsortedArray[playerIndex]);
          }
        }
      }
    } else if (sortBy === "team") {
      setScoreboardSort(sortBy);
      setSortType("hl");
      for (
        let playerIndex = 0;
        playerIndex < unsortedArray.length;
        playerIndex++
      ) {
        if (unsortedArray[playerIndex][1].team === "red") {
          sortedArray.push(unsortedArray[playerIndex]);
        } else {
          sortedArray.unshift(unsortedArray[playerIndex]);
        }
      }
    } else {
      setScoreboardSort(sortBy);
      setSortType("hl");
      while (unsortedArray.length > 0) {
        let min = Number.MIN_SAFE_INTEGER;
        let currentMax = 0;
        for (
          let searchIndex = 0;
          searchIndex < unsortedArray.length;
          searchIndex++
        ) {
          if (unsortedArray[searchIndex][1][sortBy] >= min) {
            currentMax = searchIndex;
            min = unsortedArray[searchIndex][1][sortBy];
          }
        }
        sortedArray.push(unsortedArray[currentMax]);
        unsortedArray.splice(currentMax, 1);
      }
    }
    setScoreboard(sortedArray);
  }

  let currentScoreboardIndex = 0;
  if (apiResponse.players !== undefined) {
    return (
      <div className=" bg-warmscale-7 py-3">
        <Navbar />
        <div className="flex items-center justify-center">
          <div
            id="stat-window"
            className=" w-[88rem] mx-5 bg-warmscale-8  mt-5 rounded-t-md drop-shadow"
          >
            <div
              id="header"
              className="flex pt-4 flex-wrap justify-between pr-5"
            >
              <div id="match-info" className="flex gap-7">
                <div id="format-logo"></div>
                <div className="block">
                  <div
                    id="match-type"
                    className=" text-lightscale-6 font-medium -mb-1.5"
                  >
                    Casual
                  </div>
                  <div
                    id="map"
                    className=" text-lightscale-2 text-xl font-semibold font-cantarell"
                  >
                    Product
                  </div>
                </div>
                <div id="match-scores" className="flex">
                  <div
                    id="blue-team-scores"
                    className="block text-center rounded-sm bg-tf-blue border-b-4 border-tf-blue-dark pt-1 px-3"
                  >
                    <div className=" text-lightscale-2 text-2xl font-bold font-cantarell mt-0.5">
                      0
                    </div>
                  </div>
                  <div
                    id="score-divider"
                    className=" text-lightscale-2 text-3xl font-extrabold font-cantarell mx-2 mt-0.5"
                  >
                    :
                  </div>
                  <div
                    id="blue-team-scores"
                    className="block text-center rounded-sm bg-tf-red border-b-4 border-tf-red-dark pt-1 px-3"
                  >
                    <div className=" text-lightscale-2 text-2xl font-bold font-cantarell mt-0.5">
                      0
                    </div>
                  </div>
                </div>
                <div id="match-time" className="block">
                  <div
                    id="date"
                    className=" text-lightscale-6 font-medium -mb-1.5"
                  >
                    2/16/23, 11:40 AM
                  </div>
                  <div
                    id="length"
                    className=" text-lightscale-2 text-xl font-semibold font-cantarell"
                  >
                    29m 37s
                  </div>
                </div>
                <div id="rank-info" className="block">
                  <div
                    id="date"
                    className=" text-lightscale-6 font-medium -mb-1.5"
                  >
                    Average Rank
                  </div>
                  <div
                    id="length"
                    className=" text-lightscale-2 text-xl font-semibold font-cantarell"
                  >
                    Advanced
                  </div>
                </div>
              </div>
              <div
                id="other-links"
                className="flex gap-4 justify-center items-center"
              >
                <button className="rounded-sm hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-7 bg-warmscale-7 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                  demos.tf
                </button>
                <button className="rounded-sm hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-7 bg-warmscale-7 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                  logs.tf
                </button>
                <div className="flex items-center justify-center rounded-sm hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-7 cursor-pointer bg-warmscale-7 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="fill-lightscale-2 w-5"
                  >
                    <path
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                      d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
            <div
              id="tabs"
              className="grid select-none grid-cols-5 text-center mt-5 drop-shadow-md"
            >
              <div
                onClick={() => {
                  setTab("scoreboard");
                }}
                className={`border-b-2 duration-75  ${
                  tab === "scoreboard"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-8 hover:border-warmscale-9 hover:bg-warmscale-9 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Scoreboard
              </div>
              <div
                onClick={() => {
                  setTab("performance");
                }}
                className={`border-b-2 duration-75  ${
                  tab === "performance"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-8 hover:border-warmscale-9 hover:bg-warmscale-9 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Performance
              </div>
              <div
                onClick={() => {
                  setTab("rounds");
                }}
                className={`border-b-2 duration-75 ${
                  tab === "rounds"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-8 hover:bg-warmscale-9 hover:border-warmscale-9 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Rounds
              </div>
              <div
                onClick={() => {
                  setTab("matchups");
                }}
                className={`border-b-2 duration-75 ${
                  tab === "matchups"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-8 hover:bg-warmscale-9 hover:border-warmscale-9 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Matchups
              </div>
              <div
                onClick={() => {
                  setTab("other");
                }}
                className={`border-b-2 duration-75 ${
                  tab === "other"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-8 hover:bg-warmscale-9 hover:border-warmscale-9 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Other
              </div>
            </div>
            <div
              id="scoreboard-tab "
              className={`${tab !== "scoreboard" && "hidden "}`}
            >
              <div id="scoreboard" className="bg-warmscale-9">
                <div id="stat-titles">
                  <div className="grid h-8  grid-cols-[1fr,_40px,_100px,_repeat(3,60px),_100px,_repeat(3,60px),_100px,_60px,_repeat(5,60px)]">
                    <div className="flex items-center ml-4 font-cantarell font-semibold text-lightscale-1">
                      Player
                    </div>
                    <div className="flex items-center cursor-pointer justify-center font-cantarell font-semibold text-lightscale-1 border-l border-warmscale-6">
                      C
                    </div>
                    {statTitle("combatScore" , "CS")}
                    {statTitle("kills" , "K")}
                    {statTitle("assists" , "A")}
                    {statTitle("deaths" , "D")}
                    {statTitle("damage" , "DMG")}
                    {statTitle("damagePerMinute" , "DPM")}
                    {statTitle("killAssistPerDeath" , "KA/D")}
                    {statTitle("killsPerDeath" , "K/D")}
                    {statTitle("damageTaken", "DT")}
                    {statTitle("damageTakenPerMinute", "DTM")}
                    {statTitle("damageTakenPerMinute", "HP")}
                    {statTitle("backstabs", "BS")}
                    {statTitle("headshots", "HS")}
                    {statTitle("airshots", "AS")}
                    {statTitle("damageTakenPerMinute", "CAP")}
                  </div>
                </div>
                {apiResponse !== undefined &&
                  scoreboard.map((player) => {
                    const playerObject: Object = player[1];
                    return (
                      <div id="player-stat-card">
                        <div
                          className={`grid h-10 border-b border-warmscale-85 ${
                            currentScoreboardIndex++ % 2 === 1
                              ? "bg-warmscale-85"
                              : "bg-warmscale-8"
                          } grid-cols-[1fr,_40px,_100px,_repeat(3,60px),_100px,_repeat(3,60px),_100px,_60px,_repeat(5,60px)]`}
                        >
                          <div
                            className={`block bg-gradient-to-r from-tf-${playerObject.team}-dark mr-6`}
                          >
                            <div className="pl-4">
                              <span className="font-semibold font-cantarell text-lightscale-1 ">
                                {playerObject.userName}
                              </span>
                            </div>
                            <div className="pl-4 flex items-center -mt-1">
                              <img
                                src="https://senpai.gg/_nuxt/img/5e693c4.webp"
                                className="h-3 mr-1"
                                alt=""
                              />
                              <div className="text-xs font-cantarell text-lightscale-4">
                                Invite |
                              </div>
                              <span className="text-xs ml-1 font-cantarell text-lightscale-4">
                                mori
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-center items-center border-l border-warmscale-6">
                            <img
                              src={`../../../public/class icons/Leaderboard_class_${playerObject.class}.png`}
                              className="h-6"
                              alt=""
                            />
                          </div>
                          {stat("combatScore")}
                          {stat("kills")}
                          {stat("assists")}
                          {stat("deaths")}
                          {stat("damage")}
                          {stat("damagePerMinute")}
                          {stat("killAssistPerDeath")}
                          {stat("killsPerDeath")}
                          {stat("damageTaken")}
                          {stat("damageTakenPerMinute")}
                          <div className="flex items-center justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6">
                            {playerObject.resup.medkit}
                          </div>
                          {stat("backstabs")}
                          {stat("headshots")}
                          {stat("airshots")}
                          <div className="flex items-center justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6">
                            {playerObject.resup.ammo}
                          </div>
                        </div>
                      </div>
                    );
                    function stat(statInput :String) {
                      return <div className={`flex items-center ${currentScoreboardSort === statInput && "bg-lightscale-4 bg-opacity-5"} justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6`}>
                        {playerObject[statInput]}
                      </div>;
                    }
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function statTitle(stat: String, statAbriviation: String) {
    return <div
      onClick={() => {
        scoreboardSorter(stat);
      } }
      className="flex items-center cursor-pointer justify-center select-none font-cantarell font-semibold text-lightscale-1 border-l border-warmscale-6"
    >

      {currentScoreboardSort === stat ?
        sortType !== "lh" ? (
          <div>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-4 -ml-2"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              ></path>
            </svg>
          </div>
        ) : (
          <div>
            <svg
              fill="currentColor"
              className="h-4 -ml-2"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" />
            </svg>
          </div>
        ) : (<div></div>)}
      {statAbriviation}
    </div>;
  }
};

export default Logs;
