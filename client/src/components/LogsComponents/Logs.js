import React, { useState, useEffect } from 'react'
import { AmmoPickup, Amount, Arrow, Assists, BlueScore, BuildingCount, BuildingsDestroyed, Chat, Class, ClassAgainst, ClassicLogs, ClassIcon, ClassIconBlue, ClassIconsWrapper, ClassImage, ClassTitle, Damage, DamageBar, DamageRecievedBar, DamageVersus, DamageVersusHeader, Deaths, DemosLink, Dominations, DPM, Duration, FunFacts, HealedClass, HealedName, HealedPlayer, Healer, HealerHeader, HealerStats, HealerStatTitle, HealSpread, HealStat, Individuals, InfoButtons, InfoSection, KDA, Killer, KillImage, KillMap, Kills, KillsPerPlayer, KillsPerPlayerWrapper, Label, LeftSideInfo, LogNumber, LogsLink, LogsPageWrapper, LogsSectionWrapper, Map, MapPlayed, MatchDate, MatchHeader, MatchLinks, MatchScore, MatchTitle, Medics, MedicsWrapper, MoreLogs, Name, NameInfoTitle, PerPlayerCard, PerPlayerClass, PerPlayerStat, PerRoundStats, PlayerCard, PlayerLogTitle, PlayersExtinguished, PlayerStatsWrapper, PlayerUsername, PlayerVsStats, RedScore, RightSideInfo, Score, SectionTitle, SmallButton, SmallIcon, SmallPlayerCard, Smalls, SmallStats, StatNumber, StatsWrapper, StatTitle, SvgArrow, Team, TeamIcons, TeamName, TeamSection, TeamStat, TeamStatRow, TeamStatsWrapper, TeamTotalStats, UsernameTitle, Victim, VsStat } from './LogsStyles';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

const Logs = () => {
  const id = window.location.href;
  const idArray = id.split('/');
  const logInfo = idArray[4];

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const [apiResponse, setApiResponse] = useState({});
  const [playersResponse, setPlayersResponse] = useState({});
  const [playerIconResponse, setPlayerIconResponse] = useState({});
  const [focusedPlayer, setFocusedPlayer] = useState("");
  const [damageStats, setDamageStats] = useState([]);
  const [damageRecieved, setDamageRecieved] = useState({});
  const [sort, setSort] = useState("");
  const [killSpreadArray, setKillSpreadArray] = useState();
  const [killSpreadSort, setKillSpreadSort] = useState("kills");
  const [playerStatsSort, setPlayerStatSort] = useState("dealt");

  let roundCount = 1;
  let currentRow = 0;

  useEffect(() => {
    if (playersResponse.length !== undefined) {
      sortByRow("team");
      changeDamageVs(Object.entries(apiResponse.players)[0][0]);
      sortKillSpread("kills");
    }
  }, [apiResponse]);

  useEffect(() => {

  }, [killSpreadArray])


  useEffect(() => {
    apiCall()
  }, [])

  async function apiCall() {
    console.log("apicall");
    let response = await fetch(`http://more.tf/logsplus/${logInfo}`, FetchResultTypes.JSON);
    setApiResponse(response);
    setPlayersResponse(Object.entries(response.players));
    setPlayerIconResponse(Object.entries(response.players));
  }

  function changeDamageVs(playerId) {
    setFocusedPlayer(playerId);

    playerIconResponse.map((player) => {
      if(apiResponse.players[playerId].damage_towards[player[0]] === undefined && apiResponse.players[playerId].team !==  apiResponse.players[player[0]].team) apiResponse.players[playerId].damage_towards[player[0]] = 0;
      if(apiResponse.players[playerId].damage_from[player[0]] === undefined && apiResponse.players[playerId].team !==  apiResponse.players[player[0]].team) apiResponse.players[playerId].damage_from[player[0]] = 0;
    })

    const sortedDamage = Object.entries(apiResponse.players[playerId].damage_towards)
      .sort(([, b], [, a]) => a - b)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    setDamageStats(Object.entries(sortedDamage));
    setDamageRecieved(Object.entries(apiResponse.players[playerId].damage_from)
      .sort(([, b], [, a]) => a - b)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {}));
  }

  function sortKillSpread(row) {
    setKillSpreadSort(row);
    let sortedArray = [];
    let currentResponse = apiResponse;
    let SpreadArray = Object.entries(apiResponse.killSpread);
    if (row === "kills") {
      for (let index = 0; index < Object.entries(apiResponse.killSpread).length; index++) {
        let indexFound = 0;
        let max = -1;
        for (let innerIndex = 0; innerIndex < SpreadArray.length; innerIndex++) {

          if (parseInt(currentResponse.players[SpreadArray[innerIndex][0]].kills) > max) {
            max = parseInt(apiResponse.players[SpreadArray[innerIndex][0]].kills);
            indexFound = innerIndex;
          }
        }
        sortedArray.push(SpreadArray[indexFound])
        SpreadArray.splice(indexFound, 1);
      };
      setKillSpreadArray(sortedArray);
    } else {
      for (let index = 0; index < Object.entries(apiResponse.killSpread).length; index++) {
        let indexFound = 0;
        let max = -9999999999999;
        for (let innerIndex = 0; innerIndex < SpreadArray.length; innerIndex++) {
          if (SpreadArray[innerIndex][1][row] !== undefined && parseInt(SpreadArray[innerIndex][1][row]) > max) {
            max = parseInt(SpreadArray[innerIndex][1][row]);
            indexFound = innerIndex;

          }
        }
        sortedArray.push(SpreadArray[indexFound])
        SpreadArray.splice(indexFound, 1);
      };
      setKillSpreadArray(sortedArray);
    }
  }

  function sortByRow(row) {
    setSort(row);
    var array = [];
    let arrayLength = playersResponse.length;

    if (row === "team" && sort !== row) {
      playersResponse.map((player) => {
        player[1][row] === "Blue" ? array.unshift(player) : array.push(player);
      })
      setPlayersResponse(array);

    } else if (sort !== row) {
      for (let outputIndex = 0; outputIndex < arrayLength; outputIndex++) {
        let max = 0;
        let currentIndex = 0;
        for (let playerIndex = 0; playerIndex < playersResponse.length; playerIndex++) {
          if (playersResponse[playerIndex][1][row] >= max) {
            max = playersResponse[playerIndex][1][row];
            currentIndex = playerIndex;
          }
        }
        array[outputIndex] = playersResponse[currentIndex];
        playersResponse.splice(currentIndex, 1)
      }
      setPlayersResponse(array);
    }
  }
  if (apiResponse.matchInfo !== undefined) {
    return (
      <LogsPageWrapper>
        <LogsSectionWrapper>
          <MatchHeader>
            <LeftSideInfo>
              <MatchTitle>{apiResponse.matchInfo.title}</MatchTitle>
              <MapPlayed>{apiResponse.matchInfo.map}</MapPlayed>
              <Duration>{`${Math.ceil(apiResponse.matchInfo.totalLength / 60)} : ${(apiResponse.matchInfo.totalLength % 60).toString().padStart(2, '0')}`}</Duration>
              <Duration >{apiResponse.matchInfo.pause > 0 ? `Pause ${Math.floor(apiResponse.matchInfo.pause / 60)} : ${(apiResponse.matchInfo.pause % 60).toString().padStart(2, '0')}` : ''}</Duration>
            </LeftSideInfo>
            <MatchScore>
              <BlueScore>
                <TeamName>BLU</TeamName>
                <Score>{apiResponse.teams.Blue.score}</Score>
              </BlueScore>
              <RedScore>
                <TeamName>RED</TeamName>
                <Score>{apiResponse.teams.Red.score}</Score>
              </RedScore>
            </MatchScore>
            <RightSideInfo>
              <LogNumber>{"#" + logInfo}</LogNumber>
              <MatchDate>{`${(new Date(apiResponse.matchInfo.date * 1000)).toLocaleDateString("en-US", options) + " " + (new Date(apiResponse.matchInfo.date * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</MatchDate>
              <MatchLinks>
                <LogsLink href={`https://logs.tf/${logInfo}`} target="_blank"> logs.tf </LogsLink>
                <DemosLink href={`https://demos.tf/${apiResponse.matchInfo.demosID}`} target="_blank"> demos.tf </DemosLink>
              </MatchLinks>
              <Duration style={{ fontSize: "16px", fontWeight: 400 }}>{`${apiResponse.matchInfo.combined === true ? "This is a combined log" : ""}`}</Duration>

            </RightSideInfo>
          </MatchHeader>
          <ClassicLogs>
            <PlayerLogTitle>
              <ClassTitle style={sort === "team" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("team") }} >Team</ClassTitle>
              <NameInfoTitle>
                <UsernameTitle>Username</UsernameTitle>
              </NameInfoTitle>
              <StatTitle tooltip="class" >C</StatTitle>
              <StatTitle tooltip="kills" style={sort === "kills" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("kills") }}>K</StatTitle>
              <StatTitle tooltip="assists" style={sort === "assists" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("assists") }}>A</StatTitle>
              <StatTitle tooltip="deaths" style={sort === "deaths" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("deaths") }}>D</StatTitle>
              <StatTitle tooltip="damage" style={sort === "damage" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("damage") }}>DMG</StatTitle>
              <StatTitle tooltip="damage/minute" style={sort === "DamagePM" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("DamagePM") }}>DPM</StatTitle>
              <StatTitle tooltip="kills and assist/death" style={sort === "kapd" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("kapd") }}>KA/D</StatTitle>
              <StatTitle tooltip="kills/death" style={sort === "kpd" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("kpd") }}>K/D</StatTitle>
              <StatTitle tooltip="damage taken" style={sort === "damageTaken" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("damageTaken") }}>DT</StatTitle>
              <StatTitle tooltip="damage taken/minute" style={sort === "damageTaken" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("damageTaken") }}>DT/M</StatTitle>
              <StatTitle tooltip="healtkit pickup" style={sort === "medkits" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("medkits") }}>HP</StatTitle>
              <StatTitle tooltip="backstabs" style={sort === "backstabs" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("backstabs") }}>BS</StatTitle>
              <StatTitle tooltip="headshots" style={sort === "headshots_hit" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("headshots_hit") }}>HS</StatTitle>
              <StatTitle tooltip="airshots" style={sort === "airShot" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("airShot") }}>AS</StatTitle>
              <StatTitle tooltip="points capped" style={sort === "pointCaps" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("pointCaps") }}>CP</StatTitle>
              <StatTitle tooltip="ammokits picked up" style={sort === "ammopickup" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("ammopickup") }}>AP</StatTitle>
              <StatTitle tooltip="extinguished" style={sort === "extinguished" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("extinguished") }}>E</StatTitle>
              <StatTitle tooltip="objects built" style={sort === "objectbuilds" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("objectbuilds") }}>OB</StatTitle>
              <StatTitle tooltip="objects killed" style={sort === "objectkills" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("objectkills") }}>OK</StatTitle>
              <StatTitle tooltip="dominations" style={sort === "domination" ? { textDecoration: "underline" } : {}} onClick={() => { sortByRow("domination") }}>D</StatTitle>
            </PlayerLogTitle>
            {playersResponse.map((player) => {
              return (
                <PlayerCard style={player[1].team === "Red" ? { background: "#a33333", borderBottom: "3px solid #8a2b2b" } : { background: "#4b6473", borderBottom: "3px solid #3a4e59" }}>
                  <Team style={player[1].team === "Red" ? { background: "#a33333" } : { background: "#4b6473" }}>{player[1].team}</Team>
                  <PlayerUsername onClick={() => { changeDamageVs(player[0]) }}>{player[1].userName}</PlayerUsername>
                  <Class src={player[1].classIconURL}></Class>
                  <Kills>{player[1].kills}</Kills>
                  <Assists>{player[1].assists}</Assists>
                  <Deaths >{player[1].deaths}</Deaths>
                  <Damage>{player[1].damage}</Damage>
                  <DPM>{player[1].DamagePM}</DPM>
                  <KDA>{player[1].kapd}</KDA>
                  <KDA>{player[1].kpd}</KDA>
                  <KDA>{player[1].damageTaken}</KDA>
                  <KDA>{Math.ceil(player[1].damageTaken / (apiResponse.matchInfo.totalLength / 60))}</KDA>
                  <KDA>{player[1].medkits}</KDA>
                  <KDA>{player[1].backstabs}</KDA>
                  <KDA>{player[1].headshots_hit}</KDA>
                  <KDA>{player[1].airShot}</KDA>
                  <KDA>{player[1].pointCaps}</KDA>
                  <KDA>{player[1].ammopickup}</KDA>
                  <KDA>{player[1].extinguished}</KDA>
                  <KDA>{player[1].objectbuilds}</KDA>
                  <KDA>{player[1].objectkills}</KDA>
                  <KDA>{player[1].domination}</KDA>
                </PlayerCard>
              );
            })}
          </ClassicLogs>
          <MoreLogs>
            <Individuals>
              <ClassIconsWrapper>
                <TeamIcons>
                {playerIconResponse.map((player) => {
                  if(player[1].team === "Blue"){
                    return( 
                    <ClassIconBlue style={focusedPlayer === player[0] ? { border: "3px solid #fff" } : {}} onClick={() => { changeDamageVs(player[0]) }} src={player[1].classIconURL}></ClassIconBlue>
                    )
                  }
                })}
                </TeamIcons>
                <TeamIcons>
                {playerIconResponse.map((player) => {
                  if(player[1].team === "Red"){
                    return( 
                    <ClassIcon tooltip="hey" style={focusedPlayer === player[0] ? { border: "3px solid #fff" } : {}} onClick={() => { changeDamageVs(player[0]) }} src={player[1].classIconURL}></ClassIcon>
                    )
                  }
                })}
                </TeamIcons>
              </ClassIconsWrapper>
              <DamageVersus>
                <DamageVersusHeader style={{
                  background: `${apiResponse.players[focusedPlayer] === undefined ?
                    apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Blue" ? "#BD3B3B" : "#5B7A8C" :
                    apiResponse.players[focusedPlayer].team === "Blue" ? "#5B7A8C" : "#BD3B3B"}`,
                  "borderBottom": `${apiResponse.players[focusedPlayer] === undefined ?
                    apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Blue" ? "4px solid #9D312F" : "4px solid #395C79" :
                    apiResponse.players[focusedPlayer].team === "Blue" ? "4px solid #395C79" : "4px solid #9D312F"}`
                }}>{apiResponse.players[focusedPlayer] === undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].userName : apiResponse.players[focusedPlayer].userName}</DamageVersusHeader>
                <PlayerStatsWrapper>
                  <ClassImage src={apiResponse.players[focusedPlayer] === undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].classImageURL : apiResponse.players[focusedPlayer].classImageURL}></ClassImage>
                  <PlayerVsStats>
                    <InfoSection>
                      <InfoButtons>
                        <SmallButton target="_blank" href={`https://steamcommunity.com/profiles/${apiResponse.players[focusedPlayer] === undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64 : apiResponse.players[focusedPlayer].steamID64}`} >STEAM</SmallButton>
                        <SmallButton target="_blank" href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${apiResponse.players[focusedPlayer] === undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64 : apiResponse.players[focusedPlayer].steamID64}`} > RGL</SmallButton>
                        <SmallButton target="_blank" href={`https://etf2l.org/search/${apiResponse.players[focusedPlayer] === undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64 : apiResponse.players[focusedPlayer].steamID64}`} >ETF2L</SmallButton>
                        <SmallButton target="_blank" href={`https://www.ugcleague.com/players_page.cfm?player_id=${apiResponse.players[focusedPlayer] === undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64 : apiResponse.players[focusedPlayer].steamID64}`} >UGC</SmallButton>
                      </InfoButtons>
                    </InfoSection>
                    <SectionTitle>
                      <Label onClick={() => { setPlayerStatSort("recieved") }} style={playerStatsSort === "recieved" ? { textDecoration: "underline", fontWeight: 300, justifyContent: "right", cursor: "pointer" } : { fontWeight: 300, justifyContent: "right", cursor: "pointer" }}>Damage Recieved</Label>
                      <Label style={{ fontWeight: 300, justifyContent: "center" }}>C</Label>
                      <Label onClick={() => { setPlayerStatSort("dealt") }} style={playerStatsSort === "recieved" ? { fontWeight: 300, justifyContent: "left", cursor: "pointer" } : { textDecoration: "underline", fontWeight: 300, justifyContent: "left", cursor: "pointer" }}>Damage Dealt</Label>
                    </SectionTitle>
                    <StatsWrapper>
                      {playerStatsSort === "dealt" && damageStats.map((player) => {
                        const widthIndex = (Object.entries(damageRecieved)[0][1] > damageStats[0][1] ? Object.entries(damageRecieved)[0][1] : damageStats[0][1]) / 210
                        return (
                          <VsStat>
                            <DamageRecievedBar style={{
                              width: (damageRecieved[player[0]] === undefined ? 0 : damageRecieved[player[0]] / widthIndex),
                              background: `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Blue" ? "#BD3B3B" : "#5B7A8C" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "#5B7A8C" : "#BD3B3B"}`,
                              "borderBottom": `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Blue" ? "4px solid #9D312F" : "4px solid #395C79" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "4px solid #395C79" : "4px solid #9D312F"}`,
                              padding: `${damageRecieved[player[0]] < 200 ? "4px 0px 4px 0px" : "4px 8px 4px 8px"}`,
                            }}>{damageRecieved[player[0]] === undefined ? 0 : damageRecieved[player[0]]}</DamageRecievedBar>
                            <ClassAgainst src={apiResponse.players[player[0]].classIconURL} />
                            <DamageBar style={{
                              width: (player[1] / widthIndex),
                              background: `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Red" ? "#BD3B3B" : "#5B7A8C" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "#BD3B3B" : "#5B7A8C"}`,
                              "borderBottom": `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Red" ? "4px solid #9D312F" : "4px solid #395C79" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "4px solid #9D312F" : "4px solid #395C79"}`,
                              padding: `${player[1] < 200 ? "4px 0px 4px 4px" : "4px 8px 4px 8px"}`
                            }}>{player[1]}</DamageBar>
                          </VsStat>
                        );
                      })}
                      {playerStatsSort === "recieved" && Object.entries(damageRecieved).map((player) => {
                        const widthIndex = (Object.entries(damageRecieved)[0][1] > damageStats[0][1] ? Object.entries(damageRecieved)[0][1] : damageStats[0][1]) / 210
                        return (
                          <VsStat>
                            <DamageRecievedBar style={{
                              width: (player[1] / widthIndex),
                              background: `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Blue" ? "#BD3B3B" : "#5B7A8C" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "#5B7A8C" : "#BD3B3B"}`,
                              "borderBottom": `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Blue" ? "4px solid #9D312F" : "4px solid #395C79" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "4px solid #395C79" : "4px solid #9D312F"}`,
                              padding: `${player[1] < 200 ? "4px 0px 4px 4px" : "4px 8px 4px 8px"}`
                            }}>{player[1]}</DamageRecievedBar>
                            <ClassAgainst src={apiResponse.players[player[0]].classIconURL} />
                            <DamageBar style={{
                              width: (Object.fromEntries(damageStats)[player[0]] === undefined ? 0 : Object.fromEntries(damageStats)[player[0]] / widthIndex),
                              background: `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Red" ? "#BD3B3B" : "#5B7A8C" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "#BD3B3B" : "#5B7A8C"}`,
                              "borderBottom": `${apiResponse.players[focusedPlayer] === undefined ?
                                apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Red" ? "4px solid #9D312F" : "4px solid #395C79" :
                                apiResponse.players[focusedPlayer].team === "Red" ? "4px solid #9D312F" : "4px solid #395C79"}`,
                                padding: `${player[1] < 200 ? "4px 0px 4px 4px" : "4px 8px 4px 8px"}`
                            }}>{Object.fromEntries(damageStats)[player[0]] === undefined ? 0 : Object.fromEntries(damageStats)[player[0]]}</DamageBar>
                          </VsStat>
                        );
                      })}
                    </StatsWrapper>
                  </PlayerVsStats>
                </PlayerStatsWrapper>
              </DamageVersus>
              <KillMap style={apiResponse.matchInfo.combined === true ? {display: "none"} : {}}>
                <Map src={apiResponse.matchInfo.mapImageURL}></Map>
                {(apiResponse.players[focusedPlayer] === undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].events : apiResponse.players[focusedPlayer].events).map((location) => {
                  let killerX = location.killer_location.x / 17.8;
                  let killerY = location.killer_location.y / 17.8;
                  let victimX = location.victim_location.x / 17.8;
                  let victimY = location.victim_location.y / 17.8;
                  let xOffset = apiResponse.matchInfo.offsets.x;
                  let yoffset = apiResponse.matchInfo.offsets.y;
                  var centerLineOffset = 4;
                  return (
                    <KillImage>
                      <SvgArrow height="540" width="540" style={{ position: "absolute", left: 0, top: 0 }}>
                        <Arrow points={`${killerX + centerLineOffset + xOffset},${killerY + centerLineOffset + 340 + yoffset}
                                            ${victimX + centerLineOffset + xOffset},${victimY + centerLineOffset + 340 + yoffset}`} style={{ stroke: "#FFC000" }}></Arrow>
                      </SvgArrow>
                      <Killer style={{
                        background: `${apiResponse.players[focusedPlayer] === undefined ?
                          apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Red" ? "#BD3B3B" : "#5B7A8C" :
                          apiResponse.players[focusedPlayer].team === "Red" ? "#BD3B3B" : "#5B7A8C"}`, left: killerX + xOffset, bottom: killerY + 340 + yoffset
                      }}></Killer>
                      <Victim style={{
                        background: `${apiResponse.players[focusedPlayer] === undefined ?
                          apiResponse.players[Object.entries(apiResponse.players)[0][0]].team === "Blue" ? "#BD3B3B" : "#5B7A8C" :
                          apiResponse.players[focusedPlayer].team === "Blue" ? "#BD3B3B" : "#5B7A8C"}`, left: victimX + xOffset, bottom: victimY + 340 + yoffset
                      }}></Victim>
                    </KillImage>
                  );
                })}
              </KillMap>
            </Individuals>
            <FunFacts>
              <BuildingsDestroyed>
                <Label>BUILDINGS DESTROYED</Label>
                <SmallStats>
                  <TeamSection>
                    {
                      playersResponse.map((playerinfo) => {
                        return (
                          <SmallPlayerCard style={playerinfo[1].team === "Blue" ? { "backgroundColor": "#5B7A8C" } : { "backgroundColor": "#9D312F" }}>
                            <SmallIcon src={playerinfo[1].classIconURL}></SmallIcon>
                            <Name>{playerinfo[1].userName}</Name>
                            <Amount>{playerinfo[1].objectkills}</Amount>
                          </SmallPlayerCard>
                        )
                      })
                    }
                  </TeamSection>
                </SmallStats>
              </BuildingsDestroyed>
              <Smalls>
                <PlayersExtinguished>
                  <Label>PLAYERS EXTINGUISHED</Label>
                  {
                    playersResponse.map((playerinfo) => {
                      if (playerinfo[1].extinguished !== 0) {
                        return (
                          <SmallPlayerCard style={playerinfo[1].team === "Blue" ? { "backgroundColor": "#5B7A8C" } : { "backgroundColor": "#9D312F" }}>
                            <SmallIcon src={playerinfo[1].classIconURL}></SmallIcon>
                            <Name>{playerinfo[1].userName}</Name>
                            <Amount>{playerinfo[1].extinguished}</Amount>
                          </SmallPlayerCard>
                        )
                      }
                    })
                  }
                </PlayersExtinguished>
                <BuildingCount>
                  <Label>BUILDING COUNT</Label>
                  {
                    playersResponse.map((playerinfo) => {
                      if (playerinfo[1].objectbuilds !== 0) {
                        return (
                          <SmallPlayerCard style={playerinfo[1].team === "Blue" ? { "backgroundColor": "#5B7A8C" } : { "backgroundColor": "#9D312F" }}>
                            <SmallIcon src={playerinfo[1].classIconURL}></SmallIcon>
                            <Name>{playerinfo[1].userName}</Name>
                            <Amount>{playerinfo[1].objectbuilds}</Amount>
                          </SmallPlayerCard>
                        )
                      }
                    })
                  }
                </BuildingCount>
                <Dominations>
                  <Label>MOST DOMINATIONS</Label>
                  {
                    playersResponse.map((playerinfo) => {
                      if (playerinfo[1].domination >= 2) {
                        return (
                          <SmallPlayerCard style={playerinfo[1].team === "Blue" ? { "backgroundColor": "#5B7A8C" } : { "backgroundColor": "#9D312F" }}>
                            <SmallIcon src={playerinfo[1].classIconURL}></SmallIcon>
                            <Name>{playerinfo[1].userName}</Name>
                            <Amount>{playerinfo[1].domination}</Amount>
                          </SmallPlayerCard>
                        )
                      }
                    })
                  }
                </Dominations>
              </Smalls>
              <AmmoPickup>
                <Label>AMMO PICKUP</Label>
                <SmallStats>
                  <TeamSection>
                    {
                      playersResponse.map((playerinfo) => {
                        return (
                          <SmallPlayerCard style={playerinfo[1].team === "Blue" ? { "backgroundColor": "#5B7A8C" } : { "backgroundColor": "#9D312F" }}>
                            <SmallIcon src={playerinfo[1].classIconURL}></SmallIcon>
                            <Name>{playerinfo[1].userName}</Name>
                            <Amount>{playerinfo[1].ammopickup}</Amount>
                          </SmallPlayerCard>
                        )
                      })
                    }
                  </TeamSection>
                </SmallStats>
              </AmmoPickup>
            </FunFacts>
          </MoreLogs>
          <TeamTotalStats>
            <TeamStatsWrapper>
              <TeamStatRow style={{ color: "#fff" }}>
                <TeamStat>Team</TeamStat>
                <TeamStat>Kills</TeamStat>
                <TeamStat>Damage</TeamStat>
                <TeamStat>Charges</TeamStat>
                <TeamStat>Drops</TeamStat>
                <TeamStat>Caps</TeamStat>
                <TeamStat>Midfights</TeamStat>
                <TeamStat>Medkits</TeamStat>
                <TeamStat>Ammo</TeamStat>
                <TeamStat>Object Kills</TeamStat>
              </TeamStatRow>
              <TeamStatRow style={{ background: "#BD3B3B", borderBottom: "3px solid #9D312F" }}>
                <TeamStat>RED</TeamStat>
                <TeamStat>{apiResponse.teams.Red.kills}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.dmg}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.charges}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.drops}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.caps}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.firstcaps}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.kills}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.kills}</TeamStat>
                <TeamStat>{apiResponse.teams.Red.kills}</TeamStat>
              </TeamStatRow>
              <TeamStatRow style={{ background: "#5B7A8C", borderBottom: "3px solid #395C79" }}>
                <TeamStat>BLU</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.kills}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.dmg}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.charges}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.drops}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.caps}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.firstcaps}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.kills}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.kills}</TeamStat>
                <TeamStat>{apiResponse.teams.Blue.kills}</TeamStat>
              </TeamStatRow>
            </TeamStatsWrapper>
          </TeamTotalStats>
          <PerRoundStats>
            <TeamStatsWrapper style={{ width: "700px" }}>
              <TeamStatRow style={{ color: "#fff", gridTemplateColumns: "repeat(7,100px)" }}>
                <TeamStat>Round</TeamStat>
                <TeamStat>Length</TeamStat>
                <TeamStat>Score</TeamStat>
                <TeamStat>Blue Kills</TeamStat>
                <TeamStat>Red Kills</TeamStat>
                <TeamStat>Blue DMG</TeamStat>
                <TeamStat>Red DMG</TeamStat>

              </TeamStatRow>
              {apiResponse.rounds.map((round) => {
                return (
                  <TeamStatRow style={round.winner === "Blue" ? { background: "#5B7A8C", borderBottom: "3px solid #395C79", gridTemplateColumns: "repeat(7,100px)" } : { background: "#BD3B3B", borderBottom: "3px solid #9D312F", gridTemplateColumns: "repeat(7,100px)" }}>
                    <TeamStat>{roundCount++}</TeamStat>
                    <TeamStat>{`${Math.floor(round.length / 60)}:${(round.length % 60).toString().padStart(2, '0')}`}</TeamStat>
                    <TeamStat >{`${round.team.Blue.score} - ${round.team.Red.score}`}</TeamStat>
                    <TeamStat>{round.team.Blue.kills}</TeamStat>
                    <TeamStat>{round.team.Red.kills}</TeamStat>
                    <TeamStat>{round.team.Blue.dmg}</TeamStat>
                    <TeamStat>{round.team.Red.dmg}</TeamStat>
                  </TeamStatRow>
                )
              })}
            </TeamStatsWrapper>
          </PerRoundStats>
          <Medics>
            <MedicsWrapper style={Object.entries(apiResponse.healSpread).length < 3 ? {display: "flex"} : {gridTemplateColumns:" repeat(3, 1fr)"}}>
              {Object.entries(apiResponse.healSpread).map((healer) => {
                return (
                  <Healer>
                    <HealerHeader style={apiResponse.players[healer[0]].team === "Blue" ? { background: "#5B7A8C", borderBottom: "3px solid #395C79" } : { background: "#BD3B3B", borderBottom: "3px solid #9D312F" }}>{apiResponse.names[healer[0]]}</HealerHeader>
                    <HealerStats>
                      <HealerStatTitle>Healing</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].heal))}</StatNumber>
                      {
                        Object.entries(apiResponse.players[healer[0]].ubertypes).map((charges) => {
                          return (
                            <>
                              <HealerStatTitle>{`Charges (${charges[0]})`}</HealerStatTitle>
                              <StatNumber>{charges[1]}</StatNumber>
                            </>
                          )
                        })
                      }
                      <HealerStatTitle>Drops</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].drops === undefined ? 0 : apiResponse.players[healer[0]].drops))}</StatNumber>
                      <HealerStatTitle>Avg time to build</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats === undefined ? 0 : apiResponse.players[healer[0]].medicStats.avg_time_to_build))}</StatNumber>
                      <HealerStatTitle>Avg time before using</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats === undefined ? 0 : apiResponse.players[healer[0]].medicStats.avg_time_before_using))}</StatNumber>
                      <HealerStatTitle>Near full charge deaths</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats === undefined ? 0 : apiResponse.players[healer[0]].medicStats.deaths_with_95_99_uber))}</StatNumber>
                      <HealerStatTitle>Avg uber length</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats === undefined ? 0 : apiResponse.players[healer[0]].medicStats.avg_uber_length))}</StatNumber>
                      <HealerStatTitle>Deaths after charge</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats === undefined ? 0 : apiResponse.players[healer[0]].medicStats.deaths_within_20s_after_uber))}</StatNumber>
                      <HealerStatTitle>Advantage lost</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats === undefined ? 0 : apiResponse.players[healer[0]].medicStats.advantages_lost))}</StatNumber>
                    </HealerStats>
                    <HealSpread style={apiResponse.players[healer[0]].team === "Blue" ? { borderTop: "3px solid #5B7A8C" } : { borderTop: "3px solid #BD3B3B" }}>
                      <HealedPlayer style={{ fontWeight: "800" }}>
                        <HealedName>Heal Target</HealedName>
                        <HealedName>C</HealedName>
                        <HealStat>Heal</HealStat>
                        <HealStat>%</HealStat>
                      </HealedPlayer>
                      {Object.entries(healer[1]).map((healTarget) => {
                        return (
                          <HealedPlayer>
                            <HealedName>{apiResponse.names[healTarget[0]]}</HealedName>
                            <HealedClass src={apiResponse.players[healTarget[0]].classIconURL}></HealedClass>
                            <HealStat>{healTarget[1]}</HealStat>
                            <HealStat>{Math.round(healTarget[1] * 100 / parseInt(apiResponse.players[healer[0]].heal))}</HealStat>
                          </HealedPlayer>
                        )
                      })}
                    </HealSpread>
                  </Healer>
                );
              })}
            </MedicsWrapper>
          </Medics>
          <KillsPerPlayer>
            <KillsPerPlayerWrapper>
              <PerPlayerCard style={{ borderBottom: "1px solid #070807" }}>
                <PerPlayerStat style={{ border: "none", fontWeight: 800 }}>Team</PerPlayerStat>
                <PerPlayerStat style={{ fontWeight: 800 }}>Player</PerPlayerStat>
                <PerPlayerStat style={{ fontWeight: 800 }}>C</PerPlayerStat>
                <PerPlayerClass style={killSpreadSort === "scout" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("scout") }} src="https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "soldier" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("soldier") }} src="https://wiki.teamfortress.com/w/images/9/96/Leaderboard_class_soldier.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "pyro" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("pyro") }} src="https://wiki.teamfortress.com/w/images/8/80/Leaderboard_class_pyro.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "demoman" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("demoman") }} src="https://wiki.teamfortress.com/w/images/4/47/Leaderboard_class_demoman.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "heavyweapons" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("heavyweapons") }} src="https://wiki.teamfortress.com/w/images/5/5a/Leaderboard_class_heavy.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "engineer" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("engineer") }} src="https://wiki.teamfortress.com/w/images/1/12/Leaderboard_class_engineer.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "medic" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("medic") }} src="https://wiki.teamfortress.com/w/images/e/e5/Leaderboard_class_medic.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "sniper" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("sniper") }} src="https://wiki.teamfortress.com/w/images/f/fe/Leaderboard_class_sniper.png"></PerPlayerClass>
                <PerPlayerClass style={killSpreadSort === "spy" ? { background: "#f08149", cursor: "pointer" } : { cursor: "pointer" }} onClick={() => { sortKillSpread("spy") }} src="https://wiki.teamfortress.com/w/images/3/33/Leaderboard_class_spy.png"></PerPlayerClass>
                <PerPlayerStat style={killSpreadSort === "kills" ? { fontWeight: 800, color: "#000", background: "#f08149", cursor: "pointer" } : { fontWeight: 800, cursor: "pointer" }} onClick={() => { sortKillSpread("kills") }}>K</PerPlayerStat>
              </PerPlayerCard>
              {
                killSpreadArray !== undefined && killSpreadArray.map((player, index) => {
                  return (
                    <PerPlayerCard style={currentRow++ % 2 === 1 ? { background: "#191919" } : {}}>
                      <PerPlayerStat style={apiResponse.players[player[0]].team === "Blue" ? { color: "#5B7A8C", border: "none", fontWeight: 800 } : { color: "#BD3B3B", border: "none", fontWeight: 800 }}>{apiResponse.players[player[0]].team}</PerPlayerStat>
                      <PerPlayerStat>{apiResponse.names[player[0]]}</PerPlayerStat>
                      <PerPlayerClass src={apiResponse.players[player[0]].classIconURL}></PerPlayerClass>
                      <PerPlayerStat style={player[1].scout === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].scout === undefined ? 0 : player[1].scout}</PerPlayerStat>
                      <PerPlayerStat style={player[1].soldier === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].soldier === undefined ? 0 : player[1].soldier}</PerPlayerStat>
                      <PerPlayerStat style={player[1].pyro === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].pyro === undefined ? 0 : player[1].pyro}</PerPlayerStat>
                      <PerPlayerStat style={player[1].demoman === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].demoman === undefined ? 0 : player[1].demoman}</PerPlayerStat>
                      <PerPlayerStat style={player[1].heavyweapons === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].heavyweapons === undefined ? 0 : player[1].heavyweapons}</PerPlayerStat>
                      <PerPlayerStat style={player[1].engineer === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].engineer === undefined ? 0 : player[1].engineer}</PerPlayerStat>
                      <PerPlayerStat style={player[1].medic === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].medic === undefined ? 0 : player[1].medic}</PerPlayerStat>
                      <PerPlayerStat style={player[1].sniper === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].sniper === undefined ? 0 : player[1].sniper}</PerPlayerStat>
                      <PerPlayerStat style={player[1].spy === undefined ? { color: "#4d4643" } : { fontWeight: "500" }}>{player[1].spy === undefined ? 0 : player[1].spy}</PerPlayerStat>
                      <PerPlayerStat style={{ fontWeight: "500" }}>{apiResponse.players[player[0]].kills}</PerPlayerStat>
                    </PerPlayerCard>)
                })
              }
            </KillsPerPlayerWrapper>
          </KillsPerPlayer>
          <Chat></Chat>
        </LogsSectionWrapper>
      </LogsPageWrapper>
    )
  } else {
    return (
      <div id="loader">
        <div id="shadow"></div>
        <div id="box"></div>
      </div>
    )
  }
}

export default Logs;