import React from 'react'
import { ContentHeaders, Header, Logo, NavbarWrapper } from './NavbarStyles';

const Navbar = () => {
  return (
    <>
        <NavbarWrapper>
            <Logo to="/">more.tf</Logo>
            <ContentHeaders>
                <Header>About</Header>
                <Header>Contact</Header>
                <Header to="/season-summary">S13 Summary</Header>
            </ContentHeaders>
        </NavbarWrapper>
    </>
  )
}

export default Navbar;