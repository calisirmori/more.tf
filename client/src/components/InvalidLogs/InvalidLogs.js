import React, { useEffect, useState } from 'react'
import { InfoWrapper, InputButton, InputField, InputSection, InvalidPageWrapper, MessageHeader, MessageText } from '../HomeComponents/HomeStyles';

const InvalidLogs = () => {

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
    <InvalidPageWrapper>
        <InfoWrapper>
            <MessageHeader>404</MessageHeader>
            <MessageText>BAD LOG ID</MessageText>
            <InputSection>
                  <InputField placeholder="logs.tf/3307591" onChange={e => setLogInput(e.target.value)} value={logInput}></InputField>
                  <InputButton to = {`${linkMaker(logInput)}`}>GET STARTED</InputButton>
            </InputSection>
        </InfoWrapper>
    </InvalidPageWrapper>
  )
}

export default InvalidLogs;