import styled from "styled-components";
import {Link} from 'react-router-dom';
export const HeroWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 860px;
`;

export const HeroText = styled.div`
    display: block;
    width: 440px;
    margin-right: 50px;
`;

export const H3Header = styled.div`
    color: #f08149;
    font-family: 'Poppins';
    font-weight: 600;
    font-size: 20px;
    margin-left: 5px;
    margin-bottom: 15px;
`;

export const MainHeader = styled.div`
    color: #fff;
    font-family: 'Lilita One';
    font-size: 80px;
    line-height: 70px;
`;

export const H4Header = styled.div`
    color: #f08149;
    font-family: 'Poppins';
    font-weight: 600;
    margin-left: 5px;
    margin-top: 15px;
`;

export const InputSection = styled.div`
    display:flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
`;

export const HeroImage = styled.img`
    height: 600px;
    width: 800px;
`;

export const InputField = styled.input`
    width: 200px;
    height: 30px;
    padding:  0 20px;
    background:#34302d;
    border: 3px solid #f08149;
    border-radius: 5px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    font-family: 'Poppins';
    :focus{
        outline: 1px solid #f08149;
    }
`;

export const InputButton = styled(Link)`
    text-decoration: none;
    display:flex;
    justify-content: center;
    align-items: center;

    font-family: 'Poppins';
    font-weight: 500;
    color: #1d1c1c;
    height: 35px;
    background:#f08149;
    border: 1px solid #1d1c1c;
    border-radius: 50px;
    padding: 0 10px;
    margin-left: 20px;
    cursor: pointer;
    :hover{
        outline: 3px solid #f08149;
        background:#1d1c1c;
        color: #f08149;
    }
    
`;
export const TryButton = styled(Link)`
    text-decoration: none;
    display:flex;
    justify-content: center;
    align-items: center;
    font-family: 'Poppins';
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    :hover{
        color: #f08149;
    }
    
`;

export const MessageHeader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #f08149;
    font-family: 'Lilita One';
    font-size: 200px;
    line-height: 200px;
`;

export const MessageText = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    color: #f08149;
    font-family: 'Lilita One';
    font-size: 50px;
    line-height: 50px;
    margin-bottom: 100px;
`;

export const InvalidPageWrapper = styled.div`
    height: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
`;
export const InfoWrapper = styled.div`

`;
export const Container = styled.div`

`;
