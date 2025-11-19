import Navbar from '../shared-components/Navbar';
import PageContainer from '../shared-components/PageContainer';
import React, { useEffect, useState } from 'react';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import Footer from '../shared-components/Footer';
import {
  RGL_SEASONS,
  OZF_SEASONS,
  ALL_SEASONS,
  getSeasonsByFormat,
} from '../../data/seasons';
import { CLASS_SPECIALTIES } from '../../data/classSpecialties';
import { getDivisionsForSeason } from '../../data/divisions';

const UnifiedSeasonSummary = () => {
  // Filter states with localStorage persistence
  const [selectedLeague, setSelectedLeague] = useState<'RGL' | 'OZF'>(() => {
    const saved = localStorage.getItem('seasonSummary_league');
    return saved === 'RGL' || saved === 'OZF' ? saved : 'RGL';
  });
  const [selectedFormat, setSelectedFormat] = useState<'HL' | '6S' | 'LAN'>(
    () => {
      const saved = localStorage.getItem('seasonSummary_format');
      return saved === 'HL' || saved === '6S' || saved === 'LAN' ? saved : 'HL';
    }
  );
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  // Data states
  const [currentDivision, setCurrentDivision] = useState<string>('invite');
  const [currentClass, setCurrentClass] = useState<string>('scout');
  const [displayArray, setDisplayArray] = useState<any[]>([]);
  const [currentSort, setCurrentSort] = useState('kills');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [summaryLastData, setLastSummaryData] = useState<any>({});
  const [timelimit, setTimelimit] = useState<boolean>(true);
  const [detectedDivisions, setDetectedDivisions] = useState<string[]>([]);
  let rowCount = 0;

  // Get available seasons based on league and format
  const availableSeasons = getSeasonsByFormat(selectedFormat, selectedLeague);
  const seasonSpecifics = selectedLeague === 'RGL' ? RGL_SEASONS : OZF_SEASONS;

  // Save league and format to localStorage when they change
  useEffect(() => {
    localStorage.setItem('seasonSummary_league', selectedLeague);
  }, [selectedLeague]);

  useEffect(() => {
    localStorage.setItem('seasonSummary_format', selectedFormat);
  }, [selectedFormat]);

  // Set default season when league or format changes
  useEffect(() => {
    const seasons = getSeasonsByFormat(selectedFormat, selectedLeague);
    if (seasons.length > 0) {
      // Select the most recent season (last in array)
      const latestSeason = seasons[seasons.length - 1];
      setSelectedSeasonId(latestSeason[0]);

      // Set default division based on league
      if (selectedLeague === 'RGL') {
        setCurrentDivision('invite');
      } else if (selectedFormat === 'LAN') {
        setCurrentDivision('LDU 2025');
      } else {
        setCurrentDivision('premier');
      }
    }
  }, [selectedLeague, selectedFormat]);

  useEffect(() => {
    sortTable(displayArray);
  }, [currentSort, currentClass]);

  useEffect(() => {
    if (selectedSeasonId) {
      getLastSummaryData();
      getSummaryData();
      getWeekData();
    }
  }, [selectedSeasonId]);

  async function getLastSummaryData() {
    let response: any;
    try {
      const endpoint =
        selectedLeague === 'RGL'
          ? `/api/lastweek-season-summary/${selectedSeasonId}`
          : `/api/lastweek-season-summary-ozf/${selectedSeasonId}`;

      response = await fetch(endpoint, FetchResultTypes.JSON);

      const transformedData = response.rows.reduce(
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
      const endpoint =
        selectedLeague === 'RGL'
          ? `/api/season-summary/${selectedSeasonId}`
          : `/api/season-summary-ozf/${selectedSeasonId}`;

      response = await fetch(endpoint, FetchResultTypes.JSON);

      // Extract unique divisions from the data
      const uniqueDivisions = [
        ...new Set(response.rows.map((row: any) => row.division)),
      ].filter(Boolean);
      setDetectedDivisions(uniqueDivisions as string[]);

      // Set initial division if not already set or if current division doesn't exist in data
      if (
        uniqueDivisions.length > 0 &&
        !uniqueDivisions.includes(currentDivision)
      ) {
        setCurrentDivision(uniqueDivisions[0] as string);
      }

      sortTable(response.rows);
    } catch (error) {
      console.error(error);
    }
  }

  async function getWeekData() {
    let response: any;
    try {
      response = await fetch(
        `/api/current-week/${selectedSeasonId}`,
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
      case 'kd':
        return Math.round((playerStat.kills / playerStat.deaths) * 100) / 100;
      case 'specialty':
        if (!classSpecs[selectedFormat][currentClass].perMinute) {
          return playerStat[classSpecs[selectedFormat][currentClass].id];
        }
        return (
          Math.round(
            (playerStat[classSpecs[selectedFormat][currentClass].id] /
              playTime) *
              100
          ) / 100
        );
      case 'time':
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
        CLASS_SPECIALTIES,
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

  const classSpecialties = CLASS_SPECIALTIES;

  // Use detected divisions from API data, fallback to configured divisions
  const configuredDivisions = selectedSeasonId
    ? getDivisionsForSeason(selectedSeasonId, selectedFormat, selectedLeague)
    : [];

  // Create division list - use configured order, but only include divisions that exist in the data
  const divisions =
    detectedDivisions.length > 0
      ? configuredDivisions.filter((configDiv) =>
          detectedDivisions.includes(configDiv.id)
        )
      : configuredDivisions;

  return (
    <div className="bg-warmscale-7 min-h-screen">
      <Navbar />
      <PageContainer className="font-ubuntu">
        <div className="bg-warmscale-8 rounded-md relative w-full shadow-lg">
          {/* Filters Section */}
          <div className="px-3 py-4 md:px-8 md:py-6 border-b border-warmscale-7">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-stretch md:items-center">
              {/* League Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-warmscale-3 text-xs md:text-sm font-bold">
                  League
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedLeague('RGL')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded font-semibold text-sm transition-colors ${
                      selectedLeague === 'RGL'
                        ? 'bg-tf-orange text-warmscale-9'
                        : 'bg-warmscale-7 text-lightscale-4 hover:bg-warmscale-6'
                    }`}
                  >
                    RGL
                  </button>
                  <button
                    onClick={() => setSelectedLeague('OZF')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded font-semibold text-sm transition-colors ${
                      selectedLeague === 'OZF'
                        ? 'bg-tf-orange text-warmscale-9'
                        : 'bg-warmscale-7 text-lightscale-4 hover:bg-warmscale-6'
                    }`}
                  >
                    OZF
                  </button>
                </div>
              </div>

              {/* Format Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-warmscale-3 text-xs md:text-sm font-bold">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFormat('HL')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded font-semibold text-sm transition-colors ${
                      selectedFormat === 'HL'
                        ? 'bg-tf-orange text-warmscale-9'
                        : 'bg-warmscale-7 text-lightscale-4 hover:bg-warmscale-6'
                    }`}
                  >
                    HL
                  </button>
                  <button
                    onClick={() => setSelectedFormat('6S')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded font-semibold text-sm transition-colors ${
                      selectedFormat === '6S'
                        ? 'bg-tf-orange text-warmscale-9'
                        : 'bg-warmscale-7 text-lightscale-4 hover:bg-warmscale-6'
                    }`}
                  >
                    6S
                  </button>
                  {selectedLeague === 'OZF' && (
                    <button
                      onClick={() => setSelectedFormat('LAN')}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded font-semibold text-sm transition-colors ${
                        selectedFormat === 'LAN'
                          ? 'bg-tf-orange text-warmscale-9'
                          : 'bg-warmscale-7 text-lightscale-4 hover:bg-warmscale-6'
                      }`}
                    >
                      LAN
                    </button>
                  )}
                </div>
              </div>

              {/* Season Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-warmscale-3 text-xs md:text-sm font-bold">
                  Season
                </label>
                <select
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 bg-warmscale-7 text-lightscale-1 text-sm rounded font-semibold cursor-pointer hover:bg-warmscale-6 focus:outline-none focus:ring-2 focus:ring-tf-orange"
                >
                  {availableSeasons.map(([id, details]) => (
                    <option key={id} value={id}>
                      Season {details.season}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Time filter toggle */}
          <div className="absolute right-2 top-2 md:top-1.5 z-10">
            <div className="flex justify-center gap-1">
              <div className="text-xs md:text-sm text-warmscale-3 font-bold">
                time filter:
              </div>
              <div
                onClick={() => setTimelimit(!timelimit)}
                className={`text-center w-7 text-xs md:text-sm select-none text-warmscale-3 font-semibold cursor-pointer text-opacity-50 hover:text-opacity-80 ${
                  timelimit === true ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {timelimit === true ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>

          {/* Title */}
          {selectedSeasonId && seasonSpecifics[selectedSeasonId] && (
            <div className="text-center text-lightscale-1 font-bold text-2xl md:text-5xl py-4 md:py-8 px-2">
              {seasonSpecifics[selectedSeasonId].leauge}{' '}
              {seasonSpecifics[selectedSeasonId].format} S
              {seasonSpecifics[selectedSeasonId].season} SUMMARY
              {selectedFormat !== 'LAN' && ` | WEEK ${currentWeek}`}
            </div>
          )}

          {/* Division Tabs - Desktop */}
          <div className="hidden md:flex text-lightscale-1 font-semibold text-xl">
            {divisions.map((division) =>
              divisionHeader(
                setCurrentDivision,
                currentDivision,
                division.id,
                division.label
              )
            )}
          </div>

          {/* Division Dropdown - Mobile */}
          <div className="md:hidden px-3 py-3 border-b border-warmscale-7">
            <select
              value={currentDivision}
              onChange={(e) => setCurrentDivision(e.target.value)}
              className="w-full px-4 py-2 bg-warmscale-7 text-lightscale-1 text-sm rounded font-semibold cursor-pointer hover:bg-warmscale-6 focus:outline-none focus:ring-2 focus:ring-tf-orange"
            >
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.label}
                </option>
              ))}
            </select>
          </div>

          {/* Class Tabs - Desktop */}
          <div className="hidden md:grid grid-cols-9 text-lightscale-1 font-semibold text-xl">
            {classHeader(setCurrentClass, currentClass, 'scout')}
            {classHeader(setCurrentClass, currentClass, 'soldier')}
            {classHeader(setCurrentClass, currentClass, 'pyro')}
            {classHeader(setCurrentClass, currentClass, 'demoman')}
            {classHeader(setCurrentClass, currentClass, 'heavyweapons')}
            {classHeader(setCurrentClass, currentClass, 'engineer')}
            {classHeader(setCurrentClass, currentClass, 'medic')}
            {classHeader(setCurrentClass, currentClass, 'sniper')}
            {classHeader(setCurrentClass, currentClass, 'spy')}
          </div>

          {/* Class Dropdown - Mobile */}
          <div className="md:hidden px-3 py-3 border-b border-warmscale-7">
            <div className="relative">
              <select
                value={currentClass}
                onChange={(e) => setCurrentClass(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-warmscale-7 text-lightscale-1 text-sm rounded font-semibold cursor-pointer hover:bg-warmscale-6 focus:outline-none focus:ring-2 focus:ring-tf-orange appearance-none"
              >
                <option value="scout">Scout</option>
                <option value="soldier">Soldier</option>
                <option value="pyro">Pyro</option>
                <option value="demoman">Demoman</option>
                <option value="heavyweapons">Heavy</option>
                <option value="engineer">Engineer</option>
                <option value="medic">Medic</option>
                <option value="sniper">Sniper</option>
                <option value="spy">Spy</option>
              </select>
              {/* Class Icon */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <img
                  src={`../../../class icons/Leaderboard_class_${currentClass}.png`}
                  alt=""
                  className="h-6 w-6"
                />
              </div>
              {/* Dropdown Arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 fill-lightscale-1" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Table */}
          <div className="p-2 overflow-x-auto lg:overflow-x-visible">
            <div className="min-w-[1200px] lg:min-w-0 grid grid-cols-[200px,repeat(8,1fr)] md:grid-cols-[180px,repeat(8,1fr)] text-center text-lightscale-1 font-semibold py-1 text-xs md:text-sm">
              <div className="text-left pl-2 md:pl-3">PLAYER</div>
              {columnHeader(
                setCurrentSort,
                currentSort,
                'kills',
                'Kills Per Minute',
                'K/m'
              )}
              {columnHeader(
                setCurrentSort,
                currentSort,
                'assist',
                'Assists Per Minute',
                'A/m'
              )}
              {columnHeader(
                setCurrentSort,
                currentSort,
                'deaths',
                'Deaths Per Minute',
                'D/m'
              )}
              {columnHeader(
                setCurrentSort,
                currentSort,
                'kd',
                'Kill / Deaths',
                'K/D'
              )}
              {columnHeader(
                setCurrentSort,
                currentSort,
                'dmg',
                'Damage Per Minute',
                'DMG/m'
              )}
              {columnHeader(
                setCurrentSort,
                currentSort,
                'dt',
                'Damage Taken Per Minute',
                'DT/m'
              )}
              <div
                className="cursor-pointer group relative flex justify-center items-center"
                onClick={() => setCurrentSort('specialty')}
              >
                {currentSort === 'specialty' && (
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
                {classSpecialties[selectedFormat][currentClass].title}
                <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                  {classSpecialties[selectedFormat][currentClass].name}
                  <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
              {columnHeader(
                setCurrentSort,
                currentSort,
                'time',
                'Play Time',
                'Time'
              )}
            </div>

            {/* Player Rows */}
            {displayArray.map((currentPlayer: any, index: number) => {
              const lastWeeksStats = summaryLastData[currentPlayer.id64];
              const lastWeeksPlaytime: any =
                lastWeeksStats !== undefined && lastWeeksStats.time / 60;
              const playtimeInMinutes = currentPlayer.time / 60;
              const userName =
                selectedLeague === 'RGL'
                  ? currentPlayer.rglname
                  : currentPlayer.ozfname;
              const teamID =
                currentPlayer.teamid === null ? '0000' : currentPlayer.teamid;
              const teamName =
                currentPlayer.teamname === null
                  ? 'Free Agent'
                  : currentPlayer.teamname;

              if (
                (timelimit === true
                  ? playtimeInMinutes > currentWeek * 10
                  : playtimeInMinutes > currentWeek * 0.5) &&
                currentPlayer.classid === currentClass &&
                currentPlayer.division === currentDivision
              ) {
                rowCount++;
                return (
                  <div
                    key={index}
                    className={`min-w-[1200px] lg:min-w-0 grid grid-cols-[200px,repeat(8,1fr)] md:grid-cols-[180px,repeat(8,1fr)] text-center text-lightscale-4 items-center text-xs md:text-sm ${
                      rowCount % 2 === 1 && 'bg-warmscale-85'
                    }`}
                  >
                    <div className="pl-2 md:pl-3 text-left text-lightscale-2">
                      <div className="truncate -mb-1">
                        <a
                          href={`/profile/${currentPlayer.id64}`}
                          className="hover:text-tf-orange font-semibold text-xs md:text-sm"
                        >
                          {userName}
                        </a>
                      </div>
                      <div className="truncate">
                        <a
                          href={`${
                            teamID !== 'none' &&
                            `https://rgl.gg/Public/Team.aspx?t=${teamID}&r=24`
                          }`}
                          className={`${
                            teamID !== 'none' && 'hover:text-tf-orange'
                          } select-none text-[8px] md:text-xs text-lightscale-7`}
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
                      'kills',
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
                      'assist',
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
                      'deaths',
                      2,
                      7,
                      -1
                    )}
                    <div
                      className={`relative py-2.5 flex items-center justify-center ${
                        currentSort === 'kd' && 'bg-warmscale-2 bg-opacity-5'
                      }`}
                    >
                      {(currentPlayer.kills / currentPlayer.deaths).toFixed(2)}
                      {renderTrendArrow(
                        lastWeeksStats !== undefined
                          ? Math.round(
                              (currentPlayer.kills / currentPlayer.deaths -
                                lastWeeksStats.kills / lastWeeksStats.deaths) *
                                10
                            ) / 10
                          : null
                      )}
                    </div>
                    {playerStat(
                      currentSort,
                      currentPlayer,
                      playtimeInMinutes,
                      lastWeeksStats,
                      lastWeeksPlaytime,
                      'dmg',
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
                      'dt',
                      1,
                      8,
                      -1
                    )}
                    <div
                      className={`relative py-2.5 flex items-center justify-center ${
                        currentSort === 'specialty' &&
                        'bg-warmscale-2 bg-opacity-5'
                      }`}
                    >
                      {classSpecialties[selectedFormat][currentClass].perMinute
                        ? (
                            currentPlayer[
                              classSpecialties[selectedFormat][currentClass].id
                            ] / playtimeInMinutes
                          ).toFixed(
                            currentClass === 'medic'
                              ? 0
                              : currentClass === 'pyro'
                                ? 2
                                : 1
                          )
                        : currentPlayer[
                            classSpecialties[selectedFormat][currentClass].id
                          ]}
                      {renderSpecialtyTrendArrow(
                        lastWeeksStats,
                        currentPlayer,
                        playtimeInMinutes,
                        lastWeeksPlaytime
                      )}
                    </div>
                    <div
                      className={`py-2.5 ${
                        currentSort === 'time' && 'bg-warmscale-2 bg-opacity-5'
                      }`}
                    >
                      {Math.round(currentPlayer.time / 60) + ' min'}
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* Footer */}
          <div className="relative text-stone-600 font-semibold text-center py-2 text-xs md:text-sm px-2">
            UP AND DOWN ARROWS SHOW HOW YOUR SCORE CHANGED FROM LAST WEEKS STATS
          </div>
        </div>
      </PageContainer>
      <div className="mt-6 md:mt-10">
        <Footer />
      </div>
    </div>
  );

  function renderTrendArrow(difference: number | null) {
    if (difference === null) return null;

    const colorClass =
      difference > 0
        ? 'text-green-500'
        : difference < 0
          ? 'text-red-500'
          : 'text-gray-500';

    return (
      <div
        className={`absolute left-[45%] transform translate-x-full ml-1 w-7 text-[10px] font-robotomono font-semibold ${colorClass}`}
      >
        {difference > 0 ? (
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
        ) : difference < 0 ? (
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
        ) : (
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={5.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
          </svg>
        )}
      </div>
    );
  }

  function renderSpecialtyTrendArrow(
    lastWeeksStats: any,
    currentPlayer: any,
    playtimeInMinutes: number,
    lastWeeksPlaytime: any
  ) {
    if (lastWeeksStats === undefined) return null;

    const specialty = classSpecialties[selectedFormat][currentClass];
    const isPerMinute = specialty.perMinute;

    const currentPlayerValue = currentPlayer[specialty.id];
    const lastWeekValue = lastWeeksStats[specialty.id];

    let difference;

    if (isPerMinute) {
      const currentPlayerPerMinute = currentPlayerValue / playtimeInMinutes;
      const lastWeekPerMinute = lastWeekValue / lastWeeksPlaytime;
      difference = currentPlayerPerMinute - lastWeekPerMinute;
    } else {
      difference = currentPlayerValue - lastWeekValue;
    }

    difference = Math.round(difference * 100) / 100;

    const colorClass =
      difference > 0
        ? 'text-green-500'
        : difference < 0
          ? 'text-red-500'
          : 'text-gray-500';

    return (
      <div
        className={`absolute left-[45%] transform translate-x-full w-8 text-[10px] font-robotomono font-semibold ${colorClass}`}
      >
        {difference > 0 ? (
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
        ) : difference < 0 ? (
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
        ) : (
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={5.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
          </svg>
        )}
      </div>
    );
  }
};

export default UnifiedSeasonSummary;

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
  const difference =
    lastWeeksStats !== undefined
      ? Math.round(
          (currentPlayer[stat] / playtimeInMinutes -
            lastWeeksStats[stat] / lastWeeksPlaytime) *
            100
        ) / 100
      : null;

  const colorClass =
    difference !== null
      ? difference > 0
        ? positiveStat == 1
          ? 'text-green-500'
          : 'text-red-500'
        : difference < 0
          ? positiveStat !== 1
            ? 'text-green-500'
            : 'text-red-500'
          : 'text-gray-500'
      : '';

  return (
    <div
      className={`relative py-2.5 flex items-center justify-center ${
        currentSort === stat && 'bg-warmscale-2 bg-opacity-5'
      }`}
    >
      {(currentPlayer[stat] / playtimeInMinutes).toFixed(significantDigits)}
      {difference !== null && (
        <div
          className={`absolute left-[45%] transform translate-x-full w-${arrowMargin} text-[10px] font-robotomono font-semibold ${colorClass}`}
        >
          {difference > 0 ? (
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
          ) : difference < 0 ? (
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
          ) : (
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth={5.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
            </svg>
          )}
        </div>
      )}
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
          ? 'text-lightscale-1 border-b-2 border-tf-orange'
          : 'text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9'
      } select-none min-w-[120px] md:w-56 flex-1 text-center py-2 whitespace-nowrap`}
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
        <div className="-ml-1 md:-ml-2">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-3 md:h-4 -ml-1 md:-ml-2"
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
      <div className="absolute scale-0 w-32 md:w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2 text-xs md:text-sm z-20">
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
          ? 'text-lightscale-1 border-b-2 border-tf-orange'
          : 'text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9'
      } select-none text-center py-2 min-w-[60px]`}
    >
      <img
        src={`../../../class icons/Leaderboard_class_${className}.png`}
        alt=""
        className="h-6 md:h-8"
      />
    </div>
  );
}
