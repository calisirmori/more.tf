import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Navbar from './components/shared-components/Navbar'


function App() {
  return (
    <div className='bg-grayscale-8 min-h-screen pt-3'>
      <div className=" absolute z-10 w-full top-0 pt-3">
        <Navbar />
      </div>
      <div className="bg-black w-full h-[36rem]  absolute z-0 top-0">
        <img src="https://i.imgur.com/0YGCnmh.jpeg" alt="" className=" absolute h-[36rem] object-cover w-full z-0 opacity-10 top-0" />
        <div>hey</div>
      </div>
      
    </div>
  )
}

export default App
