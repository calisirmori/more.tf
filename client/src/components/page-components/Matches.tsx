import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";


const Matches = () => {
    const id = window.location.href;
    const idArray = id.split("/");
    const playerId = idArray[4];
    
    useEffect(() => {
        steamInfoCallProfile()
        matchesInfoCall()
    }, [])
    

    const [profileData, setProfileData] = useState({});
    const [logsData, setLogsData] = useState([]);
    const [currentLogsView, setCurrentLogsView] = useState(1);
    const [pageSearch, setPageSearch] = useState(0);

    async function steamInfoCallProfile() {
        const response: any = await fetch(
          `http://localhost:8082/api/steam-info/${playerId}`,
          FetchResultTypes.JSON
        );
        setProfileData(response.response.players[0]);
    }

    async function matchesInfoCall() {
        const response: any = await fetch(
          `http://localhost:8082/api/match-history/${playerId}&limit=10000`,
          FetchResultTypes.JSON
        );
        setLogsData(response.rows);
    }

  return (
    <div className="bg-warmscale-7 min-h-screen pt-3">
        <Navbar />
        <div className="flex justify-center w-full items-center mt-10 bg-warmscale-8 py-8">
          <div className="w-[76rem] flex justify-between">
            <div className="flex items-center">
              <img
                src={profileData.avatarfull}
                alt=""
                className="rounded-md h-24"
              />
              <div className="ml-5 mb-3  font-cantarell ">
                <div className="text-lightscale-2 font-bold text-5xl">
                  {profileData.personaname}{" "}
                </div>
              </div>
            </div>
            <div id="links" className="flex gap-2 items-center">
              <a
                target="_blank"
                href={`https://steamcommunity.com/profiles/${playerId}`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
              >
                Steam
              </a>
              <a
                target="_blank"
                href={`https://demos.tf/profiles/${playerId}`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell"
              >
                demos.tf
              </a>
              <a
                target="_blank"
                href={`https://etf2l.org/search/${playerId}/`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow text-lightscale-2 font-bold font-cantarell"
              >
                <img
                  src="../../../site icons/etf2l.webp"
                  alt=""
                  className="h-8"
                />
              </a>
              <a
                target="_blank"
                href={`https://rgl.gg/Public/PlayerProfile.aspx?p=${playerId}&r=24`}
                className="rounded-sm flex items-center cursor-pointer hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-85 bg-warmscale-85 h-10 drop-shadow p-2 text-lightscale-2 font-bold font-cantarell"
              >
                <img src="../../../site icons/rgl.png" alt="" className="h-7" />
              </a>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center">
            <div className="w-[76rem]">
            <div className="bg-warmscale-8 mt-4 py-3 px-4 rounded-md font-cantarell drop-shadow-sm mb-6">
                <div className="mt-0">
                  {logsData.map((match, index) => {
                    while (index >= 25*(currentLogsView-1) && index < 25*currentLogsView) {
                      return (
                        <a
                          href={`/log/${match.logid}`}
                          className={`flex h-11 items-center hover:bg-warmscale-85 cursor-pointer ${
                            index !== 24 && "border-b"
                          } justify-between border-warmscale-7`}
                        >
                          <div className="flex items-center my-1">
                            <img
                              src={`../../../class icons/Leaderboard_class_${match.class}.png`}
                              alt=""
                              className="h-7 ml-3"
                            />
                            <div className="border-l border-warmscale-7 ml-3 py-1.5 h-full">
                              <div
                                className={`${
                                  match.match_result === "W"
                                    ? "bg-green-600"
                                    : match.match_result === "L"
                                    ? "bg-red-600"
                                    : "bg-stone-500"
                                } w-5 h-5 flex ml-3 items-center justify-center text-xs font-bold rounded-sm`}
                              >
                                {match.match_result}
                              </div>
                            </div>
                            <div className="border-l border-warmscale-7 ml-3 py-1 text-lightscale-1 font-cantarell h-full w-full flex items-center">
                              <div className="ml-2">
                                {match.map
                                  .split("_")[1]
                                  .charAt(0)
                                  .toUpperCase() +
                                  match.map.split("_")[1].slice(1)}
                              </div>
                              <div className="ml-1 text-sm text-lightscale-6 w-full truncate">
                                (
                                {match.title.includes("serveme")
                                  ? match.title.slice(23)
                                  : match.title}
                                )
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center p">
                            <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 gap-7 flex ml-3 pl-3 h-full">
                              <div className="w-[4.5rem]">
                                <div className="text-xs text-right text-lightscale-8">
                                  K/D/A
                                </div>
                                <div className="text-xs text-right">
                                  {match.kills}{" "}
                                  <span className="mx-0.5">/</span>
                                  {match.assists}
                                  <span className="mx-0.5">/</span>
                                  {match.deaths}
                                </div>
                              </div>
                              {match.class !== "medic" ? <div className="w-8">
                                <div className="text-xs text-right text-lightscale-8">
                                  DPM
                                </div>
                                <div className="text-xs text-right">
                                  {match.dpm}
                                </div>
                              </div> :
                              <div className="w-8">
                              <div className="text-xs text-right text-lightscale-8">
                                HLS
                              </div>
                              <div className="text-xs text-right">
                                {match.heals}
                              </div>
                            </div>}
                              
                              <div className="w-8">
                                <div className="text-xs text-right text-lightscale-8">
                                  DTM
                                </div>
                                <div className="text-xs text-right">
                                  {match.dtm}
                                </div>
                              </div>
                            </div>
                            <div className="border-l text-lightscale-1 font-cantarell font-semibold border-warmscale-7 ml-3 py-2 h-full">
                              <div className="ml-3 text-xs text-lightscale-5">
                                {match.players > 15
                                  ? "HL"
                                  : match.players > 10
                                  ? "6S"
                                  : match.players > 6
                                  ? "4S"
                                  : "2S"}
                              </div>
                            </div>
                            <div className="border-l text-lightscale-1 font-cantarellfont-semibold border-warmscale-7 w-24 ml-3 pl-3 h-full pr-3">
                              <div className="text-xs text-right text-lightscale-4">
                                {Math.floor(match.match_length / 60)}:
                                {match.match_length % 60 < 10
                                  ? "0" + (match.match_length % 60)
                                  : match.match_length % 60}
                              </div>
                              <div className="text-xs text-right">
                                {Math.round(Date.now() / 1000) - match.date >
                                86400
                                  ? new Date(
                                      match.date * 1000
                                    ).toLocaleDateString()
                                  : Math.round(
                                      (Math.round(Date.now() / 1000) -
                                        match.date) /
                                        3600
                                    ) + " hrs ago"}
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    }
                  })}
                </div>
                <div className="flex justify-between font-cantarell ml-2 mt-2 mb-1">
                    <div className="flex">
                        {currentLogsView - 5 > 1 && <div onClick={()=>{setCurrentLogsView(1)}} className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5  text-lightscale-8 text-sm font-semibold px-2 border border-opacity-50 border-tf-orange-dark"> {1} </div>}
                        {currentLogsView - 5 > 1 && <div className="select-none flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border-y border-opacity-50 border-tf-orange-dark"> ... </div>}
                        {currentLogsView > 1 && <div onClick={()=>{setCurrentLogsView(currentLogsView - 1)}} className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border border-opacity-50 border-tf-orange-dark"> {currentLogsView-1} </div>}
                        <div className="flex justify-center items-center py-0.5 text-tf-orange text-sm font-semibold px-2 border border-tf-orange"> {currentLogsView} </div>
                        {currentLogsView < Math.ceil(logsData.length/25) && <div onClick={()=>{setCurrentLogsView(currentLogsView + 1)}} className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border-y border-r border-opacity-50 border-tf-orange-dark"> {currentLogsView + 1} </div>}
                        {currentLogsView + 7 < logsData.length/25 && <div className="select-none flex justify-center items-center py-0.5 text-lightscale-8 text-sm font-semibold px-2 border-y border-opacity-50 border-tf-orange-dark"> ... </div>}
                        {currentLogsView + 7 < logsData.length/25 && <div onClick={()=>{setCurrentLogsView(Math.ceil(logsData.length/25))}} className="hover:bg-warmscale-82 select-none hover:text-lightscale-2 hover:border-tf-orange cursor-pointer flex justify-center items-center py-0.5  text-lightscale-8 text-sm font-semibold px-2 border border-opacity-50 border-tf-orange-dark"> {Math.ceil(logsData.length/25)} </div>}
                    </div>
                    <div className="flex mr-2">
                        <input value={pageSearch} onChange={(e)=> {setPageSearch(e.target.value)}} type="number" min="1" max={Math.ceil(logsData.length/25)} className="w-14 bg-warmscale-6 text-sm font-semibold rounded-l-md pl-2 text-lightscale-2 font-cantarell" />
                        <div onClick={()=>{setCurrentLogsView(parseInt(pageSearch) < Math.ceil(logsData.length/25) ? parseInt(pageSearch) : Math.ceil(logsData.length/25))}} className="bg-tf-orange px-2 text-sm font-semibold flex justify-center items-center rounded-r-md text-warmscale-7 cursor-pointer">GO</div>
                    </div>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}

export default Matches;