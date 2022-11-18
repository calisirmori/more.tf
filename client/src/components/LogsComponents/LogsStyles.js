import styled from 'styled-components';

export const LogsPageWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Quicksand';
    background-color: #34302d;
`;

export const LogsSectionWrapper = styled.div`
    width: 1140px;
    
    background-color: #1d1c1c;
    margin: 20px;
    display: block;
`;

export const MatchHeader = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    background-color: #1d1c1c;
    width: 1100px;
    height: 100px;
    margin: 20px 20px 0 20px;
    color: #fff;
`;

export const ClassicLogs = styled.div`
    background-color: #171616;
    padding: 20px;
    width: 1060px;
    border-radius: 5px;
    
    margin: 35px 40px 0px 20px;
`;

export const MoreLogs = styled.div`

`;

export const Individuals = styled.div`
    display: flex;
`;



export const KillMap = styled.div`
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    width: 540px;
    height: 540px;
    border-radius: 5px;
    margin: 20px 20px 20px 0;
    background-color: #171616;
`;



export const LeftSideInfo = styled.div`
    background-color: #1d1c1c;
    width: 400px;
`;
export const MatchTitle = styled.div`
    margin: 5px 10px;
    background-color: #1d1c1c;
    font-size: 20px;
    font-weight: 600;
    color: #f08149;
    text-overflow: ellipsis;
`;

export const MapPlayed = styled.div`
    background-color: #1d1c1c;
    margin: 5px 10px;
    font-weight: 500;
    font-size: 19px;
`;

export const Duration = styled.div`
    background-color: #1d1c1c;
    margin: 5px 10px;
`;

export const RightSideInfo = styled.div`
    background-color: #1d1c1c;
    display:block;
    text-align: right;
    width: 400px;
`;
export const LogNumber = styled.div`

    margin: 5px 10px;
    background-color: #1d1c1c;
    font-size: 20px;
    font-weight: 600;
    color: #f08149;
`;
export const MatchDate = styled.div`
    background-color: #1d1c1c;
    margin: 0 10px;
    font-weight: 500;
    font-size: 18px;
`;
export const MatchLinks = styled.div`
    display: flex;
    margin: 10px;
    align-items: center;
    justify-content: right;
    background-color: #1d1c1c;
`;
export const LogsLink = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 3px;
    background-color: #34302d;
    height: 35px;
    width: 100px;
    margin-right: 10px;
    cursor: pointer;
    border-radius: 3px;
    :hover {
        outline: 1px solid #f08149;
        background-color: #1d1c1c;
    }
`;
export const DemosLink = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #34302d;
    padding-bottom: 3px;
    border-radius: 3px;
    height: 35px;
    width: 100px;
    cursor: pointer;
    :hover {
        outline: 1px solid #f08149;
        background-color: #1d1c1c;
    }
`;
export const MatchScore = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1d1c1c;
`;

export const BlueScore = styled.div`
    display: block;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    padding-top: 10px;
    height: 95px;
    width: 90px;
    background-color: #5B7A8C;
    margin-right: 20px;
    border-radius: 5px;
    border-bottom: 4px solid #395C79;
`;
export const RedScore = styled.div`
    display: block;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    padding-top: 10px;
    height: 95px;
    width: 90px;
    background-color: #BD3B3B;
    margin-right: 20px;
    border-radius: 5px;
    border-bottom: 4px solid #9D312F;
`;

export const TeamName = styled.div``;

export const Score = styled.div`
    font-family: 'Lilita One';
    font-size: 60px;
    margin-top: px;
`;
export const PlayerCard = styled.div`
    display: flex;
    font-family: 'Fredoka', sans-serif;  
    height: 32px;
    background-color: #191818;
    
    margin-bottom: 4px;
`;
export const Team = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 65px;
`;
export const PlayerUsername = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 300px;
    color: white;
    cursor: pointer;
`;
export const Kills = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 110px;
    color: white;
`;
export const Assists = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 105px;
    color: white;
`;
export const Deaths = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    color: white;
`;
export const Damage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140px;
    color: white;
    
`;
export const DPM = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 110px;
    color: white;
`;
export const KDA = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 110px;
    color: white;
`;
export const Class = styled.img`
    margin: 5px 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
`;

export const PlayerLogTitle = styled.div` 
    font-family: 'Fredoka', sans-serif;  
    display: flex;
    align-items: center;
    justify-content: left;
    padding-bottom: 5px;
    
`;

export const ClassTitle = styled.button`   
    color: #fff;
    border: none;
    background-color: #171616;
    cursor: pointer;
    font-size: 16px;
`;

export const NameInfoTitle = styled.div`
    color: #fff;
    padding: 0 0px;
`;

export const UsernameTitle = styled.div`
    color: #fff;
    padding: 0 105px 0 105px;
`;

export const SteamIdTitle = styled.div` 
    color: #fff;
    padding: 0 6px;
`;

export const StatTitle = styled.button`
    color: #fff;
    margin: 0 25.5px;
    border: none;
    background-color: #171616;
    cursor: pointer;
    font-size: 16px;
`;

export const DamageVersus = styled.div`
    display: flex;
    width:540px;
    height: 540px;
    border-radius: 5px;
    background-color: #171616;
    margin: 20px;
`;

export const ClassImage = styled.img`
    margin-top: 20px;
    height: 500px;
    width: 200px;
    object-fit: cover;
`;

export const PlayerVsStats = styled.div`
    width: 300px;
    margin: 5px 20px;
    display: block;
    text-align: center;
`;

export const SectionTitle = styled.div`
    margin: 5px 10px;
    font-size: 26px;
    font-weight: 800;
    color: #fff;
`;
export const StatsWrapper = styled.div`
    margin-top: 10px;
    display: block;
`;
export const VsStat = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
`;
export const ClassAgainst = styled.img`
    height:25px;
    margin-right: 10px;
`;
export const DamageBar = styled.div`
    background-color: #BD3B3B;
    color: #fff;
    text-align: right;
    font-weight: 700;
    padding: 4px 16px 4px 8px;
    border-bottom: 4px solid #9D312F;
`;
export const InfoSection = styled.div``;
export const PlayerName = styled.div`
    margin: -10px 10px;
    margin-bottom: -5px;
    font-size: 22px;
    height: 40px;
    width: 290px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    color: #f08149;
`;
export const InfoButtons = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;
export const SmallButton = styled.img`
    border-radius: 4px;
    margin: 5px 10px;
    height: 40px;
    width: 40px;
    background-color: white;
    cursor: pointer;
`;
export const Map = styled.img`
    height: 520px;
    opacity: 0.9;
`;
export const KillImage = styled.div``;
export const Killer = styled.div`
    height:7px;
    width:7px;
    border-radius: 5px;
    background-color: #BD3B3B;
    border: 1px solid #fff;
    position: absolute;
`;

export const Arrow = styled.polyline`
    fill: none;
    stroke-width: 2;
`;

export const Victim = styled.div`
    height:7px;
    width:7px;
    border-radius: 5px;
    background-color: #395C79;
    border: 1px solid #ffff;
    position: absolute;
`;
export const SvgArrow = styled.svg`
    transform: scaleY(-1)
`;

export const FunFacts = styled.div`
    display: flex;
    margin-bottom: 20px;
`;

export const BuildingsDestroyed = styled.div`
    margin-left: 20px;
    width: 363px;
    border-radius: 5px;
    background-color: #171616;
    
`;

export const Smalls = styled.div`
    display: block;
    
    width: 354px;
    margin-left: 10px;
    border-radius: 5px;
`;

export const PlayersExtinguished = styled.div`
    margin-bottom: 10px;
    
    width: 354;
    background-color: #fff;
    border-radius: 5px;
    background-color: #171616;
    padding-top: 0.1px;
    padding-bottom: 20px;
`;

export const BuildingCount = styled.div`
    margin-bottom: 10px;
    padding-bottom: 20px;
    width: 354;
    background-color: #fff;
    border-radius: 5px;
    background-color: #171616;
    padding-top: 0.1px;
`;

export const Dominations = styled.div`
    
    padding-bottom: 20px;
    width: 354;
    background-color: #fff;
    border-radius: 5px;
    background-color: #171616;
    padding-top: 0.1px;
`;

export const AmmoPickup = styled.div`
    width: 363px;
    margin-left: 10px;
    border-radius: 5px;
    background-color: #171616;
`;

export const SmallHeaders = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: space-between;
    margin: 10px 20px;
    align-items: center;
`;
export const BlueTeam = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Lilita One';
    color: #fff;
    font-size: 45px;
    height: 50px;
    border-radius: 5px 0  0 5px;
    border-bottom: 3px solid #395C79;
    background-color: #5B7A8C;
`;
export const RedTeam = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Lilita One';
    color: #fff;
    font-size: 45px;
    height: 50px;
    border-radius: 0 5px 5px 0;
    border-bottom: 3px solid #9D312F;
    background-color: #BD3B3B;
`;
export const SmallStats = styled.div`
`;
export const Label = styled.div`
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-weight: 700;
    font-size: 24px;
    
`;
export const TeamSection = styled.div`
    display:grid;
    grid-template-rows: repeat(18, 1fr);
    
    align-content: center;
    margin-bottom: 20px;
`;
export const ClassIcons = styled.div``;
export const SmallPlayerCard = styled.div`
    display: grid;
    grid-template-columns: 20px 200px 1fr;
    width: 255px;
    border-radius: 2px;
    color: #fff;
    font-size: 14px;
    padding: 2px 10px;
    margin-left: 52px;
    margin-bottom: 2px;
`;
export const Name = styled.div`
    margin-left: -20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
export const Amount = styled.div`
    text-align: right;
`;
export const SmallIcon = styled.img`
    height:18px;
    width:18px;
    margin-top:1px;
    margin-left: -32px;
`;
export const Example = styled.div``;

