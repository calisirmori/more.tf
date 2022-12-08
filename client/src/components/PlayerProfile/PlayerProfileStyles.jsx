import styled from 'styled-components'
import {Link} from 'react-router-dom';

export const PlayerProfileWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "Poppins";
`;

export const ProfileSections = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const PlayerInfo = styled.div`
    display: block;
`;

export const Profile = styled.div`
    background: #171616;
    color: #fff;
    border-radius: 5px;
    height: 530px;
    width: 480px;
    padding: 10px;
    display: block;
    
`;

export const MostRecentMatch = styled.div`

    margin-top: 20px;
    background: #171616;
    color: #fff;
    border-radius: 5px;
    height: 225px;
    width: 480px;
    padding: 10px;
    display: block;
`;

export const PlayerMatchLogs = styled.div`
    color: #fff;
    font-weight: 200;
    border-radius: 5px;
    height: 820px;
    width: 1000px;
    margin-left: 20px;
`;

export const LogsHeader = styled.div`
    background: #000;
    border-radius: 5px;
    height: 110px;
    width: 980px;
    margin-bottom: 10px;
`;

export const LogsList = styled.div`
    padding: 10px;
    background: #171616;
    border-radius: 5px;
    height: 680px;
    width: 960px;
    display: grid;
    grid-template-rows: repeat(20, 1fr);
`;

export const MatchLogCard = styled(Link)`
    text-decoration: none;
    color: #fff;
    background: #171616;
    display: grid;
    text-align: center;
    grid-template-columns: 20px 80px 1fr 180px 50px 250px;
    cursor: pointer;
    border: 1px solid #171616;
    
    :hover{
        border: 1px solid #f08149;
    }
`;

export const CheckBox = styled.div`
    
`;

export const MatchId = styled.div`
    border-left: 2px solid #f08149;
`;

export const MatchTitle = styled.div`
    text-align: left;
    padding-left: 10px;
    border-left: 2px solid #f08149;
`;

export const MathMap = styled.div`
    border-left: 2px solid #f08149;
`;

export const MatchFormat = styled.div`
    border-left: 2px solid #f08149;
`;

export const MatchDate = styled.div`
    border-left: 2px solid #f08149;
`;

export const MatchInfo = styled.div`
    border-top: 1px solid #fff;
    margin: 5px 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    width: 480px;
`;

export const ClassPlayed = styled.img`
    margin: 10px;
    
    height: 60px;
`;

export const ScoreInfo = styled.div`
    text-align: center;
`;

export const MapPlayed = styled.div`
    margin-top: -10px;
    font-size: 14px;
    font-weight: 300;
`;

export const MatchID = styled.div`
    color: #f08149;
`;

export const Score = styled.div`
    font-size: 30px;
    font- weight: 700;
`;

export const GameDate = styled.div`

`;

export const DateAndID = styled.div`
    text-align: right;
    margin-right: 10px;
`;

export const PlayerStats = styled.div`

`;

export const KDA = styled.div`
    border-top: 1px solid #fff;
    padding-top: 5px;
    font-size: 50px;
    text-align: center;
    font-weight: 800;
`;

export const Damage = styled.div`
    font-size: 30px;
    text-align: center;
    font-weight: 800;
    margin-top: -10px;
`;



export const SectionHeader = styled.div`
    font-weight: 800;
    text-align: center;
`;
export const SteamInfo = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr;
    margin: 20px 45px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-top: 10px;
    align-items: center;
`;

export const ProfilePicture = styled.img`
    height: 64px;
    border-radius: 0;
`;

export const Username = styled.div`
    text-align: center;
    font-weight: 800;
    font-size: 40px;
`;

export const PlayerLinks = styled.div`
    margin-left: 45px;
    display: grid;
    grid-template-columns: repeat(5, 80px);
`;

export const PlayerLink = styled.a`
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 3px;
    background-color: #34302d;
    height: 30px;
    margin-right: 5px;
    cursor: pointer;
    border-radius: 3px;
    text-decoration: none;
    color: #fff;
    :hover {
        outline: 1px solid #f08149;
        background-color: #1d1c1c;
    }
    
`;

export const PlayerFunFact = styled.div`
    display: block;
`;

export const LogInfo = styled.div`
    display: grid;
    margin: 30px 45px;
    grid-template-columns: repeat(3, 1fr);
    text-align: center;
`;

export const StatWrapper = styled.div`
    
`;

export const StatHeader = styled.div`
    font-weight: bold;
`;

export const StatInfo = styled.div`
    font-weight: 200;
`;

export const FormatPercentage = styled.div`

`;

export const Format = styled.div`
    padding-left: 10px;
`;

export const FormatHeader = styled.div`
    text-align: center;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 20px;
    padding-top: 10px;
    border-top: 2px solid #fff;
`;

export const PercentageBar = styled.div`
    display: grid;
    margin-left: 20px;
    
`;

export const FormatFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    
    padding-bottom: 15px;
`;

export const FormatWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
`;

export const ColorBox = styled.div`
    width: 15px;
    height: 15px;
    
    margin-right: 5px;
    margin-left: 20px;
`;

export const FormatText = styled.div`

`;

export const Example = styled.div`

`;

