import React, { useState } from 'react'
import { AmmoPickup, Amount, Arrow, Assists, BlueScore, BlueTeam, BuildingCount, BuildingsDestroyed, Class, ClassAgainst, ClassicLogs, ClassImage, ClassTitle, Damage, DamageBar, DamageVersus, Deaths, DemosLink, Dominations, DPM, Duration, FunFacts, Individuals, InfoButtons, InfoSection, KDA, Killer, KillImage, KillMap, Kills, Label, LeftSideInfo, LogNumber, LogsLink, LogsPageWrapper, LogsSectionWrapper, Map, MapPlayed, MatchDate, MatchHeader, MatchLinks, MatchScore, MatchTitle, MoreLogs, Name, NameInfoTitle, PlayerCard, PlayerLogTitle, PlayerName, PlayersExtinguished, PlayerUsername, PlayerVsStats, RedScore, RedTeam, RightSideInfo, Score, SectionTitle, SmallButton, SmallHeaders, SmallIcon, SmallPlayerCard, Smalls, SmallStats, StatsWrapper, StatTitle, SvgArrow, Team, TeamName, TeamSection, UsernameTitle, Victim, VsStat } from './LogsStyles';
import { useEffect } from 'react';
import axios from 'axios';

const Logs = () => {

  const id = window.location.href;
  const idArray = id.split('/');
  const logInfo = idArray[4];

  const [localInput, setLocalInput] = useState([]);
  const [listOfPlayers, setListOfPlayers] = useState([]);
  const [blueTeamScore, setBlueTeamScore] = useState(0);
  const [redTeamScore, setRedTeamScore] = useState(0);
  const [currentFocusName, setCurrentFocusName] = useState("");
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const [smallStats, setSmallStats] = useState([]);
  const [sumAmountsSmallStats, setSumAmountsSmallStats] = useState([]);


  const [apiResponse, setApiResponse] = useState({});
  const [playersResponse, setPlayersResponse] = useState({});
  const [focusedPlayer, setFocusedPlayer] = useState("");
  const [damageStats, setDamageStats] = useState([]);

  var playersArray =[];
  var samplearray = [];

  async function apiCall(){
    console.log("apicall")
    let response = await axios.get(`http://localhost:8080/logsplus/${logInfo}`)
    setApiResponse(response.data);
    setPlayersResponse(Object.entries(response.data.players))
    
  }

  useEffect(() => {
    console.log(apiResponse.matchInfo)
    if(playersResponse.length != undefined){
      sortByRow("team")
      changeDamageVs(Object.entries(apiResponse.players)[0][0])
    }
  },[apiResponse]);

  useEffect(() => {
    apiCall()

  }, [])

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

  const [outputArray, setOutputArray]  = useState([]);

  function locationsToCordinates(inputArray){
    var array = Object.entries(inputArray[1].kills)
    var extraarray = [];
    for(var i = 0; i < array.length ; i++) {
      var killerLocation = (array[i][1].killer.location).split(" ");
      var victimLocation = (array[i][1].victim.location).split(" ");
      const scaleIndex = 17.8;
      extraarray[i]= [killerLocation[0]/scaleIndex, killerLocation[1]/scaleIndex
                      ,victimLocation[0]/scaleIndex, victimLocation[1]/scaleIndex]
    }  
    setOutputArray(extraarray);
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
                                                "border-bottom": `${ apiResponse.players[focusedPlayer] == undefined ?
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
                {
                  outputArray.map((location) => {
                    var currentOffset= []
                    var centerLineOffset = 5;
                      return(
                        <KillImage>
                          <SvgArrow height="540" width="540" style={{position: "absolute", left: 0, top: 0}}>
                            <Arrow points={`${location[0]+centerLineOffset+currentOffset[0]},
                                            ${location[1]+centerLineOffset+340+currentOffset[1]}
                                            ${location[2]+centerLineOffset+currentOffset[0]},
                                            ${location[3]+centerLineOffset+340+currentOffset[1]}`} style={{stroke: "#FFC000"}}></Arrow>
                          </SvgArrow>
                          <Killer style={{left : location[0]+currentOffset[0] , bottom: location[1]+340+currentOffset[1]}}></Killer>
                          <Victim style={{left : location[2]+currentOffset[0] , bottom: location[3]+340+currentOffset[1]}}></Victim>
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
  
                      smallStats.map((playerinfo) => {
                        return(
                          <SmallPlayerCard style={ playerinfo[1]=="blue" ? { "background-color": "#5B7A8C"} : { "background-color": "#9D312F"}}>
                            <SmallIcon src=""></SmallIcon>
                            <Name>{playerinfo[0]}</Name>
                            <Amount>{playerinfo[3]}</Amount>  
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
                      smallStats.map((playerinfo) => {
                        if(playerinfo[5] != 0){
                          return(
                            <SmallPlayerCard style={ playerinfo[1]=="blue" ? { "background-color": "#5B7A8C"} : { "background-color": "#9D312F"}}>
                              <SmallIcon src=""></SmallIcon>
                              <Name>{playerinfo[0]}</Name>
                              <Amount>{playerinfo[5]}</Amount>  
                            </SmallPlayerCard>
                          )
                        }
                      })
                    }
                </PlayersExtinguished>
                <BuildingCount>
                  <Label>BUILDING COUNT</Label>
                  {
                      smallStats.map((playerinfo) => {
                        if(playerinfo[6] != 0){
                          return(
                            <SmallPlayerCard style={ playerinfo[1]=="blue" ? { "background-color": "#5B7A8C"} : { "background-color": "#9D312F"}}>
                              <SmallIcon src=""></SmallIcon>
                              <Name>{playerinfo[0]}</Name>
                              <Amount>{playerinfo[6]}</Amount>  
                            </SmallPlayerCard>
                          )
                        }
                      })
                    }
                </BuildingCount>
                <Dominations>
                  <Label>MOST DOMINATIONS</Label>
                  {
                      smallStats.map((playerinfo) => {
                        if(playerinfo[7] >= 2){
                          return(
                            <SmallPlayerCard style={ playerinfo[1]=="blue" ? { "background-color": "#5B7A8C"} : { "background-color": "#9D312F"}}>
                              <SmallIcon src=""></SmallIcon>
                              <Name>{playerinfo[0]}</Name>
                              <Amount>{playerinfo[7]}</Amount>  
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
                      smallStats.map((playerinfo) => {
                        return(
                          <SmallPlayerCard style={ playerinfo[1]=="blue" ? { "background-color": "#5B7A8C"} : { "background-color": "#9D312F"}}>
                            <SmallIcon src=""></SmallIcon>
                            <Name>{playerinfo[0]}</Name>
                            <Amount>{playerinfo[4]}</Amount>  
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