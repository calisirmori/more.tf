import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { useSpring, animated } from "react-spring";
import Footer from "../shared-components/Footer";

const Profile = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const playerId = idArray[4];

  const [playerSteamInfo, setPlayerSteamInfo] = useState<any>({});
  const [matchesPlayedInfo, setMatchesPlayedInfo] = useState<any>([]);
  const [rglInfo, setRglInfo] = useState<any>({});
  const [activity, setActivity] = useState<any>({});
  const [displayTeammates, setDisplayTeammates] = useState<any>(true);
  const [teamMatesList, setTeamMatesList] = useState<any>([]);
  const [enemiesList, setEnemiesList] = useState<any>([]);
  const [teamMatesSteamInfo, setTeamMatesSteamInfo] = useState<any>([]);
  const [enemiesSteamInfo, setEnemiesSteamInfo] = useState<any>([]);
  const [perClassPlaytimeData, setPerClassPlaytimeData] = useState<any>([]);
  const [formatData, setFormatData] = useState<any>([]);
  const [mapDisparityData, setMapDisparityData] = useState<any>([]);
  const [showMoreMaps, setShowMoreMaps] = useState<any>(false);
  const [playerCardData, setPlayerCardData] = useState<any>([]);
  const [multiDiv, setMultiDiv] = useState<any>(true);
  const [highlander, setIsHighlander] = useState<boolean>(true);

  const cardRef: any = useRef(null);
  const [animatedProps, setAnimatedProps] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 15, tension: 500, friction: 60 },
  }));

  // Capture mouse move and translate it to card coordinates
  const handleMouseMove = (e: any) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / 20;
    const y = (e.clientY - (rect.top + rect.height / 2)) / -20;
    setAnimatedProps({ xys: [x, y, 1.1] });
  };

  // Reset the card transform when the mouse leaves
  const handleMouseLeave = () => {
    setAnimatedProps({ xys: [0, 0, 1] });
  };

  // Interpolate values from the spring for the transform
  const transform = animatedProps.xys.to(
    (x, y, s) =>
      `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(${s})`
  );

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

  useEffect(() => {
    playerCardCall();
  }, [highlander]);

  const canvasRef = useRef(null);
  const [images, setImages] = useState<any>({});

  // Load images only once or when playerCardData changes
  useEffect(() => {
    const imageSources:any = {
      background: "/player cards/background-red.png",
      classPortrait: `/player cards/class-portraits/${playerCardData.class}.png`,
      border: `/player cards/borders/${playerCardData.division}.png`,
      gradient: "/player cards/gradients.png",
      classIcon: `/player cards/class-icons/${playerCardData.class}.png`,
      logo: `/player cards/logo.png`,
      medal: `/player cards/division-medals/${playerCardData.division}.png`,
    };

    let loadedImages:any = 0;
    let tempImages:any = {};
    for (let src in imageSources) {
      tempImages[src] = new Image();
      tempImages[src].src = imageSources[src];
      tempImages[src].onload = () => {
        loadedImages++;
        if (loadedImages === Object.keys(imageSources).length) {
          setImages(tempImages);
        }
      };
    }
  }, [playerCardData, highlander]); // Depend on playerCardData to reload images when it changes

  useEffect(() => {
    if (Object.keys(images).length > 0) {
      drawCanvas();
    }
  }, [images, rglInfo]); // Redraw when images or rglInfo change

  function drawCanvas() {
    const canvas:any = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing


    // Draw the background
    ctx.drawImage(images.background, 0, 0);
    
    // Draw other images
    ctx.drawImage(images.border, 0, 0);
    ctx.drawImage(images.classPortrait, 0, 0);
    ctx.drawImage(images.gradient, 0, 0);
    ctx.drawImage(images.classIcon, (canvas.width/2)-20,(canvas.height)-90, 40, 40);
    ctx.drawImage(images.logo, 0, 0);
    ctx.drawImage(images.medal, 90, 250, images.medal.width * 0.6 , images.medal.height * 0.6);

    // Reset scale for text
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transform matrix
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "bold 60px 'Roboto'";
    ctx.fillText(rglInfo.name, (canvas.width/2) , 440 );

    ctx.font = "bold 46px 'Roboto Mono'";
    ctx.fillText('CBT', 206 , 512 );
    ctx.fillText('SPT', 206 , 562 );
    ctx.fillText('SRV', 206 , 612 );
    ctx.fillText('EFF', 406 , 512 );
    ctx.fillText('DMG', 406 , 562 );
    ctx.fillText('EVA', 406 , 612 );

    ctx.fillText(playerCardData.cbt, 130 , 512 );
    ctx.fillText(playerCardData.spt, 130 , 562 );
    ctx.fillText(playerCardData.srv, 130 , 612 );
    ctx.fillText(playerCardData.eff, 330 , 512 );
    ctx.fillText(playerCardData.imp, 330 , 562 );
    ctx.fillText(playerCardData.eva, 330 , 612 );

    ctx.font = "bold 20px 'Roboto Mono'";
    ctx.fillText('OVERALL', 144 , 150 );

    ctx.font = "bold 13px 'Roboto Mono'";
    ctx.fillText(`${ playerCardData.format === "HL" ? 'HIGHLANDER' : 'SIXES'}`, 144 , 165 );

    ctx.font = "bold 68px 'Roboto Mono'";
    ctx.fillText(Math.round(
      (playerCardData.cbt * 2 +
        playerCardData.spt +
        playerCardData.srv +
        playerCardData.eff * 0.5 +
        playerCardData.imp * 2 +
        playerCardData.eva * 0.5) /
        7
    ), 144 , 225 );

    ctx.beginPath();
    ctx.moveTo(80, 456);
    ctx.lineTo(470, 456);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2; 
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((canvas.width/2), 466);
    ctx.lineTo((canvas.width/2), 630);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(200, 640);
    ctx.lineTo(350, 640);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(105, 250);
    ctx.lineTo(185, 250);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
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
      response.personaname = "Steam Error";
      response.avatarfull = "Steam Error";
      setPlayerSteamInfo(response);
    }
  }

  async function playerCardCall() {
    let response: any = {};
    try {
      response = await fetch(
        `/api/playercard-stats/${playerId}`,
        FetchResultTypes.JSON
      );
      if (response.length === 2){
        setMultiDiv(true);
        if (highlander) {
          if (response[0].format === "HL") setPlayerCardData(response[0])
          else setPlayerCardData(response[1])
        } else {
          if (response[0].format === "HL") setPlayerCardData(response[1])
          else setPlayerCardData(response[0])
        }
      } else if (response.length === 1){
        setMultiDiv(false);
        setPlayerCardData(response[0]);
      }
      
    } catch (error) {}
  }

  async function steamInfoCall(currentPlayer: any) {
    let response: any;
    const idsString = currentPlayer.join(",");
    try {
      response = await fetch(
        `/api/steam-info?ids=${idsString}`,
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
    const responsePeers: any = await fetch(
      `/api/peers-search/${playerId}`,
      FetchResultTypes.JSON
    );
    const responseEnemies: any = await fetch(
      `/api/enemies-search/${playerId}`,
      FetchResultTypes.JSON
    );
    const combinedArray = responsePeers.rows.concat(responseEnemies.rows);
    teamMateSteamCalls(combinedArray);
    setTeamMatesList(responsePeers.rows);
    setEnemiesList(responseEnemies.rows);
  }

  async function calendar() {
    const response: any = await fetch(
      `/api/activity/${playerId}`,
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

    for (let i = 0; i < unsortedArray.length; i++) {
      try {
        let mapName = unsortedArray[i].map.split("_")[1];
        if (currentMapObject[mapName] === undefined) {
          currentMapObject = {
            ...currentMapObject,
            [mapName]: unsortedArray[i],
          };
        } else {
          currentMapObject[mapName].w =
            parseInt(unsortedArray[i].w) +
            parseInt(currentMapObject[mapName].w);
          currentMapObject[mapName].l =
            parseInt(unsortedArray[i].l) +
            parseInt(currentMapObject[mapName].l);
          currentMapObject[mapName].t =
            parseInt(unsortedArray[i].t) +
            parseInt(currentMapObject[mapName].t);
          currentMapObject[mapName].time =
            parseInt(unsortedArray[i].time) +
            parseInt(currentMapObject[mapName].time);
        }
      } catch (error) {}
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
    const peer_id64_list = playerList.map((obj: any) => obj.peer_id64);
    const response: any = await steamInfoCall(peer_id64_list);
    const steamObjects = response.response.players.reduce(
      (obj: any, item: any) => {
        obj[item.steamid] = item;
        return obj;
      },
      {}
    );
    setTeamMatesSteamInfo(steamObjects);
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
      let weekIndex = Math.ceil((match.date + 86400 * 2) / 604800);
      let dayIndex = Math.ceil((match.date + 86400 * 2) / 86400) % 7;

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
    <div className=" bg-warmscale-7 min-h-screen "  data-testid="profile-container">
      <Navbar />
      <div className="">
        <div className="relative w-full h-fit">
          <div className="flex justify-center w-full items-center bg-warmscale-8 py-8">
            <div className="w-[76rem] justify-between px-2 md:flex">
              <div className="flex items-center max-md:justify-center ">
                <img
                  src={playerSteamInfo.avatarfull}
                  alt=""
                  className="rounded-md sm:h-24 max-sm:h-16"
                />
                <div className="ml-5 mb-3  font-cantarell ">
                  <div className="text-lightscale-2 font-bold sm:text-5xl max-sm:text-3xl">
                    {playerSteamInfo.personaname}{" "}
                  </div>
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
                className="flex gap-2 items-center max-md:justify-center max-md:mt-3"
              >
                <a className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
                  target="_blank"
                  href={`https://wrapped.tf/recap/${playerId}`}>
                    wrapped.tf
                    <span className="absolute bg-tf-orange rounded-full w-3 h-3 top-[-7px] left-[-7px] animate-ping">
                    </span>
                    <span className="absolute bg-tf-orange rounded-full w-3 h-3 top-[-7px] left-[-7px]"></span>
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
                  href={`https://steamcommunity.com/profiles/${playerId}`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
                >
                  <img src="\steam-icon.png" alt="" className="h-7" />
                </a>
                <a
                  target="_blank"
                  href={`https://etf2l.org/search/${playerId}/`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
                >
                  <img src="\etf2l-icon.jpg" alt="" className="h-7" />
                </a>
                <a
                  target="_blank"
                  href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${playerId}&r=24`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
                >
                  <img
                    src="../../../site icons/rgl.png"
                    alt=""
                    className="h-7"
                  />
                </a>
                <a
                  target="_blank"
                  href={`https://ozfortress.com/users?utf8=✓&q=${playerId}&button=`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
                >
                  <img src="\oz-icon.svg" alt="" className="h-7" />
                </a>
                <a
                  target="_blank"
                  href={`https://fbtf.tf/users?utf8=✓&q=${playerId}&button=`}
                  className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
                >
                  <img src="\FB-icon.png" alt="" className="h-7" />
                </a>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="xl:w-[76rem] w-full xl:flex justify-between mt-4">
              <div id="summary" className="">
                <div className="flex justify-center">
                  <div className="xl:w-full w-72 max-xl:w-[90vw]">
                    <div
                      id=""
                      className="grid md:grid-cols-2 max-md:grid-rows-2 md:h-20 justify-center gap-4 max-md:px-10"
                    >
                      <div id="winrate" className="h-full bg-warmscale-8 rounded-md px-4 py-3 max-md:w-[90vw] drop-shadow-sm">
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
                      <div id="winrate" className="h-full bg-warmscale-8 rounded-md px-4 py-3 drop-shadow-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex">
                            <div
                              className={`${
                                totalMatchWins > totalMatchLosses
                                  ? "text-green-600"
                                  : "text-red-600"
                              } text-xl font-semibold font-cantarell`}
                            >
                              {Math.round(
                                (totalMatchWins / totalMatches) * 1000
                              ) / 10}
                              %
                            </div>
                            <div className="text-lightscale-1 text-xl ml-2 font-semibold font-cantarell">
                              Win Rate
                            </div>
                          </div>
                          <div className=" text-lightscale-7 text-sm font-cantarell font-semibold">
                            {" "}
                            <span className="text-green-500">
                              {totalMatchWins}
                            </span>{" "}
                            -
                            <span className="text-red-600">
                              {totalMatchLosses}
                            </span>{" "}
                            -
                            <span className="text-stone-600">
                              {totalMatchTies}
                            </span>
                          </div>
                        </div>
                        <div className="bg-warmscale-7 h-2 mt-3 rounded-sm drop-shadow-sm">
                          <div
                            className={`${
                              totalMatchWins > totalMatchLosses
                                ? "bg-green-600"
                                : "bg-red-600"
                            } h-2 rounded-sm`}
                            style={{
                              width: `${
                                (totalMatchWins / totalMatches) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div id="matches" className="bg-warmscale-8 mt-4 py-3 px-4 rounded-md font-cantarell drop-shadow-sm max-md:w-[90vw]">
                    <div className="flex justify-between">
                      <a
                        href={`/profile/${playerId}/matches`}
                        className="text-lg text-lightscale-1 font-semibold hover:underline"
                      >
                        Matches
                      </a>
                      <a
                        href={`/profile/${playerId}/matches`}
                        className="text-lg text-lightscale-1 font-semibold"
                      >
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

                    <div className="mt-3 ">
                      {matchesPlayedInfo.map((match: any, index: any) => {
                        while (index < 15) {
                          return (
                            <a
                              key={match.logid}
                              href={`/log/${match.logid}`}
                              className={`flex h-11 items-center  hover:bg-warmscale-85 cursor-pointer ${
                                index !== 14 && "border-b"
                              } justify-between border-warmscale-7`}
                            >
                              <div className="flex items-center my-1 w-full">
                                <img
                                  src={`../../../class icons/Leaderboard_class_${match.class}.png`}
                                  alt=""
                                  className="h-7 ml-3"
                                />
                                <div className="border-l border-warmscale-7 ml-3 py-1.5 h-full ">
                                  <div
                                    className={`${
                                      match.match_result === "W"
                                        ? "bg-green-600"
                                        : match.match_result === "L"
                                        ? "bg-red-600"
                                        : "bg-stone-500"
                                    } w-5 h-5 flex ml-3 items-center justify-center text-xs font-bold rounded-sm `}
                                  >
                                    {match.match_result}
                                  </div>
                                </div>
                                <div className="border-l  border-warmscale-7 ml-3 py-1 text-lightscale-1 font-cantarell h-full min-w-0 max-sm:w-[30vw] lg:w-80 truncate flex items-center">
                                  <div className="ml-2 ">
                                    {match.map.split("_")[1] !== undefined
                                      ? match.map
                                          .split("_")[1]
                                          .charAt(0)
                                          .toUpperCase() +
                                        match.map.split("_")[1].slice(1)
                                      : match.map}
                                  </div>
                                  <div className="ml-1 text-sm text-lightscale-6 truncate">
                                    (
                                    {match.title.includes("serveme")
                                      ? match.title.slice(23)
                                      : match.title}
                                    )
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center w-fit p">
                                <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7  max-md:scale-0 max-md:w-0 gap-7 flex ml-3 pl-3 h-full">
                                  <div className="w-[4.5rem] ">
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
                                <div className="border-l text-lightscale-1 font-cantarell font-semibold border-warmscale-7 ml-3 py-2 h-full max-sm:scale-0 max-sm:w-0">
                                  <div className="ml-3 text-xs text-lightscale-5">
                                    {match.format === "other"
                                      ? "OTH"
                                      : match.format.toUpperCase()}
                                  </div>
                                </div>
                                <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 w-24 sm:ml-3 pl-3 h-full pr-2">
                                  <div className="text-xs text-right text-lightscale-4">
                                    {Math.floor(match.match_length / 60)}:
                                    {match.match_length % 60 < 10
                                      ? "0" + (match.match_length % 60)
                                      : match.match_length % 60}
                                  </div>
                                  <div className="text-xs text-right">
                                    {Math.round(Date.now() / 1000) -
                                      match.date >
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
                </div>
                <div className="flex justify-center">
                  <div id="playedclasses" className="bg-warmscale-8 mt-4 rounded-md px-4 py-2 drop-shadow-sm xl:w-full max-xl:w-[90vw]">
                    <div className="flex justify-between">
                      <div className="text-lg text-lightscale-1 font-semibold ">
                        Most Played Classes
                      </div>
                    </div>
                    <div className=" font-cantarell ">
                      {perClassPlaytimeData.map(
                        (classPlayed: any, index: number) => {
                          const currentMax =
                            perClassPlaytimeData[0].time === null ? 1 : 0;
                          const topMatchesWithAnyClass =
                            parseInt(perClassPlaytimeData[currentMax].w) +
                            parseInt(perClassPlaytimeData[currentMax].t) +
                            parseInt(perClassPlaytimeData[currentMax].l);
                          if (
                            classPlayed.class !== null &&
                            index < 5 &&
                            classPlayed.time !== null
                          ) {
                            const totalGamesWithClass =
                              parseInt(classPlayed.w) +
                              parseInt(classPlayed.t) +
                              parseInt(classPlayed.l);
                            return (
                              <div
                                key={classPlayed.class}
                                className={`py-3 flex w-full justify-between items-center ${
                                  index <
                                    Math.min(
                                      perClassPlaytimeData.length - 1,
                                      4
                                    ) && "border-b"
                                } border-warmscale-7`}
                              >
                                <img
                                  src={`../../../class icons/Leaderboard_class_${classPlayed.class}.png`}
                                  alt=""
                                  className="h-10"
                                />
                                <div className="w-full md:flex justify-between">
                                  <div className="ml-4 flex items-center">
                                    <div className="text-right w-14 text-lightscale-1 font-semibold mb-0.5">
                                      {totalGamesWithClass}
                                    </div>
                                    <div className="ml-2 h-2 md:w-48 max-md:w-full bg-warmscale-5 rounded-sm ">
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
                                        (classPlayed.w / totalGamesWithClass) *
                                          1000
                                      ) / 10}
                                      %
                                    </div>
                                    <div className="ml-2 h-2 md:w-48 max-md:w-full bg-warmscale-5 rounded-sm">
                                      <div
                                        className={`h-2 ${
                                          Math.round(
                                            (classPlayed.w /
                                              totalGamesWithClass) *
                                              1000
                                          ) /
                                            10 >
                                          50
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
                                  <div className="text-right w-32 text-lightscale-1 font-semibold mb-0.5 max-md:scale-0 max-md:w-0 max-md:h-0">
                                    {(classPlayed.time / 3600).toFixed(1)}hrs
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center xl:ml-4">
                <div className="w-[25rem] max-xl:w-[90vw] max-xl:mt-4 h-full rounded-md drop-shadow-sm">
                  {playerCardData.length !== 0 && (
                    <div className="w-full py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
                      <div className="flex justify-between">
                        <div className="text-lg text-lightscale-1 mb-1 font-semibold">
                         { `Player Card | ${playerCardData.format}` }
                        </div>
                        { playerId === '76561198068070211' && ( 
                          <div className="group absolute z-50 border w-2 h-2 hover:w-96  hover:h-96 right-2 border-warmscale-8">
                            <img className="scale-0 group-hover:scale-90" src="/player cards/class-portraits/chocc1.png" alt="" />
                          </div> 
                          )}
                        {multiDiv && (
                          <div className="flex -mr-1 justify-center items-center mx-4 gap-2 text-lg font-cantarell font-semibold text-lightscale-8">
                            <div onClick={() => { setIsHighlander(true) }} className={` ${highlander ? ' text-tf-orange' : 'text-lg opacity-50 cursor-pointer hover:opacity-100'}  `} > HL </div>
                            <div onClick={() => { setIsHighlander(false) }} className={` ${!highlander ? ' text-tf-orange' : 'text-lg opacity-50 cursor-pointer hover:opacity-100'} `}> 6S </div>
                          </div>)
                        }
                      </div>
                      <div className="w-full justify-center flex h-[440px]">
                        <div className=" flex items-center justify-center min-w-[20rem] w-[20rem] px-3.5">
                          <animated.div
                            ref={cardRef}
                            style={{
                              transform,
                              background: "none", // Ensure the background is transparent
                              width: "100%", // Set desired width
                              height: "100%", // Set desired height
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                          >
                            {/* <div className="h-96 select-none flex justify-center items-center relative opacity-95">
                              <img
                                src="\player cards\background.png"
                                className="h-96 "
                                alt=""
                              />
                              <img
                                src={`/player cards/class-portraits/${playerCardData.class}.webp`}
                                className="h-[16rem] top-16 right-14 absolute"
                                alt=""
                              />
                              <img
                                src={`/player cards/borders/${playerCardData.division}.png`}
                                className="h-96 absolute"
                                alt=""
                              />
                              <img
                                src="\player cards\gradients.png"
                                className="h-96 absolute"
                                alt=""
                              />
                              <img
                                src={`/player cards/class-icons/${playerCardData.class}.png`}
                                className="h-5 absolute bottom-6"
                                alt=""
                              />
                              <img
                                src="\player cards\logo.png"
                                className="h-96 absolute"
                                alt=""
                              />
                              <div className="absolute text-[10px] left-[58px] top-[72px] text-white font-robotomono font-bold">
                                OVERALL
                              </div>
                              <div className="absolute text-4xl left-[58px] top-[82px] text-white font-robotomono font-bold">
                                {Math.round(
                                  (playerCardData.cbt +
                                    playerCardData.spt +
                                    playerCardData.srv +
                                    playerCardData.eff +
                                    playerCardData.imp +
                                    playerCardData.eva) /
                                    6
                                )}
                              </div>
                              <div className="absolute text-2xl left-[60px] top-[130px] rounded-full h-[1px] w-10 bg-white font-robotomono font-bold"></div>
                              <img
                                src={`/player cards/division-medals/${playerCardData.division}.png`}
                                className="absolute left-[52px] top-[134px] h-14"
                                alt=""
                              />
                              <div className="absolute text-3xl top-[200px] text-white font-roboto font-bold">
                                {rglInfo.name}
                              </div>
                              <div className="absolute text-2xl top-[236px] rounded-full h-[1px] w-48 bg-white font-bold"></div>
                              <div className="absolute text-2xl top-[244px] rounded-full h-20 w-[1px] bg-white font-bold"></div>
                              <div className="absolute text-2xl top-[330px] rounded-full h-[1px] w-16 bg-white font-bold"></div>
                              <div className="absolute text-2xl left-[90px] top-[240px] text-white font-robotomono font-bold">
                                CBT
                              </div>
                              <div className="absolute text-2xl left-[90px] top-[265px] text-white font-robotomono font-bold">
                                SPT
                              </div>
                              <div className="absolute text-2xl left-[90px] top-[290px] text-white font-robotomono font-bold">
                                SRV
                              </div>
                              <div className="absolute text-2xl left-[195px] top-[240px] text-white font-robotomono font-bold">
                                EFF
                              </div>
                              <div className="absolute text-2xl left-[195px] top-[265px] text-white font-robotomono font-bold">
                                DMG
                              </div>
                              <div className="absolute text-2xl left-[195px] top-[290px] text-white font-robotomono font-bold">
                                EVA
                              </div>
                              <div className="absolute text-2xl left-[55px] top-[240px] text-white font-robotomono font-extrabold">
                                {playerCardData.cbt}
                              </div>
                              <div className="absolute text-2xl left-[55px] top-[265px] text-white font-robotomono font-extrabold">
                                {playerCardData.spt}
                              </div>
                              <div className="absolute text-2xl left-[55px] top-[290px] text-white font-robotomono font-extrabold">
                                {playerCardData.srv}
                              </div>
                              <div className="absolute text-2xl left-[160px] top-[240px] text-white font-robotomono font-extrabold">
                                {playerCardData.eff}
                              </div>
                              <div className="absolute text-2xl left-[160px] top-[265px] text-white font-robotomono font-extrabold">
                                {playerCardData.imp}
                              </div>
                              <div className="absolute text-2xl left-[160px] top-[290px] text-white font-robotomono font-extrabold">
                                {playerCardData.eva}
                              </div>
                            </div> */}
                            <canvas className="-ml-1.5 mt-3" ref={canvasRef} width="550" height="750" style={{transform: `scale(${0.55})`,transformOrigin: 'top left'}}></canvas>
                          </animated.div>
                        </div>
                      </div>
                      <div className="text-xs flex justify-center text-warmscale-3 font-semibold mt-2">
                        <div className="">
                          <div>
                            CBT (Combat) ={" "}
                            {playerCardData.class !== "medic"
                              ? "KILLS"
                              : "ASSISTS"}
                          </div>
                          <div>
                            SPT (Support) ={" "}
                            {playerCardData.class !== "medic"
                              ? "ASSISTS"
                              : "UBERS"}
                          </div>
                          <div>
                            SRV (Survival) ={" "}
                            {playerCardData.class !== "medic"
                              ? "DEATHS"
                              : "DEATHS"}
                          </div>
                        </div>
                        <div className=" ml-7">
                          <div>
                            EFF (EFFICIENCY) ={" "}
                            {playerCardData.class !== "medic" ? "K/D" : "A/D"}
                          </div>
                          <div>
                            DMG (DAMAGE) ={" "}
                            {playerCardData.class !== "medic"
                              ? "DAMAGE"
                              : "HEALS"}
                          </div>
                          <div>
                            EVA (EVASION) ={" "}
                            {playerCardData.class !== "medic" ? "DTM" : "DTM"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div id="maps" className="w-full py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
                    <div className="flex justify-between">
                      <div className="text-lg text-lightscale-1 mb-1 font-semibold">
                        Maps
                      </div>
                    </div>
                    {mapDisparityData.map((currentMap: any, index: number) => {
                      const mapWins = parseInt(currentMap.w);
                      const mapLosses = parseInt(currentMap.l);
                      const mapTies = parseInt(currentMap.t);
                      const currentmapSum = mapWins + mapLosses + mapTies;
                      const dispalyCount =
                        showMoreMaps || playerCardData.length === 0 ? 7 : 1;
                      if (index < dispalyCount) {
                        if (currentMap.map !== null) {
                          return (
                            <div
                              key={currentMap}
                              className={`flex relative justify-between items-center font-cantarell text-lightscale-1 h-14 ${
                                showMoreMaps ||
                                (playerCardData.length === 0 &&
                                  index < 6 &&
                                  "border-b border-warmscale-7")
                              }`}
                            >
                              <div className="">
                                {currentMap.map.length > 0 && currentMap.map.split("_")[1] ?
                                  currentMap.map
                                    .split("_")[1]
                                    .charAt(0)
                                    .toUpperCase() +
                                    currentMap.map.split("_")[1].slice(1) : currentMap.map}{" "}
                                <span className="text-lightscale-6 text-sm">
                                  ({currentmapSum})
                                </span>{" "}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">
                                  {Math.round(
                                    (mapWins / currentmapSum) * 1000
                                  ) / 10}
                                  %
                                </div>
                                <div className="text-xs flex font-semibold text-lightscale-9">
                                  <div className="text-green-500 text-opacity-70">
                                    {mapWins}
                                  </div>
                                  -
                                  <div className="text-red-500 text-opacity-70">
                                    {mapLosses}
                                  </div>
                                  -
                                  <div className="text-stone-500 text-opacity-70">
                                    {mapTies}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      }
                    })}

                    <div className="flex justify-center">
                      {!showMoreMaps && playerCardData.length !== 0 && (
                        <svg
                          fill="none"
                          stroke="currentColor"
                          className="h-5 stroke-warmscale-2 hover:cursor-pointer"
                          onClick={() => setShowMoreMaps(true)}
                          strokeWidth={3.5}
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      )}
                      {showMoreMaps && playerCardData.length !== 0 && (
                        <svg
                          fill="none"
                          stroke="currentColor"
                          className="h-5 stroke-warmscale-2 hover:cursor-pointer"
                          onClick={() => setShowMoreMaps(false)}
                          strokeWidth={3.5}
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 15.75l7.5-7.5 7.5 7.5"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div id="formats" className="w-full flex items-center py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
                    <div className="w-full">
                      <div className="text-lg text-lightscale-1 flex justify-between mb-1 font-semibold">
                        <div>Formats</div>
                        <div className="flex gap-2 items-center text-xs text-lightscale-6">
                          <div>
                            {formatData[0] !== undefined && formatData[0].format.toUpperCase().slice(0, 3)}:{" "}
                            {formatData[0] !== undefined &&
                              Math.round(
                                ((parseInt(formatData[0].w) +
                                  parseInt(formatData[0].l) +
                                  parseInt(formatData[0].t)) /
                                  totalMatches) *
                                  1000
                              ) / 10}
                            %
                          </div>
                          <div>
                          {formatData[1] !== undefined && formatData[1].format.toUpperCase().slice(0, 3)}:{" "}
                            {formatData[1] !== undefined &&
                              Math.round(
                                ((parseInt(formatData[1].w) +
                                  parseInt(formatData[1].l) +
                                  parseInt(formatData[1].t)) /
                                  totalMatches) *
                                  1000
                              ) / 10}
                            %
                          </div>
                          <div>
                            {formatData[2] !== undefined && formatData[2].format.toUpperCase().slice(0, 3)}:{" "}
                            {formatData[2] !== undefined &&
                              Math.round(
                                ((parseInt(formatData[2].w) +
                                  parseInt(formatData[2].l) +
                                  parseInt(formatData[2].t)) /
                                  totalMatches) *
                                  1000
                              ) / 10}
                            %
                          </div>
                        </div>
                      </div>
                      <div>
                        {formatData.map((currentFormat: any) => {
                          const formatWins = parseInt(currentFormat.w);
                          const formatLosses = parseInt(currentFormat.l);
                          const formatTies = parseInt(currentFormat.t);
                          const currentFormatSum =
                            formatWins + formatLosses + formatTies;
                          if (currentFormat.format !== null) {
                            return (
                              <div
                                key={currentFormat.format}
                                className="flex text-right w-full items-center"
                              >
                                <div className="text-lightscale-2 w-10 mr-2 font-cantarell font-semibold text-sm">
                                  {currentFormat.format !== null &&
                                    (currentFormat.format === "other"
                                      ? "OTH"
                                      : currentFormat.format.toUpperCase())}
                                </div>
                                <div className="h-2 group bg-warmscale-7 rounded-sm w-full flex hover:h-6 my-2 hover:my-0 duration-75">
                                  <div
                                    className="bg-green-500 group-hover:bg-opacity-100 relative flex items-center justify-center h-full rounded-l-sm bg-opacity-70"
                                    style={{
                                      width: `${
                                        (formatWins / totalMatches) * 100
                                      }%`,
                                    }}
                                  >
                                    <div
                                      className={`scale-0 bg-warmscale-6 px-1.5 rounded-sm text-green-300 text-opacity-70 font-semibold text-sm py-0.5 ${
                                        formatWins !== 0 &&
                                        "group-hover:scale-100"
                                      }  bottom-8 absolute left-1/2 transform -translate-x-1/2`}
                                    >
                                      {formatWins}
                                      <div className="h-2 w-2 flex justify-center  items-center bg-warmscale-6 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                    </div>
                                  </div>
                                  <div
                                    className="bg-red-500 group-hover:bg-opacity-100 relative flex items-center justify-center h-full bg-opacity-70"
                                    style={{
                                      width: `${
                                        (formatLosses / totalMatches) * 100
                                      }%`,
                                    }}
                                  >
                                    <div
                                      className={`scale-0 bg-warmscale-6 px-1.5 rounded-sm text-red-300 text-opacity-70 font-semibold text-sm py-0.5 ${
                                        formatLosses !== 0 &&
                                        "group-hover:scale-100"
                                      }  bottom-8 absolute left-1/2 transform -translate-x-1/2`}
                                    >
                                      {formatLosses}
                                      <div className="h-2 w-2 flex justify-center  items-center bg-warmscale-6 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                    </div>
                                  </div>
                                  <div
                                    className="bg-stone-500 group-hover:bg-opacity-100 relative flex items-center justify-center h-full rounded-r-sm bg-opacity-70"
                                    style={{
                                      width: `${
                                        (formatTies / totalMatches) * 100
                                      }%`,
                                    }}
                                  >
                                    <div
                                      className={`scale-0 bg-warmscale-6 px-1.5 rounded-sm text-stone-300 text-opacity-70 font-semibold text-sm py-0.5 ${
                                        formatTies !== 0 &&
                                        "group-hover:scale-100"
                                      }  bottom-8 absolute left-1/2 transform -translate-x-1/2`}
                                    >
                                      {formatTies}
                                      <div className="h-2 w-2 flex justify-center  items-center bg-warmscale-6 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    id="activity"
                    className="max-md:w-[90vw] md:w-full bg-warmscale-8 py-2 px-3.5 rounded-md font-cantarell"
                  >
                    <div id="activity" className="text-lg text-lightscale-1 mb-1 font-semibold flex justify-between">
                      Activity
                      <a
                        href={`/calendar/${playerId}`}
                        className="text-lg text-lightscale-1 font-semibold"
                      >
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
                    <div className="flex my-2 justify-center ">
                      <div className=" max-sm:text-[9px] sm:text-xs font-semibold text-end text-lightscale-4 mr-1.5 ">
                        <div>MON</div>
                        <div className="max-sm:my-[2.5px] sm:my-1">TUE</div>
                        <div>WED</div>
                        <div className="max-sm:my-[2.5px] sm:my-1">THU</div>
                        <div>FRI</div>
                        <div className="max-sm:my-[2.5px] sm:my-1">SAT</div>
                        <div>SUN</div>
                      </div>
                      {currentListOfWeeks.map((currentWeek) => {
                        return (
                          <div
                            key={currentWeek}
                            className="flex-col flex-wrap "
                          >
                            {activity[currentWeek] !== undefined &&
                              daysOfTheWeek.map((day, index) => {
                                const today = Math.ceil(
                                  Date.now() / 1000 / 86400
                                );
                                if ((currentWeek - 1) * 7 + index < today + 3) {
                                  return (
                                    <div
                                      key={day}
                                      className="relative max-sm:h-3 max-sm:w-3 sm:h-4 sm:w-4 group rounded-sm bg-warmscale-4 mb-1 mr-1 text-lightscale-2"
                                    >
                                      <div className="absolute bg-lightscale-8 rounded-sm text-xs px-2 py-0.5 bottom-6 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-center w-40 z-40">
                                        {activity[currentWeek][day]} games on{" "}
                                        {new Date(
                                          ((currentWeek - 1) * 7 + index - 2) *
                                            86400 *
                                            1000
                                        ).toLocaleDateString()}
                                        <div className="h-2 w-2 flex justify-center items-center bg-lightscale-8 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                      </div>
                                      <div
                                        className={`bg-tf-orange max-sm:h-3 max-sm:w-3 sm:h-4 sm:w-4 rounded-sm`}
                                        style={{
                                          opacity: `${
                                            Math.round(
                                              activity[currentWeek][day] * 1.5
                                            ) + "0%"
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
                                  <div
                                    key={day}
                                    className={`${
                                      ((currentWeek - 1) * 7 + index) *
                                        86400 *
                                        1000 >
                                      Date.now() + 86400000
                                        ? "bg-warmscale-80"
                                        : "bg-warmscale-4 group"
                                    } relative max-sm:h-3 max-sm:w-3 sm:h-4 sm:w-4  rounded-sm mb-1 mr-1 text-lightscale-2`}
                                  >
                                    <div
                                      className={` absolute bg-warmscale-1 rounded-sm text-xs px-2 py-0.5 bottom-6 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 text-center w-36 z-40`}
                                    >
                                      0 games{" "}
                                      {new Date(
                                        ((currentWeek - 1) * 7 + index - 2) *
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
                  <div id="peers" className="w-full bg-warmscale-8 py-2 px-3.5 rounded-md mt-4 font-cantarell">
                    <div className="flex justify-between items-center gap-4 mb-2 ">
                      <div
                        onClick={(e) => {
                          setDisplayTeammates(!displayTeammates);
                        }}
                        className={`text-lg text-lightscale-1 font-semibold border-b-2 w-full text-center py-1 rounded-sm hover:cursor-pointer  hover:opacity-80 duration-200 ${
                          !displayTeammates
                            ? "bg-warmscale-85 bg-opacity-50 border-warmscale-7 text-warmscale-4"
                            : "border-tf-orange"
                        }`}
                      >
                        Teammates
                      </div>
                      <div
                        onClick={(e) => {
                          setDisplayTeammates(!displayTeammates);
                        }}
                        className={`text-lg text-lightscale-1 font-semibold border-b-2 w-full text-center py-1 rounded-sm hover:cursor-pointer  hover:opacity-80 duration-200 ${
                          displayTeammates
                            ? "bg-warmscale-85 bg-opacity-50 border-warmscale-7 text-warmscale-4"
                            : "border-tf-orange"
                        }`}
                      >
                        Enemies
                      </div>
                      <a
                        href={`/peers/${playerId}`}
                        className="text-lg text-lightscale-1 font-semibold "
                      >
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
                    <div>
                      {teamMatesList.map((teammate: any, index: number) => {
                        if (
                          index < 5 &&
                          teamMatesSteamInfo[teammate.peer_id64] !== undefined
                        ) {
                          let highestValue = displayTeammates
                            ? teamMatesList[0]
                            : enemiesList[0];
                          let displayedPlayer = displayTeammates
                            ? teammate
                            : enemiesList[index];
                          const teammateWins = parseInt(displayedPlayer.w);
                          return (
                            <div
                              key={displayedPlayer.peer_id64}
                              className={`flex py-2.5 items-center ${
                                index < 4 && "border-b"
                              } border-warmscale-7 ml-1 mr-1`}
                            >
                              <img
                                src={
                                  teamMatesSteamInfo[displayedPlayer.peer_id64]
                                    .avatarfull
                                }
                                className="h-8 rounded-md"
                                alt=""
                              />
                              <a
                                href={`/profile/${displayedPlayer.peer_id64}`}
                                className="flex-2 ml-2 text-lightscale-2 font-semibold text-lg w-32 truncate"
                              >
                                {
                                  teamMatesSteamInfo[displayedPlayer.peer_id64]
                                    .personaname
                                }
                              </a>
                              <div className="flex flex-1 items-center ml-4">
                                <div className="text-lightscale-1 font-semibold text-right text-xs w-8">
                                  {Math.round(
                                    (teammateWins / displayedPlayer.count) * 100
                                  )}
                                  %
                                </div>
                                <div className="w-full h-2 ml-1.5 rounded-sm bg-warmscale-5">
                                  <div
                                    className={`h-full ${
                                      parseInt(displayedPlayer.l) >
                                      parseInt(displayedPlayer.w)
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                    } rounded-sm`}
                                    style={{
                                      width: `${Math.round(
                                        (teammateWins / displayedPlayer.count) *
                                          100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex flex-1 items-center ml-5">
                                <div className="text-lightscale-1 font-semibold text-xs min-w-[20px] text-end">
                                  {displayedPlayer.count}
                                </div>
                                <div className="w-full h-2 ml-1.5 rounded-sm bg-warmscale-5">
                                  <div
                                    className={`h-full bg-tf-orange rounded-sm`}
                                    style={{
                                      width: `${Math.round(
                                        (displayedPlayer.count /
                                          highestValue.count) *
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
        <div className="mt-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Profile;
