import React from 'react'
import styled from 'styled-components'

const NotificationWrapper = styled.div`
    text-align: center;
    font-family: "Poppins";
    background: #f08149;
    font-weight: bold;
    @media (max-width: 1500px) {
      zoom: 0.9;
    }
    @media (max-width: 1200px) {
        zoom: 0.8;
    }
    @media (max-width: 1050px) {
        zoom: 0.6;
    }
    @media (max-width: 800px) {
        zoom: 0.5;
    }
    @media (max-width: 600px) {
        zoom: 0.6;
    }
    @media (max-width: 500px) {
        zoom: 0.4;
    }
`;

const Notifications = () => {
  return (
    <NotificationWrapper>This website is still really early in the making please contact me if you find a bug or if you have ideas you would like to see</NotificationWrapper>
  )
}

export default Notifications;