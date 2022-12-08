import { fetch, FetchResultTypes } from '@sapphire/fetch';
import React, { useEffect, useState } from 'react'
import { CheckBox, ClassPlayed, ColorBox, Damage, DateAndID, Format, FormatFooter, FormatHeader, FormatPercentage, FormatText, FormatWrapper, GameDate, KDA, LogInfo, LogsHeader, LogsList, MapPlayed, MatchDate, MatchFormat, MatchID, MatchId, MatchInfo, MatchLogCard, MatchTitle, MathMap, MostRecentMatch, PercentageBar, PlayerFunFact, PlayerInfo, PlayerLink, PlayerLinks, PlayerMatchLogs, PlayerProfileWrapper, PlayerStats, Profile, ProfilePicture, ProfileSections, Score, ScoreInfo, SectionHeader, StatHeader, StatInfo, StatWrapper, SteamInfo, Username } from './PlayerProfileStyles';

const PlayerProfile = () => {
    const [apiResponse, setApiResponse] = useState({});
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
            let logsArray= apiResponse.logs.splice(currentPage, 25);
            setCurrentLogs(logsArray)
            logstfApiCall(lastLogId);
        } catch (error) {
            console.log("not yet")
        }
        
    }, [apiResponse])

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
        let response = await fetch(`https://logs.tf/api/v1/log?player=76561198068401396&limit=10000`, FetchResultTypes.JSON);
        
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
                                <ProfilePicture src="https://avatars.akamai.steamstatic.com/0462901bf034ef06615019cdb2bbfc9bc747b256_full.jpg"></ProfilePicture>
                                <Username>mori</Username>
                            </SteamInfo>
                            <PlayerLinks>
                                <PlayerLink href="google.com" target="_blank">STEAM</PlayerLink>
                                <PlayerLink href="google.com" target="_blank">RGL</PlayerLink>
                                <PlayerLink href="google.com" target="_blank">UGC</PlayerLink>
                                <PlayerLink href="google.com" target="_blank">ETF2L</PlayerLink>
                                <PlayerLink href="google.com" target="_blank">OZ</PlayerLink>
                            </PlayerLinks>
                            <PlayerFunFact>
                                <LogInfo>
                                    <StatWrapper>
                                        <StatHeader>Last Match</StatHeader>
                                        <StatInfo>01/04/2120</StatInfo>
                                    </StatWrapper>
                                    <StatWrapper>
                                        <StatHeader>First Match</StatHeader>
                                        <StatInfo>01/04/2120</StatInfo>
                                    </StatWrapper>
                                    <StatWrapper>
                                        <StatHeader>Total Matches</StatHeader>
                                        <StatInfo>3215</StatInfo>
                                    </StatWrapper>
                                </LogInfo>
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
                                    <FormatHeader>MEDALS</FormatHeader>
                                    
                                </FormatPercentage>
                            </PlayerFunFact>
                        </Profile>
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
                                        <MatchDate>{`${(new Date(log.date * 1000)).toLocaleString("en-US", options).split(",").splice(1,2) + " " + (new Date(log.date * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</MatchDate>
                                    </MatchLogCard>
                                )
                            })}
                        </LogsList>
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