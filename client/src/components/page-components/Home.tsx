import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

const Home = () => {

  const [searchInput, setSearchInput] = useState("");
  const [searchInternalData, setSearchInternalData] = useState<any>({});
  const [searchSteamData, setSearchSteamData] = useState<any>({});
  const [searching, setSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchInput.length > 2) {
        try {
          setSearching(true);
          await searchCall(searchInput);
        } catch (error) {
          console.error("Error during search:", error);
        } finally {
          setSearching(false);
        }
      }
    }, 1000);
  
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);
  
  async function searchCall(input: string) {
    const response: any = await fetch(
      `/api/username-search/${input}`,
      FetchResultTypes.JSON
    ).then();

    if (!response.rows) {
      setSearchInternalData({});
      setSearchSteamData([]);
      return;
    }
  
    setSearchInternalData(response.rows);
  
    const steamPromises = response.rows.map((row :any) =>
      fetch(`/api/steam-info/${row.id64}`, FetchResultTypes.JSON)
        .then()
        .catch(err => {
          console.error(`Error fetching steam info for id ${row.id64}:`, err);
          return null;
        })
    );
  
    const steamData = (await Promise.all(steamPromises)).filter(Boolean);

    setSearchSteamData(steamData);
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
                          {searchSteamData.map((currentSearch:any, index:any) => {
                            if(index < 10){
                              const currentPlayerInfo = currentSearch.response.players[0]
                              return(
                                <a href={`profile/${currentPlayerInfo.steamid}`} key={index} className={`flex justify-between py-2 px-3 hover:bg-warmscale-82 cursor-pointer items-center ${index !== searchSteamData.length-1 && "border-b"} border-warmscale-4`}>
                                  <div className="flex items-center">
                                    <img src={currentPlayerInfo.avatar} className="h-6" alt="" />
                                    <div className="ml-2">{currentPlayerInfo.personaname}</div>
                                  </div>
                                  {searchInternalData[index] !== undefined && <div>{searchInternalData[index].count}</div>}
                                </a>
                              )
                            }

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
                <a href="/api/auth/steam" className="flex h-10 items-center justify-center bg-gradient-to-t from-blue-900 to-warmscale-6 rounded-lg mt-4 py-5 cursor-pointer">
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
                <a className="relative" href="/log/3378398">
                  <span className="flex justify-center items-center font-rajdhani font-semibold text-lg mb-1 text-lightscale-2 max-md:text-sm">
                    EXAMPLE LOG
                  </span>
                  <div className="bg-warmscale-8 relative rounded-md border-2 border-warmscale-4 h-56 hover:border-warmscale-2 cursor-pointer duration-100">
                    <div className="font-light flex justify-center items-center font-robotomono py-1 bg-warmscale-7 drop-shadow-md rounded-t-md">
                      #3378398
                    </div>
                    <div className="flex justify-center items-center">
                      <div className=" rounded-full bg-gradient-to-b from-black to-warmscale-8 drop-shadow-lg mt-4">
                        <img
                          className="border-2 border-orange-600 h-14 w-14 object-cover m-1.5 rounded-full"
                          src="https://avatars.akamai.steamstatic.com/0462901bf034ef06615019cdb2bbfc9bc747b256_full.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 font-quicksand max-md:text-sm  max-sm:text-xs">
                      koth_product_final
                    </div>
                    <div className="flex justify-center -mt-1 font-quicksand text-orange-400 max-md:text-sm ">
                      Highlander
                    </div>
                    <div className="flex font-quicksand justify-center text-lightscale-2 mt-4 max-md:text-sm  max-sm:text-xs">
                      <span className="max-sm:hidden">5:35PM</span>
                      <div className="ml-2">03/16/2023</div>
                    </div>
                  </div>
                </a>
                <a href="/profile/76561197970669109" className="relative">
                  <span className="flex justify-center items-center font-rajdhani font-semibold text-lg mb-1 text-lightscale-2 max-md:text-sm">
                    SIXES S10 MVP
                  </span>
                  <div className="bg-warmscale-8 relative rounded-md border-2 border-warmscale-4 h-56 hover:border-warmscale-2 cursor-pointer duration-100">
                    <div className="flex justify-center items-center">
                      <div className=" rounded-full bg-gradient-to-b from-black to-warmscale-8 drop-shadow-lg mt-12">
                        <img
                          className="border-2 border-orange-600 h-14 w-14 object-cover m-1.5 rounded-full"
                          src="https://avatars.akamai.steamstatic.com/cd78b56fcb7cc9f74ae30b5b2add073f87bf7fdb_full.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 font-quicksand font-semibold max-md:text-sm">
                      FROYO b4nny
                    </div>
                    <div className="flex justify-center -mt-1 font-quicksand font-thin text-orange-400 max-md:text-sm">
                      froyotech
                    </div>
                  </div>
                </a>
                <a href="/profile/76561198105529673" className="relative">
                  <span className="flex justify-center items-center font-rajdhani font-semibold text-lg mb-1 text-lightscale-2 max-md:text-sm">
                    HIGHLANDER S13 MVP
                  </span>
                  <div className="bg-warmscale-8 relative rounded-md border-2 border-warmscale-4 h-56 hover:border-warmscale-2 cursor-pointer duration-100">
                    <div className="flex justify-center items-center">
                      <div className=" rounded-full bg-gradient-to-b from-black to-warmscale-8 drop-shadow-lg mt-12">
                        <img
                          className="border-2 border-orange-600 h-14 w-14 object-cover m-1.5 rounded-full"
                          src="https://avatars.akamai.steamstatic.com/ae65b1629c9cdc1e20a938242bb10c51604587a1_full.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="flex justify-center mt-3 font-quicksand font-semibold max-md:text-sm">
                     blank
                    </div>
                    <div className="flex justify-center -mt-1 font-quicksand font-thin text-orange-400 max-md:text-sm">
                     Team Fun
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
