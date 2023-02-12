import React from 'react'
import Navbar from '../shared-components/Navbar';

const Logs = () => {
    const id = window.location.href;
    const idArray = id.split('/');
    const logInfo = idArray[4];


    return (
        <div className="bg-grayscale-8 w-screen h-screen py-3">
            <Navbar/>
        </div>
    )
}

export default Logs;