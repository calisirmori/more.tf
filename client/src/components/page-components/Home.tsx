import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

const Home = () => {

  const [searchInput, setSearchInput] = useState("");
  const [searchInternalData, setSearchInternalData] = useState({});
  const [searchSteamData, setSearchSteamData] = useState({});
  const [searching, setSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if(searchInput.length > 2){
        searchCall(searchInput)
      }
    }, 1000);
    setSearching(true);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput])
  
  async function searchCall(input: string){

    const response: any = await fetch(
      `http://localhost:8082/api/username-search/${input}`,
      FetchResultTypes.JSON
    );

    setSearchInternalData(response.rows);

    let steamCallArray = [];
    
    if( response.rows !== undefined ){
      for (let index = 0; index < response.rows.length; index++) {
        const steamResponse: any = await fetch(
          `http://localhost:8082/api/steam-info/${response.rows[index].id64}`,
          FetchResultTypes.JSON
        );
        steamCallArray.push(steamResponse.response.players[0]);
      }
    }
    setSearching(false);
    setSearchSteamData(steamCallArray);
  }

  return (
    <div className="bg-warmscale-8 min-h-screen pt-3 ">
      <div className=" absolute z-10 w-screen top-0 pt-3 ">
        <Navbar />
      </div>
      <div className="bg-black h-screen w-full absolute z-0 top-0 ">
        <img
          src="https://i.imgur.com/0YGCnmh.jpeg"
          alt=""
          className=" absolute h-screen object-cover w-full z-0 opacity-10 top-0"
        />
        <div className="text-white w-full absolute z-10 top-16">
          <div className="grid xl:grid-cols-2 max-md:px-0 max-lg:px-10 max-xl:gap-10 xl:h-[36rem]  gap-32 px-48 mt-20 mb-0">
            <div className="flex justify-center items-center">
              <div className={`w-full max-lg:w-96 max-xl:w-96 max-md:w-96 max-sm:w-screen max-sm:px-4 ${inputFocused && "mt-4"}`}>
                <div className="block text-center">
                  <div className="font-rajdhani font-bold text-4xl max-sm:text-3xl">
                    TEAM FORTRESS 2 STATS
                  </div>
                  <div className="font-cantarell text-xl -my-2 max-sm:text-lg">
                    Find the numbers behind your gameplay
                  </div>
                </div>
                <div className="">
                  <div className={`flex mt-14 relative `}>
                    <div className="h-14 w-14 rounded-l-md bg-warmscale-7 flex justify-center items-center cursor-pointer">
                      <svg
                        className="h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      onFocus={()=>{setInputFocused(true)}}
                      
                      className="focus:outline-none appearance-none border-0 w-full rounded-r-md placeholder-warmscale-2 pl-4 text-black bg-lightscale-2"
                      type="text"
                      onChange={(e) => {setSearchInput(e.target.value)}}
                      value={searchInput}
                      placeholder="Steam id or Username"
                    />
                  </div>
                  <div className={`${!inputFocused && "h-0"} w-full bg-warmscale-85 `}>
                    <div className="flex relative justify-between text-lg font-semibold text-lightscale-1 py-2 px-3 ">
                      {searchInput !== "" && searchSteamData.length !== undefined && inputFocused && 
                        <div className="w-full absolute left-0 top-0 min-h-40 bg-warmscale-85 rounded-b-md">
                          {searchSteamData.map((currentSearch, index) => {
                            console.log(currentSearch)
                            return(
                              <a href={`profile/${currentSearch.steamid}`} key={index} className={`flex justify-between py-2 px-3 hover:bg-warmscale-82 cursor-pointer items-center ${index !== searchSteamData.length-1 && "border-b"} border-warmscale-4`}>
                                <div className="flex items-center">
                                  <img src={currentSearch.avatar} className="h-6" alt="" />
                                  <div className="ml-2">{currentSearch.personaname}</div>
                                </div>
                                <div>{searchInternalData[index].count}</div>
                              </a>
                            )
                          })}
                        </div>
                      }
                      { searchInput !== "" && searching && inputFocused && 
                        <div className="w-full absolute left-0 top-0 h-40 bg-warmscale-85 rounded-b-md">
                          <div className="flex items-center w-full h-full justify-center">
                            <div
                              className="inline-block h-8 w-8 animate-spin text-tf-orange rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                              role="status"
                            >
                            </div>
                          </div>
                        </div>}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center items-center mt-4">
                  <div className="h-0.5 w-48 bg-warmscale-2"></div>
                  <span className=" px-3 text-lightscale-1 font-cantarell font-semibold pb-1">
                    or
                  </span>
                  <div className="h-0.5 w-48 bg-warmscale-2"></div>
                </div>
                <a href="http://localhost:8082/api/auth/steam" className="flex h-10 items-center justify-center bg-gradient-to-t from-blue-900 to-warmscale-6 rounded-lg mt-4 py-5 cursor-pointer hover:outline outline-warmscale-2 duration-100">
                  <span>Sign in through Steam</span>
                  <img
                    className="h-7 ml-3"
                    src="https://www.citypng.com/public/uploads/small/11664330747vj8jipl81prbt4ezfskjtjn7nfnvqobgjgjdatrnt9b0npg2vfshgtfedqewtdjwmprl70eedyaxgsti5kafk7y1brfmfyeshaov.png"
                    alt=""
                  />
                </a>
              </div>
            </div>
            <div className="flex justify-center items-center w-[36rem] h-full max-xl:w-full max-md:px-10  max-sm:px-2 max-sm:scale-90 duration-100">
              <div className="grid grid-cols-3 w-full lg:h-60 gap-3 ">
                <div className="relative">
                  <span className="flex justify-center items-center font-rajdhani font-semibold text-lg mb-1 text-lightscale-2 max-md:text-sm">
                    YOUR LAST GAME
                  </span>
                  <div className="bg-warmscale-8 relative rounded-md border-2 border-warmscale-4 h-56 hover:border-warmscale-2 cursor-pointer duration-100">
                    <div className="font-light flex justify-center items-center font-robotomono py-1 bg-warmscale-7 drop-shadow-md rounded-t-md">
                      #330694
                    </div>
                    <div className="flex justify-center items-center">
                      <div className=" rounded-full bg-gradient-to-b from-black to-warmscale-8 drop-shadow-lg mt-4">
                        <img
                          className="border-2 border-orange-600 h-14 w-14 object-cover m-1.5 rounded-full"
                          src="https://i1.sndcdn.com/avatars-o3aKLC4MdTH7WA8t-4WjbyQ-t500x500.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 font-quicksand max-md:text-sm  max-sm:text-xs">
                      koth_ashville_rc1
                    </div>
                    <div className="flex justify-center -mt-1 font-quicksand text-orange-400 max-md:text-sm ">
                      Highlander
                    </div>
                    <div className="flex font-quicksand justify-center text-lightscale-2 mt-4 max-md:text-sm  max-sm:text-xs">
                      <span className="max-sm:hidden">2:00PM </span>
                      <span>01/24/2023</span>
                    </div>
                  </div>
                </div>
                <a href="/profile/76561198068401396" className="relative">
                  <span className="flex justify-center items-center font-rajdhani font-semibold text-lg mb-1 text-lightscale-2 max-md:text-sm">
                    SIXES S10 MVP
                  </span>
                  <div className="bg-warmscale-8 relative rounded-md border-2 border-warmscale-4 h-56 hover:border-warmscale-2 cursor-pointer duration-100">
                    <div className="flex justify-center items-center">
                      <div className=" rounded-full bg-gradient-to-b from-black to-warmscale-8 drop-shadow-lg mt-12">
                        <img
                          className="border-2 border-orange-600 h-14 w-14 object-cover m-1.5 rounded-full"
                          src="https://marketplace.canva.com/EAFEits4-uw/1/0/800w/canva-boy-cartoon-gamer-animated-twitch-profile-photo-r0bPCSjUqg0.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 font-quicksand font-semibold max-md:text-sm">
                      BigJoe
                    </div>
                    <div className="flex justify-center -mt-1 font-quicksand font-thin text-orange-400 max-md:text-sm">
                      BestTeamEver
                    </div>
                  </div>
                </a>
                <div className="relative">
                  <span className="flex justify-center items-center font-rajdhani font-semibold text-lg mb-1 text-lightscale-32 max-md:text-sm">
                    HL S13 MVP
                  </span>
                  <div className="bg-warmscale-8 relative rounded-md border-2 border-warmscale-4 h-56 hover:border-warmscale-2 cursor-pointer duration-100">
                    <div className="flex justify-center items-center">
                      <div className=" rounded-full bg-gradient-to-b from-black to-warmscale-8 drop-shadow-lg mt-12">
                        <img
                          className="border-2 border-orange-600 h-14 w-14 object-cover m-1.5 rounded-full"
                          src="https://marketplace.canva.com/EAEeKH905XY/2/0/1600w/canva-yellow-and-black-gamer-grunge-twitch-profile-picture-Yf5RCMJroQI.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 font-quicksand font-semibold max-md:text-sm">
                      SmallerJoe
                    </div>
                    <div className="flex justify-center -mt-1 font-quicksand font-thin text-orange-400 max-md:text-sm">
                      NotSoBestTeam
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
