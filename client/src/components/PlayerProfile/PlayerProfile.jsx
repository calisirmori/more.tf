import { fetch, FetchResultTypes } from '@sapphire/fetch';
import React, { useEffect, useState } from 'react'
import { CheckBox, ClassPlayed, ColorBox, Damage, DateAndID, Format, FormatFooter, FormatHeader, FormatPercentage, FormatText, FormatWrapper, GameDate, KDA, LogInfo, LogsHeader, LogsList, MapPlayed, MatchDate, MatchFormat, MatchID, MatchId, MatchInfo, MatchLogCard, MatchTitle, MathMap, MostRecentMatch, PageBox, PageNumber, PercentageBar, PlayerFunFact, PlayerInfo, PlayerLink, PlayerLinks, PlayerMatchLogs, PlayerProfileWrapper, PlayerStats, Profile, ProfilePicture, ProfileSections, Score, ScoreInfo, SectionHeader, StatHeader, StatInfo, StatWrapper, SteamInfo, Username } from './PlayerProfileStyles';

const PlayerProfile = () => {
    const id = window.location.href;
    const idArray = id.split('/');
    const playerId = idArray[4];
    const [apiResponse, setApiResponse] = useState({});
    const [playerResponse, setPlayerResponse] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [currentLogs, setCurrentLogs] = useState([]);
    const [lastMatchWon, setLastMatchWon] = useState(true);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const [lastLogResponse, setLastLogResponse] = useState({});
    const [formatObject, setFormatObject] = useState({});
    const playerID3 = "[U:1:" + (1198068401396-1197960265728) + "]";

    

    useEffect(() => {
        try {
            const lastLogId = apiResponse.logs[0].id
            const currentResponse = apiResponse;
            setCurrentLogs(currentResponse.logs.slice(currentPage*25, currentPage*25+25))
            logstfApiCall(lastLogId);
        } catch (error) {
            console.log("not yet")
        }
        
    }, [apiResponse,currentPage])

    useEffect(() => {
        apiCall();
    }, [])

    let format = {
        total: 0,
        hl : 0,
        sixes : 0,
        fours: 0,
        UandBBAL : 0,
    }

    async function apiCall(map, players){
        let response = await fetch(`https://logs.tf/api/v1/log?player=${playerId}&limit=10000`, FetchResultTypes.JSON);
        let playerProfile = await fetch(`https://more.tf/api/steamid/${playerId}`, FetchResultTypes.JSON);
        console.log(playerProfile.response.players[0])
        format = {
            total: 0,
            hl : 0,
            sixes : 0,
            fours: 0,
            UandBBAL : 0,
        }

        response.logs.map((log)=>{
            if (log.players > 3 && log.players < 6){
                format.UandBBAL++;
                format.total++;
            } else if (log.players >= 6 && log.players < 11){
                format.fours++;
                format.total++;
            } else if (log.players >= 11 && log.players <15){
                format.sixes++;
                format.total++;
            } else if (log.players >= 15 && log.players <22){
                format.hl++;
                format.total++;
            } 
        })
        setPlayerResponse(playerProfile.response.players[0]);
        setFormatObject(format);
        setApiResponse(response);
    }
    
    async function logstfApiCall(matchId){
        const logsApiResponse = await fetch(
            `https://logs.tf/api/v1/log/${matchId}`,
            FetchResultTypes.JSON
        );

        try {
            if(lastLogResponse.teams.Blue.score > lastLogResponse.teams.Red.score && lastLogResponse.players[playerID3].team === "Blue"){
                setLastMatchWon(true);
            } else if (lastLogResponse.teams.Red.score > lastLogResponse.teams.Blue.score && lastLogResponse.players[playerID3].team === "Red"){
                setLastMatchWon(true);
            } else {
                setLastMatchWon(false);
            }
        } catch (error) {
            
        }

        setLastLogResponse(logsApiResponse)
    }
    function formatFinder(players){
        if (players > 3 && players < 6){
            return ("U/B");
        } else if (players >= 6 && players < 11){
            return ("4s");
        } else if (players >= 11 && players <15){
            return ("6s");
        } else if (players >= 15 && players <22){
            return ("HL");
        } else {
            return ("?");
        }
    }

    function DamageIconMaker(input,team) {
        switch (input) {
          case "scout":
           return "https://wiki.teamfortress.com/w/images/a/ad/Leaderboard_class_scout.png";
      
          case "soldier":
           return "https://wiki.teamfortress.com/w/images/9/96/Leaderboard_class_soldier.png";
      
          case "pyro":
           return "https://wiki.teamfortress.com/w/images/8/80/Leaderboard_class_pyro.png";
      
          case "demoman":
           return "https://wiki.teamfortress.com/w/images/4/47/Leaderboard_class_demoman.png";
      
          case "heavyweapons":
           return "https://wiki.teamfortress.com/w/images/5/5a/Leaderboard_class_heavy.png";
      
          case "engineer":
           return "https://wiki.teamfortress.com/w/images/1/12/Leaderboard_class_engineer.png";
      
          case "medic":
           return "https://wiki.teamfortress.com/w/images/e/e5/Leaderboard_class_medic.png";
      
          case "sniper":
            return "https://wiki.teamfortress.com/w/images/f/fe/Leaderboard_class_sniper.png";
      
          case "spy":
            return "https://wiki.teamfortress.com/w/images/3/33/Leaderboard_class_spy.png";
        };
    };
    let current = 0;
    if(lastLogResponse.players !== undefined){
        return (
            <PlayerProfileWrapper>
                <ProfileSections>
                    <PlayerInfo>
                        <Profile>
                            <SteamInfo>
                                <ProfilePicture src={playerResponse.avatarfull}></ProfilePicture>
                                <Username>{playerResponse.personaname}</Username>
                            </SteamInfo>
                            <PlayerLinks>
                                <PlayerLink href={`https://steamcommunity.com/profiles/${playerId}`} target="_blank">STEAM</PlayerLink>
                                <PlayerLink href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${playerId}`} target="_blank">RGL</PlayerLink>
                                <PlayerLink href={`http://www.ugcleague.com/players_page.cfm?player_id=${playerId}`} target="_blank">UGC</PlayerLink>
                                <PlayerLink href={`http://etf2l.org/search/${playerId}`} target="_blank">ETF2L</PlayerLink>
                                <PlayerLink href={`https://ozfortress.com/users?utf8=✓&q=${playerId}&button=`} target="_blank">OZ</PlayerLink>
                            </PlayerLinks>
                            <PlayerFunFact>
                                <LogInfo>
                                    <StatWrapper>
                                        <StatHeader>Last Match</StatHeader>
                                        <StatInfo>{(new Date(lastLogResponse.info.date * 1000)).toLocaleDateString('en-US')}</StatInfo>
                                    </StatWrapper>
                                    <StatWrapper>
                                        <StatHeader>First Match</StatHeader>
                                        <StatInfo>{(new Date(apiResponse.logs[apiResponse.logs.length-1].date*1000)).toLocaleDateString('en-US')}</StatInfo>
                                    </StatWrapper>
                                    <StatWrapper>
                                        <StatHeader>Total Matches</StatHeader>
                                        <StatInfo>{apiResponse.logs.length}</StatInfo>
                                    </StatWrapper>
                                </LogInfo>
                            </PlayerFunFact>
                        </Profile>
                        <FormatPercentage>
                            <FormatHeader>FORMATS PLAYED</FormatHeader>
                            <PercentageBar style={{gridTemplateColumns: `${(formatObject.sixes/formatObject.total)*450}px ${(formatObject.hl/formatObject.total)*450}px ${(formatObject.fours/formatObject.total)*450}px ${(formatObject.UandBBAL/formatObject.total)*450}px`}}>
                                <Format style={{background: "#8650AC"}}>{Math.round(formatObject.sixes/formatObject.total*100)+"%"}</Format>
                                <Format style={{background: "#4D7455"}}>{Math.round(formatObject.hl/formatObject.total*100) > 10 ? Math.round(formatObject.hl/formatObject.total*100)+"%" : ""}</Format>
                                <Format style={{background: "#476291"}}>{Math.round(formatObject.fours/formatObject.total*100) > 10 ? Math.round(formatObject.fours/formatObject.total*100)+"%" : ""}</Format>
                                <Format style={{background: "#BD3B3B"}}>{Math.round(formatObject.UandBBAL/formatObject.total*100) > 10 ? Math.round(formatObject.UandBBAL/formatObject.total*100)+"%" : ""}</Format>
                            </PercentageBar>
                            <FormatFooter>
                                <FormatWrapper>
                                    <ColorBox style={{background: "#8650AC"}}></ColorBox>
                                    <FormatText> 6s </FormatText>
                                </FormatWrapper>
                                <FormatWrapper>
                                    <ColorBox style={{background: "#4D7455"}}></ColorBox>
                                    <FormatText> HL</FormatText>
                                </FormatWrapper>
                                <FormatWrapper>
                                    <ColorBox  style={{background: "#476291"}}></ColorBox>
                                    <FormatText> 4s </FormatText>
                                </FormatWrapper>
                                <FormatWrapper>
                                    <ColorBox  style={{background: "#BD3B3B"}}></ColorBox>
                                    <FormatText>Ultiduo/BBAL</FormatText>
                                </FormatWrapper>
                            </FormatFooter>
                        </FormatPercentage>
                        <MostRecentMatch style={lastMatchWon === true ? {borderBottom: "5px solid green"}:{borderBottom: "5px solid red"}}>
                            <SectionHeader>LAST MATCH PLAYED</SectionHeader>
                            <MatchInfo>
                                <ClassPlayed src={DamageIconMaker(lastLogResponse.players[playerID3].class_stats[0].type)}></ClassPlayed>
                                <ScoreInfo>
                                    <Score>{`${lastLogResponse.teams.Blue.score} - ${lastLogResponse.teams.Red.score}`}</Score>
                                    <MapPlayed>{lastLogResponse.info.map}</MapPlayed>
                                </ScoreInfo>
                                <DateAndID>
                                    <MatchID>{"#"+apiResponse.logs[0].id}</MatchID>
                                    <GameDate>{(new Date(lastLogResponse.info.date * 1000)).toLocaleDateString('en-US')}</GameDate>
                                </DateAndID>
                            </MatchInfo>
                            <PlayerStats>
                                <KDA tooltip="Kills/Deaths/Assists">{`${lastLogResponse.players[playerID3].kills} / ${lastLogResponse.players[playerID3].deaths} / ${lastLogResponse.players[playerID3].assists} `}</KDA>
                                <Damage tooltip="damage | dpm">{`${lastLogResponse.players[playerID3].dmg} | ${lastLogResponse.players[playerID3].dapm} `}</Damage>
                            </PlayerStats>
                        </MostRecentMatch>
                    </PlayerInfo>
                    <PlayerMatchLogs>
                        <LogsHeader></LogsHeader>
                        <LogsList>
                            {currentLogs.map((log)=>{
                                return(
                                    <MatchLogCard to={`/log/${log.id}`} style={current++ % 2 === 1 ? {background: "#1f1f1f"}: {}}>
                                        <CheckBox>x</CheckBox>
                                        <MatchId>{log.id}</MatchId>
                                        <MatchTitle>{log.title}</MatchTitle>
                                        <MathMap>{log.map}</MathMap>
                                        <MatchFormat>{formatFinder(log.players)}</MatchFormat>
                                        <MatchDate>{`${(new Date(log.date * 1000)).toLocaleString("en-US").split(",").splice(0,1) + " " + (new Date(log.date * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</MatchDate>
                                    </MatchLogCard>
                                )
                            })}
                        </LogsList>
                        <PageNumber>
                            {currentPage > 2 && <PageBox onClick ={()=>{setCurrentPage(0)}}>{1}</PageBox>}
                            {currentPage > 2 && <PageBox>{`...`}</PageBox>}
                            {currentPage > 1 && <PageBox onClick ={()=>{setCurrentPage(currentPage-2)}}>{currentPage-1}</PageBox>}
                            {currentPage > 0 && <PageBox onClick ={()=>{setCurrentPage(currentPage-1)}}>{currentPage}</PageBox>}
                            {currentPage >= 0 && <PageBox onClick ={()=>{setCurrentPage(currentPage)}}>{currentPage+1}</PageBox>}
                            {(currentPage >= 0 && currentPage < Math.floor(apiResponse.logs.length/25)-1) && <PageBox onClick ={()=>{setCurrentPage(currentPage+1)}}>{currentPage + 2}</PageBox>}
                            {(currentPage >= 0 && currentPage < Math.floor(apiResponse.logs.length/25)-2) && <PageBox onClick ={()=>{setCurrentPage(currentPage+2)}}>{currentPage + 3}</PageBox>}
                            {(currentPage >= 0 && currentPage < Math.floor(apiResponse.logs.length/25)-3) && <PageBox style={{cursor: "default"}}>...</PageBox>}
                            {(currentPage >= 0 && currentPage < Math.floor(apiResponse.logs.length/25)) && <PageBox onClick ={()=>{setCurrentPage(Math.floor(apiResponse.logs.length/25))}}>{Math.floor(apiResponse.logs.length/25)+1}</PageBox>}
                        </PageNumber>
                    </PlayerMatchLogs>
                </ProfileSections>
            </PlayerProfileWrapper>
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

export default PlayerProfile;