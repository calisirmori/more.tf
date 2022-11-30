import React, { useEffect, useState } from 'react'
import { Card, ClassSelect, ClassTab, Division, DivisionSelect, Info, Medal, MedalHeader, MedalImage, PlayerCards, PlayerName, PlayerNameCard, PlayerTeam, SeasonHeader, SummaryPage, SummaryTable, SummaryWrapper, Team, TopStatMedals, Username } from './SeasonSummaryStyles';
import axios from 'axios';
import {FaSort} from 'react-icons/fa'

const SeasonSummary = () => {
    const [divisionChoice, setDivisionChoice] = useState("invite")
    const [classChoice, setClassChoice] = useState("scout")
    const [apiResponse, setApiResponse] = useState()
    const [displayArray, setDisplayArray] = useState([])
    const [currentSort, setCurrentSort] = useState("teamPlacement")

    useEffect(() => {
        async function apiCall(){
            setApiResponse(await axios.get(`http://localhost:8080/api/season-13-summary`))
            console.log("apicalss")
        }
        apiCall()
    }, [])
    
    useEffect(() => {
        let currentArray= [];
        try {
            apiResponse.data[divisionChoice].map((playerInfo)=>{
                if(Object.entries(playerInfo)[0][1].classPlayed === classChoice && Object.entries(playerInfo)[0][1].gamesPlayed > 3 ){
                    currentArray.push(Object.entries(playerInfo)[0][1])
                    
                }
            })
        } catch (error) {
            
        }
        
        let sortedArray = [];
        if(currentSort === "teamPlacement"){
            try {
                let length = currentArray.length;
                for (let index = 0; index < length; index++) {
                    let currentIndex = 0;
                    let min = Number.MAX_SAFE_INTEGER;
                    for (let searchIndex = 0; searchIndex < currentArray.length; searchIndex++) {
                        if (currentArray[searchIndex][currentSort] <= min) {
                            min = currentArray[searchIndex][currentSort];
                            currentIndex = searchIndex;
                        }
                    }
                    sortedArray.push(currentArray[currentIndex]);
                    currentArray.splice(currentIndex, 1);
                }
            } catch (error) {
            }
        } else if (currentSort === "kd"){
            try {
                let length = currentArray.length;
                for (let index = 0; index < length; index++) {
                    let currentIndex = 0;
                    let max = Number.MIN_SAFE_INTEGER;
                    for (let searchIndex = 0; searchIndex < currentArray.length; searchIndex++) {
                        if (currentArray[searchIndex].kills/currentArray[searchIndex].deaths >=max) {
                            max = currentArray[searchIndex].kills/currentArray[searchIndex].deaths;
                            currentIndex = searchIndex;
                        }
                    }
                    sortedArray.push(currentArray[currentIndex]);
                    currentArray.splice(currentIndex, 1);
                }
            } catch (error) {
            }
        }else if (currentSort === "gamesPlayed"){
            try {
                let length = currentArray.length;
                for (let index = 0; index < length; index++) {
                    let currentIndex = 0;
                    let max = Number.MIN_SAFE_INTEGER;
                    for (let searchIndex = 0; searchIndex < currentArray.length; searchIndex++) {
                        if (currentArray[searchIndex].gamesPlayed >=max) {
                            max = currentArray[searchIndex].gamesPlayed;
                            currentIndex = searchIndex;
                        }
                    }
                    sortedArray.push(currentArray[currentIndex]);
                    currentArray.splice(currentIndex, 1);
                }
            } catch (error) {
            }
        }else {
            try {
                let length = currentArray.length;
                for (let index = 0; index < length; index++) {
                    let currentIndex = 0;
                    let max = Number.MIN_SAFE_INTEGER;
                    for (let searchIndex = 0; searchIndex < currentArray.length; searchIndex++) {
                        if (currentArray[searchIndex][currentSort]/currentArray[searchIndex].gamesPlayed >=max) {
                            max = currentArray[searchIndex][currentSort]/currentArray[searchIndex].gamesPlayed;
                            currentIndex = searchIndex;
                        }
                    }
                    sortedArray.push(currentArray[currentIndex]);
                    currentArray.splice(currentIndex, 1);
                }
            } catch (error) {
            }
        }
        setDisplayArray(sortedArray);
        
    }, [classChoice,divisionChoice,apiResponse,currentSort])
    

    function divisionStyleObject(input){
        return( input === divisionChoice ? {background: "#f08149", color: "#121111", "fontWeight" : "800"} : {});
    }
    function classStyleObject(input){
        return( input === classChoice ? {background: "#f08149", color: "#121111", "fontWeight" : "800"} : {});
    }

    return (
    <>
        <SummaryPage>
            <SummaryWrapper>
                <SeasonHeader>RGL HIGHLANDER SEASON 13</SeasonHeader>
                <SummaryTable>
                    <DivisionSelect>
                        <Division style={divisionStyleObject("invite")} onClick={() => {setDivisionChoice("invite")}}>Invite</Division>
                        <Division style={divisionStyleObject("advanced")} onClick={() => {setDivisionChoice("advanced")}}>Advanced</Division>
                        <Division style={divisionStyleObject("main")} onClick={() => {setDivisionChoice("main")}}>Main</Division>
                        <Division style={divisionStyleObject("intermediate")} onClick={() => {setDivisionChoice("intermediate")}}>Intermediate</Division>
                    </DivisionSelect>
                    <ClassSelect>
                        <ClassTab style={classStyleObject("scout")} onClick={() => {setClassChoice("scout")}}>Scout</ClassTab>
                        <ClassTab style={classStyleObject("soldier")} onClick={() => {setClassChoice("soldier")}}>Soldier</ClassTab>
                        <ClassTab style={classStyleObject("pyro")} onClick={() => {setClassChoice("pyro")}}>Pyro</ClassTab>
                        <ClassTab style={classStyleObject("demoman")} onClick={() => {setClassChoice("demoman")}}>Demoman</ClassTab>
                        <ClassTab style={classStyleObject("heavyweapons")} onClick={() => {setClassChoice("heavyweapons")}}>Heavy</ClassTab>
                        <ClassTab style={classStyleObject("engineer")} onClick={() => {setClassChoice("engineer")}}>Engineer</ClassTab>
                        <ClassTab style={classStyleObject("medic")} onClick={() => {setClassChoice("medic")}}>Medic</ClassTab>
                        <ClassTab style={classStyleObject("sniper")} onClick={() => {setClassChoice("sniper")}}>Sniper</ClassTab>
                        <ClassTab style={classStyleObject("spy")} onClick={() => {setClassChoice("spy")}}>Spy</ClassTab>
                    </ClassSelect>
                    <PlayerCards>
                        <Card style={{background: "#f08149"}} >
                            <PlayerNameCard style={{color: "#000" , marginTop : "8px", fontWeight: 500}} >PLAYERINFO</PlayerNameCard>
                            <Info onClick = {() => {setCurrentSort("kills")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "kills" ? 800 : 500}`}}>KILLS</Info>
                            <Info onClick = {() => {setCurrentSort("assists")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "assists" ? 800 : 500}`}}>ASSIST</Info>
                            <Info onClick = {() => {setCurrentSort("deaths")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "deaths" ? 800 : 500}`}}>DEATH</Info>
                            <Info onClick = {() => {setCurrentSort("damage")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "damage" ? 800 : 500}`}}>DPM</Info>
                            <Info onClick = {() => {setCurrentSort("kd")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "kd" ? 800 : 500}`}}>KD</Info>
                            <Info onClick = {() => {setCurrentSort("damageTaken")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "damageTaken" ? 800 : 500}`}}>DTM</Info>
                            <Info onClick = {() => {setCurrentSort("medkits")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "medkits" ? 800 : 500}`}}>HP</Info>
                            <Info onClick = {() => {setCurrentSort("gamesPlayed")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "gamesPlayed" ? 800 : 500}`}}>PLAYED</Info>
                            <Info onClick = {() => {setCurrentSort("teamPlacement")}} style={{color: "#000" , cursor: "pointer" , fontWeight: `${currentSort === "teamPlacement" ? 800 : 500}`}}>SPOT</Info>
                        </Card>
                        {displayArray.map((player) =>{
                            return(
                                <Card>
                                    <PlayerNameCard>
                                        <Username  href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${player.playerID64}`} target="_blank">{player.playerUserName}</Username>
                                        <Team>{player.team}</Team>
                                    </PlayerNameCard>
                                    <Info>{Math.ceil(player.kills/player.gamesPlayed)}</Info>
                                    <Info>{Math.ceil(player.assists/player.gamesPlayed)}</Info>
                                    <Info>{Math.round(player.deaths/player.gamesPlayed)}</Info>
                                    <Info>{Math.ceil(player.damage/player.gamesPlayed)}</Info>
                                    <Info>{(player.kills/player.deaths).toFixed(2)}</Info>
                                    <Info>{Math.ceil(player.damageTaken/player.gamesPlayed)}</Info>
                                    <Info>{Math.ceil(player.medkits/player.gamesPlayed)}</Info>
                                    <Info>{player.gamesPlayed}</Info>
                                    <Info>{player.teamPlacement}</Info>
                                </Card>
                            )
                        })}
                        
                    </PlayerCards>
                </SummaryTable>
                <TopStatMedals>
                    <Medal>
                        <MedalHeader>KILLS</MedalHeader>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kills[0]}`}</PlayerTeam>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kills[1]}`}</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>DEATHS</MedalHeader>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].deaths[0]}`}</PlayerTeam>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].deaths[1]}`}</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>DPM</MedalHeader>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dpm[0]}`}</PlayerTeam>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dpm[1]}`}</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>KD</MedalHeader>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kd[0]}`}</PlayerTeam>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kd[1]}`}</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>DAMAGE TAKEN</MedalHeader>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dtm[0]}`}</PlayerTeam>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dtm[1]}`}</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>HEALS</MedalHeader>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].heals[0]}`}</PlayerTeam>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].heals[1]}`}</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>HEADSHOT</MedalHeader>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].headshots[0]}`}</PlayerTeam>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].headshots[1]}`}</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                </TopStatMedals>
            </SummaryWrapper>
        </SummaryPage>
    </>
  )
}

export default SeasonSummary;


