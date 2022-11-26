import styled from 'styled-components'
import {Link} from 'react-router-dom';


export const SummaryPage = styled.div`
    display:flex;
    justify-content:center;
    align-items:center;
    height: 875px;
    
`;

export const SummaryWrapper = styled.div`
    display: block;
    text-align: center;
    height: 800px;
    width: 1200px;
    
`;

export const SeasonHeader = styled.div`
    color: #f08149;
    font-family: 'Lilita One';
    font-size: 60px;
    line-height: 70px;
    margin-bottom: 20px;
`;

export const SummaryTable = styled.div`
    margin-bottom: 4px;
    
    width: 1160px;
`;

export const DivisionSelect = styled.div`
    display:grid;
    color: #fff;

    font-family: 'Quicksand';
    grid-template-columns: repeat(4, 1fr);
    height: 40px;
    background: #1d1c1c;
    border-bottom: 3px solid #34302d;
`;

export const ClassSelect = styled.div`
    display:grid;
    color: #fff;
    font-family: 'Quicksand';
    grid-template-columns: repeat(9, 1fr);
    height: 40px;
    background: #1d1c1c;
    border-bottom: 3px solid #34302d;
`;


export const Medal = styled.div`
    background: #1d1c1c;
    height:150px;
    
`;

export const TopStatMedals = styled.div`
    width:1160px;
    grid-gap: 5px;
    display:grid;
    color: #fff;
    font-family: 'Quicksand';
    grid-template-columns: repeat(7, 1fr);
`;

export const ClassTab = styled.div`

    cursor: pointer;
    display:flex;
    justify-content:center;
    align-items:center;
    border: 1px solid #121111;
    background: #121111;
    color: #34302d;
    font-weight : 800;
    :hover{
        border: 1px solid #f08149;
    }
`;

export const Division = styled.div`
    cursor: pointer;
    display:flex;
    justify-content:center;
    align-items:center;
    border: 1px solid #121111;
    background: #121111;
    color: #34302d;
    font-weight : 800;
    :hover{
        border: 1px solid #f08149;
    }
`;

export const MedalHeader = styled.div`
    margin-top: 5px;
    padding-bottom: 5px;
    border-bottom: 3px solid #181818;
    font-size: 20px;
    font-family: 'Lilita One';
    color: #f08149;
`;

export const PlayerName = styled.div`
    font-weight: 600;
`;

export const PlayerTeam = styled.div`

    margin-top: 10px;
    font-weight: 300;
    color: #f08149;
`;

export const MedalImage = styled.img`
    height: 50px;
    width: 120px;
    margin-top: 5px;

`;

export const PlayerCards = styled.div`
    display: grid;
    grid-template-rows: repeat(9, 1fr);
    grid-gap: 5px;
    background-color: #1d1c1c;
    padding: 10px;
`;

export const Card = styled.div`
    display: grid;
    grid-template-columns: 200px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    height: 40px;
    width: 1140px;
    background-color: #171616;
`;
export const PlayerNameCard = styled.div`
    display:block;

    margin-top: px;
    margin-left: 20px;
    font-family: 'Quicksand';
    color: #fff;
    font-weight: 600;
    font-size: 18px;
    margin-top: 8px;
`;
export const Info = styled.div`
    font-family: 'Quicksand';
    color: #fff;
    font-weight: 600;
    font-size: 18px;
    margin-top: 8px;
`;
export const Subdivision = styled.div`
`;
export const Username = styled.div`
    font-family: 'Quicksand';
    color: #fff;
    font-weight: 600;
    font-size: 18px;
    margin-top: -7px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
export const Team = styled.div`
    font-family: 'Quicksand';
    margin-top: -3px;
    font-weight: 400;
    font-size: 12px;
    color: #f08149;
`;
