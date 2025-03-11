import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { weaponsList } from "../WeaponNames";
import { mapCordinates } from "../MapCalibrations";

const Logs = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const logId = idArray[4];

  const [tab, setTab] = useState<any>("scoreboard");
  const [apiResponse, setResponse] = useState<any>({});
  const [scoreboard, setScoreboard] = useState<any>([]);
  const [ptscoreboard, setptScoreboard] = useState<any>([]);
  const [killSpread, setKillSpread] = useState<any>([]);
  const [killSpreadSort, setKillSpreadSort] = useState<any>("kills");
  const [currentScoreboardSort, setScoreboardSort] = useState<any>("team");
  const [ptcurrentScoreboardSort, ptsetScoreboardSort] = useState<any>("team");
  const [scoreboardCollapsed, setScoreboardCollapsed] = useState(true);
  const [sortType, setSortType] = useState<any>("hl");
  const [currentPerformanceFocus, setPerformanceFocus] = useState<any>("");
  const [performanceChartSort, setPerformanceChartSort] = useState<any>("dealt");
  const [killMapActive, setKillMapActive] = useState<any>(false);
  const [focusedKillEvent, setFocusedKillEvent] = useState<any>({});
  const [currentKillMapFilter, setCurrentKillMapFilter] = useState<any>("none");
  const [killMapShowDeaths, setKillMapShowDeaths] = useState<any>(false);
  const [matchupPlayersRed, setMatchupPlayersRed] = useState<any>("none");
  const [matchupPlayersBlue, setMatchupPlayersBlue] = useState<any>("none");
  const [chartFilter, setChartFilter] = useState<any>("damage");
  const [linkView, setLinkView] = useState("none");
  const [currentDemosID, setCurrentDemosID] = useState("");

  const classOrder = [
    "scout",
    "soldier",
    "pyro",
    "demoman",
    "heavyweapons",
    "engineer",
    "medic",
    "sniper",
    "spy",
  ];

  const refOne: any = useRef(null);
  const refTwo: any = useRef(null);

  useEffect(() => {
    apiCall();
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
  }, []);

  const handleClickOutside = (e :any) => {
    if (tab == "scoreboard" && refOne.current.contains(e.target) !== null && !refOne.current.contains(e.target)) {
      setLinkView("none");
    }
    if (tab == "performance" && refTwo.current.contains(e.target) !== null && !refTwo.current.contains(e.target)) {
      setKillMapActive(false);
    }
  };

  async function apiCall() {
    try {
      const response: any = await fetch(
        `/api/log/${logId}`,
        FetchResultTypes.JSON
      );
      setResponse(response);
      setScoreboard(Object.entries(response.players));
      setptScoreboard(Object.entries(response.players));
      setKillSpread(Object.entries(response.killSpread));
    } catch (error) {
      // SEND TO ERROR PAGE
      window.location.replace("/log/error")
    }
  }

  function damageDivisionSortByClass() {
    let sortedArray: any = [];
    for (let classIndex = 0; classIndex < classOrder.length; classIndex++) {
      Object.entries(
        apiResponse.players[currentPerformanceFocus].damageDivision.damageTo
      ).map((player: any, index: any) => {
        if (apiResponse.players[player[0]].class === classOrder[classIndex])
          sortedArray.push({
            [player[0]]: {
              damageFrom:
                apiResponse.players[currentPerformanceFocus].damageDivision
                  .damageFrom[player[0]],
              damageTo:
                apiResponse.players[currentPerformanceFocus].damageDivision
                  .damageTo[player[0]],
            },
          });
      });
    }
    return sortedArray;
  }

  function ID3toID64Converter(userId3: string) {
    let steamid64ent1 = 7656,
      steamid64ent2 = 1197960265728,
      cleanId3 = userId3.replace(/\]/g, "").split(":")[2];
    let userid64 = steamid64ent1 + String(parseInt(cleanId3) + steamid64ent2);
    return userid64;
  }

  function scoreboardSorter(sortBy: string) {
    let sortedArray: any = [];
    let unsortedArray: any = scoreboard;

    if (sortBy === currentScoreboardSort) {
      if (sortType === "hl") {
        setSortType("lh");
        setScoreboardSort(sortBy);
        if (sortBy === "class") {
          setScoreboardSort(sortBy);
          setSortType("lh");
          for (
            let classIndex = classOrder.length - 1;
            classIndex > -1;
            classIndex--
          ) {
            for (
              let playerIndex = 0;
              playerIndex < unsortedArray.length;
              playerIndex++
            ) {
              if (
                unsortedArray[playerIndex][1].class === classOrder[classIndex]
              ) {
                sortedArray.push(unsortedArray[playerIndex]);
              }
            }
          }
        } else {
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
    } else if (sortBy === "class") {
      setScoreboardSort(sortBy);
      setSortType("hl");
      for (let classIndex = 0; classIndex < classOrder.length; classIndex++) {
        for (
          let playerIndex = 0;
          playerIndex < unsortedArray.length;
          playerIndex++
        ) {
          if (unsortedArray[playerIndex][1].class === classOrder[classIndex]) {
            sortedArray.push(unsortedArray[playerIndex]);
          }
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
  function ptscoreboardSorter(sortBy: string) {
    let sortedArray: any = [];
    let unsortedArray: any = ptscoreboard;

    if (sortBy === ptcurrentScoreboardSort) {
      if (sortType === "hl") {
        setSortType("lh");
        ptsetScoreboardSort(sortBy);
        if (sortBy === "class") {
          ptsetScoreboardSort(sortBy);
          setSortType("lh");
          for (
            let classIndex = classOrder.length - 1;
            classIndex > -1;
            classIndex--
          ) {
            for (
              let playerIndex = 0;
              playerIndex < unsortedArray.length;
              playerIndex++
            ) {
              if (
                unsortedArray[playerIndex][1].class === classOrder[classIndex]
              ) {
                sortedArray.push(unsortedArray[playerIndex]);
              }
            }
          }
        } else {
          while (unsortedArray.length > 0) {
            let max = Number.MAX_SAFE_INTEGER;
            let currentMax = 0;
            for (
              let searchIndex = 0;
              searchIndex < unsortedArray.length;
              searchIndex++
            ) {
              if (unsortedArray[searchIndex][1].passTime[sortBy] <= max) {
                currentMax = searchIndex;
                max = unsortedArray[searchIndex][1].passTime[sortBy];
              }
            }
            sortedArray.push(unsortedArray[currentMax]);
            unsortedArray.splice(currentMax, 1);
          }
        }
      } else if (sortType === "lh") {
        setSortType("team");
        ptsetScoreboardSort("team");
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
      ptsetScoreboardSort(sortBy);
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
    } else if (sortBy === "class") {
      ptsetScoreboardSort(sortBy);
      setSortType("hl");
      for (let classIndex = 0; classIndex < classOrder.length; classIndex++) {
        for (
          let playerIndex = 0;
          playerIndex < unsortedArray.length;
          playerIndex++
        ) {
          if (unsortedArray[playerIndex][1].class === classOrder[classIndex]) {
            sortedArray.push(unsortedArray[playerIndex]);
          }
        }
      }
    } else {
      ptsetScoreboardSort(sortBy);
      setSortType("hl");
      while (unsortedArray.length > 0) {
        let min = Number.MIN_SAFE_INTEGER;
        let currentMax = 0;
        for (
          let searchIndex = 0;
          searchIndex < unsortedArray.length;
          searchIndex++
        ) {
          if (unsortedArray[searchIndex][1].passTime[sortBy] >= min) {
            currentMax = searchIndex;
            min = unsortedArray[searchIndex][1].passTime[sortBy];
          }
        }
        sortedArray.push(unsortedArray[currentMax]);
        unsortedArray.splice(currentMax, 1);
      }
    }
    setptScoreboard(sortedArray);
  }

  async function demostfLinkIdFinder(){
    let currentPlayersArray: any = Object.entries(apiResponse.players);
    let currentResponse: any = "";
    for (let index = 0; index < 1; index++) {
      currentResponse += currentPlayersArray[index][0];
    }
    let demostfApiResponse: any = await fetch(`https://api.demos.tf/demos/?map=${apiResponse.info.map}&players[]=${currentResponse}&after=${apiResponse.info.date-5000}&before=${apiResponse.info.date+5000}`, FetchResultTypes.JSON);
    if(demostfApiResponse.length !== 0){
      setCurrentDemosID(demostfApiResponse[demostfApiResponse.length-1].id)
    }
  }

  function killSpreadSorter(sortBy: string) {
    setKillSpreadSort(sortBy);
    let unsortedArray = killSpread;
    let sortedArray = [];
    if (sortBy !== killSpreadSort && sortBy !== "kills") {
      for (
        let searchIndex = 0;
        searchIndex < unsortedArray.length + 1;
        searchIndex++
      ) {
        let max: any = Number.MIN_SAFE_INTEGER;
        let currentMaxIndex: any = 0;
        for (
          let secondaryIndex: any = 0;
          secondaryIndex < unsortedArray.length;
          secondaryIndex++
        ) {
          let currentPlayerArray: any = Object.entries(
            unsortedArray[secondaryIndex][1]
          );
          for (
            let killIndex = 0;
            killIndex < currentPlayerArray.length;
            killIndex++
          ) {
            if (
              apiResponse.players[currentPlayerArray[killIndex][0]].class ===
                sortBy &&
              currentPlayerArray[killIndex][1] >= max
            ) {
              max = currentPlayerArray[killIndex][1];
              currentMaxIndex = secondaryIndex;
            }
          }
        }
        sortedArray.push(unsortedArray[currentMaxIndex]);
        unsortedArray.splice(currentMaxIndex, 1);
        searchIndex = 0;
      }
      setKillSpread(sortedArray);
    } else if (sortBy === "kills") {
      for (
        let searchIndex = 0;
        searchIndex < unsortedArray.length + 1;
        searchIndex++
      ) {
        let max = Number.MIN_SAFE_INTEGER;
        let currentMaxIndex = 0;
        for (
          let secondaryIndex = 0;
          secondaryIndex < unsortedArray.length;
          secondaryIndex++
        ) {
          if (
            apiResponse.players[unsortedArray[secondaryIndex][0]].kills >= max
          ) {
            max = apiResponse.players[unsortedArray[secondaryIndex][0]].kills;
            currentMaxIndex = secondaryIndex;
          }
        }
        sortedArray.push(unsortedArray[currentMaxIndex]);
        unsortedArray.splice(currentMaxIndex, 1);
        searchIndex = 0;
      }
      setKillSpread(sortedArray);
    }
  }

  let currentScoreboardIndex = 0;
  let currentRound = 1;
  let currentRound2 = 1;

  if (apiResponse.players !== undefined) {
    demostfLinkIdFinder();
    return (
      <div className=" bg-warmscale-7 min-h-screen"  data-testid="logs-container">
        <Navbar />
        <div className="flex items-center justify-center">
          <div
            id="stat-window"
            className=" w-[88rem] mx-5  mt-5 rounded-t-md drop-shadow"
          >
            <div
              id="header"
              className="flex pt-4 flex-wrap justify-between bg-warmscale-8 pr-5 "
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

                    {apiResponse.info.map.split("_")[1] !== undefined ? apiResponse.info.map.split("_")[1].charAt(0).toUpperCase() + apiResponse.info.map.split("_")[1].slice(1) : apiResponse.info.map}
                  </div>
                </div>
                <div id="match-scores" className="flex">
                  <div
                    id="blue-team-scores"
                    className="block text-center rounded-sm bg-tf-blue border-b-4 border-tf-blue-dark pt-1 px-3"
                  >
                    <div className=" text-lightscale-2 text-2xl font-bold font-cantarell mt-0.5">
                      {apiResponse.teams.blue.score}
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
                      {apiResponse.teams.red.score}
                    </div>
                  </div>
                </div>
                <div id="match-time" className="block">
                  <div
                    id="date"
                    className=" text-lightscale-6 font-medium -mb-1.5"
                  >
                    {new Date(
                      apiResponse.info.date * 1000
                    ).toLocaleDateString()}
                    ,{" "}
                    {new Date(apiResponse.info.date * 1000).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </div>
                  <div
                    id="length"
                    className=" text-lightscale-2 text-xl font-semibold font-cantarell"
                  >
                    {Math.floor(apiResponse.info.matchLength / 60)}:
                    {apiResponse.info.matchLength % 60 < 10
                      ? "0" + (apiResponse.info.matchLength % 60)
                      : apiResponse.info.matchLength % 60}{" "}
                    mins
                  </div>
                </div>
                {/* <div id="rank-info" className="block">
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
                </div> */}
              </div>
              <div
                id="other-links"
                className="flex gap-4 justify-center items-center"
              >
                <a target="_blank" href={`https://demos.tf/${currentDemosID}`} className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-8 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                  demos.tf
                </a>
                <a
                  target="_blank"
                  href={`https://www.logs.tf/${logId}`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-8 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
                >
                  logs.tf
                </a>
                <div className="flex items-center justify-center rounded-sm hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-8 cursor-pointer bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="fill-lightscale-2 w-5"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
            <div
              id="tabs"
              className="grid bg-warmscale-8 select-none grid-cols-5 text-center pt-5"
            >
              <div
                onClick={() => {
                  setTab("scoreboard");
                }}
                className={`border-b-4 duration-75  ${
                  tab === "scoreboard"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-6 hover:border-warmscale-8 hover:bg-warmscale-85 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Scoreboard
              </div>
              <div
                onClick={() => {
                  setTab("performance");
                }}
                className={`border-b-4 duration-75  ${
                  tab === "performance"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-6 hover:border-warmscale-82 hover:bg-warmscale-85 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Performance
              </div>
              <div
                onClick={() => {
                  setTab("matchups");
                }}
                className={`border-b-4 duration-75 ${
                  tab === "matchups"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-6 hover:bg-warmscale-85 hover:border-warmscale-82 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Matchups
              </div>
              <div
                onClick={() => {
                  setTab("charts");
                }}
                className={`border-b-4 duration-75 ${
                  tab === "charts"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-6 hover:bg-warmscale-85 hover:border-warmscale-82 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Charts
              </div>
              <div
                onClick={() => {
                  setTab("other");
                }}
                className={`border-b-4 duration-75 ${
                  tab === "other"
                    ? "border-tf-orange cursor-default"
                    : "border-warmscale-6 hover:bg-warmscale-85 hover:border-warmscale-82 cursor-pointer"
                } py-2 text-lightscale-2 text-lg font-bold font-cantarell`}
              >
                Other
              </div>
            </div>
            <div
              id="scoreboard-tab "
              className={`bg-warmscale-85 py-2 ${
                tab !== "scoreboard" && "hidden "
              }`}
            >
              <div id="scoreboard" className="p-2 rounded-md m-4">
                <div className=" h-1 flex bg-warmscale-4 mt-8 mb-10 mx-2 justify-between">
                  {apiResponse.rounds.map(
                    (round: any, index: any) => {
                      return (
                        <div
                          className={` ${ apiResponse.info.map.includes("pl_") ? ( index === 1 || index % 2 === 1
                          ? "bg-tf-blue-dark"
                          : "bg-tf-red-dark") : 
                            (round.roundWinner === "blue"
                              ? "bg-tf-blue-dark"
                              : "bg-tf-red-dark")
                          } h-1 justify-end items-center flex `}
                          style={{
                            width: `${
                              (round.roundDuration + 15 /
                                apiResponse.info.matchLength) *
                              100
                            }%`,
                          }}
                        >
                          <div className="justify-center flex w-full text-sm font-semibold text-lightscale-6">
                            <div className=" text-center">
                              <div className="mb-2 ">Round {index+1}</div>
                                <div className="text-center">
                                {Math.floor(round.roundDuration / 60)}:
                                  {round.roundDuration % 60 < 10
                                    ? "0" + (round.roundDuration % 60)
                                    : round.roundDuration % 60}{" "}
                                  min
                                </div>
                              </div>
                            </div>
                          <div
                            className={`px-1.5 py-1 ${ apiResponse.info.map.includes("pl_") ? ( index === 1 || index % 2 === 1
                              ? "bg-tf-blue border-2 border-tf-blue-dark2"
                              : "bg-tf-red border-2 border-tf-red-dark2") : 
                                (round.roundWinner === "blue"
                                  ? "bg-tf-blue border-2 border-tf-blue-dark2"
                                  : "bg-tf-red border-2 border-tf-red-dark2")
                              } rounded-md text-xs text-lightscale-2 font-cantarell font-bold flex justify-center items-center`}
                          >
                            {currentRound++}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className="flex justify-center  ">
                  <div className="bg-warmscale-82 p-3 w-fit rounded-md">
                    <div className="flex justify-end -mt-1">
                      {scoreboardCollapsed ? (
                        <svg
                          fill="none"
                          onClick={() => setScoreboardCollapsed(false)}
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          className="h-5 mb-1 cursor-pointer stroke-lightscale-4 hover:stroke-lightscale-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          fill="none"
                          onClick={() => setScoreboardCollapsed(true)}
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          className="h-5 mb-1 cursor-pointer stroke-lightscale-4 hover:stroke-lightscale-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                          />
                        </svg>
                      )}
                    </div>
                    <div id="stat-titles">
                      <div
                        className={`grid h-8 bg-warmscale-9 ${
                          scoreboardCollapsed
                            ? "grid-cols-[260px,_60px,_100px,_repeat(3,60px),_100px,_repeat(3,60px),_100px,_60px,_60px]"
                            : "grid-cols-[260px,_60px,_100px,_repeat(3,60px),_100px,_repeat(3,60px),_100px,_60px,_60px,_repeat(6,40px)]"
                        } `}
                      >
                        <div className="flex items-center ml-4 font-cantarell font-semibold text-lightscale-1">
                          Player
                        </div>
                        {statTitle("class", "C", "Class")}
                        {statTitle("combatScore", "CS", "Combat Score")}
                        {statTitle("kills", "K", "Kills")}
                        {statTitle("assists", "A", "Assists")}
                        {statTitle("deaths", "D", "Deaths")}
                        {statTitle("damage", "DMG", "Damage")}
                        {statTitle("damagePerMinute", "DPM", "Damage/minute")}
                        {statTitle(
                          "killAssistPerDeath",
                          "KA/D",
                          "Kills+Assists/Death"
                        )}
                        {statTitle("killsPerDeath", "K/D", "Kills/Death")}
                        {statTitle("damageTaken", "DT", "Damage Taken")}
                        {statTitle("damageTakenPerMinute", "DTM", "DT/minute")}
                        {statTitle(
                          "deathScreenTime",
                          "DST",
                          "Death Screen Time"
                        )}
                        {scoreboardCollapsed === false &&
                          statTitle("damageTakenPerMinute", "HP", "HP resup")}
                        {scoreboardCollapsed === false &&
                          statTitle("backstabs", "BS", "Backstabs")}
                        {scoreboardCollapsed === false &&
                          statTitle("headshots", "HS", "Headshots")}
                        {scoreboardCollapsed === false &&
                          statTitle("airshots", "AS", "Airshots")}
                        {scoreboardCollapsed === false &&
                          statTitle("pointCaps", "PC", "Points Capped")}
                        {scoreboardCollapsed === false &&
                          statTitle("buildingKills", "BK", "Building Kills")}
                      </div>
                    </div>
                    {apiResponse !== undefined &&
                      scoreboard.map((player: any, index: any) => {
                        const playerObject: any = player[1];
                        if(playerObject.damageTaken !== 0){
                          return (
                            <div id="player-stat-card" >
                              <div
                                className={`grid h-10 border-b border-warmscale-8 ${
                                  currentScoreboardIndex++ % 2 === 1
                                    ? "bg-warmscale-8"
                                    : "bg-warmscale-85"
                                } ${
                                  scoreboardCollapsed
                                    ? "grid-cols-[260px,_60px,_100px,_repeat(3,60px),_100px,_repeat(3,60px),_100px,_60px,_60px]"
                                    : "grid-cols-[260px,_60px,_100px,_repeat(3,60px),_100px,_repeat(3,60px),_100px,_60px,_60px,_repeat(6,40px)]"
                                }`}
                              >
                                <div
                                  className={`block bg-gradient-to-r ${
                                    playerObject.team === "blue"
                                      ? "from-tf-blue-dark"
                                      : "from-tf-red-dark"
                                  }  mr-6 text-ellipsis `}
                                >
                                  <div className="pl-4 w-full h-full flex items-center justify-center ml-2">
                                    <div className="group font-semibold font-cantarell text-lightscale-1 hover:underline cursor-pointer relative">
                                      <div
                                        onClick={() => {
                                          setLinkView(
                                            linkView === player[0]
                                              ? "none"
                                              : player[0]
                                          );
                                        }}
                                        className="truncate w-60"
                                      >
                                        {" "}
                                        {playerObject.userName}
                                      </div>
                                      <div
                                        ref={refOne}
                                        className={`${
                                          linkView === player[0]
                                            ? "scale-100"
                                            : "scale-0"
                                        } top-6 w-20  z-50 bg-warmscale-5 border border-warmscale-6 grid grid-rows-5 rounded-sm absolute`}
                                      >
                                        <a
                                          target="_blank"
                                          href={`/profile/${player[0]}`}
                                          className="hover:bg-warmscale-8  px-2 py-1"
                                        >
                                          Profile
                                        </a>
                                        <a
                                          target="_blank"
                                          href={`https://steamcommunity.com/profiles/${player[0]}`}
                                          className="hover:bg-warmscale-8 px-2 py-1"
                                        >
                                          Steam
                                        </a>
                                        <a
                                          target="_blank"
                                          href={`https://etf2l.org/search/${player[0]}/`}
                                          className="hover:bg-warmscale-8 px-2 py-1"
                                        >
                                          ETF2L
                                        </a>
                                        <a
                                          target="_blank"
                                          href={`https://www.ugcleague.com/players_page.cfm?player_id=${player[0]}`}
                                          className="hover:bg-warmscale-8 px-2 py-1"
                                        >
                                          UGC
                                        </a>
                                        <a
                                          target="_blank"
                                          href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${player[0]}&r=24`}
                                          className="hover:bg-warmscale-8 px-2 py-1"
                                        >
                                          RGL
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                  
                                </div>
                                <div className="flex justify-center items-center border-l border-warmscale-6">
                                  {Object.entries(playerObject.classStats).map(
                                    (classPlayed: any, index: any) => {
                                      if (
                                        classPlayed[0] !== "changedClass" &&
                                        (classPlayed[1].time /
                                        playerObject.playtime) *
                                          100 >
                                          30
                                      ) {
                                        return (
                                          <div className="group relative font-cantarell text-lightscale-2 " >
                                            <div className="scale-0 group-hover:scale-100 w-fit bottom-8 absolute rounded-sm left-1/2 transform -translate-x-1/2 select-none bg-warmscale-5  border-1 drop-shadow-lg border-warmscale-8">
                                              <div className="w-full py-1 text-lg bg-warmscale-7 border-b border-warmscale-7 rounded-t-sm text-lightscale-2 font-semibold pl-4">
                                                {classPlayed[0]}
                                              </div>
                                              <div className="bg-warmscale-5 flex justify-center w-full">
                                                <div className="gap-x-0.5 m-2 grid grid-cols-[70px,_50px,_50px,_50px,_80px] bg-warmscale-3 text-center">
                                                  <div className="bg-warmscale-5 font-semibold">
                                                    Time
                                                  </div>
                                                  <div className="bg-warmscale-5 font-semibold">
                                                    K
                                                  </div>
                                                  <div className="bg-warmscale-5 font-semibold">
                                                    A
                                                  </div>
                                                  <div className="bg-warmscale-5 font-semibold">
                                                    D
                                                  </div>
                                                  <div className="bg-warmscale-5 font-semibold">
                                                    DMG
                                                  </div>
                                                  <div className="bg-warmscale-5">
                                                    {Math.floor(
                                                      classPlayed[1].time / 60
                                                    )}
                                                    :
                                                    {classPlayed[1].time % 60 < 10
                                                      ? "0" +
                                                        (classPlayed[1].time % 60)
                                                      : classPlayed[1].time % 60}
                                                  </div>
                                                  <div className="bg-warmscale-5">
                                                    {classPlayed[1].kills}
                                                  </div>
                                                  <div className="bg-warmscale-5">
                                                    {classPlayed[1].assists}
                                                  </div>
                                                  <div className="bg-warmscale-5">
                                                    {classPlayed[1].deaths}
                                                  </div>
                                                  <div className="bg-warmscale-5">
                                                    {classPlayed[1].damage}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="bg-warmscale-7  justify-around w-full  border-t border-warmscale-7 p-2">
                                                <div className="flex  font-semibold">
                                                  <div className="w-48 pl-3 py-1">
                                                    WEAPON
                                                  </div>
                                                  <div className="border-l-2 py-1 border-warmscale-4 text-center w-12">
                                                    K
                                                  </div>
                                                  <div className="border-l-2 py-1 border-warmscale-4 text-center w-28">
                                                    DMG
                                                  </div>
                                                  <div className="border-l-2 py-1 border-warmscale-4 text-center w-16">
                                                    ACC
                                                  </div>
                                                </div>
                                                {Object.entries(
                                                  classPlayed[1].weapons
                                                ).map((weapon: any, index: any) => {
                                                  return (
                                                    <div
                                                      
                                                      className={`flex ${
                                                        index % 2 === 0
                                                          ? "bg-warmscale-8"
                                                          : "bg-warmscale-7"
                                                      }`}
                                                    >
                                                      <div className="w-48 pl-3 py-1">
                                                        {weaponsList[
                                                          weapon[0]
                                                        ] !== undefined
                                                          ? weaponsList[weapon[0]]
                                                              .name
                                                          : weapon[0]}
                                                      </div>
                                                      <div className="border-l-2 py-1 border-warmscale-4 text-center w-12">
                                                        {weapon[1].kills}
                                                      </div>
                                                      <div className="border-l-2 py-1 border-warmscale-4 text-center w-28 flex items-center justify-center">
                                                        {weapon[1].damage !==
                                                        undefined
                                                          ? weapon[1].damage
                                                          : "-"}{" "}
                                                        <span className="text-xs text-lightscale-6 ml-0.5">
                                                          {" "}
                                                          {weapon[1].damage !==
                                                            undefined &&
                                                            "(" +
                                                              Math.round(
                                                                (weapon[1]
                                                                  .damage /
                                                                  playerObject.damage) *
                                                                  100
                                                              ) +
                                                              "%)"}{" "}
                                                        </span>{" "}
                                                      </div>
                                                      <div className="border-l-2 py-1 border-warmscale-4 text-center w-16">
                                                        {weapon[1].shotsFired !==
                                                          0 &&
                                                        weapon[1].shotsFired !==
                                                          undefined
                                                          ? Math.round(
                                                              (weapon[1]
                                                                .shotsHit /
                                                                weapon[1]
                                                                  .shotsFired) *
                                                                100
                                                            ) + "%"
                                                          : "-"}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                              <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                            </div>
                                            <img
                                              src={`../../../class icons/Leaderboard_class_${classPlayed[0]}.png`}
                                              className="h-6 "
                                              alt=""
                                              style={{
                                                opacity: `${Math.floor(
                                                  (classPlayed[1].time / playerObject.playtime) *
                                                    200
                                                )}%`,
                                              }}
                                            />
                                          </div>
                                        );
                                      }
                                    }
                                  )}
                                </div>
                                {stat("combatScore", 1)}
                                {stat("kills")}
                                {stat("assists")}
                                {stat("deaths")}
                                {stat("damage")}
                                {stat("damagePerMinute")}
                                {stat("killAssistPerDeath", 1)}
                                {stat("killsPerDeath", 1)}
                                {stat("damageTaken")}
                                {stat("damageTakenPerMinute")}
                                <div className="flex items-center justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6">
                                  {Math.floor(playerObject.deathScreenTime / 60)}:
                                  {playerObject.deathScreenTime % 60 < 10
                                    ? "0" + (playerObject.deathScreenTime % 60)
                                    : playerObject.deathScreenTime % 60}
                                </div>
                                {scoreboardCollapsed === false && (
                                  <div className="flex items-center justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6">
                                    {playerObject.resup.medkit}
                                  </div>
                                )}
                                {scoreboardCollapsed === false &&
                                  stat("backstabs")}
                                {scoreboardCollapsed === false &&
                                  stat("headshots")}
                                {scoreboardCollapsed === false &&
                                  stat("airshots")}
                                {scoreboardCollapsed === false && (
                                  <div className="flex items-center justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6">
                                    {playerObject.pointCaps}
                                  </div>
                                )}
                                {scoreboardCollapsed === false &&
                                  stat("buildingKills")}
                              </div>
                            </div>
                          );
                        }
                        function stat(
                          statInput: string,
                          decimalPlaces: number = 0
                        ) {
                          return (
                            <div
                              className={`flex items-center ${
                                currentScoreboardSort === statInput &&
                                "bg-lightscale-4 bg-opacity-5"
                              } justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6`}
                            >
                              {playerObject[statInput] === null ? 0 : playerObject[statInput].toFixed(decimalPlaces)}
                            </div>
                          );
                        }
                      })}
                  </div>
                </div>
              </div>
              {apiResponse.info.passTime === 1 && <div className="w-full flex justify-center items-center">
                <div className="bg-warmscale-82 p-3 w-fit rounded-md">
                  <div className="text-lg text-lightscale-3 font-semibold font-cantarell text-center mb-3">PASS TIME</div>
                    <div id="stat-titles">
                      <div
                        className={`grid h-8 bg-warmscale-9 grid-cols-[260px,repeat(11,70px)]`}
                      >
                        <div className="flex items-center ml-4 font-cantarell font-semibold text-lightscale-1 ">
                          Player
                        </div>
                        {ptstatTitle("class", "C", "Class")}
                        {ptstatTitle("scores", "SCORE", "Scores")}
                        {ptstatTitle("assists", "ASSISTS", "Assists")}
                        {ptstatTitle("saves", "SAVES", "Saves")}
                        {ptstatTitle("steals", "STEALS", "Steals")}
                        {ptstatTitle("ballsStolen", "BS", "Balls Stolen")}
                        {ptstatTitle("failedPass", "FP", "Failed Passes - Interceptions that occur within 1 second")}
                        {ptstatTitle("intercepts", "INT", "Intercepts")}
                        {ptstatTitle("handoffs", "HNDFF", "Hand Offs")}
                        {ptstatTitle("catapults", "CTPLT", "Catapults")}
                        {ptstatTitle("firstGrab", "FG", "First Grabs")}
                      </div>
                    </div>
                    {apiResponse !== undefined &&
                      ptscoreboard.map((player: any, index: any) => {
                        const playerObject: any = player[1];
                        if(playerObject.damageTaken !== 0){
                          return (
                            <div id="player-stat-card" >
                              <div
                                className={`grid h-10 border-b border-warmscale-8 ${
                                  currentScoreboardIndex++ % 2 === 1
                                    ? "bg-warmscale-8"
                                    : "bg-warmscale-85"
                                } grid-cols-[260px,repeat(11,70px)]`}
                              >
                                <div
                                  className={`block bg-gradient-to-r ${
                                    playerObject.team === "blue"
                                      ? "from-tf-blue-dark"
                                      : "from-tf-red-dark"
                                  }  mr-6 text-ellipsis `}
                                >
                                  <div className="pl-4 w-full h-full flex items-center justify-center ml-2">
                                    <div className="group font-semibold font-cantarell text-lightscale-1 hover:underline cursor-pointer relative">
                                      <a
                                        href={`/profile/${player[0]}`}
                                        className="truncate w-60"
                                      >
                                        {" "}
                                        {playerObject.userName}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-center items-center border-l border-warmscale-6">
                                  {Object.entries(playerObject.classStats).map(
                                    (classPlayed: any, index: any) => {
                                      if (
                                        classPlayed[0] !== "changedClass" &&
                                        (classPlayed[1].time /
                                        playerObject.playtime) *
                                          100 >
                                          30
                                      ) {
                                        return (
                                          <div className="group relative font-cantarell text-lightscale-2 " >
                                            <img
                                              src={`../../../class icons/Leaderboard_class_${classPlayed[0]}.png`}
                                              className="h-6 "
                                              alt=""
                                              style={{
                                                opacity: `${Math.floor(
                                                  (classPlayed[1].time / playerObject.playtime) *
                                                    200
                                                )}%`,
                                              }}
                                            />
                                          </div>
                                        );
                                      }
                                    }
                                  )}
                                </div>
                                {stat("scores")}
                                {stat("assists")}
                                {stat("saves")}
                                {stat("steals")}
                                {stat("ballsStolen")}
                                {stat("failedPass")}
                                {stat("intercepts")}
                                {stat("handoffs")}
                                {stat("catapults")}
                                {stat("firstGrab")}
                              </div>
                            </div>
                          );
                        }
                        function stat(
                          statInput: string,
                          decimalPlaces: number = 0
                        ) {
                          return (
                            <div
                              className={`flex items-center relative group ${
                                ptcurrentScoreboardSort === statInput &&
                                "bg-lightscale-4 bg-opacity-5"
                              } justify-center font-cantarell text-lightscale-1 border-l border-warmscale-6`}
                            >
                              {statInput === "scores" && <div className="absolute group-hover:scale-100 scale-0 bg-warmscale-85 rounded-sm drop-shadow border-warmscale-4 border z-50 p-2 bottom-9">
                                <div className="text-xs font-semibold font-cantarell text-lightscale-6 text-center  border-b border-b-warmscale-6 mb-1">PANACEAS</div>
                                <div className="text-center font-semibold text-xs ">{player[1].passTime.panaceas === 0 ? 0 : player[1].passTime.panaceas.toFixed(decimalPlaces)}</div>
                                <div className=" h-2 w-2 flex justify-center items-center bg-warmscale-85 border-b border-r border-b-warmscale-4 border-r-warmscale-4 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                              </div>}
                              {player[1].passTime[statInput] === 0 ? 0 : player[1].passTime[statInput].toFixed(decimalPlaces)}
                            </div>
                          );
                        }
                      })}
                  </div>
              </div>}
              <div
                id="team-sums"
                className="flex justify-center items-center my-10"
              >
                <div
                  id="team-sums-wrapper"
                  className="w-1/2 p-2 bg-warmscale-82 rounded-md drop-shadow-md"
                >
                  <div
                    id="team-sum-titles"
                    className="grid font-cantarell text-lightscale-1 font-semibold text-center grid-cols-6"
                  >
                    <div>KILLS</div>
                    <div>DMG</div>
                    <div>UBERS</div>
                    <div>DROPS</div>
                    <div>CAPS</div>
                    <div>MIDS</div>
                  </div>
                  <div
                    id="blue-team-sums"
                    className="p-1 mt-2 bg-tf-blue-dark border-b-4 border-tf-blue-dark2 rounded-sm grid font-cantarell text-lightscale-1 font-medium text-center grid-cols-6"
                  >
                    <div>{apiResponse.teams.blue.kills}</div>
                    <div>{apiResponse.teams.blue.damage}</div>
                    <div>{apiResponse.teams.blue.charges}</div>
                    <div>{apiResponse.teams.blue.drops}</div>
                    <div>{apiResponse.teams.blue.caps}</div>
                    <div>{apiResponse.teams.blue.firstcaps}</div>
                  </div>
                  <div
                    id="red-team-sums"
                    className="p-1 mt-2 bg-tf-red-dark border-b-4 border-tf-red-dark2 rounded-sm grid font-cantarell text-lightscale-1 font-medium text-center grid-cols-6"
                  >
                    <div>{apiResponse.teams.red.kills}</div>
                    <div>{apiResponse.teams.red.damage}</div>
                    <div>{apiResponse.teams.red.charges}</div>
                    <div>{apiResponse.teams.red.drops}</div>
                    <div>{apiResponse.teams.red.caps}</div>
                    <div>{apiResponse.teams.red.firstcaps}</div>
                  </div>
                </div>
              </div>
              <div className="w-full mb-6 -mt-4">
                <div className="mx-72 bg-warmscale-82 mt-10 rounded-md pt-3 pb-1">
                  <div className="text-xl font-bold grid grid-cols-7 text-center mx-2 text-lightscale-2 font-cantarell mb-3">
                    <div>Round</div>
                    <div>Length</div>
                    <div>Score</div>
                    <div>Blue Kills</div>
                    <div>Red Kills</div>
                    <div>Blue DMG</div>
                    <div>Red DMG</div>
                  </div>
                  {apiResponse.rounds.map(
                    (round: any , index: any) => {
                      return (
                        <div
                          
                          className={`${
                            round.roundWinner === "blue"
                              ? "bg-tf-blue-dark border-tf-blue-dark2"
                              : "bg-tf-red-dark border-tf-red-dark2"
                          } font-medium grid grid-cols-7 text-center items-center font-cantarell text-lightscale-2 border-b-4 h-9 mb-2 mx-2 rounded-sm`}
                        >
                          <div>{currentRound2++}</div>
                          <div>
                            {Math.floor(round.roundDuration / 60)}:
                            {round.roundDuration % 60 < 10
                              ? "0" + (round.roundDuration % 60)
                              : round.roundDuration % 60}
                          </div>
                          <div>
                            {round.teamScores.blue.score} -{" "}
                            {round.teamScores.red.score}
                          </div>
                          <div>{round.teamScores.blue.kills}</div>
                          <div>{round.teamScores.red.kills}</div>
                          <div>{round.teamScores.blue.damage}</div>
                          <div>{round.teamScores.red.damage}</div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
              <div id="medic-heals">
                <div
                  id="medic-heals-wrapper"
                  className="flex justify-center gap-4 mb-4"
                >
                  {Object.entries(apiResponse.players).map((player: any, index) => {
                    if (player[1].healsPerMinute > 150) {
                      return (
                        <div
                          
                          id="medic-stats"
                          className="font-cantarell text-lightscale-1 bg-warmscale-82 p-2 rounded-md w-[26rem]"
                        >
                          <div
                            id="player-username"
                            className={`flex justify-center items-center py-1 font-semibold rounded-sm bg-tf-${player[1].team}-dark border-b-4 border-tf-${player[1].team}-dark2`}
                          >
                            {player[1].userName}
                          </div>
                          <div id="stats">
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Healing</div>
                              <div>{player[1].heals}</div>
                            </div>
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Heals Per Minute</div>
                              <div>{player[1].healsPerMinute}/m</div>
                            </div>
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Charges(total)</div>
                              <div>{player[1].medicStats.ubers}</div>
                            </div>
                            <div className="flex">
                              {Object.entries(
                                player[1].medicStats.uberTypes
                              ).map((uberGun, index) => {
                                return (
                                  <div
                                    
                                    id="stat"
                                    className="flex ml-4 text-lightscale-4 font-light text-sm -mt-1.5"
                                  >
                                    <div className=" mr-0.5">{uberGun[0]}</div>
                                    <div>{"(" + uberGun[1] + ")"}</div>
                                  </div>
                                );
                              })}
                            </div>
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Drops</div>
                              <div>{player[1].medicStats.drops}</div>
                            </div>
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Near full charge deaths (90+)</div>
                              <div>{player[1].medicStats.nearFullDeaths}</div>
                            </div>
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Crossbow Healing</div>
                              <div>
                                {player[1].crossbowHealing}{" "}
                                <span className="text-lightscale-5 text-sm">
                                  {"(" +
                                    Math.round(
                                      (player[1].crossbowHealing /
                                        player[1].heals) *
                                        100
                                    ) +
                                    "%)"}
                                </span>{" "}
                              </div>
                            </div>
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Avg time heal after spawn</div>
                              <div>
                                {Math.round(
                                  player[1].medicStats.healAfterSpawn * 10
                                ) / 10}
                              </div>
                            </div>
                            <div
                              id="stat"
                              className="flex flex-wrap justify-between my-1"
                            >
                              <div>Avg uber length</div>
                              <div>{player[1].medicStats.uberLength}</div>
                            </div>
                          </div>
                          <div
                            id="divider"
                            className={`h-1 my-2 bg-tf-${player[1].team} w-full`}
                          ></div>
                          <div id="heal-division ">
                            <div
                              id="heal-division-titles"
                              className="font-semibold grid grid-cols-[1fr,_54px,_90px,_50px] mb-2 mx-2 -mr-1"
                            >
                              <div>Heal Target</div>
                              <div className="text-center">C</div>
                              <div className="text-center">Heal</div>
                              <div className="text-center">%</div>
                            </div>
                            {Object.entries(
                              apiResponse.healSpread[player[0]]
                            ).map((healedPlayer: any ,index) => {
                              return (
                                <div
                                  
                                  id="healed-player"
                                  className="grid grid-cols-[1fr,_50px,_90px,_50px] mx-2 -mr-1"
                                >
                                  <div className="truncate">
                                    {
                                      apiResponse.players[healedPlayer[0]]
                                        .userName
                                    }{" "}
                                    <span className="text-ellipsis text-lightscale-5">
                                      {apiResponse.players[healedPlayer[0]]
                                        .team !== player[1].team && `(enemy)`}
                                    </span>
                                  </div>
                                  <img
                                    src={`../../../class icons/Leaderboard_class_${
                                      apiResponse.players[healedPlayer[0]].class
                                    }.png`}
                                    alt=""
                                    className="h-6 flex ml-3"
                                  />
                                  <div className="text-center border-x py-1 border-warmscale-5">
                                    {healedPlayer[1]}
                                  </div>
                                  <div className="text-center">
                                    {Math.round(
                                      (healedPlayer[1] / player[1].heals) * 100
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
              <div className="flex justify-center items-center mb-2">
                <div className="p-2 bg-warmscale-82 rounded-md">
                  <div className="grid items-center grid-cols-[70px,_260px,_repeat(11,60px)] font-bold font-cantarell text-lightscale-1  border-b border-warmscale-5">
                    <div className="flex justify-center">Team</div>
                    <div className="pl-3 border-l border-warmscale-5 py-2">
                      Player
                    </div>
                    <div className="flex justify-center border-l border-warmscale-5 py-2">
                      C
                    </div>
                    {killSpreadTitles(
                      killSpreadSorter,
                      "scout",
                      killSpreadSort
                    )}
                    {killSpreadTitles(
                      killSpreadSorter,
                      "soldier",
                      killSpreadSort
                    )}
                    {killSpreadTitles(killSpreadSorter, "pyro", killSpreadSort)}
                    {killSpreadTitles(
                      killSpreadSorter,
                      "demoman",
                      killSpreadSort
                    )}
                    {killSpreadTitles(
                      killSpreadSorter,
                      "heavyweapons",
                      killSpreadSort
                    )}
                    {killSpreadTitles(
                      killSpreadSorter,
                      "engineer",
                      killSpreadSort
                    )}
                    {killSpreadTitles(
                      killSpreadSorter,
                      "medic",
                      killSpreadSort
                    )}
                    {killSpreadTitles(
                      killSpreadSorter,
                      "sniper",
                      killSpreadSort
                    )}
                    {killSpreadTitles(killSpreadSorter, "spy", killSpreadSort)}
                    <div
                      onClick={() => {
                        killSpreadSorter("kills");
                      }}
                      className={`cursor-pointer flex justify-center border-l border-warmscale-5 py-2 ${
                        killSpreadSort === "kills" &&
                        "border-b-2 border-b-tf-orange"
                      }`}
                    >
                      K
                    </div>
                  </div>
                  {killSpread.map((killer: any, index: any) => {
                    return (
                      <div
                        
                        className={`grid items-center grid-cols-[70px,_260px,_repeat(11,60px)] font-cantarell text-lightscale-1 ${
                          index % 2 === 1 && "bg-warmscale-82"
                        }`}
                      >
                        <div
                          className={`flex justify-center font-bold ${
                            apiResponse.players[killer[0]].team === "red"
                              ? "text-tf-red"
                              : "text-tf-blue"
                          }`}
                        >
                          {apiResponse.players[killer[0]].team}
                        </div>
                        <div className="pl-3 border-l border-warmscale-5 py-1.5 truncate">
                          {apiResponse.players[killer[0]].userName}
                        </div>
                        <div className="flex justify-center border-l border-warmscale-5 py-1.5">
                          <img
                            src={`../../../class icons/Leaderboard_class_${
                              apiResponse.players[killer[0]].class
                            }.png`}
                            alt=""
                            className="h-6"
                          />
                        </div>
                        {classOrder.map((currentClass, index) => {
                          let currentArray: any = Object.entries(killer[1]);
                          let classFound = false;
                          for (
                            let currentVictim = 0;
                            currentVictim < currentArray.length;
                            currentVictim++
                          ) {
                            if (
                              currentClass ===
                              apiResponse.players[
                                currentArray[currentVictim][0]
                              ].class
                            ) {
                              classFound = true;
                              return (
                                <div  className="text-center border-l border-warmscale-5 py-1.5 font-semibold font-cantarell">
                                  {currentArray[currentVictim][1]}
                                </div>
                              );
                            }
                          }
                          if (classFound === false) {
                            return (
                              <div  className="text-center border-l border-warmscale-5 py-1.5 text-warmscale-3 font-thin">
                                0
                              </div>
                            );
                          }
                        })}
                        <div className="flex justify-center border-l border-warmscale-5 py-1.5">
                          {apiResponse.players[killer[0]].kills}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div
              id="performance-tab"
              className={`bg-warmscale-85 mb-7 py-4 ${
                tab !== "performance" && "hidden "
              }`}
            >
              <div
                id="class-icons"
                className="h-10 flex justify-center items-center my-6"
              >
                <div id="red-team-icons" className="flex">
                  {classOrder.map((currentClass: any , index) => {
                    return Object.entries(apiResponse.players).map(
                      (player: any, index) => {
                        if (
                          player[1].team === "red" &&
                          player[1].class === currentClass
                        ) {
                          return (
                            <div className="group relative" >
                              <div className="absolute scale-0 text-lightscale-2 font-cantarell left-1/2 transform bottom-16 -translate-x-1/2 truncate font-semibold p-1 px-2 bg-warmscale-9 rounded-md bg-opacity-70 group-hover:scale-100">
                                {player[1].userName}
                              </div>
                              <img
                                onClick={() => {
                                  setPerformanceFocus(player[0]);
                                }}
                                src={`../../../class icons/Leaderboard_class_${player[1].class}.png`}
                                className={` ${
                                  currentPerformanceFocus === player[0]
                                    ? "border-lightscale-2 bg-tf-red hover:border-lightscale-2"
                                    : "bg-tf-red-dark cursor-pointer "
                                }  h-14 p-1.5 hover:bg-tf-red hover:border-tf-red-dark border-4 rounded-md border-tf-red-dark2 m-1`}
                                alt=""
                              />
                            </div>
                          );
                        }
                      }
                    );
                  })}
                </div>
                <div
                  id="team-icon-dividers"
                  className="font-bold text-4xl font-cantarell mx-3 text-lightscale-1"
                >
                  VS
                </div>
                <div id="blue-team-icons" className="flex">
                  {classOrder.map((currentClass: any, index) => {
                    return Object.entries(apiResponse.players).map(
                      (player: any) => {
                        if (
                          player[1].team === "blue" &&
                          player[1].class === currentClass
                        ) {
                          return (
                            <div className="group relative" >
                              <div className="absolute scale-0 text-lightscale-2 font-cantarell left-1/2 transform bottom-16 -translate-x-1/2 truncate font-semibold p-1 px-2 bg-warmscale-9 rounded-md bg-opacity-70 group-hover:scale-100">
                                {player[1].userName}
                              </div>
                              <img
                                onClick={() => {
                                  setPerformanceFocus(player[0]);
                                }}
                                src={`../../../class icons/Leaderboard_class_${player[1].class}.png`}
                                className={` ${
                                  currentPerformanceFocus === player[0]
                                    ? "border-lightscale-2 bg-tf-blue hover:border-lightscale-2"
                                    : "bg-tf-blue-dark cursor-pointer "
                                }  h-14 p-1.5 hover:bg-tf-blue hover:border-tf-blue-dark border-4 rounded-md border-tf-blue-dark2 m-1`}
                                alt=""
                              />
                            </div>
                          );
                        }
                      }
                    );
                  })}
                </div>
              </div>
              <div className="flex h-full">
                {currentPerformanceFocus !== "" && (
                  <div className="flex ml-10 mr-10 mb-10">
                    <div className="w-2/3 mt-4 bg-warmscale-82 p-3 rounded-md h-auto">
                      <div
                        className={`flex mb-2 justify-center items-center h-9  ${
                          apiResponse.players[currentPerformanceFocus].team ===
                          "blue"
                            ? "bg-tf-blue"
                            : "bg-tf-red"
                        }  border-b-4  ${
                          apiResponse.players[currentPerformanceFocus].team ===
                          "blue"
                            ? "border-tf-blue-dark"
                            : "border-tf-red-dark"
                        }  rounded-md text-xl font-cantarell font-semibold text-lightscale-1`}
                      >
                        {apiResponse.players[currentPerformanceFocus].userName}
                      </div>
                      <div className="flex">
                        <div id="class-image" className="ml-3">
                          <img
                            src={`../../../class images/${apiResponse.players[currentPerformanceFocus].class}_${apiResponse.players[currentPerformanceFocus].team}.png`}
                            className="object-cover h-[26rem]"
                            alt=""
                          />
                        </div>
                        <div>
                          <div
                            id="damage-division-titles"
                            className="grid grid-cols-[1fr,_30px,_1fr] gap-2 w-[32rem] text-lightscale-1 font-semibold text-xl font-cantarell mb-2"
                          >
                            <div
                              className="text-right cursor-pointer"
                              onClick={() => {
                                setPerformanceChartSort("taken");
                              }}
                            >
                              <div className="flex justify-end items-center">
                                {performanceChartSort === "taken" && (
                                  <div>
                                    <svg
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-6 pt-1 mr-1"
                                    >
                                      <path
                                        clipRule="evenodd"
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                      ></path>
                                    </svg>
                                  </div>
                                )}
                                Damage Taken
                              </div>
                            </div>
                            <div
                              className="text-center cursor-pointer"
                              onClick={() => {
                                setPerformanceChartSort("class");
                              }}
                            >
                              <div className="flex justify-center items-center">
                                C
                                {performanceChartSort === "class" && (
                                  <div>
                                    <svg
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-6 pt-1 -mr-1"
                                    >
                                      <path
                                        clipRule="evenodd"
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                      ></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                setPerformanceChartSort("dealt");
                              }}
                            >
                              <div className="flex items-center">
                                Damage Dealt
                                {performanceChartSort === "dealt" && (
                                  <div>
                                    <svg
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-6 pt-1 ml-1"
                                    >
                                      <path
                                        clipRule="evenodd"
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                      ></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div id="damage-division-chart">
                            {performanceChartSort === "dealt" &&
                              Object.entries(
                                apiResponse.players[currentPerformanceFocus]
                                  .damageDivision.damageTo
                              ).map((player: any, index) => {
                                let objectA: any = Object.entries(
                                  apiResponse.players[currentPerformanceFocus]
                                    .damageDivision.damageTo
                                )[0][1];
                                let objectB: any = Object.entries(
                                  apiResponse.players[currentPerformanceFocus]
                                    .damageDivision.damageFrom
                                )[0][1];
                                let currentMax: any = Math.max(
                                  objectA,
                                  objectB
                                );
                                let currentPercent = Math.round(
                                  (apiResponse.players[currentPerformanceFocus]
                                    .damageDivision.damageFrom[player[0]] /
                                    currentMax) *
                                    100
                                );
                                return (
                                  <div  className="grid grid-cols-[1fr,_30px,_1fr] gap-2 text-lightscale-1 font-semibold font-cantarell">
                                    <div className="relative group">
                                      <div className="absolute right-0 w-full">
                                        <div className="flex justify-end items-center gap-1">
                                          {
                                            apiResponse.players[
                                              currentPerformanceFocus
                                            ].damageDivision.damageFrom[
                                              player[0]
                                            ]
                                          }{" "}
                                          <div
                                            className={`${
                                              apiResponse.players[player[0]]
                                                .team === "blue"
                                                ? "bg-tf-blue border-tf-blue-dark"
                                                : "bg-tf-red border-tf-red-dark"
                                            } group text-clip h-9 border-b-2 rounded-sm  p-1`}
                                            style={{
                                              width: `${currentPercent + "%"}`,
                                            }}
                                          >
                                            <div
                                              className={`scale-0 ${
                                                Math.round(
                                                  (apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damageDivision.damageFrom[
                                                    player[0]
                                                  ] /
                                                    apiResponse.players[
                                                      currentPerformanceFocus
                                                    ].damageTaken) *
                                                    100
                                                ) > 5
                                                  ? "group-hover:scale-100"
                                                  : "group-hover:scale-0"
                                              } ml-1 mt-1 text-lightscale-4 text-xs`}
                                            >
                                              {Math.round(
                                                (apiResponse.players[
                                                  currentPerformanceFocus
                                                ].damageDivision.damageFrom[
                                                  player[0]
                                                ] /
                                                  apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damageTaken) *
                                                  100
                                              ) + "%"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center group select-none">
                                      <div className="scale-0 absolute z-40 bg-warmscale-85 mb-1 py-0.5 rounded-sm bg-opacity-90 px-2 group-hover:scale-100">
                                        {
                                          apiResponse.players[player[0]]
                                            .userName
                                        }
                                      </div>
                                      <img
                                        src={`../../../class icons/Leaderboard_class_${
                                          apiResponse.players[player[0]].class
                                        }.png`}
                                        alt=""
                                        className="h-7 my-1.5"
                                      />
                                    </div>
                                    <div className="relative group ">
                                      <div className="absolute right-0 w-full">
                                        <div className="flex items-center gap-1">
                                          <div
                                            className={`${
                                              apiResponse.players[player[0]]
                                                .team === "red"
                                                ? "bg-tf-blue border-tf-blue-dark"
                                                : "bg-tf-red border-tf-red-dark"
                                            } group text-clip h-9 border-b-2 mr-1 rounded-sm p-1`}
                                            style={{
                                              width: `${
                                                Math.round(
                                                  (player[1] / currentMax) * 100
                                                ) + "%"
                                              }`,
                                            }}
                                          >
                                            <div
                                              className={`scale-0 text-lightscale-4 mt-1 flex justify-end ${
                                                Math.round(
                                                  (player[1] /
                                                    apiResponse.players[
                                                      currentPerformanceFocus
                                                    ].damage) *
                                                    100
                                                ) > 5
                                                  ? "group-hover:scale-100"
                                                  : "group-hover:scale-0"
                                              } text-xs mr-1`}
                                            >
                                              {Math.round(
                                                (player[1] /
                                                  apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damage) *
                                                  100
                                              ) + "%"}
                                            </div>
                                          </div>
                                          {player[1]}{" "}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            {performanceChartSort === "taken" &&
                              Object.entries(
                                apiResponse.players[currentPerformanceFocus]
                                  .damageDivision.damageFrom
                              ).map((player: any, index) => {
                                let objectA: any = Object.entries(
                                  apiResponse.players[currentPerformanceFocus]
                                    .damageDivision.damageTo
                                )[0][1];
                                let objectB: any = Object.entries(
                                  apiResponse.players[currentPerformanceFocus]
                                    .damageDivision.damageFrom
                                )[0][1];
                                let currentMax: any = Math.max(
                                  objectA,
                                  objectB
                                );
                                let currentPercent = Math.round(
                                  (apiResponse.players[currentPerformanceFocus]
                                    .damageDivision.damageFrom[player[0]] /
                                    currentMax) *
                                    100
                                );
                                return (
                                  <div  className="grid grid-cols-[1fr,_30px,_1fr] gap-2 text-lightscale-1 font-semibold font-cantarell">
                                    <div className="relative group">
                                      <div className="absolute right-0 w-full">
                                        <div className="flex justify-end items-center gap-1">
                                          {player[1]}{" "}
                                          <div
                                            className={`${
                                              apiResponse.players[player[0]]
                                                .team === "blue"
                                                ? "bg-tf-blue border-tf-blue-dark"
                                                : "bg-tf-red border-tf-red-dark"
                                            }  text-clip h-9 border-b-2 ml-1 group  rounded-sm  p-1`}
                                            style={{
                                              width: `${currentPercent + "%"}`,
                                            }}
                                          >
                                            <div
                                              className={`text-lightscale-4 text-xs flex ml-1 mt-1.5 scale-0 ${
                                                Math.round(
                                                  (apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damageDivision.damageFrom[
                                                    player[0]
                                                  ] /
                                                    apiResponse.players[
                                                      currentPerformanceFocus
                                                    ].damageTaken) *
                                                    100
                                                ) > 5
                                                  ? "group-hover:scale-100"
                                                  : "group-hover:scale-0"
                                              }`}
                                            >
                                              {Math.round(
                                                (apiResponse.players[
                                                  currentPerformanceFocus
                                                ].damageDivision.damageFrom[
                                                  player[0]
                                                ] /
                                                  apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damageTaken) *
                                                  100
                                              ) + "%"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center group select-none">
                                      <div
                                        className={`scale-0 absolute z-40 bg-warmscale-85 mb-1 py-0.5 rounded-sm bg-opacity-90 px-2 ${
                                          Math.round(
                                            (apiResponse.players[
                                              currentPerformanceFocus
                                            ].damageDivision.damageTo[
                                              player[0]
                                            ] /
                                              currentMax) *
                                              100
                                          ) > 5
                                            ? "group-hover:scale-100"
                                            : "group-hover:scale-0"
                                        }`}
                                      >
                                        {
                                          apiResponse.players[player[0]]
                                            .userName
                                        }
                                      </div>
                                      <img
                                        src={`../../../class icons/Leaderboard_class_${
                                          apiResponse.players[player[0]].class
                                        }.png`}
                                        alt=""
                                        className="h-7 my-1.5"
                                      />
                                    </div>
                                    <div className="relative group">
                                      <div className="absolute right-0 w-full">
                                        <div className="flex items-center gap-1">
                                          <div
                                            className={`${
                                              apiResponse.players[player[0]]
                                                .team === "red"
                                                ? "bg-tf-blue border-tf-blue-dark"
                                                : "bg-tf-red border-tf-red-dark"
                                            } group text-clip h-9 border-b-2 mr-1 rounded-sm p-1`}
                                            style={{
                                              width: `${
                                                Math.round(
                                                  (apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damageDivision.damageTo[
                                                    player[0]
                                                  ] /
                                                    currentMax) *
                                                    100
                                                ) + "%"
                                              }`,
                                            }}
                                          >
                                            <span
                                              className={` flex justify-end mt-1 text-lightscale-4 text-xs scale-0 mr-1 ${
                                                Math.round(
                                                  (apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damageDivision.damageTo[
                                                    player[0]
                                                  ] /
                                                    apiResponse.players[
                                                      currentPerformanceFocus
                                                    ].damage) *
                                                    100
                                                ) > 5
                                                  ? "group-hover:scale-100"
                                                  : "group-hover:scale-0"
                                              }`}
                                            >
                                              {Math.round(
                                                (apiResponse.players[
                                                  currentPerformanceFocus
                                                ].damageDivision.damageTo[
                                                  player[0]
                                                ] /
                                                  apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damage) *
                                                  100
                                              ) + "%"}
                                            </span>
                                          </div>{" "}
                                          {
                                            apiResponse.players[
                                              currentPerformanceFocus
                                            ].damageDivision.damageTo[player[0]]
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            {performanceChartSort === "class" &&
                              damageDivisionSortByClass().map((player: any , index: any) => {
                                let currentPlayerArray: Array<any> =
                                  Object.entries(player);
                                  let objectA: any = Object.entries(
                                    apiResponse.players[currentPerformanceFocus]
                                      .damageDivision.damageTo
                                  )[0][1];
                                  let objectB: any = Object.entries(
                                    apiResponse.players[currentPerformanceFocus]
                                      .damageDivision.damageFrom
                                  )[0][1];
                                  let currentMax: any = Math.max(
                                    objectA,
                                    objectB
                                  );
                                let currentPercent = Math.round(
                                  (apiResponse.players[currentPerformanceFocus]
                                    .damageDivision.damageFrom[
                                    currentPlayerArray[0][0]
                                  ] /
                                    currentMax) *
                                    100
                                );

                                return (
                                  <div  className="grid grid-cols-[1fr,_30px,_1fr] gap-2 text-lightscale-1 font-semibold font-cantarell">
                                    <div className="relative group">
                                      <div className="absolute right-0 w-full">
                                        <div className="flex justify-end items-center gap-1">
                                          {currentPlayerArray[0][1].damageFrom}{" "}
                                          <div
                                            className={`${
                                              apiResponse.players[
                                                currentPerformanceFocus
                                              ].team === "red"
                                                ? "bg-tf-blue border-tf-blue-dark"
                                                : "bg-tf-red border-tf-red-dark"
                                            } group h-9 border-b-2 rounded-sm  p-1`}
                                            style={{
                                              width: `${currentPercent + "%"}`,
                                            }}
                                          >
                                            <div
                                              className={`ml-1 mt-1 scale-0 ${
                                                Math.round(
                                                  (currentPlayerArray[0][1]
                                                    .damageFrom /
                                                    apiResponse.players[
                                                      currentPerformanceFocus
                                                    ].damageTaken) *
                                                    100
                                                ) > 5
                                                  ? "group-hover:scale-100"
                                                  : "group-hover:scale-0"
                                              } text-lightscale-4 text-xs`}
                                            >
                                              {Math.round(
                                                (currentPlayerArray[0][1]
                                                  .damageFrom /
                                                  apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damageTaken) *
                                                  100
                                              ) + "%"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center group select-none">
                                      <div className="scale-0 absolute z-40 bg-warmscale-85 mb-1 py-0.5 rounded-sm bg-opacity-90 px-2 group-hover:scale-100">
                                        {
                                          apiResponse.players[
                                            currentPlayerArray[0][0]
                                          ].userName
                                        }
                                      </div>
                                      <img
                                        src={`../../../class icons/Leaderboard_class_${
                                          apiResponse.players[
                                            currentPlayerArray[0][0]
                                          ].class
                                        }.png`}
                                        alt=""
                                        className="h-7 my-1.5"
                                      />
                                    </div>
                                    <div className="relative group">
                                      <div className="absolute right-0 w-full">
                                        <div className="flex items-center gap-1">
                                          <div
                                            className={`${
                                              apiResponse.players[
                                                currentPerformanceFocus
                                              ].team === "blue"
                                                ? "bg-tf-blue border-tf-blue-dark"
                                                : "bg-tf-red border-tf-red-dark"
                                            } text-clip h-9 border-b-2 mr-1 rounded-sm p-1`}
                                            style={{
                                              width: `${
                                                Math.round(
                                                  (currentPlayerArray[0][1]
                                                    .damageTo /
                                                    currentMax) *
                                                    100
                                                ) + "%"
                                              }`,
                                            }}
                                          >
                                            <div
                                              className={`flex justify-end mt-1 ${
                                                Math.round(
                                                  (currentPlayerArray[0][1]
                                                    .damageTo /
                                                    apiResponse.players[
                                                      currentPerformanceFocus
                                                    ].damage) *
                                                    100
                                                ) > 5
                                                  ? "group-hover:scale-100"
                                                  : "group-hover:scale-0"
                                              } scale-0 text-lightscale-4 text-xs mr-1`}
                                            >
                                              {Math.round(
                                                (currentPlayerArray[0][1]
                                                  .damageTo /
                                                  apiResponse.players[
                                                    currentPerformanceFocus
                                                  ].damage) *
                                                  100
                                              ) + "%"}
                                            </div>
                                          </div>{" "}
                                          {currentPlayerArray[0][1].damageTo}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </div>
                    {apiResponse.info.map.split("_")[1] !== undefined && <div id="performance-killmap-container" className="ml-4 w-1/3">
                      <div className="text-white flex gap-6 mt-4 rounded-t-md px-2 pt-2 justify-center items-center bg-warmscale-82">
                        <div className="flex font-cantarell font-semibold gap-1">
                          <div className="flex ">
                            <div
                              onClick={() => {
                                setKillMapShowDeaths(false);
                              }}
                              className={`${
                                killMapShowDeaths === false
                                  ? "border-tf-orange border rounded-sm text-lightscale-2"
                                  : " cursor-pointer text-warmscale-5"
                              } py-1 px-2 select-none`}
                            >
                              KILLS
                            </div>
                            <div
                              onClick={() => {
                                setKillMapShowDeaths(true);
                              }}
                              className={`${
                                killMapShowDeaths === true
                                  ? "border-tf-orange border rounded-sm text-lightscale-2"
                                  : " cursor-pointer text-warmscale-5"
                              } py-1 px-2 select-none`}
                            >
                              DEATHS
                            </div>
                          </div>
                        </div>
                        <div className="flex font-cantarell font-semibold w-60 ml-2 mt-1 gap-2">
                          enemy
                          <select
                            id="countries"
                            className="bg-warmscale-8 ring-tf-orange text-lightscale-2 text-sm rounded-md focus:ring-tf-orange focus:border-tf-orange block w-full py-0.5 mb-1 px-2.5"
                            onChange={(event) =>
                              setCurrentKillMapFilter(event.target.value)
                            }
                            value={currentKillMapFilter}
                          >
                            <option value="none">Filtered player (none)</option>
                            {classOrder.map((currentClass) => {
                              return Object.entries(apiResponse.players).map(
                                (player: any, index) => {
                                  if (
                                    player[1].team !==
                                      apiResponse.players[
                                        currentPerformanceFocus
                                      ].team &&
                                    player[1].class === currentClass
                                  ) {
                                    return (
                                      <option  value={player[0]}>
                                        {player[1].class} ({player[1].userName})
                                      </option>
                                    );
                                  }
                                }
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          killMapActive === false && setKillMapActive(true);
                        }}
                        ref={refTwo}
                        className={`bg-warmscale-82 p-2 rounded-b-md ${
                          killMapActive
                            ? "aspect-square absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85vh]"
                            : "cursor-pointer scale-100"
                        }`}
                      >
                        <div className="bg-black items-center relative flex">
                          <div
                            onClick={() => {
                              killMapActive && setKillMapActive(false);
                            }}
                            className={`cursor-pointer absolute top-3 right-3 z-10 ${
                              killMapActive === false ? "scale-0" : "scale-100"
                            }`}
                          >
                            <svg
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                              className="hover:stroke-white h-7 stroke-lightscale-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>
                          
                          <img
                            src={`../../../map images/${apiResponse.info.map.split("_")[1]}.png`}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                          <div className="h-full aspect-square absolute">
                            <div className="absolute aspect-square h-full">
                              {focusedKillEvent.killerId !== undefined && (
                                <div className="absolute right-12 top-3.5 text-lightscale-1 apsect-square h-fit bg-lightscale-1 rounded-md bg-opacity-80 text-xs px-2 py-1 font-cantarell">
                                  <div className="flex gap-1.5 justify-center items-center">
                                    <div
                                      className={`${
                                        apiResponse.players[
                                          focusedKillEvent.killerId
                                        ].team === "red"
                                          ? "text-tf-red"
                                          : "text-tf-blue"
                                      } font-semibold`}
                                    >
                                      {
                                        apiResponse.players[
                                          focusedKillEvent.killerId
                                        ].userName
                                      }
                                    </div>
                                    <div className="text-warmscale-3 font-bold">
                                      killed
                                    </div>
                                    <div
                                      className={`${
                                        apiResponse.players[
                                          focusedKillEvent.victimId
                                        ].team === "red"
                                          ? "text-tf-red"
                                          : "text-tf-blue"
                                      } font-semibold`}
                                    >
                                      {
                                        apiResponse.players[
                                          focusedKillEvent.victimId
                                        ].userName
                                      }{" "}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <svg
                                fill="none"
                                stroke="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                className="h-full aspect-square"
                              >
                                {apiResponse.events.map((killEvent: any, index: any) => {
                                  const mapName = apiResponse.info.map.split("_")[1];
                                  console.log(mapCordinates[mapName])
                                  let currentMap = mapCordinates[mapName];

                                  if(currentMap === undefined){
                                    currentMap = "default";
                                  }

                                  let currentScale = currentMap.scale;
                                  let calibrationX = currentMap.x;
                                  let calibrationY = currentMap.y;
                                  if (
                                    killEvent[
                                      killMapShowDeaths ? "victimId" : "killerId"
                                    ] === currentPerformanceFocus &&
                                    (currentKillMapFilter === "none" ||
                                      killEvent[
                                        killMapShowDeaths
                                          ? "killerId"
                                          : "victimId"
                                      ] === currentKillMapFilter)
                                  ) {
                                    return (
                                      <svg
                                        
                                        onMouseEnter={() => {
                                          setFocusedKillEvent(killEvent);
                                        }}
                                        onMouseLeave={() => {
                                          setFocusedKillEvent({});
                                        }}
                                        className="group"
                                      >
                                        <line x1={`${(killEvent.killer.position.x - (calibrationX + 910 * currentScale)) / currentScale * 0.097656 +50}%`} y1={`${(killEvent.killer.position.y - (calibrationY - 512 * currentScale)) / currentScale * -0.097656 +50}%`} x2={`${(killEvent.victim.position.x - (calibrationX + 910 * currentScale)) / currentScale * 0.097656 + 50}%`} y2={`${(killEvent.victim.position.y - (calibrationY - 512 * currentScale)) / currentScale * -0.097656 + 50}%`} className="group-hover:stroke-white absolute stroke-yellow-500 cursor-pointer  group-hover:z-50 -z-50"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <circle
                                          
                                          id="killer-position"
                                          cx={`${(killEvent.killer.position.x - (calibrationX + 910 * currentScale)) / currentScale * 0.097656 +50}%`}
                                          cy={`${(killEvent.killer.position.y - (calibrationY - 512 * currentScale)) / currentScale * -0.097656 +50}%`}
                                          r="3"
                                          strokeWidth="1"
                                          className={`${
                                            apiResponse.players[
                                              currentPerformanceFocus
                                            ].team === "red"
                                              ? killMapShowDeaths
                                                ? "fill-tf-blue"
                                                : "fill-tf-red"
                                              : killMapShowDeaths
                                              ? "fill-tf-red"
                                              : "fill-tf-blue"
                                          } stroke-white group-hover:stroke-2 cursor-pointer  group-hover:z-50 -z-50`}
                                        />
                                        <rect
                                          
                                          x={`${(killEvent.victim.position.x - (calibrationX + 910 * currentScale)) / currentScale * 0.097656 + 49.25 + 0.25}%`}
                                          y={`${(killEvent.victim.position.y - (calibrationY - 512 * currentScale)) / currentScale * -0.097656 + 49.25 + 0.25}%`}
                                          width="6"
                                          height="6"
                                          strokeWidth="1"
                                          className={`${
                                            apiResponse.players[
                                              currentPerformanceFocus
                                            ].team === "red"
                                              ? killMapShowDeaths
                                                ? "fill-tf-red"
                                                : "fill-tf-blue"
                                              : killMapShowDeaths
                                              ? "fill-tf-blue"
                                              : "fill-tf-red"
                                          } stroke-white group-hover:stroke-2 cursor-pointer group-hover:z-50 -z-50`}
                                        />
                                      </svg>
                                    );
                                  }
                                })}
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex p-2 items-center justify-center gap-6 mt-2 text-lightscale-2 font-semibold font-cantarell">
                        <div className="flex justify-center items-center">
                          <div
                            className={`${
                              apiResponse.players[currentPerformanceFocus]
                                .team === "red"
                                ? killMapShowDeaths
                                  ? "bg-tf-blue"
                                  : "bg-tf-red"
                                : killMapShowDeaths
                                ? "bg-tf-red"
                                : "bg-tf-blue"
                            } h-2.5 w-2.5 border border-white rounded-full mr-1`}
                          ></div>
                          Killer
                          <span className="text-lightscale-6 ml-0.5">
                            {killMapShowDeaths ? "(enemy)" : "(you)"}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-center items-center">
                            <div
                              className={`${
                                apiResponse.players[currentPerformanceFocus]
                                  .team === "red"
                                  ? killMapShowDeaths
                                    ? "bg-tf-red"
                                    : "bg-tf-blue"
                                  : killMapShowDeaths
                                  ? "bg-tf-blue"
                                  : "bg-tf-red"
                              } h-2.5 w-2.5 border border-white mr-1`}
                            ></div>
                            Victim
                            <span className="text-lightscale-6 ml-0.5">
                              {killMapShowDeaths ? "(you)" : "(enemy)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>}
                    {apiResponse.info.map.split("_")[1] === undefined && <div className=" text-warmscale-2 font-semibold flex justify-center items-center ml-4 text-xl font-robotomono" >THE MAP IS BEING REWORKED FOR COMBINED LOGS</div> }
                  </div>
                )}
              </div>
            </div>
            <div
              id="matchups-tab"
              className={`bg-warmscale-85 mb-7 py-4 ${
                tab !== "matchups" && "hidden "
              }`}
            >
              {" "}
              <div
                id="class-icons"
                className="h-10 flex justify-center items-center mt-6"
              >
                <div className="flex font-cantarell font-semibold w-96 mx-4 mt-1 gap-2 -mb-4">
                  <select
                    id="countries"
                    className="bg-warmscale-8 border-tf-red ring-tf-orange text-lightscale-2 text-lg rounded-md focus:ring-tf-orange focus:border-tf-orange block w-full py-1.5 px-2.5"
                    onChange={(event) =>
                      setMatchupPlayersRed(event.target.value)
                    }
                    value={matchupPlayersRed}
                  >
                    <option value="none">Filtered player (none)</option>
                    {classOrder.map((currentClass: any, index) => {
                      return Object.entries(apiResponse.players).map(
                        (player: any) => {
                          if (
                            player[1].team !== "blue" &&
                            player[1].class === currentClass
                          ) {
                            return (
                              <option  value={player[0]}>
                                {player[1].class} ({player[1].userName})
                              </option>
                            );
                          }
                        }
                      );
                    })}
                  </select>
                </div>

                <div className="flex font-cantarell font-semibold w-96 mx-4 mt-1 gap-2 ml-32 -mb-4">
                  <select
                    id="countries"
                    className="bg-warmscale-8  border-tf-blue ring-tf-orange text-lightscale-2 text-lg rounded-md focus:ring-tf-orange focus:border-tf-orange block w-full py-1.5 px-2.5"
                    onChange={(event) =>
                      setMatchupPlayersBlue(event.target.value)
                    }
                    value={matchupPlayersBlue}
                  >
                    <option value="none">Filtered player (none)</option>
                    {classOrder.map((currentClass: any) => {
                      return Object.entries(apiResponse.players).map(
                        (player: any) => {
                          if (
                            player[1].team !== "red" &&
                            player[1].class === currentClass
                          ) {
                            return (
                              <option value={player[0]}>
                                {player[1].class} ({player[1].userName})
                              </option>
                            );
                          }
                        }
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="w-full h-[35.8rem] flex justify-center ">
                {matchupPlayersRed !== "none" &&
                  matchupPlayersBlue !== "none" && (
                    <div className="flex mt-6">
                      <div className=" text-lightscale-1 font-cantarell font-semibold text-xl w-[30rem] ml-4">
                        <div className="w-full bg-tf-red-dark border-b-4 rounded-sm mb-8 border-tf-red-dark2 text-2xl px-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <img
                              src={`../../../class icons/Leaderboard_class_${apiResponse.players[matchupPlayersRed].class}.png`}
                              alt=""
                              className="h-10 mr-2"
                            />
                            {apiResponse.players[matchupPlayersRed].userName}
                          </div>
                          <div className=" text-5xl font-ubuntu font-extrabold py-3 -mt-1 mx-2">
                            {" "}
                            {(apiResponse.players[matchupPlayersBlue].kills >
                            apiResponse.players[matchupPlayersRed].kills
                              ? 0
                              : 1) +
                              (apiResponse.players[matchupPlayersBlue].assists >
                              apiResponse.players[matchupPlayersRed].assists
                                ? 0
                                : 1) +
                              (apiResponse.players[matchupPlayersBlue].deaths <
                              apiResponse.players[matchupPlayersRed].deaths
                                ? 0
                                : 1) +
                              (apiResponse.players[matchupPlayersBlue]
                                .damagePerMinute >
                              apiResponse.players[matchupPlayersRed]
                                .damagePerMinute
                                ? 0
                                : 1) +
                              (apiResponse.players[matchupPlayersBlue]
                                .damageTakenPerMinute <
                              apiResponse.players[matchupPlayersRed]
                                .damageTakenPerMinute
                                ? 0
                                : 1)}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div
                            className={` ${
                              apiResponse.players[matchupPlayersRed].kills >
                              apiResponse.players[matchupPlayersBlue].kills
                                ? "bg-tf-red border-tf-red-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 pr-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersRed].kills /
                                  0.4 +
                                "%"
                              }`,
                            }}
                          >
                            {apiResponse.players[matchupPlayersRed].kills}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div
                            className={` my-2 ${
                              apiResponse.players[matchupPlayersRed].assists >
                              apiResponse.players[matchupPlayersBlue].assists
                                ? "bg-tf-red border-tf-red-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 pr-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersRed].assists /
                                  0.2 +
                                "%"
                              }`,
                            }}
                          >
                            {apiResponse.players[matchupPlayersRed].assists}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div
                            className={` ${
                              apiResponse.players[matchupPlayersRed].deaths <
                              apiResponse.players[matchupPlayersBlue].deaths
                                ? "bg-tf-red border-tf-red-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 pr-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersRed].deaths /
                                  0.4 +
                                "%"
                              }`,
                            }}
                          >
                            {apiResponse.players[matchupPlayersRed].deaths}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div
                            className={` my-2 ${
                              apiResponse.players[matchupPlayersRed]
                                .damagePerMinute >
                              apiResponse.players[matchupPlayersBlue]
                                .damagePerMinute
                                ? "bg-tf-red border-tf-red-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 pr-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersRed]
                                  .damagePerMinute /
                                  7 +
                                "%"
                              }`,
                            }}
                          >
                            {
                              apiResponse.players[matchupPlayersRed]
                                .damagePerMinute
                            }
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div
                            className={` ${
                              apiResponse.players[matchupPlayersRed]
                                .damageTakenPerMinute <
                              apiResponse.players[matchupPlayersBlue]
                                .damageTakenPerMinute
                                ? "bg-tf-red border-tf-red-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 pr-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersRed]
                                  .damageTakenPerMinute /
                                  5 +
                                "%"
                              }`,
                            }}
                          >
                            {
                              apiResponse.players[matchupPlayersRed]
                                .damageTakenPerMinute
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                <div className=" text-lightscale-1 font-cantarell font-semibold text-xl text-center mx-2 mt-7 pt-1.5">
                  <div
                    id="team-icon-dividers"
                    className="text-5xl font-ubuntu mx-3 text-lightscale-1 mb-12"
                  >
                    VS
                  </div>
                  <div>K</div>
                  <div className="my-4">A</div>
                  <div>D</div>
                  <div className="my-4">DPM</div>
                  <div>DTM</div>
                </div>
                {matchupPlayersBlue !== "none" &&
                  matchupPlayersRed !== "none" && (
                    <div className="flex">
                      <div className=" text-lightscale-1 font-cantarell font-semibold text-xl w-[30rem] mr-4 mt-6">
                        <div className="w-full bg-tf-blue-dark border-b-4 rounded-sm mb-8 border-tf-blue-dark2 text-2xl px-3 flex justify-between items-center">
                          <div className=" text-5xl font-ubuntu font-extrabold py-3 -mt-1 mx-2">
                            {" "}
                            {(apiResponse.players[matchupPlayersBlue].kills >
                            apiResponse.players[matchupPlayersRed].kills
                              ? 1
                              : 0) +
                              (apiResponse.players[matchupPlayersBlue].assists >
                              apiResponse.players[matchupPlayersRed].assists
                                ? 1
                                : 0) +
                              (apiResponse.players[matchupPlayersBlue].deaths <
                              apiResponse.players[matchupPlayersRed].deaths
                                ? 1
                                : 0) +
                              (apiResponse.players[matchupPlayersBlue]
                                .damagePerMinute >
                              apiResponse.players[matchupPlayersRed]
                                .damagePerMinute
                                ? 1
                                : 0) +
                              (apiResponse.players[matchupPlayersBlue]
                                .damageTakenPerMinute <
                              apiResponse.players[matchupPlayersRed]
                                .damageTakenPerMinute
                                ? 1
                                : 0)}{" "}
                          </div>
                          <div className="flex items-center">
                            {apiResponse.players[matchupPlayersBlue].userName}
                            <img
                              src={`../../../class icons/Leaderboard_class_${apiResponse.players[matchupPlayersBlue].class}.png`}
                              alt=""
                              className="h-10 ml-2"
                            />
                          </div>
                        </div>
                        <div className="flex ">
                          <div
                            className={` ${
                              apiResponse.players[matchupPlayersBlue].kills >
                              apiResponse.players[matchupPlayersRed].kills
                                ? "bg-tf-blue border-tf-blue-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 justify-end pl-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersBlue].kills /
                                  0.4 +
                                "%"
                              }`,
                            }}
                          >
                            {apiResponse.players[matchupPlayersBlue].kills}
                          </div>
                        </div>
                        <div className="flex">
                          <div
                            className={` my-2 ${
                              apiResponse.players[matchupPlayersBlue].assists >
                              apiResponse.players[matchupPlayersRed].assists
                                ? "bg-tf-blue border-tf-blue-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 justify-end pl-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersBlue]
                                  .assists /
                                  0.2 +
                                "%"
                              }`,
                            }}
                          >
                            {apiResponse.players[matchupPlayersBlue].assists}
                          </div>
                        </div>
                        <div className="flex">
                          <div
                            className={` ${
                              apiResponse.players[matchupPlayersBlue].deaths <
                              apiResponse.players[matchupPlayersRed].deaths
                                ? "bg-tf-blue border-tf-blue-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 justify-end pl-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersBlue].deaths /
                                  0.4 +
                                "%"
                              }`,
                            }}
                          >
                            {apiResponse.players[matchupPlayersBlue].deaths}
                          </div>
                        </div>
                        <div className="flex">
                          <div
                            className={` my-2 ${
                              apiResponse.players[matchupPlayersBlue]
                                .damagePerMinute >
                              apiResponse.players[matchupPlayersRed]
                                .damagePerMinute
                                ? "bg-tf-blue border-tf-blue-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 justify-end pl-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersBlue]
                                  .damagePerMinute /
                                  7 +
                                "%"
                              }`,
                            }}
                          >
                            {
                              apiResponse.players[matchupPlayersBlue]
                                .damagePerMinute
                            }
                          </div>
                        </div>
                        <div className="flex">
                          <div
                            className={` ${
                              apiResponse.players[matchupPlayersBlue]
                                .damageTakenPerMinute <
                              apiResponse.players[matchupPlayersRed]
                                .damageTakenPerMinute
                                ? "bg-tf-blue border-tf-blue-dark font-semibold"
                                : "bg-warmscale-4 border-warmscale-5 text-lightscale-5"
                            } flex border-b-4 h-9 items-center rounded-sm px-2 justify-end pl-5`}
                            style={{
                              width: `${
                                apiResponse.players[matchupPlayersBlue]
                                  .damageTakenPerMinute /
                                  5 +
                                "%"
                              }`,
                            }}
                          >
                            {
                              apiResponse.players[matchupPlayersBlue]
                                .damageTakenPerMinute
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <div
              id="charts-tab"
              className={`bg-warmscale-85 mb-7 p-8 ${
                tab !== "charts" && "hidden "
              }`}
            >
              <div className="w-full h-full">
                <div className="flex font-cantarell font-semibold -mt-4 mb-3 justify-between items-center">
                  <div className=" text-lightscale-4 text-lg">
                    {" "}
                    {chartFilter === "damage" ? "DAMAGE" : "HEALS"} PER INTERVAL{" "}
                    <span className="text-warmscale-1">(30secs)</span>{" "}
                  </div>
                  <div className="flex ">
                    <div
                      onClick={() => {
                        setChartFilter("heals");
                      }}
                      className={`${
                        chartFilter === "heals"
                          ? "border-tf-orange border rounded-sm text-lightscale-2"
                          : " cursor-pointer text-warmscale-3"
                      } py-1 px-2 select-none`}
                    >
                      HEALS
                    </div>
                    <div
                      onClick={() => {
                        setChartFilter("damage");
                      }}
                      className={`${
                        chartFilter === "damage"
                          ? "border-tf-orange border rounded-sm text-lightscale-2"
                          : " cursor-pointer text-warmscale-3"
                      } py-1 px-2 select-none`}
                    >
                      DMG
                    </div>
                  </div>
                </div>
                <div id="chart-background" className="h-[35rem] relative ml-6">
                  <div className="w-1 h-full bg-warmscale-2 "></div>
                  <div className="">
                    <div className=" top-0 absolute w-full">
                      <div className="flex mx-1 items-center gap-2">
                        <div className="h-0.5 w-full bg-warmscale-8"></div>
                        <div className=" text-sm font-robotomono font-bold w-24 text-warmscale-6">
                          3000 {chartFilter === "damage" ? "DMG" : "HEALS"}
                        </div>
                      </div>
                    </div>
                    <div className=" top-1/4 absolute w-full">
                      <div className="flex mx-1 items-center gap-2">
                        <div className="h-0.5 w-full bg-warmscale-8"></div>
                        <div className=" text-sm font-robotomono font-bold w-24 text-warmscale-6">
                          2250 {chartFilter === "damage" ? "DMG" : "HEALS"}
                        </div>
                      </div>
                    </div>
                    <div className=" top-2/4 absolute w-full">
                      <div className="flex mx-1 items-center gap-2">
                        <div className="h-0.5 w-full bg-warmscale-8"></div>
                        <div className=" text-sm font-robotomono font-bold w-24 text-warmscale-6">
                          1500 {chartFilter === "damage" ? "DMG" : "HEALS"}
                        </div>
                      </div>
                    </div>
                    <div className=" top-3/4 absolute w-full">
                      <div className="flex mx-1 items-center gap-2">
                        <div className="h-0.5 w-full bg-warmscale-8"></div>
                        <div className=" text-sm font-robotomono font-bold w-24 text-warmscale-6">
                          750 {chartFilter === "damage" ? "DMG" : "HEALS"}
                        </div>
                      </div>
                    </div>
                    <div className="absolute w-full">
                      <div className=" flex mx-1 items-center">
                        <div className="h-1 -ml-1 w-full bg-warmscale-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-[12.4rem] ml-7 w-full h-[550px]">
                  <svg className="w-full h-full">
                    {apiResponse.damagePerInterval.red.map(
                      (interval: any, index: any) => {
                        let chartXMax = 1250;
                        let chartYMax = 550;
                        let currentArrayLength =
                          apiResponse.damagePerInterval.red.length;
                        let currentIntervalWidth =
                          chartXMax / currentArrayLength;

                        return (
                          <svg>
                            <path
                              className="group-hover:stroke-white absolute stroke-warmscale-7 z-0 opacity-70"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={`M${currentIntervalWidth * index},${0} L${
                                currentIntervalWidth * index
                              },${chartYMax}`}
                            />
                            <path
                              className={`group-hover:stroke-white absolute stroke-tf-red z-10 ${
                                chartFilter === "heals" &&
                                "opacity-20 stroke-tf-red-dark2"
                              }`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={`M${currentIntervalWidth * index},${
                                chartYMax -
                                (apiResponse.damagePerInterval.red[index] /
                                  3000) *
                                  chartYMax
                              } L${currentIntervalWidth * (index + 1)},${
                                chartYMax -
                                (apiResponse.damagePerInterval.red[index + 1] /
                                  3000) *
                                  chartYMax
                              }`}
                            />
                            <path
                              className={`group-hover:stroke-white absolute stroke-tf-blue z-10 ${
                                chartFilter === "heals" &&
                                "opacity-20 stroke-tf-blue-dark2"
                              }`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={`M${currentIntervalWidth * index},${
                                chartYMax -
                                (apiResponse.damagePerInterval.blue[index] /
                                  3000) *
                                  chartYMax
                              } L${currentIntervalWidth * (index + 1)},${
                                chartYMax -
                                (apiResponse.damagePerInterval.blue[index + 1] /
                                  3000) *
                                  chartYMax
                              }`}
                            />
                            <path
                              className={`group-hover:stroke-white absolute stroke-tf-red z-10 ${
                                chartFilter === "damage" &&
                                "opacity-20 stroke-tf-red-dark2"
                              }`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={`M${currentIntervalWidth * index},${
                                chartYMax -
                                (apiResponse.healsPerInterval.red[index] /
                                  3000) *
                                  chartYMax
                              } L${currentIntervalWidth * (index + 1)},${
                                chartYMax -
                                (apiResponse.healsPerInterval.red[index + 1] /
                                  3000) *
                                  chartYMax
                              }`}
                            />
                            <path
                              className={`group-hover:stroke-white absolute stroke-tf-blue z-10 ${
                                chartFilter === "damage" &&
                                "opacity-20 stroke-tf-blue-dark2"
                              }`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={`M${currentIntervalWidth * index},${
                                chartYMax -
                                (apiResponse.healsPerInterval.blue[index] /
                                  3000) *
                                  chartYMax
                              } L${currentIntervalWidth * (index + 1)},${
                                chartYMax -
                                (apiResponse.healsPerInterval.blue[index + 1] /
                                  3000) *
                                  chartYMax
                              }`}
                            />
                          </svg>
                        );
                      }
                    )}
                  </svg>
                </div>
              </div>
            </div>
            <div
              id="other-tab"
              className={`bg-warmscale-85 h mb-7 py-4 ${
                tab !== "other" && "hidden "
              }`}
            >
              <div className="flex justify-center gap-10 mx-10 my-4">
                <div className="bg-warmscale-82 rounded-md pb-2 px-4 w-96 h-fit">
                  <div className="flex justify-center text-lightscale-2 font-semibold text-xl my-2">
                    CHAT
                  </div>
                  <div className="h-0.5 w-full bg-warmscale-7 mb-2"></div>
                  {apiResponse.chat.map(
                    (chatEvent: any) => {
                      return (
                        <div className="py-0.5 text-lightscale-2">
                          {" "}
                          <span
                            className={`${
                              apiResponse.players[chatEvent.userId] !== undefined && apiResponse.players[chatEvent.userId].team ===
                              "red"
                                ? "text-tf-red"
                                : apiResponse.players[chatEvent.userId] !== undefined && apiResponse.players[chatEvent.userId].team === "blue" ? "text-tf-blue" : "text-warmscale-3"
                            }  font-bold`}
                          >
                            {apiResponse.players[chatEvent.userId] !== undefined ? apiResponse.players[chatEvent.userId].userName : "Spectator"}
                          </span>{" "}
                          : {chatEvent.message}
                        </div>
                      );
                    }
                  )}
                </div>
                {apiResponse.killStreaks.source !== "internal" && <div className="bg-warmscale-82 rounded-md pb-2 px-4 w-96 h-fit ">
                  <div className="flex justify-center text-lightscale-2 font-semibold text-xl my-2">
                    KILLSTREAKS
                  </div>
                  <div className="h-0.5 w-full bg-warmscale-7 mb-2 "></div>
                  {Object.entries(apiResponse.killStreaks).map(
                    (killStreakEvent: any) => {
                      return (
                        <div className="py-0.5 text-lightscale-2 flex justify-between">
                          <div
                            className={`${
                              apiResponse.players[
                                ID3toID64Converter(killStreakEvent[1].steamid)
                              ].team === "red"
                                ? "text-tf-red"
                                : "text-tf-blue"
                            } font-bold`}
                          >
                            {
                              apiResponse.players[
                                ID3toID64Converter(killStreakEvent[1].steamid)
                              ].userName
                            }{" "}
                            <span className="text-warmscale-2 font-normal">
                              ({Math.floor(killStreakEvent[1].time / 60)}:
                              {killStreakEvent[1].time % 60 < 10
                                ? "0" + (killStreakEvent[1].time % 60)
                                : killStreakEvent[1].time % 60}
                              )
                            </span>{" "}
                          </div>
                          <div className="text-end">
                            {killStreakEvent[1].streak} kills
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className=" h-screen bg-warmscale-7 pt-3">
        <Navbar />
        <div className="flex items-center w-full h-[90%] justify-center">
          <div
            className="-mt-10 inline-block h-8 w-8 animate-spin text-tf-orange rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >

          </div>
        </div>
      </div>
    );
  }

  function statTitle(stat: string, statAbriviation: string, title: string) {
    return (
      <div
        id={stat + "-title"}
        onClick={() => {
          scoreboardSorter(stat);
        }}
        className="flex group relative items-center cursor-pointer justify-center select-none font-cantarell font-semibold text-lightscale-1 border-l border-warmscale-6"
      >
        {currentScoreboardSort === stat ? (
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
                  clipRule="evenodd"
                  fillRule="evenodd"
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
                  d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                />
              </svg>
            </div>
          )
        ) : (
          <div></div>
        )}
        {statAbriviation}
        <div className="absolute scale-0 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
          {title}
          <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
    );
  }
  function ptstatTitle(stat: string, statAbriviation: string, title: string) {
    return (
      <div
        id={stat + "-title"}
        onClick={() => {
          ptscoreboardSorter(stat);
        }}
        className="flex group relative items-center cursor-pointer justify-center select-none font-cantarell font-semibold text-lightscale-1 border-l border-warmscale-6 text-sm"
      >
        {currentScoreboardSort === stat ? (
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
                  clipRule="evenodd"
                  fillRule="evenodd"
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
                  d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                />
              </svg>
            </div>
          )
        ) : (
          <div></div>
        )}
        {statAbriviation}
        <div className="absolute scale-0 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
          {title}
          <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
    );
  }
};

export default Logs;

function killSpreadTitles(
  killSpreadSorter: (sortBy: string) => void,
  classPlayed: string,
  currentSort: string
) {
  return (
    <div
      onClick={() => {
        killSpreadSorter(classPlayed);
      }}
      className={` ${
        currentSort === classPlayed && "border-b-tf-orange border-b-2"
      } flex justify-center  border-warmscale-5 border-l items-center cursor-pointer  py-2`}
    >
      <img
        src={`../../../class icons/Leaderboard_class_${classPlayed}.png`}
        alt=""
        className="h-6"
      />
    </div>
  );
}
