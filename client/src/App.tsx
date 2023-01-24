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
      <div className="bg-black w-full h-screen absolute z-0 top-0">
        <img src="https://i.imgur.com/0YGCnmh.jpeg" alt="" className=" absolute h-screen object-cover w-full z-0 opacity-10 top-0" />
        <div className="text-white absolute z-10 top-16">
          <div className="grid md:grid-cols-2 max-md:grid-rows-2 max-md:px-0 max-lg:px-10 max-lg:gap-10  w-screen h-96 gap-32 px-48 my-20 " >
            <div className="flex justify-center items-center">
              <div className="w-full max-lg:w-96 max-xl:w-96 max-md:w-96 max-sm:w-screen max-sm:px-4">
                <div className="block text-center">
                  <div className="font-rajdhani font-bold text-4xl max-sm:text-3xl">TEAM FORTRESS 2 STATS</div>
                  <div className="font-cantarell text-xl -my-2 max-sm:text-lg">Find the numbers behind your gameplay</div>
                </div>
                <div className="flex mt-14">
                  <div className="h-14 w-14 rounded-l-md bg-grayscale-8 flex justify-center items-center cursor-pointer">
                    <svg className="h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
                    </svg>
                  </div>
                  <input className="focus:outline-none appearance-none border-0 w-full rounded-r-md placeholder-grayscale-2 pl-4 text-black bg-gray-200" type="text" placeholder='Steam id or Username' />
                </div>
                <div className="flex justify-center items-center mt-4">
                  <div className="h-0.5 w-48 bg-grayscale-2"></div>
                  <span className=" px-3 text-grayscale-1 font-cantarell font-semibold pb-1">or</span>
                  <div className="h-0.5 w-48 bg-grayscale-2"></div>
                </div>
                <div className="flex h-10 items-center justify-center bg-gradient-to-t from-blue-900 to-grayscale-6 rounded-lg mt-4 py-5 cursor-pointer hover:outline outline-grayscale-2 duration-100">
                  <span>Sign in through Steam</span>
                  <img className="h-7 ml-3" src="https://www.citypng.com/public/uploads/small/11664330747vj8jipl81prbt4ezfskjtjn7nfnvqobgjgjdatrnt9b0npg2vfshgtfedqewtdjwmprl70eedyaxgsti5kafk7y1brfmfyeshaov.png" alt="" />
                </div>

              </div>
            </div>
            <div className="border border-pink-500">
              <div></div>
              <div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default App
