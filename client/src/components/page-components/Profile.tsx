import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../shared-components/Navbar';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { useSpring } from 'react-spring';
import Footer from '../shared-components/Footer';
import PlayerCard from '../shared-components/PlayerCard';
import ProfileCardShowcase from '../shared-components/ProfileCardShowcase';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import MatchHistory from './MatchHistory';
import ClassStats from './ClassStats';
import FormatStats from './FormatStats';
import ActivityCalendar from './ActivityCalendar';

const Profile = () => {
  const id = window.location.href;
  const idArray = id.split('/');
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
  const [allPlayerCardData, setAllPlayerCardData] = useState<any>([]); // Store full response
  const [multiDiv, setMultiDiv] = useState<any>(true);
  const [highlander, setIsHighlander] = useState<boolean>(true);
  const [s3CardUrl, setS3CardUrl] = useState<string | null>(null);
  const [useS3Card, setUseS3Card] = useState<boolean>(false);
  const [cardHolo, setCardHolo] = useState<boolean>(false);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

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
    fetchAllProfileData();
    fetchInventoryCount();
    checkIfOwnProfile();
  }, []);

  async function fetchInventoryCount() {
    try {
      const response: any = await fetch(
        `/api/card-inventory/stats/${playerId}`,
        FetchResultTypes.JSON
      );
      if (response && response.stats) {
        setInventoryCount(parseInt(response.stats.total_cards) || 0);
      }
    } catch (error) {
      console.log('Failed to fetch inventory count:', error);
      setInventoryCount(0);
    }
  }

  async function checkIfOwnProfile() {
    try {
      // Use native fetch with credentials to ensure cookies are sent
      const response = await window.fetch('/api/me', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data && data.authenticated && data.user) {
        setIsOwnProfile(data.user.steamId === playerId);
      } else {
        setIsOwnProfile(false);
      }
    } catch (error) {
      console.log('Failed to check authentication:', error);
      setIsOwnProfile(false);
    }
  }

  useEffect(() => {
    // When highlander state changes, re-select the appropriate card from cached data
    if (allPlayerCardData && allPlayerCardData.length > 0) {
      handlePlayerCardData(allPlayerCardData);
    }
  }, [highlander]);

  useEffect(() => {
    if (playerCardData && playerCardData.seasonid) {
      fetchS3Card();
    }
  }, [playerCardData]);

  const canvasRef = useRef(null);
  const [images, setImages] = useState<any>({});

  // Load images only once or when playerCardData changes
  useEffect(() => {
    // Only load images if we have valid playerCardData and not using S3 card
    if (
      !playerCardData ||
      !playerCardData.class ||
      !playerCardData.division ||
      useS3Card
    ) {
      return;
    }

    const imageSources: any = {
      background: '/player cards/background-orange.png',
      classPortrait: `/player cards/class-portraits/${playerCardData.class}.png`,
      border: `/player cards/borders/${playerCardData.division}.png`,
      gradient: '/player cards/gradients.png',
      classIcon: `/player cards/class-icons/${playerCardData.class}.png`,
      logo: `/player cards/logo.png`,
      medal: `/player cards/division-medals/${playerCardData.division}.png`,
    };

    let loadedImages: any = 0;
    const tempImages: any = {};
    for (const src in imageSources) {
      tempImages[src] = new Image();
      tempImages[src].src = imageSources[src];
      tempImages[src].onload = () => {
        loadedImages++;
        if (loadedImages === Object.keys(imageSources).length) {
          setImages(tempImages);
        }
      };
    }
  }, [playerCardData, highlander, useS3Card]); // Depend on playerCardData to reload images when it changes

  useEffect(() => {
    if (Object.keys(images).length > 0 && !useS3Card && canvasRef.current) {
      drawCanvas();
    }
  }, [images, rglInfo, useS3Card]); // Redraw when images or rglInfo change, but not if using S3 card

  function drawCanvas() {
    const canvas: any = canvasRef.current;
    if (!canvas) {
      console.log('Canvas ref not available');
      return;
    }
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing

    // Draw the background
    ctx.drawImage(images.background, 0, 0);

    // Draw other images
    ctx.drawImage(images.border, 0, 0);
    ctx.drawImage(images.classPortrait, 0, 0);
    ctx.drawImage(images.gradient, 0, 0);
    ctx.drawImage(
      images.classIcon,
      canvas.width / 2 - 20,
      canvas.height - 90,
      40,
      40
    );
    ctx.drawImage(images.logo, 0, 0);
    ctx.drawImage(
      images.medal,
      90,
      250,
      images.medal.width * 0.6,
      images.medal.height * 0.6
    );

    // Reset scale for text
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transform matrix
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.font = "bold 60px 'Roboto'";
    ctx.fillText(rglInfo.name, canvas.width / 2, 440);

    ctx.font = "bold 46px 'Roboto Mono'";
    ctx.fillText('CBT', 206, 512);
    ctx.fillText('SPT', 206, 562);
    ctx.fillText('SRV', 206, 612);
    ctx.fillText('EFF', 406, 512);
    ctx.fillText('DMG', 406, 562);
    ctx.fillText('EVA', 406, 612);

    ctx.fillText(playerCardData.cbt, 130, 512);
    ctx.fillText(playerCardData.spt, 130, 562);
    ctx.fillText(playerCardData.srv, 130, 612);
    ctx.fillText(playerCardData.eff, 330, 512);
    ctx.fillText(playerCardData.imp, 330, 562);
    ctx.fillText(playerCardData.eva, 330, 612);

    ctx.font = "bold 20px 'Roboto Mono'";
    ctx.fillText('OVERALL', 144, 150);

    ctx.font = "bold 13px 'Roboto Mono'";
    ctx.fillText(
      `${playerCardData.format === 'HL' ? 'HIGHLANDER' : 'SIXES'}`,
      144,
      165
    );

    ctx.font = "bold 68px 'Roboto Mono'";
    ctx.fillText(
      Math.round(
        (playerCardData.cbt * 2 +
          playerCardData.spt +
          playerCardData.srv +
          playerCardData.eff * 0.5 +
          playerCardData.imp * 2 +
          playerCardData.eva * 0.5) /
          7
      ),
      144,
      225
    );

    ctx.beginPath();
    ctx.moveTo(80, 456);
    ctx.lineTo(470, 456);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 466);
    ctx.lineTo(canvas.width / 2, 630);
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

  async function fetchAllProfileData() {
    try {
      const response: any = await fetch(
        `/api/profile-data/${playerId}`,
        FetchResultTypes.JSON
      );

      // Set all state from the consolidated response
      if (response.playerSteamInfo) {
        setPlayerSteamInfo(response.playerSteamInfo);
      } else {
        const fallbackInfo = {
          personaname: 'Steam Error',
          avatarfull: 'Steam Error',
        };
        setPlayerSteamInfo(fallbackInfo);
      }

      setMatchesPlayedInfo(response.matchHistory || []);
      setRglInfo(response.rglInfo || {});
      setTeamMatesList(response.peers || []);
      setEnemiesList(response.enemies || []);
      setTeamMatesSteamInfo(response.teamMatesSteamInfo || {});
      setPerClassPlaytimeData(response.perClassStats || []);
      setFormatData(response.perFormatStats || []);
      setMapDisparityData(response.perMapStats || []);

      // Process activity data
      if (response.activity) {
        activityMaker(response.activity);
      }

      // Handle player card data
      if (response.playerCard && response.playerCard.length > 0) {
        setAllPlayerCardData(response.playerCard); // Store full response
        handlePlayerCardData(response.playerCard);
      } else {
        // No player card data available
        setAllPlayerCardData([]);
        setPlayerCardData([]);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      // Set fallback values for critical UI elements
      setPlayerSteamInfo({
        personaname: 'Error Loading Profile',
        avatarfull: '',
      });
    }
  }

  function handlePlayerCardData(cardData: any) {
    if (cardData.length === 2) {
      setMultiDiv(true);
      if (highlander) {
        if (cardData[0].format === 'HL') setPlayerCardData(cardData[0]);
        else setPlayerCardData(cardData[1]);
      } else {
        if (cardData[0].format === 'HL') setPlayerCardData(cardData[1]);
        else setPlayerCardData(cardData[0]);
      }
    } else if (cardData.length === 1) {
      setMultiDiv(false);
      setPlayerCardData(cardData[0]);
    }
  }

  // No longer needed - player card data is fetched in fetchAllProfileData
  // and re-selected when switching formats using the useEffect hook

  async function fetchS3Card() {
    try {
      const seasonId = playerCardData.seasonid;
      if (!seasonId) {
        setUseS3Card(false);
        return;
      }

      const response: any = await fetch(
        `/api/profile-s3-card/${playerId}/${seasonId}`,
        FetchResultTypes.JSON
      );

      if (response && response.exists && response.cardUrl) {
        setS3CardUrl(response.cardUrl);
        setUseS3Card(true);
        setCardHolo(response.holo || false);
      } else {
        setS3CardUrl(null);
        setUseS3Card(false);
        setCardHolo(false);
      }
    } catch (error) {
      console.log('S3 card not available, using canvas rendering', error);
      setS3CardUrl(null);
      setUseS3Card(false);
      setCardHolo(false);
    }
  }

  // These functions are no longer needed as data is fetched in fetchAllProfileData
  // Keeping them commented out for reference during migration
  /*
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
  */

  let totalMatchLosses: any = 0;
  let totalMatchWins: any = 0;
  let totalMatchTies: any = 0;
  let totalMatches: any = 0;

  [0, 1, 2, 3].forEach((i) => {
    totalMatchLosses += formatData[i]?.format_losses || 0;
    totalMatchWins += formatData[i]?.format_wins || 0;
    totalMatchTies += formatData[i]?.format_ties || 0;
  });

  totalMatches = totalMatchLosses + totalMatchWins + totalMatchTies;
  // These functions are also no longer needed
  /*
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

    setMapDisparityData(response.rows);
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
  */

  const currentWeekIndex = Math.floor(Date.now() / 1000 / 604800);
  const daysOfTheWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const currentListOfWeeks = [];
  for (let index = 0; index < 17; index++) {
    currentListOfWeeks.push(currentWeekIndex - 15 + index);
  }

  function activityMaker(inputArray: any) {
    const activityObject: any = {};

    const dayOfTheWeekFinder: any = {
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
      0: 'sunday',
      1: 'monday',
    };
    inputArray.map((match: any) => {
      const weekIndex = Math.ceil((match.date + 86400 * 2) / 604800);
      const dayIndex = Math.ceil((match.date + 86400 * 2) / 86400) % 7;

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
    <>
      <Navbar />
      {/* Header Section - Full Width Background */}
      <div className="pt-16 bg-warmscale-7">
        <ProfileHeader
          playerSteamInfo={playerSteamInfo}
          rglInfo={rglInfo}
          playerId={playerId}
          inventoryCount={inventoryCount}
          isOwnProfile={isOwnProfile}
        />

        {/* Main Content Section */}
        <div className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 py-6">
          <div className="w-full xl:flex xl:gap-4">
            <div id="summary" className="xl:w-2/3 w-full">
              {/* Card Showcase Section */}
              <div className="flex justify-center">
                <div className="w-full">
                  <ProfileCardShowcase steamid={playerId} />
                </div>
              </div>

              <ProfileStats
                totalMatches={totalMatches}
                totalMatchWins={totalMatchWins}
                totalMatchLosses={totalMatchLosses}
                totalMatchTies={totalMatchTies}
              />
              <MatchHistory
                matchesPlayedInfo={matchesPlayedInfo}
                playerId={playerId}
              />
              <ClassStats perClassPlaytimeData={perClassPlaytimeData} />
            </div>
            <div className="xl:w-1/3 w-full max-xl:mt-4">
              <div className="w-full">
                {playerCardData.length !== 0 && (
                  <div className="w-full py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell">
                    <div className="flex justify-between">
                      <div className="text-lg text-lightscale-1 mb-1 font-semibold">
                        {`Player Card | ${playerCardData.format}`}
                      </div>
                      {playerId === '76561198068070211' && (
                        <div className="group absolute z-50 border w-2 h-2 hover:w-96  hover:h-96 right-2 border-warmscale-8">
                          <img
                            className="scale-0 group-hover:scale-90"
                            src="/player cards/class-portraits/chocc1.png"
                            alt=""
                          />
                        </div>
                      )}
                      {multiDiv && (
                        <div className="flex -mr-1 justify-center items-center mx-4 gap-2 text-lg font-cantarell font-semibold text-lightscale-8">
                          <div
                            onClick={() => {
                              setIsHighlander(true);
                            }}
                            className={` ${highlander ? ' text-tf-orange' : 'text-lg opacity-50 cursor-pointer hover:opacity-100'}  `}
                          >
                            {' '}
                            HL{' '}
                          </div>
                          <div
                            onClick={() => {
                              setIsHighlander(false);
                            }}
                            className={` ${!highlander ? ' text-tf-orange' : 'text-lg opacity-50 cursor-pointer hover:opacity-100'} `}
                          >
                            {' '}
                            6S{' '}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-full justify-center flex h-[440px]">
                      <div className=" flex items-center justify-center min-w-[20rem] w-[20rem] px-3.5">
                        <PlayerCard
                          cardUrl={
                            useS3Card ? s3CardUrl || undefined : undefined
                          }
                          holo={cardHolo}
                          useCanvas={!useS3Card}
                          canvasRef={!useS3Card ? canvasRef : undefined}
                          enable3DTilt={true}
                          imageClassName={useS3Card ? '' : '-ml-1.5 mt-3'}
                          onError={() => {
                            console.log(
                              'Failed to load S3 card, falling back to canvas'
                            );
                            setUseS3Card(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-xs flex justify-center text-warmscale-3 font-semibold mt-2">
                      <div className="">
                        <div>
                          CBT (Combat) ={' '}
                          {playerCardData.class !== 'medic'
                            ? 'KILLS'
                            : 'ASSISTS'}
                        </div>
                        <div>
                          SPT (Support) ={' '}
                          {playerCardData.class !== 'medic'
                            ? 'ASSISTS'
                            : 'UBERS'}
                        </div>
                        <div>
                          SRV (Survival) ={' '}
                          {playerCardData.class !== 'medic'
                            ? 'DEATHS'
                            : 'DEATHS'}
                        </div>
                      </div>
                      <div className=" ml-7">
                        <div>
                          EFF (EFFICIENCY) ={' '}
                          {playerCardData.class !== 'medic' ? 'K/D' : 'A/D'}
                        </div>
                        <div>
                          DMG (DAMAGE) ={' '}
                          {playerCardData.class !== 'medic'
                            ? 'DAMAGE'
                            : 'HEALS'}
                        </div>
                        <div>
                          EVA (EVASION) ={' '}
                          {playerCardData.class !== 'medic' ? 'DTM' : 'DTM'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  id="maps"
                  className="w-full py-2 bg-warmscale-8 px-3.5 rounded-md mb-4 font-cantarell"
                >
                  <div className="flex justify-between">
                    <div className="text-lg text-lightscale-1 mb-1 font-semibold">
                      Maps
                    </div>
                  </div>
                  {mapDisparityData.map((currentMap: any, index: number) => {
                    const mapWins = currentMap.wins;
                    const mapLosses = currentMap.losses;
                    const mapTies = currentMap.ties;
                    const currentmapSum = currentMap.map_count;
                    const dispalyCount =
                      showMoreMaps || playerCardData.length === 0 ? 7 : 1;
                    if (index < dispalyCount) {
                      if (currentMap.map_name !== null) {
                        return (
                          <div
                            key={currentMap.map_name}
                            className={`flex relative justify-between items-center font-cantarell text-lightscale-1 h-14 ${
                              showMoreMaps ||
                              (playerCardData.length === 0 &&
                                index < 6 &&
                                'border-b border-warmscale-7')
                            }`}
                          >
                            <div className="">
                              {currentMap.map_name.length > 0 &&
                                currentMap.map_name.charAt(0).toUpperCase() +
                                  currentMap.map_name.slice(1)}{' '}
                              <span className="text-lightscale-6 text-sm">
                                ({currentmapSum})
                              </span>{' '}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {Math.round((mapWins / currentmapSum) * 1000) /
                                  10}
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
                <FormatStats
                  formatData={formatData}
                  totalMatches={totalMatches}
                />
                <ActivityCalendar activity={activity} playerId={playerId} />
                <div
                  id="peers"
                  className="w-full bg-warmscale-8 py-2 px-3.5 rounded-md mt-4 font-cantarell"
                >
                  <div className="flex justify-between items-center gap-4 mb-2 ">
                    <div
                      onClick={(e) => {
                        setDisplayTeammates(!displayTeammates);
                      }}
                      className={`text-lg text-lightscale-1 font-semibold border-b-2 w-full text-center py-1 rounded-sm hover:cursor-pointer  hover:opacity-80 duration-200 ${
                        !displayTeammates
                          ? 'bg-warmscale-85 bg-opacity-50 border-warmscale-7 text-warmscale-4'
                          : 'border-tf-orange'
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
                          ? 'bg-warmscale-85 bg-opacity-50 border-warmscale-7 text-warmscale-4'
                          : 'border-tf-orange'
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
                        const highestValue = displayTeammates
                          ? teamMatesList[0]
                          : enemiesList[0];
                        const displayedPlayer = displayTeammates
                          ? teammate
                          : enemiesList[index];
                        const teammateWins = parseInt(displayedPlayer.w);
                        return (
                          <div
                            key={displayedPlayer.peer_id64}
                            className={`flex py-2.5 items-center ${
                              index < 4 && 'border-b'
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
                                      ? 'bg-red-500'
                                      : 'bg-green-500'
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
      <Footer />
    </>
  );
};

export default Profile;
