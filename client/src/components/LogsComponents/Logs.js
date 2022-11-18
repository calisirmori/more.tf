import React, { useState } from 'react'
import { AmmoPickup, Amount, Arrow, Assists, BlueScore, BlueTeam, BuildingCount, BuildingsDestroyed, Class, ClassAgainst, ClassicLogs, ClassIcons, ClassImage, ClassTitle, Damage, DamageBar, DamageVersus, Deaths, DemosLink, Dominaions, Dominations, DPM, Duration, FunFacts, Individuals, InfoButtons, InfoSection, KDA, Killer, KillImage, KillMap, Kills, Label, LeftSideInfo, LogNumber, LogsLink, LogsPageWrapper, LogsScore, LogsSectionWrapper, Map, MapPlayed, MatchDate, MatchHeader, MatchLinks, MatchScore, MatchTitle, MoreLogs, Name, NameInfoTitle, PlayerCard, PlayerLogTitle, PlayerName, PlayersExtinguished, PlayerUsername, PlayerVsStats, RedScore, RedTeam, RightSideInfo, Score, SectionTitle, SmallButton, SmallHeaders, SmallIcon, SmallPlayerCard, Smalls, SmallStats, StatsWrapper, StatTitle, SvgArrow, Team, TeamName, TeamSection, UsernameTitle, Victim, VsStat } from './LogsStyles';
import { useEffect } from 'react';
import axios from 'axios';

const Logs = () => {

  const id = window.location.href;
  const idArray = id.split('/');
  const logInfo = idArray[4];

  const [listOfPlayers, setListOfPlayers] = useState([]);
  const [blueTeamScore, setBlueTeamScore] = useState(0);
  const [redTeamScore, setRedTeamScore] = useState(0);
  const [map, setMap] = useState("map");
  const [logTime, setLogTime] = useState();
  const [gameLength, setGameLength] = useState("");
  const [matchTitle, setMatchTitles] = useState("");
  const [localInput, setLocalInput] = useState([]);
  const [currentFocusName, setCurrentFocusName] = useState("");
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const [sortedDamage,setSortedDamage] =  useState([0,0,0,0,0,0,0,0,0])
  const [smallStats, setSmallStats] = useState([]);
  const [sumAmountsSmallStats, setSumAmountsSmallStats] = useState([]);
  var playersArray =[];

  useEffect(() => {
    axios.get(`https://logs.tf/api/v1/log/${logInfo}`).then((response) => {
        const players = [response.data.players];
        const gameData = [response.data]
        setBlueTeamScore(gameData[0].teams.Blue.score);
        setRedTeamScore(gameData[0].teams.Red.score);
        const gameEndTime = new Date(response.data.info.date*1000);
        setGameLength(Math.round((response.data.info.total_length)/60) + "mins")
        setMatchTitles(response.data.info.title);
        setLogTime(gameEndTime.toLocaleDateString("en-US", options) + " " +gameEndTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
        setMap(gameData[0].info.map);
        for(let i=0; i<Object.entries(players[0]).length ;i++){
          const currentPlayer = [
            Object.entries(Object.entries(players[0])[i][1])[0][1],
            Object.entries(players[0])[i][0],
            Object.entries(gameData[0].names)[i][1],
            Object.entries(Object.entries(players[0])[i][1])[1][1][0].type,
            Object.entries(Object.entries(players[0])[i][1])[2][1],
            Object.entries(Object.entries(players[0])[i][1])[4][1],
            Object.entries(Object.entries(players[0])[i][1])[3][1],
            Object.entries(Object.entries(players[0])[i][1])[8][1],
            Object.entries(Object.entries(players[0])[i][1])[16][1],
            Object.entries(Object.entries(players[0])[i][1])[6][1]
          ];
          classToIconUrl(currentPlayer);
          playersArray = ([...playersArray, currentPlayer])
        }
        playersArray.sort();
        setListOfPlayers(playersArray);
    });
    axios.get(`http://localhost:8080/logsplus/${logInfo}`).then((response) => {
      setLocalInput(Object.entries(response.data))
      var buildingfinder = Object.entries(response.data);
      var samplearray = [];
      var sumBlueBD = 0;
      var sumRedBD = 0;
      var sumBlueAP = 0;
      var sumRedAP = 0;
      //make this a big object with everyone
      for(var i = 0; i < buildingfinder.length; i++){
        if(buildingfinder[i][1].team == "blue" ){
          sumBlueAP += buildingfinder[i][1].ammopickup;
          sumBlueBD += buildingfinder[i][1].objectkills;
        } else {
          sumRedAP += buildingfinder[i][1].ammopickup;
          sumRedBD += buildingfinder[i][1].objectkills;
        }
        
        samplearray[i]= [nameFinder(buildingfinder[i][0]),
                          buildingfinder[i][1].team,
                          buildingfinder[i][1].class,
                          buildingfinder[i][1].objectkills,
                          buildingfinder[i][1].ammopickup,
                          buildingfinder[i][1].extinguished,
                          buildingfinder[i][1].objectbuilds,
                          buildingfinder[i][1].domination
                          ]
      }
      findTheDamageSpread(9);
      setSmallStats(samplearray);
      setSumAmountsSmallStats([sumBlueBD,sumBlueAP,sumRedBD,sumRedAP])
    });
    console.log("hey")
  }, [])

  function nameFinder(steamid){
    for(var i = 0; i < listOfPlayers.length; i++){
      if(steamid == listOfPlayers[i][1]){
        return listOfPlayers[i][2];
      }
    }
  }

  function findTheDamageSpread(inputId) {
    var currentDamageList = [];
    var array = [0,0,0,0,0,0,0,0,0];
      currentDamageList = Object.entries(localInput[inputId][1].damage);
      for(var i = 0; i < currentDamageList.length; i++){
        var maxLocation =0;
        var max=0;
        for(var j = 1; j < currentDamageList.length; j++){
          if (currentDamageList[j][1] >= max){
            array[i]=[currentDamageList[j][0],currentDamageList[j][1]];
            max = currentDamageList[j][1];
            maxLocation = j;
          }
        }
        currentDamageList[maxLocation][1]=-1;
      }
      setSortedDamage(array)
  }

  function changeDamageVs(inputNumber,inputName){
    var outputNumber =0;

    for( var i =0; i < localInput.length; i++){
      if(inputNumber == localInput[i][0]) outputNumber=i;
    };
    setCurrentFocusName(inputName)
    findTheDamageSpread(outputNumber);
    locationsToCordinates(localInput[outputNumber])
  }
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

  function classToIconUrl(currentPlayer) {
    switch (currentPlayer[3]) {
      case "scout":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png";
        break;
      case "soldier":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/9/96/Leaderboard_class_soldier.png";
        break;
      case "pyro":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/8/80/Leaderboard_class_pyro.png";
        break;
      case "demoman":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/4/47/Leaderboard_class_demoman.png";
        break;
      case "heavyweapons":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/5/5a/Leaderboard_class_heavy.png";
        break;
      case "engineer":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/1/12/Leaderboard_class_engineer.png";
        break;
      case "medic":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/e/e5/Leaderboard_class_medic.png";
        break;
      case "sniper":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/f/fe/Leaderboard_class_sniper.png";
        break;
      case "spy":
        currentPlayer[3] = "https://wiki.teamfortress.com/w/images/3/33/Leaderboard_class_spy.png";
        break;
      default:
        break;
    };
  };

  function DamageIconMaker(input) {
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

  function mapInfo() {
    var outputObject = {
      URL : "",
      xOffset : 0,
      yOffset : 0,
      scale: 17.8,
    }
    if(map.includes("swift")) {
      outputObject.URL = "https://i.imgur.com/EtCcpOA.png";
      outputObject.xOffset = 78;
      outputObject.yOffset = 16;
    } else if (map.includes("product")) {
      //
      outputObject.URL = "https://i.imgur.com/YoSSGDd.png";
      outputObject.xOffset = 352;
      outputObject.yOffset = -82;
    } else if (map.includes("vigil")) {
      //
      outputObject.URL = "https://i.imgur.com/g6NzUn1.png";
      outputObject.xOffset = 180;
      outputObject.yOffset = -160;
    } else if (map.includes("upward")) {
      //?
      outputObject.URL = "https://i.imgur.com/z8JJgT8.png";
      outputObject.xOffset = 262;
      outputObject.yOffset = -55;
    } else if (map.includes("proot")) {
      //
      outputObject.URL = "https://i.imgur.com/hRWgf6O.png";
      outputObject.xOffset = 270;
      outputObject.yOffset = -72;
    } else if (map.includes("ashville")) {
      //
      outputObject.URL = "https://i.imgur.com/1RW16HF.png";
      outputObject.xOffset = 258;
      outputObject.yOffset = -68;
    } else if (map.includes("steel")) {
      //
      outputObject.URL = "https://i.imgur.com/GBbqE7I.png";
      outputObject.xOffset = 255;
      outputObject.yOffset = -43;
    }
    return outputObject;
  }

  function sortByRow(row){
    var array = [...listOfPlayers];
    if(row === 0) {
      array.sort();
    } else {
      var index = 0;
      for (var i = 0; i < array.length-1; i++){
        var max = -1;
        for (var j = i; j < array.length; j++) {
          if( array[j][row] >= max ){
            max = array[j][row];
            index = j;
          }
        }
        var placeholder = array[index];
        array[index] = array[i];
        array[i] = placeholder;
      }
    }
    setListOfPlayers(array);
  }

  return (
    <LogsPageWrapper>
      <LogsSectionWrapper>
        <MatchHeader>
          <LeftSideInfo>
            <MatchTitle>{matchTitle}</MatchTitle>
            <MapPlayed>{map}</MapPlayed>
            <Duration>{gameLength}</Duration>
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
            <MatchDate>{logTime}</MatchDate>
            <MatchLinks>
              <LogsLink> logs.tf </LogsLink>
              <DemosLink> demos.tf </DemosLink>
            </MatchLinks>
          </RightSideInfo>
        </MatchHeader>
        <ClassicLogs>
          <PlayerLogTitle>
            <ClassTitle onClick={() =>{sortByRow(0)}} >Team</ClassTitle>
            <NameInfoTitle>
              <UsernameTitle>Username</UsernameTitle>
            </NameInfoTitle>
            <StatTitle class="no-click">Class</StatTitle>
            <StatTitle className="Kills" onClick={() =>{sortByRow(4)}}>Kills</StatTitle>
            <StatTitle className="Assists" onClick={() =>{sortByRow(5)}}>Assist</StatTitle>
            <StatTitle className="Deaths" onClick={() =>{sortByRow(6)}}>Death</StatTitle>
            <StatTitle className="Damage" onClick={() =>{sortByRow(7)}}>Damage</StatTitle>
            <StatTitle className="DPM" onClick={() =>{sortByRow(8)}}>DPM</StatTitle>
            <StatTitle className="KDA" onClick={() =>{sortByRow(9)}}>KDA</StatTitle>
          </PlayerLogTitle> 
          {listOfPlayers.map((player) => {
              return(
                <PlayerCard>
                  <Team className={player[0]}>{player[0]}</Team>
                  <PlayerUsername onClick={() =>{changeDamageVs(player[1],player[2])}}>{player[2]}</PlayerUsername>
                  <Class src={player[3]}></Class>
                  <Kills>{player[4]}</Kills>
                  <Assists>{player[5]}</Assists>
                  <Deaths >{player[6]}</Deaths>
                  <Damage>{player[7]}</Damage>
                  <DPM>{player[8]}</DPM>
                  <KDA>{player[9]}</KDA>
                </PlayerCard>
              );
          })}
        </ClassicLogs>
        <MoreLogs>
          <Individuals>
            <DamageVersus>
              <ClassImage src="https://w.namu.la/s/5f4d7e4da47265254d638e997fab91f8fdb3cc78c05d23cc115495075a68796f373ce51e3dcebd31a0d3bfe2fb271b8984e466b01bd54478135e5400fee71a35085b8daee97fe50a3f4fb8d4b214b2ea"></ClassImage>
              <PlayerVsStats>
                <Label>DAMAGE TO CLASS</Label>
                <InfoSection>
                  <PlayerName>{currentFocusName}</PlayerName>
                  <InfoButtons>
                    <SmallButton style={{background : "#BEBDBB"}}src="https://cdn.icon-icons.com/icons2/2248/PNG/512/steam_icon_135152.png"></SmallButton>
                    <SmallButton src="https://avatars.cloudflare.steamstatic.com/e8b64622d8d348f9d3761d51f1aed63233401b26_full.jpg"></SmallButton>
                    <SmallButton src="https://etf2l.org/wp-content/uploads/2018/07/2018_etf2l_short_nobackground_dark.png"></SmallButton>
                    <SmallButton src="https://pbs.twimg.com/profile_images/1128657074215432192/gOCZ-jLz_400x400.jpg"></SmallButton>
                  </InfoButtons>
                </InfoSection>
                <SectionTitle></SectionTitle>
                <StatsWrapper>
                  {sortedDamage.map((player) => {
                    var currentIndex = sortedDamage[0][1]/230;
                    if(sortedDamage[0][1]<230) currentIndex=1000/230;
                      return(
                        <VsStat>
                          <ClassAgainst src={DamageIconMaker(player[0])}></ClassAgainst>
                          <DamageBar style={{ width: (player[1]/currentIndex)}}>{player[1]}</DamageBar>
                        </VsStat>
                      );
                    })}
                </StatsWrapper>
              </PlayerVsStats>
            </DamageVersus>
            <KillMap>
              <Map src={mapInfo().URL}></Map>
              {
                outputArray.map((location) => {
                  var currentOffset= [mapInfo().xOffset,mapInfo().yOffset]
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
                          <SmallIcon src={DamageIconMaker(playerinfo[2])}></SmallIcon>
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
                            <SmallIcon src={DamageIconMaker(playerinfo[2])}></SmallIcon>
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
                            <SmallIcon src={DamageIconMaker(playerinfo[2])}></SmallIcon>
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
                            <SmallIcon src={DamageIconMaker(playerinfo[2])}></SmallIcon>
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
                          <SmallIcon src={DamageIconMaker(playerinfo[2])}></SmallIcon>
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

export default Logs;