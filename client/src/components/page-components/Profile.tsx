import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";

const Profile = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const playerId = idArray[4];

  const [playerSteamInfo, setPlayerSteamInfo] = useState({});
  const [matchesPlayedInfo, setMatchesPlayedInfo] = useState([]);

  useEffect(() => {
    steamInfoCall();
    matchesInfoCall();
  }, []);

  async function steamInfoCall() {
    const response: any = await fetch(
      `http://localhost:8082/api/steam-info/${playerId}`,
      FetchResultTypes.JSON
    );
    setPlayerSteamInfo(response.response.players[0]);
  }
  
  async function matchesInfoCall() {
    const response: any = await fetch(
      `http://localhost:8082/api/players/${playerId}`,
      FetchResultTypes.JSON
    );
    setMatchesPlayedInfo(response.rows);
  }

  console.log(matchesPlayedInfo)

  return (
    <div className=" bg-warmscale-8 min-h-screen py-3">
      <Navbar />
      <div className="relative w-full">
        <div className="flex justify-center w-full items-center mt-10 bg-warmscale-85 py-8">
          <div className="w-[76rem] flex justify-between">
            <div className="flex items-center">
              <img
                src={playerSteamInfo.avatarfull}
                alt=""
                className="rounded-md h-24"
              />
              <div className="ml-5 mb-3 text-lightscale-2 font-cantarell font-bold text-5xl">
                {playerSteamInfo.personaname}
              </div>
            </div>
            <div id="links" className="flex gap-2 items-center">
              <a
                target="_blank"
                href={`https://steamcommunity.com/profiles/${playerId}`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-8 bg-warmscale-8 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                Steam
              </a>
              <a target="_blank" href={`https://demos.tf/profiles/${playerId}`} className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-8 bg-warmscale-8 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                demos.tf
              </a>
              <a target="_blank" href={`https://etf2l.org/search/${playerId}/`} className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-8 bg-warmscale-8 h-10 drop-shadow text-lightscale-2 font-bold font-cantarell">
                <img
                  src="../../../site icons/etf2l.webp"
                  alt=""
                  className="h-8"
                />
              </a>
              <a
                target="_blank"
                href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${playerId}&r=24`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-8 bg-warmscale-8 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
              >
                <img
                  src="../../../site icons/rgl.png"
                  alt=""
                  className="h-7"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-[76rem] flex justify-between mt-4">
            <div id="summary" className="w-[50rem]">
              <div id="" className="grid grid-cols-2 h-20 gap-4">
                <div className="h-full bg-warmscale-85 rounded-md px-4 py-3">
                  <div className="flex justify-between items-baseline">
                    <div className="flex">
                      <div className="text-tf-orange text-xl font-semibold font-cantarell">199</div>
                      <div className="text-lightscale-1 text-xl ml-1 font-semibold font-cantarell">Matches</div>
                    </div>
                    <div className=" text-lightscale-7 font-cantarell font-semibold">FirstMatch: Feb 20, 2014</div>
                  </div>
                  <div className="bg-tf-orange h-2 mt-3 rounded-sm"></div>
                </div>
                <div className="h-full bg-warmscale-85 rounded-md px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex">
                      <div className="text-red-600 text-xl font-semibold font-cantarell">49.8%</div>
                      <div className="text-lightscale-1 text-xl ml-2 font-semibold font-cantarell">Win Rate</div>
                    </div>
                    <div className=" text-lightscale-7 text-sm font-cantarell font-semibold"> <span className="text-green-500">99</span> - <span className="text-red-600">101</span></div>
                  </div>
                  <div className="bg-warmscale-7 h-2 mt-3 rounded-sm">
                    <div className="bg-red-600 w-1/2 h-2 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div className="bg-warmscale-85 mt-4 py-3 px-4 rounded-md font-cantarell">
                <div className="text-lg text-lightscale-1 font-semibold">Matches</div>
                <div className="mt-3">
                  {matchesPlayedInfo.map((match, index) =>{
                    console.log(match);
                    while (index < 15){
                      return( <div className={`flex h-11 items-center ${index !== 14 && "border-b"} justify-between border-warmscale-7 my-1 py-1`}>
                      <div className="flex">
                        <img src={`../../../class icons/Leaderboard_class_${match.class}.png`} alt="" className="h-7 ml-3"/>
                        <div className="border-l border-warmscale-7 ml-3 py-2 h-full">
                          <div className={`${match.win === "W" ? "bg-green-500" : "bg-red-600"} w-5 h-5 flex ml-3 items-center justify-center text-xs font-bold rounded-sm`}>{match.win}</div>
                        </div>
                        <div className="border-l border-warmscale-7 ml-3 py-2 text-lightscale-1 font-cantarell h-full w-40 flex items-center">
                          <div className="ml-2">Product</div>
                        </div>
                      </div>
                      <div>
                        <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 gap-7 flex ml-3 pl-3 h-full">
                          <div className="w-14">
                            <div className="text-xs text-right text-lightscale-8">K/D/A</div>      
                            <div className="text-xs text-right">{match.kill}{match.assist}{match.death}</div>
                          </div>
                          <div className="w-8">
                            <div className="text-xs text-right text-lightscale-8">DPM</div>      
                            <div className="text-xs text-right">{match.dpm}</div>
                          </div>
                          <div className="w-8">
                            <div className="text-xs text-right text-lightscale-8">DTM</div>      
                            <div className="text-xs text-right">{match.dtm}</div>
                          </div>
                        </div>
                        <div className="border-l text-lightscale-1 font-cantarell font-semibold border-warmscale-7 ml-3 py-2 h-full">
                          <div className="ml-3 text-xs text-lightscale-5">HL</div>         
                        </div>
                        <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 ml-3 pl-3 h-full">
                          <div className="text-xs text-right">22:17</div>      
                          <div className="text-xs text-right">7 hr. ago</div>
                        </div>
                      </div>
                      
                    </div> )
                    }
                  })}
                </div>
              </div>
            </div>
            <div className="w-[25rem] h-screen bg-warmscale-85 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
