import React, { useEffect, useState } from 'react'
import { ContactHeader, ContentHeaders, Header, InputButton, InputField, InputSection, Logo, NavbarWrapper } from './NavbarStyles';

const Navbar = () => {
  return (
    <>
        <NavbarWrapper style={{gridTemplateColumns: "1fr 1fr"}}>
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