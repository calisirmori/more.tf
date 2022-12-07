import React from 'react'
import Logs from '../components/LogsComponents/Logs'
import Navbar from '../components/Navbar/Navbar';
import NavbarSearch from '../components/Navbar/NavbarSearch';
import Notifications from '../components/Notifications/Notification';

const LogsPage = () => {
  return (
    <>  
        {/* <NavbarSearch /> */}
        <Navbar />
        <Notifications />
        <Logs />
    </>
  )
}

export default LogsPage;