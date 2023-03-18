import styled from 'styled-components'
import {Link} from 'react-router-dom';
export const NavbarWrapper = styled.div`

    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    font-family: 'Poppins';
   
`;

export const Logo = styled(Link)`
    color: #f08149;
    font-weight: 700;
    font-size: 34px;
    cursor: pointer;
    margin: 10px 30px;
    text-decoration: none;
`;

export const ContentHeaders = styled.div`
    display: flex;
    justify-content: right;
    align-items: center;
    color: #fff;
    font-weight: 400;
    font-size: 20px;
`;

export const Header = styled.a`
    text-decoration: none;
    color: #fff;
    font-weight: 500;
    margin: 0 30px;
    cursor: pointer;
    @media (max-width: 800px) {
        margin: 0 20px;
        font-size: 14px;
    }
`;
export const ContactHeader = styled.a`
    text-decoration: none;
    color: #fff;
    font-weight: 500;
    margin: 0 30px;
    cursor: pointer;
    @media (max-width: 800px) {
        font-size: 14px;
        margin: 0 10px;
    }
`;

export const InputSection = styled.div`
    display:flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
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
    padding: 0 30px;
    margin-left: 20px;
    cursor: pointer;
    :hover{
        outline: 3px solid #f08149;
        background:#1d1c1c;
        color: #f08149;
    }
    `;
export const Example = styled.div`
`;

