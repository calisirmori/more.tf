import React, { useState } from 'react'
import { AmmoPickup, Arrow, Assists, BlueScore, BuildingCount, BuildingsDestroyed, Class, ClassAgainst, ClassicLogs, ClassImage, ClassTitle, Damage, DamageBar, DamageVersus, Deaths, DemosLink, Dominaions, DPM, Duration, FunFacts, Individuals, InfoButtons, InfoSection, KDA, Killer, KillImage, KillMap, Kills, LeftSideInfo, LogNumber, LogsLink, LogsPageWrapper, LogsScore, LogsSectionWrapper, Map, MapPlayed, MatchDate, MatchHeader, MatchLinks, MatchScore, MatchTitle, MoreLogs, NameInfoTitle, PlayerCard, PlayerLogTitle, PlayerName, PlayersExtinguished, PlayerUsername, PlayerVsStats, RedScore, RightSideInfo, Score, SectionTitle, SmallButton, Smalls, StatsWrapper, StatTitle, SvgArrow, Team, TeamName, UsernameTitle, Victim, VsStat } from './LogsStyles';
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
      findTheDamageSpread(9);
    });
  }, [])
  
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
      const scaleIndex = 19;
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
              <Map src="https://wiki.teamfortress.com/w/images/thumb/c/c5/Swiftwater_overview.png/800px-Swiftwater_overview.png"></Map>
              {
                outputArray.map((location) => {
                  var offesIndex = -0;
                  var currentOffset= [168,11]
                  console.log(location[2]-location[0],location[3]-location[1] ,location[3], location[2] )
                    return(
                      <KillImage>
                        <SvgArrow height="600" width="600" style={{position: "absolute", left: offesIndex, top: offesIndex}}>
                          <Arrow points={`${location[0]+Math.abs(offesIndex)+4+currentOffset[0]},${location[1]+Math.abs(offesIndex)+4+400+currentOffset[1]} ${location[2]+Math.abs(offesIndex)+4+currentOffset[0]},${location[3]+Math.abs(offesIndex)+4+400+currentOffset[1]}`} style={{stroke: "#FFC000"}}></Arrow>
                        </SvgArrow>
                        <Killer style={{left : location[0]+167.5 , bottom: location[1]+351}}></Killer>
                        <Victim style={{left : location[2]+167.5 , bottom: location[3]+351}}></Victim>
                      </KillImage>
                    );
                })}
            </KillMap>
          </Individuals>
          <FunFacts>
            <BuildingsDestroyed></BuildingsDestroyed>
            <Smalls>
              <PlayersExtinguished></PlayersExtinguished>
              <BuildingCount></BuildingCount>
              <Dominaions></Dominaions>
            </Smalls>
            <AmmoPickup></AmmoPickup>
          </FunFacts>
        </MoreLogs>
      </LogsSectionWrapper>
    </LogsPageWrapper>
  )
}

export default Logs;