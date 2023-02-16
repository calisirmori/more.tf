import React, { useState } from "react";
import Navbar from "../shared-components/Navbar";

const Logs = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const logInfo = idArray[4];

  const [tab, setTab] = useState("scoreboard");

  return (
    <div className=" bg-warmscale-7 w-screen h-screen py-3">
      <Navbar />
      <div className="mt-3 flex items-center justify-center">
        <div
          id="stat-window"
          className=" w-[88rem] mx-5 bg-warmscale-8 h-32 mt-5 rounded-t-md drop-shadow"
        >
          <div id="header" className="flex pt-4 flex-wrap justify-between pr-5">
            <div id="match-info" className="flex gap-7">
              <div id="format-logo"></div>
              <div className="block">
                <div
                  id="match-type"
                  className=" text-lightscale-6 font-medium -mb-1.5"
                >
                  Casual
                </div>
                <div
                  id="map"
                  className=" text-lightscale-2 text-xl font-semibold font-cantarell"
                >
                  Product
                </div>
              </div>
              <div id="match-scores" className="flex">
                <div
                  id="blue-team-scores"
                  className="block text-center rounded-sm bg-tf-blue border-b-4 border-tf-blue-dark pt-1 px-3"
                >
                  <div className=" text-lightscale-2 text-2xl font-bold font-cantarell mt-0.5">
                    0
                  </div>
                </div>
                <div
                  id="score-divider"
                  className=" text-lightscale-2 text-3xl font-extrabold font-cantarell mx-2 mt-0.5"
                >
                  :
                </div>
                <div
                  id="blue-team-scores"
                  className="block text-center rounded-sm bg-tf-red border-b-4 border-tf-red-dark pt-1 px-3"
                >
                  <div className=" text-lightscale-2 text-2xl font-bold font-cantarell mt-0.5">
                    0
                  </div>
                </div>
              </div>
              <div id="match-time" className="block">
                <div
                  id="date"
                  className=" text-lightscale-6 font-medium -mb-1.5"
                >
                  2/16/23, 11:40 AM
                </div>
                <div
                  id="length"
                  className=" text-lightscale-2 text-xl font-semibold font-cantarell"
                >
                  29m 37s
                </div>
              </div>
              <div id="rank-info" className="block">
                <div
                  id="date"
                  className=" text-lightscale-6 font-medium -mb-1.5"
                >
                  Average Rank
                </div>
                <div
                  id="length"
                  className=" text-lightscale-2 text-xl font-semibold font-cantarell"
                >
                  Advanced
                </div>
              </div>
            </div>
            <div
              id="other-links"
              className="flex gap-4 justify-center items-center"
            >
              <button className="rounded-sm hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-7 bg-warmscale-7 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                demos.tf
              </button>
              <button className="rounded-sm hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-7 bg-warmscale-7 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                logs.tf
              </button>
              <div className="flex items-center justify-center rounded-sm hover:bg-warmscale-9 hover:border-tf-orange duration-75 border border-warmscale-7 cursor-pointer bg-warmscale-7 h-10 drop-shadow px-3 text-lightscale-2 font-bold font-cantarell">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="fill-lightscale-2 w-5"
                >
                  <path
                    clip-rule="evenodd"
                    fill-rule="evenodd"
                    d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div id="tabs" className="grid grid-cols-5 text-center mt-5">
            <div onClick={()=>{setTab("scoreboard")}} className={`border-b-2 duration-75  ${tab === "scoreboard" ? "border-tf-orange cursor-default" : "border-warmscale-8 hover:border-warmscale-9 hover:bg-warmscale-9 cursor-pointer"} py-2 text-lightscale-2 text-lg font-bold font-cantarell`}>Scoreboard</div>
            <div onClick={()=>{setTab("performance")}} className={`border-b-2 duration-75  ${tab === "performance" ? "border-tf-orange cursor-default" : "border-warmscale-8 hover:border-warmscale-9 hover:bg-warmscale-9 cursor-pointer"} py-2 text-lightscale-2 text-lg font-bold font-cantarell`}>Performance</div>
            <div onClick={()=>{setTab("rounds")}} className={`border-b-2 duration-75 ${tab === "rounds" ? "border-tf-orange cursor-default" : "border-warmscale-8 hover:bg-warmscale-9 hover:border-warmscale-9 cursor-pointer"} py-2 text-lightscale-2 text-lg font-bold font-cantarell`}>Rounds</div>
            <div onClick={()=>{setTab("matchups")}} className={`border-b-2 duration-75 ${tab === "matchups" ? "border-tf-orange cursor-default" : "border-warmscale-8 hover:bg-warmscale-9 hover:border-warmscale-9 cursor-pointer"} py-2 text-lightscale-2 text-lg font-bold font-cantarell`}>Matchups</div>
            <div onClick={()=>{setTab("other")}} className={`border-b-2 duration-75 ${tab === "other" ? "border-tf-orange cursor-default" : "border-warmscale-8 hover:bg-warmscale-9 hover:border-warmscale-9 cursor-pointer"} py-2 text-lightscale-2 text-lg font-bold font-cantarell`}>Other</div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
