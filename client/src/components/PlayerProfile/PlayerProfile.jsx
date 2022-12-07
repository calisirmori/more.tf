import React from 'react'
import { CheckBox, LogsHeader, LogsList, MatchDate, MatchFormat, MatchId, MatchLogCard, MatchTitle, MathMap, MostRecentMatch, PlayerInfo, PlayerMatchLogs, PlayerProfileWrapper, Profile, ProfileSections } from './PlayerProfileStyles';

const PlayerProfile = () => {
  return (
    <PlayerProfileWrapper>
        <ProfileSections>
            <PlayerInfo>
                <Profile></Profile>
                <MostRecentMatch></MostRecentMatch>
            </PlayerInfo>
            <PlayerMatchLogs>
                <LogsHeader></LogsHeader>
                <LogsList>
                    <MatchLogCard>
                        <CheckBox></CheckBox>
                        <MatchId></MatchId>
                        <MatchTitle></MatchTitle>
                        <MathMap></MathMap>
                        <MatchFormat></MatchFormat>
                        <MatchDate></MatchDate>
                    </MatchLogCard>
                </LogsList>
            </PlayerMatchLogs>
        </ProfileSections>
    </PlayerProfileWrapper>
  )
}

export default PlayerProfile;