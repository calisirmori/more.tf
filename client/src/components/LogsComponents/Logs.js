import React, { useState } from 'react'
import { AmmoPickup, Amount, Arrow, Assists, BlueScore, BlueTeam, BuildingCount, BuildingsDestroyed, Chat, Class, ClassAgainst, ClassicLogs, ClassImage, ClassTitle, Damage, DamageBar, DamageVersus, Deaths, DemosLink, Dominations, DPM, Duration, FunFacts, HealedClass, HealedName, HealedPlayer, Healer, HealerHeader, HealerStats, HealerStatTitle, HealSpread, HealStat, Individuals, InfoButtons, InfoSection, KDA, Killer, KillImage, KillMap, Kills, KillsPerPlayer, Label, LeftSideInfo, LogNumber, LogsLink, LogsPageWrapper, LogsSectionWrapper, Map, MapPlayed, MatchDate, MatchHeader, MatchLinks, MatchScore, MatchTitle, Medics, MedicsWrapper, MoreLogs, Name, NameInfoTitle, PerRoundStats, PlayerCard, PlayerLogTitle, PlayerName, PlayersExtinguished, PlayerUsername, PlayerVsStats, RedScore, RedTeam, RightSideInfo, Score, SectionTitle, SmallButton, SmallHeaders, SmallIcon, SmallPlayerCard, Smalls, SmallStats, StatNumber, StatsWrapper, StatTitle, SvgArrow, Team, TeamName, TeamSection, TeamStat, TeamStatRow, TeamStatsWrapper, TeamTotalStats, UsernameTitle, Victim, VsStat } from './LogsStyles';
import { useEffect } from 'react';
import axios from 'axios';

const Logs = () => {

  const id = window.location.href;
  const idArray = id.split('/');
  const logInfo = idArray[4];

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const [apiResponse, setApiResponse] = useState({});
  const [playersResponse, setPlayersResponse] = useState({});
  const [focusedPlayer, setFocusedPlayer] = useState("");
  const [damageStats, setDamageStats] = useState([]);
  const [sort, setSort] = useState("");
  let roundCount = 1;
  useEffect(() => {
    if(playersResponse.length != undefined){
      sortByRow("team")
      changeDamageVs(Object.entries(apiResponse.players)[0][0])
      let smallStatsObject = { "objectBuilds" : sortForSmallStats("objectbuilds"), "dominations" : sortForSmallStats("dominations"), "extinguished" : sortForSmallStats("extinguished")}
  
    }
  },[apiResponse]);
  
  useEffect(() => {
    apiCall()
  }, [])
  
  async function apiCall(){
    console.log("apicall")
    let response = await axios.get(`http://localhost:8080/logsplus/${logInfo}`)
    setApiResponse(response.data);
    setPlayersResponse(Object.entries(response.data.players))
  }

  function changeDamageVs(playerId){
    setFocusedPlayer(playerId);
    const sortedDamage = Object.entries(apiResponse.players[playerId].damage_towards)
    .sort(([,b],[,a]) => a-b)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    setDamageStats(Object.entries(sortedDamage));
  }

  function classNameToIconURL(input) {
    var output = "";
    switch (input) {
      case "scout":
        output = "https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png";
        break;
      case "soldier":
        output = "https://wiki.teamfortress.com/w/images/9/96/Leaderboard_class_soldier.png";
        break;
      case "pyro":
        output = "https://wiki.teamfortress.com/w/images/8/80/Leaderboard_class_pyro.png";
        break;
      case "demoman":
        output = "https://wiki.teamfortress.com/w/images/4/47/Leaderboard_class_demoman.png";
        break;
      case "heavyweapons":
        output = "https://wiki.teamfortress.com/w/images/5/5a/Leaderboard_class_heavy.png";
        break;
      case "engineer":
        output = "https://wiki.teamfortress.com/w/images/1/12/Leaderboard_class_engineer.png";
        break;
      case "medic":
        output = "https://wiki.teamfortress.com/w/images/e/e5/Leaderboard_class_medic.png";
        break;
      case "sniper":
        output = "https://wiki.teamfortress.com/w/images/f/fe/Leaderboard_class_sniper.png";
        break;
      case "spy":
        output = "https://wiki.teamfortress.com/w/images/3/33/Leaderboard_class_spy.png";
        break;
      default:
        break;
    };
    return output;
  };
  
  function sortForSmallStats(stat){
    var array = [];
    let arrayLength = playersResponse.length;

    for (let outputIndex = 0; outputIndex < arrayLength; outputIndex++){
      let max = 0;
      let currentIndex = 0;
      for(let playerIndex = 0; playerIndex < playersResponse.length; playerIndex++){
        if(playersResponse[playerIndex][1][stat] >= max){
          max = playersResponse[playerIndex][1][stat];
          currentIndex = playerIndex;
        }
      }
      array[outputIndex] = [playersResponse[currentIndex][0],playersResponse[currentIndex][1][stat]];
      playersResponse.splice(currentIndex, 1)
    }
    return array;
  }

  function sortByRow(row){
    setSort(row);
    var array = [];
    let arrayLength = playersResponse.length;

    if(row == "team" && sort !== row){
      playersResponse.map((player) =>{
        player[1][row] === "Blue" ? array.unshift(player) : array.push(player);
      })
      setPlayersResponse(array);

    } else if (sort !== row) {
      for (let outputIndex = 0; outputIndex < arrayLength; outputIndex++){
        let max = 0;
        let currentIndex = 0;
        for(let playerIndex = 0; playerIndex < playersResponse.length; playerIndex++){
          if(playersResponse[playerIndex][1][row] >= max){
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
  console.log(apiResponse.players)
  if(apiResponse.matchInfo !== undefined ){
    return (
      <LogsPageWrapper>
        <LogsSectionWrapper>
          <MatchHeader>
            <LeftSideInfo>
              <MatchTitle>{apiResponse.matchInfo.title}</MatchTitle>
              <MapPlayed>{apiResponse.matchInfo.map}</MapPlayed>
              <Duration>{`${Math.ceil(apiResponse.matchInfo.totalLength/60)} : ${(apiResponse.matchInfo.totalLength%60).toString().padStart(2, '0')}`}</Duration>
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
              <LogNumber>{"#"+ logInfo}</LogNumber>
              <MatchDate>{`${(new Date(apiResponse.matchInfo.date*1000)).toLocaleDateString("en-US", options) + " " +(new Date(apiResponse.matchInfo.date*1000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}</MatchDate>
              <MatchLinks>
                <LogsLink href={`https://logs.tf/${logInfo}`} target="_blank"> logs.tf </LogsLink>
                <DemosLink href={`https://demos.tf/${apiResponse.matchInfo.demosID}`} target="_blank"> demos.tf </DemosLink>
              </MatchLinks>
            </RightSideInfo>
          </MatchHeader>
          <ClassicLogs>
            <PlayerLogTitle>
              <ClassTitle style={sort === "team" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("team")}} >Team</ClassTitle>
              <NameInfoTitle>
                <UsernameTitle>Username</UsernameTitle>
              </NameInfoTitle>
              <StatTitle >C</StatTitle>
              <StatTitle style={sort === "kills" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("kills")}}>K</StatTitle>
              <StatTitle style={sort === "assists" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("assists")}}>A</StatTitle>
              <StatTitle style={sort === "deaths" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("deaths")}}>D</StatTitle>
              <StatTitle style={sort === "damage" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("damage")}}>DMG</StatTitle>
              <StatTitle style={sort === "DamagePM" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("DamagePM")}}>DPM</StatTitle>
              <StatTitle style={sort === "kapd" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("kapd")}}>KA/D</StatTitle>
              <StatTitle style={sort === "kpd" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("kpd")}}>K/D</StatTitle>
              <StatTitle style={sort === "damageTaken" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("damageTaken")}}>DT</StatTitle>
              <StatTitle style={sort === "damageTaken" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("damageTaken")}}>DT/M</StatTitle>
              <StatTitle style={sort === "medkits" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("medkits")}}>HP</StatTitle>
              <StatTitle style={sort === "backstabs" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("backstabs")}}>BS</StatTitle>
              <StatTitle style={sort === "headshots_hit" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("headshots_hit")}}>HS</StatTitle>
              <StatTitle style={sort === "airShot" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("airShot")}}>AS</StatTitle>
              <StatTitle style={sort === "pointCaps" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("pointCaps")}}>CP</StatTitle>
              <StatTitle style={sort === "ammopickup" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("ammopickup")}}>AP</StatTitle>
              <StatTitle style={sort === "extinguished" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("extinguished")}}>E</StatTitle>
              <StatTitle style={sort === "objectbuilds" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("objectbuilds")}}>OB</StatTitle>
              <StatTitle style={sort === "objectkills" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("objectkills")}}>OK</StatTitle>
              <StatTitle style={sort === "domination" ? {textDecoration : "underline"} : {}} onClick={() =>{sortByRow("domination")}}>D</StatTitle>
            </PlayerLogTitle> 
            {playersResponse.map((player) => {
                return(
                  <PlayerCard style={player[1].team == "Red" ? {background: "#BD3B3B", borderBottom: "3px solid #9D312F"} : {background: "#5B7A8C", borderBottom: "3px solid #395C79"} }>
                    <Team style={player[1].team == "Red" ? {background: "#BD3B3B"} : {background: "#5B7A8C"} }>{player[1].team}</Team>
                    <PlayerUsername onClick={() =>{changeDamageVs(player[0])}}>{player[1].userName}</PlayerUsername>
                    <Class src={player[1].classIconURL}></Class>
                    <Kills>{player[1].kills}</Kills>
                    <Assists>{player[1].assists}</Assists>
                    <Deaths >{player[1].deaths}</Deaths>
                    <Damage>{player[1].damage}</Damage>
                    <DPM>{player[1].DamagePM}</DPM>
                    <KDA>{player[1].kapd}</KDA>
                    <KDA>{player[1].kpd}</KDA>
                    <KDA>{player[1].damageTaken}</KDA>
                    <KDA>{Math.ceil(player[1].damageTaken/(apiResponse.matchInfo.totalLength/60))}</KDA>
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
              <DamageVersus>
                <ClassImage src={ apiResponse.players[focusedPlayer] == undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].classImageURL: apiResponse.players[focusedPlayer].classImageURL}></ClassImage>
                <PlayerVsStats>
                  <Label>DAMAGE TO CLASS</Label>
                  <InfoSection>
                    <PlayerName>{apiResponse.players[focusedPlayer] == undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].userName: apiResponse.players[focusedPlayer].userName}</PlayerName>
                    <InfoButtons>
                      <SmallButton target="_blank" href={`https://steamcommunity.com/profiles/${apiResponse.players[focusedPlayer] == undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64: apiResponse.players[focusedPlayer].steamID64}`} ><img src="https://cdn.icon-icons.com/icons2/2248/PNG/512/steam_icon_135152.png"></img></SmallButton>
                      <SmallButton target="_blank" href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${apiResponse.players[focusedPlayer] == undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64: apiResponse.players[focusedPlayer].steamID64}`} ><img src="https://avatars.cloudflare.steamstatic.com/e8b64622d8d348f9d3761d51f1aed63233401b26_full.jpg"></img></SmallButton>
                      <SmallButton target="_blank" href={`https://etf2l.org/search/${apiResponse.players[focusedPlayer] == undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64: apiResponse.players[focusedPlayer].steamID64}`} ><img src="https://etf2l.org/wp-content/uploads/2018/07/2018_etf2l_short_nobackground_dark.png"></img></SmallButton>
                      <SmallButton target="_blank" href={`https://www.ugcleague.com/players_page.cfm?player_id=${apiResponse.players[focusedPlayer] == undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].steamID64: apiResponse.players[focusedPlayer].steamID64}`} ><img src="https://pbs.twimg.com/profile_images/1128657074215432192/gOCZ-jLz_400x400.jpg"></img></SmallButton>
                    </InfoButtons>
                  </InfoSection>
                  <SectionTitle></SectionTitle>
                  <StatsWrapper>
                      {damageStats.map((player) => {
                      const widthIndex = damageStats[0][1] /230;
                        return(
                          <VsStat>
                            <ClassAgainst src={classNameToIconURL(player[0])}/>
                            <DamageBar style={{ width: (player[1]/widthIndex), 
                                                background: `${ apiResponse.players[focusedPlayer] == undefined ?
                                                                  apiResponse.players[Object.entries(apiResponse.players)[0][0]].team == "Red" ? "#BD3B3B" : "#5B7A8C" :
                                                                  apiResponse.players[focusedPlayer].team == "Red" ? "#BD3B3B" : "#5B7A8C" }`,
                                           "borderBottom": `${ apiResponse.players[focusedPlayer] == undefined ?
                                                                  apiResponse.players[Object.entries(apiResponse.players)[0][0]].team == "Red" ? "4px solid #9D312F" : "4px solid #395C79" :
                                                                  apiResponse.players[focusedPlayer].team == "Red" ? "4px solid #9D312F" : "4px solid #395C79" }`}}>{player[1]}</DamageBar>
                          </VsStat>
                        );
                      })}
                  </StatsWrapper>
                </PlayerVsStats>
              </DamageVersus>
              <KillMap>
                <Map src={apiResponse.matchInfo.mapImageURL}></Map>
                {(apiResponse.players[focusedPlayer] == undefined ? apiResponse.players[Object.entries(apiResponse.players)[0][0]].events: apiResponse.players[focusedPlayer].events).map((location) => {
                    let killerX = location.killer_location.x/17.8;
                    let killerY = location.killer_location.y/17.8;
                    let victimX = location.victim_location.x/17.8;
                    let victimY = location.victim_location.y/17.8;
                    let xOffset = apiResponse.matchInfo.offsets.x;
                    let yoffset = apiResponse.matchInfo.offsets.y;
                    var centerLineOffset = 5;
                      return(
                        <KillImage>
                          <SvgArrow height="540" width="540" style={{position: "absolute", left: 0, top: 0}}>
                            <Arrow points={`${killerX+centerLineOffset+xOffset},${killerY+centerLineOffset+340+yoffset}
                                            ${victimX+centerLineOffset+xOffset},${victimY+centerLineOffset+340+yoffset}`} style={{stroke: "#FFC000"}}></Arrow>
                          </SvgArrow>
                          <Killer style={{left : killerX+xOffset , bottom: killerY+340+yoffset}}></Killer>
                          <Victim style={{left : victimX+xOffset , bottom: victimY+340+yoffset}}></Victim>
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
                        return(
                          <SmallPlayerCard style={ playerinfo[1].team=="Blue" ? { "backgroundColor": "#5B7A8C"} : { "backgroundColor": "#9D312F"}}>
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
                        if(playerinfo[1].extinguished != 0){
                          return(
                            <SmallPlayerCard style={ playerinfo[1].team=="Blue" ? { "backgroundColor": "#5B7A8C"} : { "backgroundColor": "#9D312F"}}>
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
                        if(playerinfo[1].objectbuilds != 0){
                          return(
                            <SmallPlayerCard style={ playerinfo[1].team=="Blue" ? { "backgroundColor": "#5B7A8C"} : { "backgroundColor": "#9D312F"}}>
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
                        if(playerinfo[1].domination >= 2){
                          return(
                            <SmallPlayerCard style={ playerinfo[1].team=="Blue" ? { "backgroundColor": "#5B7A8C"} : { "backgroundColor": "#9D312F"}}>
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
                        return(
                          <SmallPlayerCard style={ playerinfo[1].team=="Blue" ? { "backgroundColor": "#5B7A8C"} : { "backgroundColor": "#9D312F"}}>
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
              <TeamStatRow style={{color : "#fff"}}>
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
              <TeamStatRow style={{ background : "#BD3B3B", borderBottom: "3px solid #9D312F"}}>
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
              <TeamStatRow style={{ background : "#5B7A8C", borderBottom: "3px solid #395C79"}}>
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
            <TeamStatsWrapper style={{width: "700px"}}>
              <TeamStatRow style={{color : "#fff", gridTemplateColumns: "repeat(7,100px)"}}>
                <TeamStat>Round</TeamStat>
                <TeamStat>Length</TeamStat>
                <TeamStat>Score</TeamStat>
                <TeamStat>Blue Kills</TeamStat>
                <TeamStat>Red Kills</TeamStat>
                <TeamStat>Blue DMG</TeamStat>
                <TeamStat>Red DMG</TeamStat>

              </TeamStatRow>
              { apiResponse.rounds.map((round)=>{
                return(
                  <TeamStatRow style={round.winner === "Blue" ? {background : "#5B7A8C", borderBottom: "3px solid #395C79",gridTemplateColumns: "repeat(7,100px)"} : {background : "#BD3B3B", borderBottom: "3px solid #9D312F", gridTemplateColumns: "repeat(7,100px)"}}>
                    <TeamStat>{roundCount++}</TeamStat>
                    <TeamStat>{`${Math.floor(round.length/60)}:${(round.length%60).toString().padStart(2, '0')}`}</TeamStat>
                    <TeamStat >{`${round.team.Blue.score} - ${round.team.Red.score}`}</TeamStat>
                    <TeamStat>{round.team.Blue.kills}</TeamStat>
                    <TeamStat>{round.team.Red.kills}</TeamStat>
                    <TeamStat>{round.team.Blue.dmg}</TeamStat>
                    <TeamStat>{round.team.Red.dmg}</TeamStat>
                  </TeamStatRow>
                )})}
            </TeamStatsWrapper>
          </PerRoundStats>
          <Medics>
            <MedicsWrapper>
              {Object.entries(apiResponse.healSpread).map((healer)=>{
                return(
                  <Healer>
                    <HealerHeader style={apiResponse.players[healer[0]].team === "Blue" ? {background : "#5B7A8C", borderBottom: "3px solid #395C79"} : {background : "#BD3B3B", borderBottom: "3px solid #9D312F"}}>{apiResponse.names[healer[0]]}</HealerHeader>
                    <HealerStats>
                      <HealerStatTitle>Healing</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].heal))}</StatNumber>
                      <HealerStatTitle>Charges</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].heal))}</StatNumber>
                      <HealerStatTitle>Drops</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].drops))}</StatNumber>
                      <HealerStatTitle>Avg time to build</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats.avg_time_to_build))}</StatNumber>
                      <HealerStatTitle>Avg time before using</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats.avg_time_before_using))}</StatNumber>
                      <HealerStatTitle>Near full charge deaths</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats.deaths_with_95_99_uber))}</StatNumber>
                      <HealerStatTitle>Avg uber length</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats.avg_uber_length))}</StatNumber>
                      <HealerStatTitle>Deaths after charge</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats.deaths_within_20s_after_uber))}</StatNumber>
                      <HealerStatTitle>Advantage lost</HealerStatTitle>
                      <StatNumber>{Math.ceil(parseInt(apiResponse.players[healer[0]].medicStats.advantages_lost))}</StatNumber>
                    </HealerStats>
                    <HealSpread style={apiResponse.players[healer[0]].team === "Blue" ? {borderTop: "3px solid #395C79"} : {borderTop: "3px solid #9D312F"}}>
                      <HealedPlayer style={{fontWeight: "800"}}>
                        <HealedName>Heal Target</HealedName>
                        <HealedName>C</HealedName>
                        <HealStat>Heal</HealStat>
                        <HealStat>%</HealStat>
                      </HealedPlayer>
                      {Object.entries(healer[1]).map((healTarget)=>{
                        return(
                          <HealedPlayer>
                            <HealedName>{apiResponse.names[healTarget[0]]}</HealedName>
                            <HealedClass src={apiResponse.players[healTarget[0]].classIconURL}></HealedClass>
                            <HealStat>{healTarget[1]}</HealStat>
                            <HealStat>{Math.round(healTarget[1]*100/parseInt(apiResponse.players[healer[0]].heal))}</HealStat>
                          </HealedPlayer>
                        )
                      })}
                    </HealSpread>
                  </Healer>
                );
              })}
            </MedicsWrapper>
          </Medics>
          <KillsPerPlayer></KillsPerPlayer>
          <Chat></Chat>
        </LogsSectionWrapper>
      </LogsPageWrapper>
    )
  } else {
    return(
      <div id="loader">
        <div id="shadow"></div>
        <div id="box"></div>
      </div>
    )
  }
}

export default Logs;