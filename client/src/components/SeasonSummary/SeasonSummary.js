import React, { useState } from 'react'
import { Card, ClassSelect, ClassTab, Division, DivisionSelect, Info, Medal, MedalHeader, MedalImage, PlayerCards, PlayerName, PlayerNameCard, PlayerTeam, SeasonHeader, SummaryPage, SummaryTable, SummaryWrapper, Team, TopStatMedals, Username } from './SeasonSummaryStyles';

const SeasonSummary = () => {
    const [divisionChoice, setDivisionChoice] = useState("Invite")
    const [classChoice, setClassChoice] = useState("Scout")

    function divisionStyleObject(input){
        return( input == divisionChoice ? {background: "#f08149", color: "#121111", "font-weight" : "800"} : {});
    }
    function classStyleObject(input){
        return( input == classChoice ? {background: "#f08149", color: "#121111", "font-weight" : "800"} : {});
    }
    return (
    <>
        <SummaryPage>
            <SummaryWrapper>
                <SeasonHeader>RGL HIGHLANDER SEASON 13</SeasonHeader>
                <SummaryTable>
                    <DivisionSelect>
                        <Division style={divisionStyleObject("Invite")} onClick={() => {setDivisionChoice("Invite")}}>Invite</Division>
                        <Division style={divisionStyleObject("Advanced")} onClick={() => {setDivisionChoice("Advanced")}}>Advanced</Division>
                        <Division style={divisionStyleObject("Main")} onClick={() => {setDivisionChoice("Main")}}>Main</Division>
                        <Division style={divisionStyleObject("Intermediate")} onClick={() => {setDivisionChoice("Intermediate")}}>Intermediate</Division>
                        <Division style={divisionStyleObject("Amateur")} onClick={() => {setDivisionChoice("Amateur")}}>Amateur</Division>
                        <Division style={divisionStyleObject("Newcomer")} onClick={() => {setDivisionChoice("Newcomer")}}>Newcomer</Division>
                    </DivisionSelect>
                    <ClassSelect>
                        <ClassTab style={classStyleObject("Scout")} onClick={() => {setClassChoice("Scout")}}>Scout</ClassTab>
                        <ClassTab style={classStyleObject("Soldier")} onClick={() => {setClassChoice("Soldier")}}>Soldier</ClassTab>
                        <ClassTab style={classStyleObject("Pyro")} onClick={() => {setClassChoice("Pyro")}}>Pyro</ClassTab>
                        <ClassTab style={classStyleObject("Demoman")} onClick={() => {setClassChoice("Demoman")}}>Demoman</ClassTab>
                        <ClassTab style={classStyleObject("Heavy")} onClick={() => {setClassChoice("Heavy")}}>Heavy</ClassTab>
                        <ClassTab style={classStyleObject("Engineer")} onClick={() => {setClassChoice("Engineer")}}>Engineer</ClassTab>
                        <ClassTab style={classStyleObject("Medic")} onClick={() => {setClassChoice("Medic")}}>Medic</ClassTab>
                        <ClassTab style={classStyleObject("Sniper")} onClick={() => {setClassChoice("Sniper")}}>Sniper</ClassTab>
                        <ClassTab style={classStyleObject("Spy")} onClick={() => {setClassChoice("Spy")}}>Spy</ClassTab>
                    </ClassSelect>
                    <PlayerCards>
                        <Card style={{background: "#f08149"}} >
                            <PlayerNameCard style={{color: "#000"}} >PLAYERINFO</PlayerNameCard>
                            <Info style={{color: "#000"}}>KILLS</Info>
                            <Info style={{color: "#000"}}>ASSIST</Info>
                            <Info style={{color: "#000"}}>DEATH</Info>
                            <Info style={{color: "#000"}}>DPM</Info>
                            <Info style={{color: "#000"}}>KD</Info>
                            <Info style={{color: "#000"}}>DTM</Info>
                            <Info style={{color: "#000"}}>HP</Info>
                            <Info style={{color: "#000"}}>PLAYED</Info>
                            <Info style={{color: "#000"}}>SPOT</Info>
                        </Card>
                        <Card>
                            <PlayerNameCard>
                                <Username>treemonkey</Username>
                                <Team>big brain comp</Team>
                            </PlayerNameCard>
                            <Info>9</Info>
                            <Info>4</Info>
                            <Info>14</Info>
                            <Info>345</Info>
                            <Info>0.6</Info>
                            <Info>323</Info>
                            <Info>60</Info>
                            <Info>6</Info>
                            <Info>4</Info>
                        </Card>
                        <Card>
                            <PlayerNameCard></PlayerNameCard>
                            <Info></Info>
                        </Card>
                        <Card>
                            <PlayerNameCard></PlayerNameCard>
                            <Info></Info>
                        </Card>
                        <Card>
                            <PlayerNameCard></PlayerNameCard>
                            <Info></Info>
                        </Card>
                        <Card>
                            <PlayerNameCard></PlayerNameCard>
                            <Info></Info>
                        </Card>
                        <Card>
                            <PlayerNameCard></PlayerNameCard>
                            <Info></Info>
                        </Card>
                        <Card>
                            <PlayerNameCard></PlayerNameCard>
                            <Info></Info>
                        </Card>
                        <Card>
                            <PlayerNameCard></PlayerNameCard>
                            <Info></Info>
                        </Card>
                    </PlayerCards>
                </SummaryTable>
                <TopStatMedals>
                    <Medal>
                        <MedalHeader>KILLS</MedalHeader>
                        <PlayerTeam>bigbraincomp</PlayerTeam>
                        <PlayerName>dookiemonster33</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>DEATHS</MedalHeader>
                        <PlayerTeam>bigbraincomp</PlayerTeam>
                        <PlayerName>dookiemonster33</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>DPM</MedalHeader>
                        <PlayerTeam>bigbraincomp</PlayerTeam>
                        <PlayerName>dookiemonster33</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>KD</MedalHeader>
                        <PlayerTeam>bigbraincomp</PlayerTeam>
                        <PlayerName>dookiemonster33</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>DAMAGE TAKEN</MedalHeader>
                        <PlayerTeam>bigbraincomp</PlayerTeam>
                        <PlayerName>dookiemonster33</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>HEALS</MedalHeader>
                        <PlayerTeam>bigbraincomp</PlayerTeam>
                        <PlayerName>dookiemonster33</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                    <Medal>
                        <MedalHeader>HEADSHOT</MedalHeader>
                        <PlayerTeam>bigbraincomp</PlayerTeam>
                        <PlayerName>dookiemonster33</PlayerName>
                        <MedalImage src="https://i.imgur.com/KwwYkBb.png"></MedalImage>
                    </Medal>
                </TopStatMedals>
            </SummaryWrapper>
        </SummaryPage>
    </>
  )
}

export default SeasonSummary;