import React, { useState } from 'react'
import { AmmoPickup, Amount, Arrow, Assists, BlueScore, BlueTeam, BuildingCount, BuildingsDestroyed, Class, ClassAgainst, ClassicLogs, ClassImage, ClassTitle, Damage, DamageBar, DamageVersus, Deaths, DemosLink, Dominations, DPM, Duration, FunFacts, Individuals, InfoButtons, InfoSection, KDA, Killer, KillImage, KillMap, Kills, Label, LeftSideInfo, LogNumber, LogsLink, LogsPageWrapper, LogsSectionWrapper, Map, MapPlayed, MatchDate, MatchHeader, MatchLinks, MatchScore, MatchTitle, MoreLogs, Name, NameInfoTitle, PlayerCard, PlayerLogTitle, PlayerName, PlayersExtinguished, PlayerUsername, PlayerVsStats, RedScore, RedTeam, RightSideInfo, Score, SectionTitle, SmallButton, SmallHeaders, SmallIcon, SmallPlayerCard, Smalls, SmallStats, StatsWrapper, StatTitle, SvgArrow, Team, TeamName, TeamSection, UsernameTitle, Victim, VsStat } from './LogsStyles';
import { useEffect } from 'react';
import axios from 'axios';

const Logs = () => {

  const id = window.location.href;
  const idArray = id.split('/');
  const logInfo = idArray[4];

  const [blueTeamScore, setBlueTeamScore] = useState(0);
  const [redTeamScore, setRedTeamScore] = useState(0);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const [smallStats, setSmallStats] = useState([]);
  const [sumAmountsSmallStats, setSumAmountsSmallStats] = useState([]);

  const [apiResponse, setApiResponse] = useState({});
  const [playersResponse, setPlayersResponse] = useState({});
  const [smallStatsResponse, setSmallStatsResponse] = useState({});
  const [focusedPlayer, setFocusedPlayer] = useState("");
  const [damageStats, setDamageStats] = useState([]);

  
  useEffect(() => {
    console.log(apiResponse.matchInfo)
    if(playersResponse.length != undefined){
      sortByRow("team")
      changeDamageVs(Object.entries(apiResponse.players)[0][0])
      let smallStatsObject = { "objectBuilds" : sortForSmallStats("objectbuilds"), "dominations" : sortForSmallStats("dominations"), "extinguished" : sortForSmallStats("extinguished")}
      console.log(smallStatsObject)
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
    setSmallStatsResponse(Object.entries(response.data.players))
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

    var array = [];
    let arrayLength = playersResponse.length;

    if(row == "team"){
      playersResponse.map((player) =>{
        player[1][row] === "Blue" ? array.unshift(player) : array.push(player);
      })
    } else {
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
    }

    setPlayersResponse(array);
  }

  if(apiResponse.matchInfo !== undefined ){
    return (
      <LogsPageWrapper>
        <LogsSectionWrapper>
          <MatchHeader>
            <LeftSideInfo>
              <MatchTitle>{apiResponse.matchInfo.title}</MatchTitle>
              <MapPlayed>{apiResponse.matchInfo.map}</MapPlayed>
              <Duration>{apiResponse.matchInfo.totalLength}</Duration>
            </LeftSideInfo>
            <MatchScore>
              <BlueScore>
                <TeamName>BLU</TeamName>
                <Score>{blueTeamScore}</Score>
              </BlueScore>
              <RedScore>
                <TeamName>RED</TeamName>
                <Score>{redTeamScore}</Score>
              </RedScore>
            </MatchScore>
            <RightSideInfo>
              <LogNumber>{logInfo}</LogNumber>
              <MatchDate>{apiResponse.matchInfo.date}</MatchDate>
              <MatchLinks>
                <LogsLink> logs.tf </LogsLink>
                <DemosLink> demos.tf </DemosLink>
              </MatchLinks>
            </RightSideInfo>
          </MatchHeader>
          <ClassicLogs>
            <PlayerLogTitle>
              <ClassTitle onClick={() =>{sortByRow("team")}} >Team</ClassTitle>
              <NameInfoTitle>
                <UsernameTitle>Username</UsernameTitle>
              </NameInfoTitle>
              <StatTitle className="no-click">Class</StatTitle>
              <StatTitle className="Kills" onClick={() =>{sortByRow("kills")}}>Kills</StatTitle>
              <StatTitle className="Assists" onClick={() =>{sortByRow("assists")}}>Assist</StatTitle>
              <StatTitle className="Deaths" onClick={() =>{sortByRow("deaths")}}>Death</StatTitle>
              <StatTitle className="Damage" onClick={() =>{sortByRow("damage")}}>Damage</StatTitle>
              <StatTitle className="DPM" onClick={() =>{sortByRow("DamagePm")}}>DPM</StatTitle>
              <StatTitle className="KDA" onClick={() =>{sortByRow("kpd")}}>KDA</StatTitle>
            </PlayerLogTitle> 
            {playersResponse.map((player) => {
                return(
                  <PlayerCard>
                    <Team className={player[1].team}>{player[1].team}</Team>
                    <PlayerUsername onClick={() =>{changeDamageVs(player[0])}}>{player[1].userName}</PlayerUsername>
                    <Class src={player[1].classIconURL}></Class>
                    <Kills>{player[1].kills}</Kills>
                    <Assists>{player[1].assists}</Assists>
                    <Deaths >{player[1].deaths}</Deaths>
                    <Damage>{player[1].damage}</Damage>
                    <DPM>{player[1].DamagePM}</DPM>
                    <KDA>{player[1].kpd}</KDA>
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
                      <SmallButton style={{background : "#BEBDBB"}}src="https://cdn.icon-icons.com/icons2/2248/PNG/512/steam_icon_135152.png"></SmallButton>
                      <SmallButton src="https://avatars.cloudflare.steamstatic.com/e8b64622d8d348f9d3761d51f1aed63233401b26_full.jpg"></SmallButton>
                      <SmallButton src="https://etf2l.org/wp-content/uploads/2018/07/2018_etf2l_short_nobackground_dark.png"></SmallButton>
                      <SmallButton src="https://pbs.twimg.com/profile_images/1128657074215432192/gOCZ-jLz_400x400.jpg"></SmallButton>
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
                <SmallHeaders>
                  <BlueTeam>{sumAmountsSmallStats[0]}</BlueTeam>
                  <RedTeam>{sumAmountsSmallStats[2]}</RedTeam>
                </SmallHeaders>
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
                <SmallHeaders>
                  <BlueTeam>{sumAmountsSmallStats[1]}</BlueTeam>
                  <RedTeam>{sumAmountsSmallStats[3]}</RedTeam>
                </SmallHeaders>
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
        </LogsSectionWrapper>
      </LogsPageWrapper>
    )
  }

}

export default Logs;