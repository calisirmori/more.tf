import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import Footer from "../shared-components/Footer";

const calendar = () => {
  const url = window.location.href;
  const playerSteamID = url.substring(url.lastIndexOf("/") + 1);

  const [calendarArray, setCalendarArray] = useState<any>([]);
  const [playerSteamInfo, setPlayerSteamInfo] = useState<any>({});
  const [rglInfo, setRglInfo] = useState<any>({});

  useEffect(() => {
    calendarCall();
    steamInfoCallProfile();
  }, []);

  async function rglInfoCall() {
    const response: any = await fetch(
      `/api/rgl-profile/${playerSteamID}`,
      FetchResultTypes.JSON
    );
    setRglInfo(response);
  }

  async function steamInfoCallProfile() {
    let response: any = {};
    try {
      response = await fetch(
        `/api/steam-info?ids=${playerSteamID}`,
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

  useEffect(() => {

  }, [calendarArray]);

  async function calendarCall() {
    let response: any = {};
    try {
      response = await fetch(
        `/api/calendar/${playerSteamID}`,
        FetchResultTypes.JSON
      );
      setCalendarArray(response.rows);
    } catch (error) {}
  }

  const countOfWeeks = 53;
  const countOfDays = 7;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2017 }, (v, k) => k + 2018);
  const daysOfTheWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let leapYearCount = 0;
  let currentSpotCount = 0;
  let yearlyCount = 0;

  return (
    <div className="bg-warmscale-7 min-h-screen w "  data-testid="calendar-container">
      <div className=" absolute z-10 w-full top-0  ">
        <Navbar />
        <div className="flex justify-center max-w-full items-center mt-10 bg-warmscale-8 py-8">
          <div className="w-[76rem] justify-between px-2 md:flex">
            <div className="flex items-center max-md:justify-center ">
              <img
                src={playerSteamInfo.avatarfull}
                alt=""
                className="rounded-md sm:h-24 max-sm:h-16"
              />
              <div className="ml-5 mb-3  font-cantarell ">
                <a href={`/profile/${playerSteamID}`}>
                    <div className="text-lightscale-2 font-bold sm:text-5xl max-sm:text-3xl hover:underline hover:cursor-pointer">
                      {playerSteamInfo.personaname}{" "}
                    </div>
                </a>
                <div className="text-warmscale-1 font-semibold sm:text-lg sm:mt-2 flex">
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
            <div
              id="links"
              className="flex gap-2 items-center max-md:justify-center max-md:mt-3 "
            >
              <a
                target="_blank"
                href={`https://steamcommunity.com/profiles/${playerSteamID}`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
              >
                Steam
              </a>
              <a
                target="_blank"
                href={`https://demos.tf/profiles/${playerSteamID}`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
              >
                demos.tf
              </a>
              <a
                target="_blank"
                href={`https://etf2l.org/search/${playerSteamID}/`}
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
                href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${playerSteamID}&r=24`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
              >
                <img src="../../../site icons/rgl.png" alt="" className="h-7" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center w-full mt-6 bg-warmscale-7 pb-10">
          <div>
            <div className="flex justify-between">
              <div className="text-xl font-semibold font-cantarell text-lightscale-4">
                GAMES BY CALENDAR DAY
              </div>
              <div className="text-xl font-semibold font-cantarell text-lightscale-4">
                JAN 2018 - TODAY
              </div>
            </div>
            <div className=" border-2 mt-2 px-3 rounded-md border-opacity-20 drop-shadow-md border-warmscale-82 bg-warmscale-8">
              <div>
                {years.map((currentYear: any, index) => {
                  yearlyCount = 0;
                  const leapYear = currentYear % 4 === 0 ? 1 : 0;
                  const daysPerMonth = [
                    31,
                    28 + leapYear,
                    31,
                    30,
                    31,
                    30,
                    31,
                    31,
                    30,
                    31,
                    30,
                    31,
                  ];
                  leapYearCount += leapYear;
                  const currentYearIndex = index * 365 + leapYearCount;
                  const currentYearDays = 365 + leapYear;
                  return (
                    <div className="my-8">
                      <div className="flex">
                        <div className="text-sm font-cantarell text-end text-lightscale-6 mr-1.5">
                          <div className="h-[14px]"></div>
                          <div className="my-0.5">Sun</div>
                          <div className="my-0.5">Mon</div>
                          <div className="my-0.5">Tue</div>
                          <div className="my-0.5">Wed</div>
                          <div className="my-0.5">Thu</div>
                          <div className="my-0.5">Fri</div>
                          <div className="my-0.5">Sat</div>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 53 }).map((_, index) => {
                            const currentWeekIndex = index * 7;
                            let matchesPerDay = 0;
                            let dayIndex: any = 0;
                            let currentMonth: any;
                            let currentDay: any;
                            if (calendarArray[currentSpotCount] !== undefined) {
                              matchesPerDay =
                                calendarArray[currentSpotCount].matches_per_day;
                              dayIndex =
                                calendarArray[currentSpotCount]
                                  .day_of_week_numeric;
                              currentMonth = new Date(
                                calendarArray[currentSpotCount].match_date
                              ).getUTCMonth();
                              currentDay = new Date(
                                calendarArray[currentSpotCount].match_date
                              ).getUTCDate();
                            }
                            return (
                              <div key={index} className="">
                                <div className="h-[20px] -mb-1">
                                  {currentMonth === 0 && index === 0 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3">
                                      Jan {currentYear}
                                    </div>
                                  )}
                                  {currentMonth === 1 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Feb
                                    </div>
                                  )}
                                  {currentMonth === 2 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Mar
                                    </div>
                                  )}
                                  {currentMonth === 3 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Apr
                                    </div>
                                  )}
                                  {currentMonth === 4 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      May
                                    </div>
                                  )}
                                  {currentMonth === 5 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Jun
                                    </div>
                                  )}
                                  {currentMonth === 6 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Jul
                                    </div>
                                  )}
                                  {currentMonth === 7 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Aug
                                    </div>
                                  )}
                                  {currentMonth === 8 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Sep
                                    </div>
                                  )}
                                  {currentMonth === 9 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Oct
                                    </div>
                                  )}
                                  {currentMonth === 10 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Nov
                                    </div>
                                  )}
                                  {currentMonth === 11 && currentDay <= 7 && (
                                    <div className="absolute text-xs font-cantarell text-end font-semibold text-lightscale-3 -ml-2">
                                      Dec
                                    </div>
                                  )}
                                </div>
                                {Array.from({ length: 7 }).map((_, index) => {
                                  const currentDayIndex = index + 1;
                                  let matchesPerDay = 0;
                                  let dayIndex: any = 0;
                                  let currentMonth: any;
                                  let currentDate: any;
                                  let currentOpacity: any;
                                  if (
                                    calendarArray[currentSpotCount] !==
                                    undefined
                                  ) {
                                    matchesPerDay =
                                      calendarArray[currentSpotCount]
                                        .matches_per_day;
                                    currentOpacity =
                                      calendarArray[currentSpotCount]
                                        .percentage_of_max;
                                    dayIndex =
                                      calendarArray[currentSpotCount]
                                        .day_of_week_numeric;
                                    currentMonth = new Date(
                                      calendarArray[currentSpotCount].match_date
                                    ).getUTCMonth();
                                    currentDate = new Date(
                                      calendarArray[currentSpotCount].match_date
                                    ).getUTCDate();
                                  }
                                  yearlyCount++;
                                  if (
                                    yearlyCount <= currentYearDays &&
                                    index + 1 == dayIndex
                                  ) {
                                    currentSpotCount++;
                                    return (
                                      <div
                                        className={`border-[1px] border-warmscale-8   ${
                                          daysPerMonth[currentMonth] <
                                            currentDate + 7 &&
                                          currentMonth !== 11 &&
                                          " border-r-lightscale-3"
                                        } ${
                                          daysPerMonth[currentMonth] ===
                                            currentDate &&
                                          index !== 6 &&
                                          currentMonth !== 11 &&
                                          " border-b-lightscale-3"
                                        }`}
                                      >
                                        <div
                                          key={index}
                                          className={`border h-[20px] w-[20px] ${
                                            currentOpacity === "0"
                                              ? "border-warmscale-7 border-opacity-50"
                                              : "border-warmscale-8 group"
                                          }  hover:border-white relative rounded-sm`}
                                          style={{
                                            backgroundColor: `rgba(240,129,73,${
                                              currentOpacity / 80
                                            })`,
                                          }}
                                        >
                                          <div className="group-hover:scale-100 scale-0 absolute left-1/2 transform -translate-x-1/2 z-50 bottom-5 text-xs text-lightscale-1 font-cantarell ">
                                            <div className="w-48 h-5 bg-warmscale-2 border-2 border-warmscale-5 rounded-md flex justify-center items-center">
                                              {matchesPerDay} GAMES ON{" "}
                                              {calendarArray[
                                                currentSpotCount
                                              ] !== undefined &&
                                                new Date(
                                                  calendarArray[
                                                    currentSpotCount
                                                  ].match_date
                                                ).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    yearlyCount--;
                                    return (
                                      <div className="border border-warmscale-8">
                                        <div
                                          key={index}
                                          className={`h-[20px] w-[20px]`}
                                        ></div>
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            );
                          })}
                          <div></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default calendar;
