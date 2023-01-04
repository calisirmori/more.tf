import styled from 'styled-components'



export const SummaryPage = styled.div`
    display:flex;
    justify-content:center;
    @media (max-width: 1500px) {
        -webkit-transform: scale(0.8);
transform: scale(0.8);
       

    }
    @media (max-width: 1200px) {
        -webkit-transform: scale(0.7);
transform: scale(0.7);
        
    }
    @media (max-width: 1050px) {
        -webkit-transform: scale(0.5);
transform: scale(0.5);
        

    }
    @media (max-width: 800px) {
        -webkit-transform: scale(0.4);
transform: scale(0.4);
        

    }
    @media (max-width: 600px) {
        -webkit-transform: scale(0.3);
transform: scale(0.3);
        
    }
    @media (max-width: 500px) {
        -webkit-transform: scale(0.28);
transform: scale(0.28);
        
    }

    
`;

export const SummaryWrapper = styled.div`
    display: block;
    text-align: center;
    padding: 20px;
    padding-bottom: 10px;
    border-radius: 5px;
    background: #34302d;
`;

export const SeasonHeader = styled.div`
    color: #f08149;
    font-family: 'Lilita One';
    font-size: 60px;
    @media (max-width: 800px) {
        font-size: 40px;
    }
    line-height: 70px;
    margin-bottom: 15px;
`;

export const SummaryTable = styled.div`
    margin-bottom: 4px;
    
    width: 1160px;
`;

export const DivisionSelect = styled.div`
    display:grid;
    color: #fff;
    font-family: 'Poppins';
    grid-template-columns: repeat(4, 1fr);
    height: 40px;
    border-bottom: 3px solid #34302d;
`;

export const ClassSelect = styled.div`
    display:grid;
    color: #fff;
    font-family: 'Poppins';
    grid-template-columns: repeat(9, 1fr);
    height: 40px;
    background: #1d1c1c;
    border-bottom: 3px solid #34302d;
`;


export const Medal = styled.div`
    background: #1d1c1c;

    
`;

export const TopStatMedals = styled.div`
    width:1160px;
    grid-gap: 5px;
    display:grid;
    color: #fff;
    font-family: 'Poppins';
    grid-template-columns: repeat(7, 1fr);
`;

export const ClassTab = styled.div`

    cursor: pointer;
    display:flex;
    justify-content:center;
    align-items:center;
    border: 1px solid #121111;
    background: #121111;
    color: #BEBDBB;
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
    color: #BEBDBB;
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
    @media (max-width: 800px) {
        font-size: 14px;
    }
    font-family: 'Lilita One';
    color: #f08149;
`;

export const PlayerName = styled.div`
    font-weight: 800;
    font-size: 16px;
    @media (max-width: 800px) {
        font-size: 12px;
    }
    margin: 0 15px;
    margin-top: 5px;
`;

export const PlayerTeam = styled.div`
    font-size: 14px;
    @media (max-width: 800px) {
        font-size: 10px;
    }
    font-weight: 500;
    color: #f08149;
`;
export const MedalImage = styled.img`
    height: 50px;
    width: 120px;
    margin-top: 5px;

`;
export const MedalInfo = styled.div`
    font-size: 11px;
    padding-bottom: 8px;
    @media (max-width: 800px) {
        font-size: 14px;
    }
    font-weight: 300;
    margin: 5px 10px;
`;


export const PlayerCards = styled.div`
    display: grid;
    grid-template-rows: repeat(1, 1fr);
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
    margin-top: 1px;
    margin-left: 20px;
    font-family: 'Poppins';
    color: #fff;
    font-weight: 600;
    font-size: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
export const Info = styled.div`
    font-family: 'Poppins';
    color: #fff;
    font-weight: 600;
    font-size: 18px;
    margin-top: 8px;
`;

export const Subdivision = styled.div`
`;

export const Username = styled.a`
    text-decoration: none;
    font-family: 'Poppins';
    color: #fff;
    font-weight: 600;
    width: 100px;
    font-size: 18px;
`;
export const Team = styled.div`
    font-family: 'Poppins';
    margin-top: -6px;
    font-weight: 300;
    font-size: 12px;
    color: #f08149;
`;
export const SeasonDisclaimer = styled.div`
    color: #fff;
    font-family: 'Poppins';
    font-size: 20px;
    margin-top: 10px;
`;
