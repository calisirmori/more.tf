import Navbar from '../shared-components/Navbar';
import React, { useEffect, useState, useRef } from 'react';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import Footer from '../shared-components/Footer';

interface DayInfo {
  day: string;
  date: string;
  epochTimeStart: string;
  epochTimeEnd: string;
}

const MatchList = () => {
  const [officialsList, setOfficialsList] = useState<any[]>([]);
  const [officialsListEtf2l, setOfficialsListEtf2l] = useState<any[]>([]);
  const [activeDate, setActiveDate] = useState<any>(3);
  const [activeDiv, setActiveDiv] = useState<any>(0);
  const [dayInfoList, setDayInfoList] = useState<DayInfo[]>([]);

  useEffect(() => {
    getOfficials();
    generateDayInfo();
  }, []);

  const generateDayInfo = () => {
    const daysArray: DayInfo[] = [];
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = -3; i <= 3; i++) {
      const date = new Date(today.getTime() + i * oneDay);
      const dayName =
        i === 0 ? 'Today' : date.toLocaleString('en-US', { weekday: 'short' });
      const dateString = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const epochTimeStart = Math.floor(
        date.setHours(0, 0, 0, 0) / 1000
      ).toString();
      const epochTimeEnd = Math.floor(
        date.setHours(23, 59, 59, 999) / 1000
      ).toString();

      daysArray.push({
        day: dayName,
        date: dateString,
        epochTimeStart: epochTimeStart,
        epochTimeEnd: epochTimeEnd,
      });
    }

    setDayInfoList(daysArray);
  };

  useEffect(() => {
    getOfficials();
  }, []);

  async function getOfficials() {
    let response: any;
    try {
      response = await fetch(`/api/officials-rgl`, FetchResultTypes.JSON);
      setOfficialsList(response.rows);
    } catch (error) {
      console.error(error);
    }
    try {
      response = await fetch(`/api/officials-etf2l`, FetchResultTypes.JSON);
      setOfficialsListEtf2l(response.rows);
    } catch (error) {
      console.error(error);
    }
  }

  const formatDate = (epochTime: number): string => {
    const date = new Date(epochTime * 1000);
    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleString('en-US', { day: 'numeric' });
    const monthDayOrdinal = getOrdinalSuffix(monthDay);
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    return `${day}, ${monthDayOrdinal} ${time}`;
  };

  const getOrdinalSuffix = (day: string): string => {
    const dayInt = parseInt(day, 10);
    if (dayInt > 3 && dayInt < 21) return `${dayInt}th`;
    switch (dayInt % 10) {
      case 1:
        return `${dayInt}st`;
      case 2:
        return `${dayInt}nd`;
      case 3:
        return `${dayInt}rd`;
      default:
        return `${dayInt}th`;
    }
  };

  const divisions = [
    'Invite / Premiership',
    'Advanced / Division 1',
    'Main / Division 2A',
    'Intermediate / Division 2B',
    'Amateur / Mid',
    'Newcomer / Low',
    'Open',
  ];

  const divisionsPerLeauge = {
    rgl: [
      'Invite',
      'Advanced',
      'Main',
      'Intermediate',
      'Amateur',
      'Newcomer',
      '',
    ],
    etf2l: [
      'Premiership',
      'Division 1',
      'Division 2A',
      'Division 2B',
      'Mid',
      'Low',
      'Open',
    ],
  };

  let matchIndex = 0;
  return (
    <div className=" bg-warmscale-7 min-h-screen">
      <Navbar />
      <div className="w-full h-full font-ubuntu max-sm:scale-50 max-sm:-mt-52 max-lg:scale-50 max-xl:scale-75 max-lg:-mt-36 max-xl:-mt-20 max-md:scale-50">
        <div className="flex justify-center mb-10 max-[450px]:scale-50 max-sm:scale-75 max-lg:scale-110">
          <div className="rounded-md">
            <div className="grid grid-cols-7 gap-2">
              {dayInfoList.map((dayInfo, index) => (
                <div
                  key={index}
                  className={` py-0.5 cursor-pointer bg-warmscale-85 rounded-md duration-100 font-quicksand font-semibold ${
                    index === activeDate
                      ? 'border border-tf2orange text-lightscale-2'
                      : 'border border-warmscale-85 hover:scale-95 hover:border-warmscale-2 text-lightscale-8 opacity-70 hover:opacity-90'
                  }`}
                  onClick={() => setActiveDate(index)}
                >
                  <div className="text-center -mb-1">{dayInfo.day}</div>
                  <div className="text-center">{dayInfo.date}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {divisions.map((divInfo, index) => (
                <div
                  key={index}
                  className={`py-0.5 px-3 flex justify-center items-center cursor-pointer bg-warmscale-85 rounded-md duration-100 font-quicksand font-semibold text-sm ${
                    index === activeDiv
                      ? 'border border-tf2orange text-lightscale-2'
                      : 'border border-warmscale-85 hover:scale-95 hover:border-warmscale-2 text-lightscale-8 opacity-70 hover:opacity-90'
                  }`}
                  onClick={() => setActiveDiv(index)}
                >
                  <div className="text-center">{divInfo}</div>
                </div>
              ))}
            </div>

            <div className="block mt-6">
              <div className="border-2 rounded-md border-warmscale-85">
                <div className="flex bg-warmscale-85">
                  <img
                    src="https://premium-storefronts.s3.amazonaws.com/storefronts/rglgg/assets/logo.png"
                    alt=""
                    className="h-7 my-3 ml-3 "
                  />
                  <div className=" text-lightscale-3 font-bold font-quicksand text-lg px-2 py-3">
                    Sixes Recharge Gaming Leauge - RGL
                  </div>
                </div>
                {officialsList.map((match: any, index: number) => {
                  const matchTime = match.day_played - 14400;
                  if (
                    Number(dayInfoList[activeDate].epochTimeStart) <
                      matchTime &&
                    Number(dayInfoList[activeDate].epochTimeEnd) > matchTime &&
                    match.division === divisionsPerLeauge.rgl[activeDiv] &&
                    match.format === '6s'
                  ) {
                    console.log(match);
                    matchIndex++;
                    return (
                      <a
                        key={match.matchid}
                        href={`https://rgl.gg/Public/Match?m=${match.matchid}&r=24`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div
                          className={` cursor-pointer hover:bg-tf2orange hover:bg-opacity-10 flex justify-center items-center h-12 ${
                            matchIndex % 2 === 0 ? 'bg-black bg-opacity-10' : ''
                          }`}
                        >
                          <div className="grid items-center grid-cols-[200px,1fr,20px,1fr,200px] w-full p-4 text-lightscale-4 font-quicksand font-semibold">
                            <div>{formatDate(matchTime)}</div>

                            <div className=" text-right">
                              {match.team1_name}
                            </div>
                            <div className=" text-center">-</div>
                            <div>{match.team2_name}</div>

                            <div className="text-right text-sm">
                              <div className="">{match.format}</div>
                              <div>{match.division}</div>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  }
                })}
              </div>
              <div className="border-2 rounded-md border-warmscale-85 mt-5">
                <div className="flex bg-warmscale-85">
                  <img
                    src="https://premium-storefronts.s3.amazonaws.com/storefronts/rglgg/assets/logo.png"
                    alt=""
                    className="h-7 my-3 ml-3 "
                  />
                  <div className=" text-lightscale-3 font-bold font-quicksand text-lg px-2 py-3">
                    Highlander Recharge Gaming Leauge - RGL
                  </div>
                </div>
                {officialsList.map((match: any, index: number) => {
                  const matchTime = match.day_played - 14400;
                  if (
                    Number(dayInfoList[activeDate].epochTimeStart) <
                      matchTime &&
                    Number(dayInfoList[activeDate].epochTimeEnd) > matchTime &&
                    match.division === divisionsPerLeauge.rgl[activeDiv] &&
                    match.format === 'HL'
                  ) {
                    matchIndex++;
                    return (
                      <a
                        key={match.matchid}
                        href={`https://rgl.gg/Public/Match?m=${match.matchid}&r=24`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div
                          className={` cursor-pointer hover:bg-tf2orange hover:bg-opacity-10 flex justify-center items-center h-12 ${
                            matchIndex % 2 === 0 ? 'bg-black bg-opacity-10' : ''
                          }`}
                        >
                          <div className="grid items-center grid-cols-[200px,1fr,20px,1fr,200px] w-full p-4 text-lightscale-4 font-quicksand font-semibold">
                            <div>{formatDate(matchTime)}</div>
                            <div className=" text-right">
                              {match.team1_name}
                            </div>
                            <div className=" text-center">-</div>
                            <div>{match.team2_name}</div>
                            <div className="text-right text-sm">
                              <div className="">{match.format}</div>
                              <div>{match.division}</div>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  }
                })}
              </div>
              <div className="border-2 rounded-md border-warmscale-85 mt-5">
                <div className="flex bg-warmscale-85">
                  <img
                    src="https://etf2l.org/wp-content/uploads/2018/07/2018_etf2l_short_nobackground_light.png"
                    alt=""
                    className="h-7 my-3 ml-3 "
                  />
                  <div className=" text-lightscale-3 font-bold font-quicksand text-lg px-2 py-3">
                    Sixes ETF2L
                  </div>
                </div>
                {officialsListEtf2l.map((match: any, index: number) => {
                  const matchTime = match.day_played - 14400;
                  if (
                    Number(dayInfoList[activeDate].epochTimeStart) <
                      matchTime &&
                    Number(dayInfoList[activeDate].epochTimeEnd) > matchTime &&
                    match.division === divisionsPerLeauge.etf2l[activeDiv] &&
                    match.format === '6s'
                  ) {
                    matchIndex++;
                    return (
                      <a
                        key={match.matchid}
                        href={`https://rgl.gg/Public/Match?m=${match.matchid}&r=24`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div
                          className={` cursor-pointer hover:bg-tf2orange hover:bg-opacity-10 flex justify-center items-center h-12 ${
                            matchIndex % 2 === 0 ? 'bg-black bg-opacity-10' : ''
                          }`}
                        >
                          <div className="grid items-center grid-cols-[200px,1fr,20px,1fr,200px] w-full p-4 text-lightscale-4 font-quicksand font-semibold">
                            <div>{formatDate(matchTime)}</div>
                            <div className=" text-right">
                              {match.team1_name}
                            </div>
                            <div className=" text-center">-</div>
                            <div>{match.team2_name}</div>
                            <div className="text-right text-sm">
                              <div className="">{match.format}</div>
                              <div>{match.division}</div>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  }
                })}
              </div>
              <div className="border-2 rounded-md border-warmscale-85 mt-5">
                <div className="flex bg-warmscale-85">
                  <img
                    src="https://etf2l.org/wp-content/uploads/2018/07/2018_etf2l_short_nobackground_light.png"
                    alt=""
                    className="h-7 my-3 ml-3 "
                  />
                  <div className=" text-lightscale-3 font-bold font-quicksand text-lg px-2 py-3">
                    Highlander ETF2L
                  </div>
                </div>
                {officialsListEtf2l.map((match: any, index: number) => {
                  const matchTime = match.day_played - 14400;
                  if (
                    Number(dayInfoList[activeDate].epochTimeStart) <
                      matchTime &&
                    Number(dayInfoList[activeDate].epochTimeEnd) > matchTime &&
                    match.division === divisionsPerLeauge.etf2l[activeDiv] &&
                    match.format === 'HL'
                  ) {
                    matchIndex++;
                    return (
                      <a
                        key={match.matchid}
                        href={`https://rgl.gg/Public/Match?m=${match.matchid}&r=24`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div
                          className={` cursor-pointer hover:bg-tf2orange hover:bg-opacity-10 flex justify-center items-center h-12 ${
                            matchIndex % 2 === 0 ? 'bg-black bg-opacity-10' : ''
                          }`}
                        >
                          <div className="grid items-center grid-cols-[200px,1fr,20px,1fr,200px] w-full p-4 text-lightscale-4 font-quicksand font-semibold">
                            <div>{formatDate(matchTime)}</div>
                            <div className=" text-right">
                              {match.team1_name}
                            </div>
                            <div className=" text-center">-</div>
                            <div>{match.team2_name}</div>
                            <div className="text-right text-sm">
                              <div className="">{match.format}</div>
                              <div>{match.division}</div>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchList;
