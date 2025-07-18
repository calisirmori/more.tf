import Navbar from "../shared-components/Navbar";
import React, { useEffect, useState, useRef } from "react";
import { S14summary, S15summary } from "../summary";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { time } from "console";
import Footer from "../shared-components/Footer";

const SeasonSummaryOzf = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const currentSeason = idArray[4];
  const [currentDivision, setCurrentDivision] = useState<string>(currentSeason == "79" ? "LDU 2025" : "premier");
  const [currentClass, setCurrentClass] = useState<string>("scout");
  const [displayArray, setDisplayArray] = useState<any[]>([]);
  const [currentSort, setCurrentSort] = useState("kills");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [summaryLastData, setLastSummaryData] = useState<any>({});
  const [timelimit, setTimelimit] = useState<boolean>(true)
  let rowCount = 0;

  useEffect(() => {
    sortTable(displayArray);
  }, [currentSort, currentClass]);

  useEffect(() => {
    getLastSummaryData();
    getSummaryData();
    getWeekData();
  }, []);

  async function getLastSummaryData() {
    let response: any;
    try {
      response = await fetch(
        `/api/lastweek-season-summary-ozf/${currentSeason}`,
        FetchResultTypes.JSON
      );

      let transformedData = response.rows.reduce(
        (accumulator: any, current: any) => {
          accumulator[current.id64] = current;
          return accumulator;
        },
        {}
      );

      setLastSummaryData(transformedData);
    } catch (error) {
      console.error(error);
    }
  }

  async function getSummaryData() {
    let response: any;
    try {
      response = await fetch(
        `/api/season-summary-ozf/${currentSeason}`,
        FetchResultTypes.JSON
      );
      console.log(response.rows)
      sortTable(response.rows);
    } catch (error) {
      console.error(error);
    }
  }

  async function getWeekData() {
    let response: any;
    try {
      response = await fetch(
        `/api/current-week/${currentSeason}`,
        FetchResultTypes.JSON
      );
      setCurrentWeek(response.rows[0].max);
    } catch (error) {
      console.error(error);
    }
  }

  type PlayerStat = {
    time: number;
    [key: string]: any;
  };

  type TempArrayItem = {
    data: PlayerStat;
    value: number;
  };

  function calculateValue(
    playerStat: PlayerStat,
    sortKey: string,
    classSpecs: any,
    currentClass: string
  ): number {
    const playTime = playerStat.time / 60;

    switch (sortKey) {
      case "kd":
        return Math.round((playerStat.kills / playerStat.deaths) * 100) / 100;
      case "specialty":
        if (!classSpecs[seasonSpecifics[currentSeason].format][currentClass].perMinute) {
          return playerStat[classSpecs[seasonSpecifics[currentSeason].format][currentClass].id];
        }
        return (
          Math.round(
            (playerStat[classSpecs[seasonSpecifics[currentSeason].format][currentClass].id] / playTime) * 100
          ) / 100
        );
      case "time":
        return playerStat.time;
      default:
        return Math.round((playerStat[sortKey] / playTime) * 100) / 100;
    }
  }

  function sortTable(data: any[]) {
    const tempArray: TempArrayItem[] = [];

    data.forEach((playerStat: PlayerStat) => {
      const currentValue = calculateValue(
        playerStat,
        currentSort,
        classSpecialties,
        currentClass
      );
      tempArray.push({
        data: playerStat,
        value: currentValue,
      });
    });

    tempArray.sort((a: TempArrayItem, b: TempArrayItem) => b.value - a.value);
    const finalArray = tempArray.map((item) => item.data);
    setDisplayArray(finalArray);
  }

  const seasonSpecifics: any = {
    67: {
      leauge: "OZF",
      format: "6S",
      season: 40,
    },
    69: {
      leauge: "OZF",
      format: "HL",
      season: 8,
    },
    70: {
      leauge: "OZF",
      format: "6S",
      season: 41,
    },
    73: {
      leauge: "OZF",
      format: "HL",
      season: 9,
    },
    74: {
      leauge: "OZF",
      format: "6S",
      season: 42,
    },
    80: {
      leauge: "OZF",
      format: "HL",
      season: 10,
    },
    81: {
      leauge: "OZF",
      format: "6S",
      season: 43,
    },
    79: {
      leauge: "OZF",
      format: "LAN",
      season: "2025",
    },
  };

  const classSpecialties: any = {
    "6S": {
      scout: {
        id: "acc",
        name: "Accuracy",
        title: "ACC",
        perMinute: false,
      },
      soldier: {
        id: "airshots",
        name: "Total Airshots",
        title: "Airshots",
        perMinute: false,
      },
      pyro: {
        id: "spykills",
        name: "Spy Kills Per Minute",
        title: "Spy Kills/m",
        perMinute: true,
      },
      demoman: {
        id: "airshots",
        name: "Total Airshots",
        title: "Airshots",
        perMinute: false,
      },
      heavyweapons: {
        id: "hr",
        name: "Heals Received",
        title: "HR/m",
        perMinute: true,
      },
      engineer: {
        id: "sentry_dmg",
        name: "Sentry Damage",
        title: "Sentry DMG",
        perMinute: true,
      },
      medic: {
        id: "heals",
        name: "Heals Per Minute",
        title: "Heals/m",
        perMinute: true,
      },
      sniper: {
        id: "hs",
        name: "Headshots Per Minute",
        title: "HS/m",
        perMinute: true,
      },
      spy: {
        id: "bs",
        name: "Backstabs Per Minute",
        title: "BS/m",
        perMinute: true,
      },
    },
    "LAN": {
      scout: {
        id: "acc",
        name: "Accuracy",
        title: "ACC",
        perMinute: false,
      },
      soldier: {
        id: "airshots",
        name: "Total Airshots",
        title: "Airshots",
        perMinute: false,
      },
      pyro: {
        id: "spykills",
        name: "Spy Kills Per Minute",
        title: "Spy Kills/m",
        perMinute: true,
      },
      demoman: {
        id: "airshots",
        name: "Total Airshots",
        title: "Airshots",
        perMinute: false,
      },
      heavyweapons: {
        id: "hr",
        name: "Heals Received",
        title: "HR/m",
        perMinute: true,
      },
      engineer: {
        id: "sentry_dmg",
        name: "Sentry Damage",
        title: "Sentry DMG",
        perMinute: true,
      },
      medic: {
        id: "heals",
        name: "Heals Per Minute",
        title: "Heals/m",
        perMinute: true,
      },
      sniper: {
        id: "hs",
        name: "Headshots Per Minute",
        title: "HS/m",
        perMinute: true,
      },
      spy: {
        id: "bs",
        name: "Backstabs Per Minute",
        title: "BS/m",
        perMinute: true,
      },
    },
    HL: {
      scout: {
        id: "bleed",
        name: "Bleed Damage Per Minute",
        title: "Bleed/m",
        perMinute: true,
      },
      soldier: {
        id: "airshots",
        name: "Total Airshots",
        title: "Airshots",
        perMinute: false,
      },
      pyro: {
        id: "spykills",
        name: "Spy Kills Per Minute",
        title: "Spy Kills/m",
        perMinute: true,
      },
      demoman: {
        id: "airshots",
        name: "Total Airshots",
        title: "Airshots",
        perMinute: false,
      },
      heavyweapons: {
        id: "hr",
        name: "Heals Received",
        title: "HR/m",
        perMinute: true,
      },
      engineer: {
        id: "sentry_dmg",
        name: "Sentry Damage",
        title: "Sentry DMG",
        perMinute: true,
      },
      medic: {
        id: "heals",
        name: "Heals Per Minute",
        title: "Heals/m",
        perMinute: true,
      },
      sniper: {
        id: "hs",
        name: "Headshots Per Minute",
        title: "HS/m",
        perMinute: true,
      },
      spy: {
        id: "bs",
        name: "Backstabs Per Minute",
        title: "BS/m",
        perMinute: true,
      },
    },
  };

  return (
    <div className=" bg-warmscale-7 min-h-screen">
      <Navbar />
      <div className="w-full h-full font-ubuntu max-sm:scale-50 max-sm:-mt-52 max-lg:scale-50 max-xl:scale-75 max-lg:-mt-36 max-xl:-mt-20 max-md:scale-50">
        <div className="flex justify-center mt-10 max-[450px]:scale-50 max-sm:scale-75 max-lg:scale-110">
          <div className="bg-warmscale-8 rounded-md relative">
            <div className="absolute right-2 top-1.5">
              <div className="flex justify-center gap-1">
                <div className=" text-sm text-warmscale-3 font-bold">time filter: </div>
                <div onClick={()=> {setTimelimit(!timelimit)}} className={ ` text-center w-7 text-sm select-none text-warmscale-3 font-semibold cursor-pointer text-opacity-50 hover:text-opacity-80 ${timelimit === true ? 'text-green-400' : 'text-red-400'}`}>{timelimit === true ? 'ON' : 'OFF'}</div>
              </div>
            </div>
            <div className="text-center text-lightscale-1 font-bold text-5xl  py-8">
              {seasonSpecifics[currentSeason].leauge} {seasonSpecifics[currentSeason].format} {seasonSpecifics[currentSeason].format !== "LAN" && "S"}{seasonSpecifics[currentSeason].season} SUMMARY{seasonSpecifics[currentSeason].format !== "LAN" && " | WEEK"} {currentWeek}
            </div>
            <div className="flex text-lightscale-1 font-semibold text-xl">
              {seasonSpecifics[currentSeason].format !== "LAN" && divisionHeader(
                setCurrentDivision,
                currentDivision,
                "premier",
                "PREMIER"
              )}
              
              {seasonSpecifics[currentSeason].format === "6S" && divisionHeader(
                setCurrentDivision,
                currentDivision,
                "high",
                "HIGH"
              )}
              {seasonSpecifics[currentSeason].format !== "LAN" && divisionHeader(
                setCurrentDivision,
                currentDivision,
                "intermediate",
                "INTERMEDIATE"
              )}
              {seasonSpecifics[currentSeason].format !== "LAN" && divisionHeader(
                setCurrentDivision,
                currentDivision,
                "main",
                "MAIN"
              )}
              {seasonSpecifics[currentSeason].format === "6S" && divisionHeader(
                setCurrentDivision,
                currentDivision,
                "open",
                "OPEN"
              )}
              {seasonSpecifics[currentSeason].format === "LAN" && divisionHeader(
                setCurrentDivision,
                currentDivision,
                "LDU 2025",
                "LDU 2025"
              )}
            </div>
            <div className="grid grid-cols-9 text-lightscale-1 font-semibold text-xl">
              {classHeader(setCurrentClass, currentClass, "scout")}
              {classHeader(setCurrentClass, currentClass, "soldier")}
              {classHeader(setCurrentClass, currentClass, "pyro")}
              {classHeader(setCurrentClass, currentClass, "demoman")}
              {classHeader(setCurrentClass, currentClass, "heavyweapons")}
              {classHeader(setCurrentClass, currentClass, "engineer")}
              {classHeader(setCurrentClass, currentClass, "medic")}
              {classHeader(setCurrentClass, currentClass, "sniper")}
              {classHeader(setCurrentClass, currentClass, "spy")}
            </div>
            <div className="p-2">
              <div className="grid grid-cols-[250px,repeat(8,1fr)] text-center text-lightscale-1 font-semibold py-1 ">
                <div className="text-left pl-3">PLAYER</div>
                {columnHeader(
                  setCurrentSort,
                  currentSort,
                  "kills",
                  "Kills Per Minute",
                  "K/m"
                )}
                {columnHeader(
                  setCurrentSort,
                  currentSort,
                  "assist",
                  "Assists Per Minute",
                  "A/m"
                )}
                {columnHeader(
                  setCurrentSort,
                  currentSort,
                  "deaths",
                  "Deaths Per Minute",
                  "D/m"
                )}
                {columnHeader(
                  setCurrentSort,
                  currentSort,
                  "kd",
                  "Kill / Deaths",
                  "K/D"
                )}
                {columnHeader(
                  setCurrentSort,
                  currentSort,
                  "dmg",
                  "Damage Per Minute",
                  "DMG/m"
                )}
                {columnHeader(
                  setCurrentSort,
                  currentSort,
                  "dt",
                  "Damage Taken Per Minute",
                  "DT/m"
                )}
                <div
                  className="cursor-pointer group relative flex justify-center items-center"
                  onClick={() => setCurrentSort("specialty")}
                >
                  {currentSort === "specialty" && (
                    <div className="-ml-2">
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
                  )}

                  {
                    classSpecialties[seasonSpecifics[currentSeason].format][
                      currentClass
                    ].title
                  }
                  <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                    {
                      classSpecialties[seasonSpecifics[currentSeason].format][
                        currentClass
                      ].name
                    }
                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                {columnHeader(
                  setCurrentSort,
                  currentSort,
                  "time",
                  "Play Time",
                  "Time"
                )}
              </div>

              {displayArray.map((currentPlayer: any, index: number) => {
                const lastWeeksStats = summaryLastData[currentPlayer.id64];
                const lastWeeksPlaytime: any =
                  lastWeeksStats !== undefined && lastWeeksStats.time / 60;
                const playtimeInMinutes = currentPlayer.time / 60;
                const userID = currentPlayer.steamid;
                const userName = currentPlayer.ozfname;
                const teamID =
                  currentPlayer.teamid === null ? "0000" : currentPlayer.teamid;
                const teamName =
                  currentPlayer.teamname === null
                    ? "Free Agent"
                    : currentPlayer.teamname;
                if (
                  (timelimit === true ? playtimeInMinutes > currentWeek*10 : playtimeInMinutes > currentWeek*0.5) &&
                  currentPlayer.classid === currentClass &&
                  currentPlayer.division === currentDivision
                ) {
                  rowCount++;
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[250px,repeat(8,1fr)] text-center text-lightscale-4 items-center ${
                        rowCount % 2 === 1 && "bg-warmscale-85"
                      }`}
                    >
                      <div className="pl-3 text-left text-lightscale-2">
                        <div className="-mb-2 truncate ">
                          <a
                            href={`/profile/${currentPlayer.id64}`}
                            className="hover:text-tf-orange font-semibold"
                          >
                            {userName}
                          </a>
                        </div>
                        <div className="overflow-hidden">
                          <a
                            href={`${
                              teamID !== "none" &&
                              `https://rgl.gg/Public/Team.aspx?t=${teamID}&r=24`
                            }`}
                            className={`${
                              teamID !== "none" && "hover:text-tf-orange"
                            } select-none pl-0.5 text-xs text-lightscale-7 whitespace-nowrap `}
                          >
                            {teamName}
                          </a>
                        </div>
                      </div>
                      {playerStat(
                        currentSort,
                        currentPlayer,
                        playtimeInMinutes,
                        lastWeeksStats,
                        lastWeeksPlaytime,
                        "kills",
                        2,
                        7,
                        1
                      )}
                      {playerStat(
                        currentSort,
                        currentPlayer,
                        playtimeInMinutes,
                        lastWeeksStats,
                        lastWeeksPlaytime,
                        "assist",
                        2,
                        7,
                        1
                      )}
                      {playerStat(
                        currentSort,
                        currentPlayer,
                        playtimeInMinutes,
                        lastWeeksStats,
                        lastWeeksPlaytime,
                        "deaths",
                        2,
                        7,
                        -1
                      )}
                      <div
                        className={`relative py-2.5 flex items-center justify-center ${
                          currentSort === "kd" && "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {(currentPlayer.kills / currentPlayer.deaths).toFixed(
                          2
                        )}
                        <div
                          className={`absolute left-[45%] transform translate-x-full ml-1 w-7 text-[10px] font-robotomono font-semibold ${
                            lastWeeksStats !== undefined
                              ? (() => {
                                  const difference =
                                    Math.round(
                                      (currentPlayer.kills /
                                        currentPlayer.deaths -
                                        lastWeeksStats.kills /
                                          lastWeeksStats.deaths) *
                                        10
                                    ) / 10;

                                  if (difference > 0) {
                                    return "text-green-500"; // Green for positive values
                                  } else if (difference < 0) {
                                    return "text-red-500"; // Red for negative values
                                  } else {
                                    return "text-gray-500"; // Gray for zero
                                  }
                                })()
                              : ""
                          }`}
                        >
                          {lastWeeksStats !== undefined
                            ? (() => {
                                const difference =
                                  Math.round(
                                    (currentPlayer.kills /
                                      currentPlayer.deaths -
                                      lastWeeksStats.kills /
                                        lastWeeksStats.deaths) *
                                      10
                                  ) / 10;

                                if (difference > 0) {
                                  return (
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3.5}
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                      />
                                    </svg>
                                  );
                                } else if (difference < 0) {
                                  return (
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3.5}
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                      />
                                    </svg>
                                  );
                                } else {
                                  return (
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={5.5}
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 12H6"
                                      />
                                    </svg>
                                  );
                                }
                              })()
                            : null}
                        </div>
                      </div>
                      {playerStat(
                        currentSort,
                        currentPlayer,
                        playtimeInMinutes,
                        lastWeeksStats,
                        lastWeeksPlaytime,
                        "dmg",
                        1,
                        8,
                        1
                      )}
                      {playerStat(
                        currentSort,
                        currentPlayer,
                        playtimeInMinutes,
                        lastWeeksStats,
                        lastWeeksPlaytime,
                        "dt",
                        1,
                        8,
                        -1
                      )}
                      <div
                        className={`relative py-2.5 flex items-center justify-center ${
                          currentSort === "speciality" &&
                          "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {classSpecialties[
                          seasonSpecifics[currentSeason].format
                        ][currentClass].perMinute
                          ? (
                              currentPlayer[
                                classSpecialties[
                                  seasonSpecifics[currentSeason].format
                                ][currentClass].id
                              ] / playtimeInMinutes
                            ).toFixed(
                              currentClass === "medic"
                                ? 0
                                : currentClass === "pyro"
                                ? 2
                                : 1
                            )
                          : currentPlayer[
                              classSpecialties[
                                seasonSpecifics[currentSeason].format
                              ][currentClass].id
                            ]}
                        <div
                          className={`absolute left-[45%] transform translate-x-full w-${8} text-[10px] font-robotomono font-semibold ${
                            lastWeeksStats !== undefined
                              ? (() => {
                                  const specialty =
                                    classSpecialties[
                                      seasonSpecifics[currentSeason].format
                                    ][currentClass];
                                  const isPerMinute = specialty.perMinute;

                                  const currentPlayerValue =
                                    currentPlayer[specialty.id];
                                  const lastWeekValue =
                                    lastWeeksStats[specialty.id];

                                  let difference;

                                  if (isPerMinute) {
                                    const currentPlayerPerMinute =
                                      currentPlayerValue / playtimeInMinutes;
                                    const lastWeekPerMinute =
                                      lastWeekValue / lastWeeksPlaytime;
                                    difference =
                                      currentPlayerPerMinute -
                                      lastWeekPerMinute;
                                  } else {
                                    difference =
                                      currentPlayerValue - lastWeekValue;
                                  }

                                  difference =
                                    Math.round(difference * 100) / 100;

                                  if (difference > 0) {
                                    return 1 == 1
                                      ? "text-green-500"
                                      : "text-red-500";
                                  } else if (difference < 0) {
                                    return 1 !== 1
                                      ? "text-green-500"
                                      : "text-red-500";
                                  } else {
                                    return "text-gray-500";
                                  }
                                })()
                              : ""
                          }`}
                        >
                          {lastWeeksStats !== undefined
                            ? (() => {
                                const specialty =
                                  classSpecialties[
                                    seasonSpecifics[currentSeason].format
                                  ][currentClass];
                                const isPerMinute = specialty.perMinute;

                                const currentPlayerValue =
                                  currentPlayer[specialty.id];
                                const lastWeekValue =
                                  lastWeeksStats[specialty.id];

                                let difference;

                                if (isPerMinute) {
                                  const currentPlayerPerMinute =
                                    currentPlayerValue / playtimeInMinutes;
                                  const lastWeekPerMinute =
                                    lastWeekValue / lastWeeksPlaytime;
                                  difference =
                                    currentPlayerPerMinute - lastWeekPerMinute;
                                } else {
                                  difference =
                                    currentPlayerValue - lastWeekValue;
                                }

                                if (difference > 0) {
                                  return (
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3.5}
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                      />
                                    </svg>
                                  );
                                } else if (difference < 0) {
                                  return (
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3.5}
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                      />
                                    </svg>
                                  );
                                } else {
                                  return (
                                    <svg
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={5.5}
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="h-3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 12H6"
                                      />
                                    </svg>
                                  );
                                }
                              })()
                            : null}
                        </div>
                      </div>

                      <div
                        className={` py-2.5 ${
                          currentSort === "time" &&
                          "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {Math.round(currentPlayer.time / 60) + " min"}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            <div className="relative text-stone-600 font-semibold text-center py-2">
              UP AND DOWN ARROWS SHOW HOW YOUR SCORE CHANGED FROM LAST WEEKS
              STATS
              {seasonSpecifics[currentSeason].format === "HL" && (
                <div className="absolute top-2 right-3">
                  {
                    <a
                      href="/season-summary-ozf/67"
                      className="text-tf-orange opacity-30 hover:opacity-50"
                    >
                      S40
                    </a>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-10">
            {<Footer />}
        </div>
      </div>
    </div>
  );
};

export default SeasonSummaryOzf;

function playerStat(
  currentSort: string,
  currentPlayer: any,
  playtimeInMinutes: number,
  lastWeeksStats: any,
  lastWeeksPlaytime: any,
  stat: string,
  significantDigits: number,
  arrowMargin: number,
  positiveStat: number
) {
  return (
    <div
      className={`relative py-2.5 flex items-center justify-center ${
        currentSort === stat && "bg-warmscale-2 bg-opacity-5"
      }`}
    >
      {(currentPlayer[stat] / playtimeInMinutes).toFixed(significantDigits)}
      <div
        className={`absolute left-[45%] transform translate-x-full w-${arrowMargin} text-[10px] font-robotomono font-semibold ${
          lastWeeksStats !== undefined
            ? (() => {
                const difference =
                  Math.round(
                    (currentPlayer[stat] / playtimeInMinutes -
                      lastWeeksStats[stat] / lastWeeksPlaytime) *
                      100
                  ) / 100;

                if (difference > 0) {
                  return positiveStat == 1 ? "text-green-500" : "text-red-500";
                } else if (difference < 0) {
                  return positiveStat !== 1 ? "text-green-500" : "text-red-500";
                } else {
                  return "text-gray-500";
                }
              })()
            : ""
        }`}
      >
        {lastWeeksStats !== undefined
          ? (() => {
              const difference =
                Math.round(
                  (currentPlayer[stat] / playtimeInMinutes -
                    lastWeeksStats[stat] / lastWeeksPlaytime) *
                    100
                ) / 100;

              if (difference > 0) {
                return (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 15.75l7.5-7.5 7.5 7.5"
                    />
                  </svg>
                );
              } else if (difference < 0) {
                return (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                );
              } else {
                return (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={5.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 12H6"
                    />
                  </svg>
                );
              }
            })()
          : null}
      </div>
    </div>
  );
}

function divisionHeader(
  setCurrentDivision: React.Dispatch<React.SetStateAction<string>>,
  currentDivision: string,
  divisionName: string,
  title: string
) {
  return (
    <div
      onClick={() => {
        setCurrentDivision(divisionName);
      }}
      className={` ${
        currentDivision === divisionName
          ? "text-lightscale-1 border-b-2 border-tf-orange"
          : "text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9"
      } select-none min-w-[288px] w-full text-center py-2`}
    >
      {title}
    </div>
  );
}

function columnHeader(
  setCurrentSort: React.Dispatch<React.SetStateAction<string>>,
  currentSort: string,
  type: string,
  name: string,
  title: string
) {
  return (
    <div
      className="cursor-pointer group relative flex justify-center items-center"
      onClick={() => setCurrentSort(type)}
    >
      {currentSort === type && (
        <div className="-ml-2">
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
      )}

      {title}
      <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
        {name}
        <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
      </div>
    </div>
  );
}

function classHeader(
  setCurrentClass: React.Dispatch<React.SetStateAction<string>>,
  currentClass: string,
  className: string
) {
  return (
    <div
      onClick={() => {
        setCurrentClass(className);
      }}
      className={`flex pt-2 justify-center items-center ${
        currentClass === className
          ? "text-lightscale-1 border-b-2 border-tf-orange"
          : "text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9"
      } select-none text-center min-w-[150px] py-2`}
    >
      <img
        src={`../../../class icons/Leaderboard_class_${className}.png`}
        alt=""
        className="h-8"
      />
    </div>
  );
}
