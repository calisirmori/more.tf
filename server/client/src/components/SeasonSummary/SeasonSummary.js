import React, { useEffect, useState } from 'react'
import { Card, ClassSelect, ClassTab, Division, DivisionSelect, Info, Medal, MedalHeader, MedalImage, MedalInfo, PlayerCards, PlayerName, PlayerNameCard, PlayerTeam, SeasonDisclaimer, SeasonHeader, SummaryPage, SummaryTable, SummaryWrapper, Team, TopStatMedals, Username } from './SeasonSummaryStyles';
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
            setApiResponse(await axios.get(`http://localhost:3000/api/season-13-summary`))
            console.log("apicalss")
        }
        apiCall()
    }, [])
    
    useEffect(() => {
        let currentArray= [];
        try {
            apiResponse.data[divisionChoice].map((playerInfo)=>{
                if(Object.entries(playerInfo)[0][1].classPlayed === classChoice && Object.entries(playerInfo)[0][1].gamesPlayed > 3  && Object.entries(playerInfo)[0][1].teamPlacement > 0 && Object.entries(playerInfo)[0][1].teamPlacement < 9){
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
                        if (currentArray[searchIndex][currentSort]/currentArray[searchIndex].totalTime/60 >=max) {
                            max = currentArray[searchIndex][currentSort]/currentArray[searchIndex].totalTime/60;
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
                        <ClassTab style={classStyleObject("spy") } onClick={() => {setClassChoice("spy")}}>Spy</ClassTab>
                    </ClassSelect>
                    <PlayerCards>
                        <Card style={{background: "#f08149"}} >
                            <PlayerNameCard style={{color: "#000" , marginTop : "8px", fontWeight: 500}} >PLAYERINFO</PlayerNameCard>
                            <Info onClick = {() => {setCurrentSort("kills")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "kills" ? 800 : 500}`}}>Kill/m</Info>
                            <Info onClick = {() => {setCurrentSort("assists")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "assists" ? 800 : 500}`}}>Assist/m</Info>
                            <Info onClick = {() => {setCurrentSort("deaths")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "deaths" ? 800 : 500}`}}>Death/m</Info>
                            <Info onClick = {() => {setCurrentSort("damage")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "damage" ? 800 : 500}`}}>Dmg/m</Info>
                            <Info onClick = {() => {setCurrentSort("kd")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "kd" ? 800 : 500}`}}>KD</Info>
                            <Info onClick = {() => {setCurrentSort("damageTaken")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "damageTaken" ? 800 : 500}`}}>DmgT/m</Info>
                            {classChoice === "medic" &&
                                <Info onClick = {() => {setCurrentSort("heal")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "heal" ? 800 : 500}`}}>Heal/m</Info>
                            }
                            {classChoice === "sniper" &&
                                <Info onClick = {() => {setCurrentSort("headshots")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "headshots" ? 800 : 500}`}}>hs/m</Info>
                            }
                            {classChoice === "spy" &&
                                <Info onClick = {() => {setCurrentSort("backstabs")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "backstabs"? 800 : 500}`}}>bs/m</Info>
                            }
                            {(classChoice !== "medic" && classChoice !== "spy" && classChoice !== "sniper") &&
                                <Info onClick = {() => {setCurrentSort("medkits")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "medkits" ? 800 : 500}`}}>Medkits</Info>
                            }
                            <Info onClick = {() => {setCurrentSort("gamesPlayed")}} style={{color: "#000" , cursor: "pointer", fontWeight: `${currentSort === "gamesPlayed" ? 800 : 500}`}}>Games</Info>
                            <Info onClick = {() => {setCurrentSort("teamPlacement")}} style={{color: "#000" , cursor: "pointer" , fontWeight: `${currentSort === "teamPlacement" ? 800 : 500}`}}>Placement</Info>
                        </Card>
                        {displayArray.map((player) =>{
                            return(
                                <Card>
                                    <PlayerNameCard>
                                        <Username  href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${player.playerID64}`} target="_blank">{player.playerUserName}</Username>
                                        <Team>{player.team}</Team>
                                    </PlayerNameCard>
                                    <Info>{(player.kills/(player.totalTime/60)).toFixed(2)}</Info>
                                    <Info>{(player.assists/(player.totalTime/60)).toFixed(2)}</Info>
                                    <Info>{(player.deaths/(player.totalTime/60)).toFixed(2)}</Info>
                                    <Info>{Math.ceil(player.damage/(player.totalTime/60))}</Info>
                                    <Info>{(player.kills/player.deaths).toFixed(2)}</Info>
                                    <Info>{Math.ceil(player.damageTaken/(player.totalTime/60))}</Info>
                                    {classChoice === "medic" &&
                                    <Info>{(player.heal/(player.totalTime/60)).toFixed(2)}</Info>
                                    }
                                    {classChoice === "sniper" &&
                                    <Info>{(player.headshots/(player.totalTime/60)).toFixed(2)}</Info>
                                    }
                                    {classChoice === "spy" &&
                                    <Info>{(player.backstabs/(player.totalTime/60)).toFixed(2)}</Info>
                                    }
                                    {(classChoice !== "medic" && classChoice !== "spy" && classChoice !== "sniper")&&
                                    <Info>{(player.medkits/(player.totalTime/60)).toFixed(2)}</Info>
                                    }
                                    <Info>{player.gamesPlayed}</Info>
                                    <Info>{player.teamPlacement}</Info>
                                </Card>
                            )
                        })}
                        
                    </PlayerCards>
                </SummaryTable>
                <TopStatMedals>
                    <Medal>
                        <MedalHeader>KILLS/m</MedalHeader>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kills[1]}`}</PlayerName>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kills[0]}`}</PlayerTeam>
                        <MedalInfo> Most kills per minute in the division</MedalInfo>
                    </Medal>
                    <Medal>
                        <MedalHeader>DEATHS/m</MedalHeader>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].deaths[1]}`}</PlayerName>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].deaths[0]}`}</PlayerTeam>
                        <MedalInfo> Least deaths per minute in the division</MedalInfo>
                    </Medal>
                    <Medal>
                        <MedalHeader>DAMAGE/m</MedalHeader>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dpm[1]}`}</PlayerName>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dpm[0]}`}</PlayerTeam>
                        <MedalInfo> Most damage dealt per minute in the division</MedalInfo>
                    </Medal>
                    <Medal>
                        <MedalHeader>KILL/DEATH</MedalHeader>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kd[1]}`}</PlayerName>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].kd[0]}`}</PlayerTeam>
                        <MedalInfo> Best kill per death ratio in the division</MedalInfo>
                    </Medal>
                    <Medal>
                        <MedalHeader>DMGTAKEN/m</MedalHeader>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dtm[1]}`}</PlayerName>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].dtm[0]}`}</PlayerTeam>
                        <MedalInfo> Most damage taken per minute in the division</MedalInfo>
                    </Medal>
                    <Medal>
                        <MedalHeader>HEALS/M</MedalHeader>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].heals[1]}`}</PlayerName>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].heals[0]}`}</PlayerTeam>
                        <MedalInfo> Most heals per minute in the division</MedalInfo>
                    </Medal>
                    <Medal>
                        <MedalHeader>HEADSHOTS/M</MedalHeader>
                        <PlayerName>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].headshots[1]}`}</PlayerName>
                        <PlayerTeam>{`${apiResponse === undefined ? true : apiResponse.data.medals[divisionChoice].headshots[0]}`}</PlayerTeam>
                        <MedalInfo> Most headshots per minute in the division</MedalInfo>
                    </Medal>
                </TopStatMedals>
                <SeasonDisclaimer>Only players who played more than half the season and on top 8 are displayed </SeasonDisclaimer>
            </SummaryWrapper>
        </SummaryPage>
    </>
  )
}

export default SeasonSummary;


