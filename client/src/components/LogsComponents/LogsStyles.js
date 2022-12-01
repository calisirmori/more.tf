import styled from 'styled-components';

export const LogsPageWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Poppins';
    
`;

export const LogsSectionWrapper = styled.div`
    width: 1540px;
    background-color: #1c1c1c;
    margin: 10px;
    display: block;
    padding-bottom: 20px;
`;

export const MatchHeader = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    background-color: #171616;
    border-radius: 5px;
    width: 1480px;
    padding: 10px;
    margin: 20px 20px 0 20px;
    color: #fff;
`;

export const ClassicLogs = styled.div`
    background-color: #171616;
    padding: 20px;
    width: 1460px;
    border-radius: 5px;
    
    margin: 20px 40px 0px 20px;
`;

export const MoreLogs = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1460px;
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
  
`;
export const MatchTitle = styled.div`
    margin: 5px 10px;
    font-size: 20px;
    font-weight: 600;
    color: #f08149;
    text-overflow: ellipsis;
`;

export const MapPlayed = styled.div`
    margin: 5px 10px;
    font-weight: 500;
    font-size: 19px;
`;

export const Duration = styled.div`
    margin: 5px 10px;
    font-size: 20px;
    font-weight: bold;
`;

export const RightSideInfo = styled.div`
    display:block;
    text-align: right;
    
`;
export const LogNumber = styled.div`

    margin: 5px 10px;
    font-size: 20px;
    font-weight: 600;
    color: #f08149;
`;
export const MatchDate = styled.div`
    margin: 0 10px;
    font-weight: 500;
    font-size: 18px;
`;
export const MatchLinks = styled.div`
    display: flex;
    margin: 10px;
    align-items: center;
    justify-content: right;
    
`;
export const LogsLink = styled.a`
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
    text-decoration: none;
    color: #fff;
    :hover {
        outline: 1px solid #f08149;
        background-color: #1d1c1c;
    }
`;
export const DemosLink = styled.a`
    text-decoration: none;
    color: #fff;
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
    border-radius: 5px;
    border-bottom: 4px solid #9D312F;
`;

export const TeamName = styled.div``;

export const Score = styled.div`
    font-family: 'Lilita One';
    font-size: 60px;
    margin-top: -6px;
`;
export const PlayerCard = styled.div`
    display: grid;
    grid-template-columns: 50px 200px 50px repeat(19, 1fr);
    font-family: 'Fredoka', sans-serif;
    height: 32px;
    border-radius: 3px;
    background-color: #191818;
    text-align: center;
    margin-bottom: 3px;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
`;
export const Team = styled.div`
border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #000;
`;
export const PlayerUsername = styled.div`
    display:block;
    text-align: center;
    margin: 4px 10px 0px 10px;
    
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
`;
export const Kills = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    
`;
export const Assists = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    
`;
export const Deaths = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    
`;
export const Damage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    
    
`;
export const DPM = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    
`;
export const KDA = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    
`;
export const Class = styled.img`
    margin-top: 4px;
    margin-left: 12.5px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 25px;
`;

export const PlayerLogTitle = styled.div` 

    display: grid;
    grid-template-columns: 50px 200px 50px repeat(19, 1fr);
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
    padding-bottom: 5px;
    text-align: center;
`;

export const ClassTitle = styled.button`   
    color: #fff;
    border: none;
    background-color: #171616;
    cursor: pointer;
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
`;

export const NameInfoTitle = styled.div`
    color: #fff;
    margin-bottom: -4px;
`;

export const UsernameTitle = styled.div`
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
    margin-top: 1px;
`;

export const SteamIdTitle = styled.div` 
    color: #fff;
`;

export const StatTitle = styled.button`
    color: #fff;
    border: none;
    background-color: #171616;
    cursor: pointer;
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
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
    margin-top: -70px;
    margin-left: 20px;
    margin-right: -20px;

    height: 650px;
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

    color: #fff;
    text-align: right;
    font-weight: 700;
    padding: 4px 16px 4px 8px;

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
export const SmallButton = styled.a`
    text-decoration: none;
    border-radius: 4px;
    margin: 5px 10px;
    height: 40px;
    width: 40px;
    background-
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
    display: none;
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
export const TeamTotalStats = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;

`;
export const TeamStatsWrapper = styled.div`
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    text-align: center;
    grid-gap: 3px;
    background: #171616;
    padding: 10px;
    width: 902px;
    border-radius: 5px;
    margin-bottom: 20px;
`;
export const TeamStatRow = styled.div`
    display: grid;
    grid-template-columns: repeat(10,1fr);
    border-radius: 3px;
    text-align: center;
`;

export const TeamStat = styled.div``;

export const PerRoundStats = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
`;
export const Medics = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 300;
`;

export const MedicsWrapper = styled.div`
    display: flex;
`;

export const Healer = styled.div`
    padding: 10px;
    background: #171616;
    border-radius: 5px;
    margin: 0 10px;
`;
export const HealerHeader = styled.div`
    text-align: center;
    background: #BD3B3B;
    border-bottom: 3px solid #9D312F;
    border-radius: 2px;
    font-weight: 600;
    padding: 3px;
    margin-bottom: 10px;
`;

export const HealerStats = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(9, 1fr);
    color: #fff;
`;

export const HealerStatTitle = styled.div`
    margin-left: 10px;
`;
export const StatNumber = styled.div`
    text-align: right;
    margin-right: 10px;
`;
export const HealSpread = styled.div`
    color: #fff;
    border-top: 3px solid #BD3B3B;
    display: grid;
    margin-top: 5px;
    padding-top: 5px;
    grid-template-rows: repeat(8, 1fr);
`;

export const HealedPlayer = styled.div`
    margin-top: 2px;
    margin-left: 10px;
    text-align: center;   
    display: grid;
    grid-template-columns:  220px 50px 1fr 1fr;
`;

export const HealedName = styled.div`
    text-align: left;
    
`;

export const HealedClass = styled.img`
    height: 25px;
    margin-left: -8px;
`;
export const HealStat = styled.div``;

export const KillsPerPlayer = styled.div`
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-weight: 300;
`;

export const KillsPerPlayerWrapper = styled.div`
    padding: 10px;
    background: #171616;
    border-radius: 5px;
`;
export const PerPlayerCard = styled.div`
    text-align: center;
    display: grid;
    grid-template-columns: 80px 250px repeat(11, 60px);
    grid-gap: 2px;
    
`;
export const PerPlayerStat = styled.div`
    border-left: 1px solid #070807;
    padding: 5px 0;
    
`;
export const PerPlayerClass = styled.img`
    height: 25px;
    padding: 5px 18px;

    border-radius: 0;
    border-left: 1px solid #070807;
`;

export const Chat = styled.div``;
export const Example = styled.div``;

