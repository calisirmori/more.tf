import styled from 'styled-components'
import {Link} from 'react-router-dom';
export const NavbarWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
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

export const Header = styled(Link)`
    text-decoration: none;
    color: #fff;
    font-weight: 500;
    margin: 0 30px;
    cursor: pointer;
`;
export const ContactHeader = styled.a`
    text-decoration: none;
    color: #fff;
    font-weight: 500;
    margin: 0 30px;
    cursor: pointer;
`;

export const Example = styled.div`
`;

