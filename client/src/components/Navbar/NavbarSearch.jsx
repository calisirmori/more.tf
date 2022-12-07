import React, { useEffect, useState } from 'react'
import { ContactHeader, ContentHeaders, Header, InputButton, InputField, InputSection, Logo, NavbarWrapper } from './NavbarStyles';

const NavbarSearch = () => {
  const [logInput, setLogInput] = useState("");

  useEffect(() => {
  }, [logInput])
  
  function linkMaker(inputLink){
    console.log(inputLink)
    if(inputLink.includes("logs.tf") && !inputLink.includes("#")){
      inputLink.split("/")
      return("/log/"+inputLink.slice(inputLink.lastIndexOf("/")+1))
    } else if (inputLink.includes("logs.tf") && inputLink.includes("#")){
      return("/log/"+inputLink.slice(inputLink.lastIndexOf("/")+1, inputLink.indexOf("#")))
    } else if (!inputLink.includes("logs.tf") && inputLink.length == 7){
      return("/log/"+inputLink)
    } else {
      return("/bad-id")
    }
  }
  return (
    <>
        <NavbarWrapper>
            <Logo to="/">more.tf</Logo>
            <InputSection>
                  <InputField placeholder="logs.tf/3307591" onChange={e => setLogInput(e.target.value)} value={logInput}></InputField>
                  <InputButton to= {linkMaker(logInput)}>GO</InputButton>
            </InputSection>
            <ContentHeaders>
                <ContactHeader href="https://discord.gg/ZbYQGWbUnx" target="_blank">Contact</ContactHeader>
                <Header to="/season-summary">S13 Summary</Header>
            </ContentHeaders>
        </NavbarWrapper>
    </>
  )
}

export default NavbarSearch;