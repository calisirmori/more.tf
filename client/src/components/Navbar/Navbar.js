import React from 'react'
import { ContactHeader, ContentHeaders, Header, Logo, NavbarWrapper } from './NavbarStyles';

const Navbar = () => {
  return (
    <>
        <NavbarWrapper>
            <Logo to="/">more.tf</Logo>
            <ContentHeaders>
                <ContactHeader href="https://discord.gg/ZbYQGWbUnx" target="_blank">Contact</ContactHeader>
                <Header to="/season-summary">S13 Summary</Header>
            </ContentHeaders>
        </NavbarWrapper>
    </>
  )
}

export default Navbar;