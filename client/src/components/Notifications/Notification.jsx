import React from 'react'
import styled from 'styled-components'

const NotificationWrapper = styled.div`
    text-align: center;
    font-family: "Poppins";
    background: #f08149;
    font-weight: bold;
`;

const Notifications = () => {
  return (
    <NotificationWrapper>This website is still really early in the making please contact me if you find a bug or if you have ideas you would like to see</NotificationWrapper>
  )
}

export default Notifications;