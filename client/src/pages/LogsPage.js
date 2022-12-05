import React from 'react'
import Logs from '../components/LogsComponents/Logs'
import NavbarSearch from '../components/Navbar/NavbarSearch';
import Notifications from '../components/Notifications/Notification';

const LogsPage = () => {
  return (
    <>  
        <NavbarSearch />
        <Notifications />
        <Logs />
    </>
  )
}

export default LogsPage;