import React, { useEffect, useState } from 'react'
import { H3Header, H4Header, HeroImage, HeroText, HeroWrapper, InputButton, InputField, InputSection, MainHeader } from './HomeStyles';

const Home = () => {
  
  const [logInput, setLogInput] = useState("");
  useEffect(() => {
  }, [logInput])
  
  function linkMaker(inputLink){
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
        <HeroWrapper>
          <HeroText>
            <H3Header>LEARN MORE FROM TF2</H3Header>
            <MainHeader>NUMBERS BEHIND YOUR GAME</MainHeader>
            <H4Header>Get a better look into your statistics and learn more about how you play, simply put in your matches logs.tf link to learn so much more!</H4Header>
            <InputSection>
              <InputField placeholder="logs.tf/3307591" onChange={e => setLogInput(e.target.value)} value={logInput}></InputField>
              <InputButton to = {`${linkMaker(logInput)}`}>GET STARTED</InputButton>
            </InputSection>
          </HeroText>
          <HeroImage src="https://i.imgur.com/yMWOUOG.png"></HeroImage>
          
        </HeroWrapper>
    </>
  )
}

export default Home;