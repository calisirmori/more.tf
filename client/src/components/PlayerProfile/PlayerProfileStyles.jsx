import styled from 'styled-components'
import {Link} from 'react-router-dom';

export const PlayerProfileWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "Poppins";
    @media (max-width: 1500px) {
        zoom: 0.8;
    }
    @media (max-width: 1200px) {
        zoom: 0.7;
    }
    @media (max-width: 1050px) {
        zoom: 0.5;
    }
    @media (max-width: 800px) {
        zoom: 0.4;
    }
    @media (max-width: 600px) {
        zoom: 0.3;
    }
    @media (max-width: 500px) {
        zoom: 0.25;
    }
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
    margin-bottom: 20px;
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
    background: #171616;
    border-radius: 5px;
    height: 65px;
    width: 970px;
    padding: 5px;
    margin: 10px 0;
    display: grid;
    justify-content: center;
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
    grid-template-columns: 20px 90px 1fr 180px 50px 200px;
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
    font-family: 'Roboto Mono', monospace;
`;

export const MatchTitle = styled.div`
    text-align: left;
    padding-left: 10px;
    border-left: 2px solid #f08149;
`;

export const MathMap = styled.div`
    border-left: 2px solid #f08149;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px;
`;

export const MatchFormat = styled.div`
    border-left: 2px solid #f08149;
`;

export const MatchDate = styled.div`
    border-left: 2px solid #f08149;
    font-family: 'Roboto Mono', monospace;

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
    position: relative;

    &:before{
        display:none;
        content: "${props => props.tooltip}";
        position: absolute;
        font-weight: 600;
        top: -1.8rem;
        font-size: 20px;
        color: #000;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px;
        background-color: #f08149;
        white-space: nowrap;
        padding-bottom: 12px;
        clip-path: polygon(0% 0%, 100% 0%, 100% 80%, calc(50% + 5px) 80%, 50% 100%, calc(50% - 5px) 80%, 0% 80%);
    }

    &:hover{
        &:before{
            display: block;
        }
    }
`;

export const Damage = styled.div`
    font-size: 30px;
    text-align: center;
    font-weight: 800;
    margin-top: -10px;
    position: relative;

    &:before{
        display:none;
        content: "${props => props.tooltip}";
        position: absolute;
        font-weight: 600;
        top: -2.5rem;
        font-size: 20px;
        color: #000;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px;
        background-color: #f08149;
        white-space: nowrap;
        padding-bottom: 12px;
        clip-path: polygon(0% 0%, 100% 0%, 100% 80%, calc(50% + 5px) 80%, 50% 100%, calc(50% - 5px) 80%, 0% 80%);
    }

    &:hover{
        &:before{
            display: block;
        }
    }
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
    border-radius: 3px;
`;

export const Username = styled.div`
    text-align: center;
    font-weight: 800;
    font-size: 40px;
`;

export const PlayerLinks = styled.div`
    margin-left: 40px;
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
    font-weight: 400;
    font-family: 'Roboto Mono', monospace;

`;

export const FormatPercentage = styled.div`
    background: #171616;
    color: #fff;
    border-radius: 5px;
    width: 480px;
    padding: 10px;
    display: block;
`;

export const Format = styled.div`

    padding-left: 10px;
    position: relative;

    &:before{
        display:none;
        content: "${props => props.tooltip}";
        position: absolute;
        font-weight: 600;
        top: -2.5rem;
        color: #000;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px;
        background-color: #f08149;
        white-space: nowrap;
        padding-bottom: 12px;
        clip-path: polygon(0% 0%, 100% 0%, 100% 80%, calc(50% + 5px) 80%, 50% 100%, calc(50% - 5px) 80%, 0% 80%);
    }

    &:hover{
        &:before{
            display: block;
        }
    }
`;

export const FormatHeader = styled.div`
    text-align: center;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 20px;
    padding-top: 10px;
   
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

export const PageNumber = styled.div`
    display: flex;
    justify-content: right;
    margin: 10px 30px;
`;
export const PageBox = styled.div`
    font-family: 'Roboto Mono', monospace;
    padding: 4px 12px;
    font-weight: 200;
    outline: 1px solid #f08149;
    cursor: pointer;
    :hover{
        background: #f08149;
        color: #1c1c1c;
    }
`;
export const SearchElements = styled.div`
    display: flex;
    height: 65px;
    margin: 5px;
`;

export const PlayerAdd = styled.input`
    width: 180px;
    height: 1.7em;
    padding: 0 1em 0 1em;
    appearance: none;
    border: 0;
    outline: 0;
    font: inherit;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.25em;
    box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.2);
    color: #f08149;
    font-weight: bold;
    margin-right: 10px;
`;

export const MapSearch = styled.input`
    width: 180px;
    height: 1.7em;
    padding: 0 1em 0 1em;
    appearance: none;
    border: 0;
    outline: 0;
    font: inherit;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.25em;
    box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.2);
    color: #f08149;
    font-weight: bold;
    margin-right: 10px;
`;
export const DateSearch = styled.input`

`;
export const FormatSearch = styled.select`
    appearance: none;
    border: 0;
    outline: 0;
    font: inherit;
    width: 85px;
    height: 1.7em;
    padding: 0 1em 0 1em;
    background: url(https://upload.wikimedia.org/wikipedia/commons/9/9d/Caret_down_font_awesome_whitevariation.svg)
        no-repeat right 0em center / 1.4em,
      linear-gradient(to left, rgba(255, 255, 255, 0.3) 1.5em, rgba(255, 255, 255, 0.2) 1.5em);
    color: #f08149;
    font-weight: bold;
    border-radius: 0.25em;
    box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.2);
    cursor: pointer;
`;

export const SearchTag = styled.option`
    color: #f08149;
    background: #1c1c1c;
`;

export const RemoveButton = styled.div`
    padding-left: 10px;
    
    font-weight: 500;
    cursor: pointer;
    :hover{
        color: #fff;
    }
`;

export const SearchTags = styled.div`
    display: flex;
    margin-left: -150px;
`;
export const Tag = styled.div`
    display: flex;
    color: #1c1c1c;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    height: 20px;
    padding: 0px 10px;
    background-color: #f08149;
    margin: 3px 5px;
`;

export const Element = styled.div`

`;

export const ElementHeader = styled.div`

`;
export const SearchButton = styled.button`
    text-decoration: none;
    display:flex;
    justify-content: center;
    align-items: center;
    font-family: 'Poppins';
    font-weight: 600;
    color: #1d1c1c;
    margin-top: 5px;
    height: 45px;
    background:#f08149;
    border: 1px solid #1d1c1c;
    border-radius: 10px;
    padding: 0 30px;
    margin-left: 30px;
    cursor: pointer;
    :hover{
        outline: 3px solid #f08149;
        background:#1d1c1c;
        color: #f08149;
    }
`;

export const PlayerName = styled.div``;

export const FormatLabel = styled.div`
    display: flex;
    justify-content: center;
    font-weight: 600;
`;

export const RGLTeamsLayout = styled.div`
    background: #171616;
    color: #fff;
    border-radius: 5px;
    width: 480px;
    padding: 10px;
    display: block;
    margin-top: 20px;
`;
export const TeamName = styled.a`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    font-wright: 200;
    color: #f08149;
    text-decoration: none;
    margin-left: 10px;
    :hover{
        color: #fff;
    }
`;
