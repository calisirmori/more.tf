import Navbar from "../shared-components/Navbar";
import Footer from "../shared-components/Footer";
import React, { useEffect, useState, useRef } from "react";
import { S14summary, S15summary } from "../summary";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { time } from "console";

const Leaderboard = () => {
  const [leaderboardStats, setLeaderboardStats] = useState<any>([]);
const [currentClassFilter, setCurrentClassFilter] = useState<any>("all");
  useEffect(() => {
    playerCardCall();
  }, []);

  useEffect(() => {}, [leaderboardStats]);

  async function playerCardCall() {
    let response: any = {};
    try {
      response = await fetch(
        `/api/leaderboard-stats`,
        FetchResultTypes.JSON
      );
      setLeaderboardStats(response);
    } catch (error) {}
  }

  async function classFilter(value: string){
    setCurrentClassFilter(value)
  }

  let currentRow = 0;

  return (
    <div className=" bg-warmscale-7 min-h-screen"  data-testid="leaderboard-container">
      <Navbar />
      <div className="w-full h-full font-ubuntu">
        <div className="flex w-full items-center justify-center mt-6">
          <div>
            <div>
              <div className="text-5xl max-sm:text-3xl font-extrabold text-lightscale-3 text-center">
                LEADERBOARD
              </div>
              <div className="text-1xl max-sm:text-md font-extrabold text-lightscale-6 text-center">
                SEASON 16 | OCT 2 - NOV 13
              </div>
            </div>
            <div className="lg:flex justify-between h-5 mt-4 max-lg:mb-10">
                <div className="flex items-center justify-center text-lg font-cantarell font-semibold text-lightscale-4">
                    FILTER:
                    <div className="flex font-cantarell font-semibold w-60 ml-2 mt-1 gap-2">
                        <select
                          id="countries"
                          className="bg-warmscale-8 ring-tf-orange outline-none text-lightscale-2 text-sm rounded-md focus:ring-tf-orange focus:border-tf-orange block w-full py-0.5 mb-1 px-2.5"
                          onChange={(event) =>
                            classFilter(event.target.value)
                        }
                        value={currentClassFilter}
                        >
                          <option value="all">ALL CLASSES</option>
                          <option value="scout">SCOUT</option>
                          <option value="soldier">SOLDIER</option>
                          <option value="pyro">PYRO</option>
                          <option value="demoman">DEMOMAN</option>
                          <option value="heavyweapons">HEAVY</option>
                          <option value="engineer">ENGINEER</option>
                          <option value="medic">MEDIC</option>
                          <option value="sniper">SNIPER</option>
                          <option value="spy">SPY</option>
                        </select>
                    </div>
                </div>
                <div style={{lineHeight: '18px'}} className="flex gap-4 justify-center text-lg font-cantarell font-semibold text-lightscale-4 mr-4">
                    <div className="flex items-baseline justify-center">
                        <div className="mr-2">INV</div>
                        <div className="h-3 w-3 bg-yellow-500 border border-yellow-600 rounded-sm"></div>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <div className="mr-2">ADV</div>
                        <div className="h-3 w-3 bg-rose-800 border border-rose-900 rounded-sm"></div>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <div className="mr-2">MAIN</div>
                        <div className="h-3 w-3 bg-fuchsia-600 border border-fuchsia-700 rounded-sm"></div>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <div className="mr-2">IM</div>
                        <div className="h-3 w-3 bg-violet-600 border border-violet-700 rounded-sm"></div>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <div className="mr-2">AM</div>
                        <div className="h-3 w-3 bg-blue-800 border border-blue-900 rounded-sm"></div>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <div className="mr-2">NC</div>
                        <div className="h-3 w-3 bg-gray-600 border border-gray-700 rounded-sm"></div>
                    </div>
                </div>
            </div>
            <div className="max-h-[670px] max-xl:w-[80vw] overflow-y-scroll flex justify-center custom-scrollbar max-lg:overflow-x-scroll relative mt-2 rounded-sm">
              <table className="text-left bg-warmscale-8 bg-opacity-40">
                <thead className="text-base text-tf-orange border-t-2 border-warmscale-8 border-opacity-40 sticky -top-1 z-40 bg-warmscale-8">
                  <tr>
                    <th></th>
                    <th scope="col" className="text-centerpy-3 px-10 text-lg">
                      #
                    </th>
                    <th scope="col" className="py-3 pr-32 pl-8 text-lg">
                      NAME
                    </th>
                    <th scope="col" className="py-3 px-6">
                        <div>
                            <div className="-mb-1.5 flex">COMBAT <div className="max-lg:hidden"> (CBT)</div></div>
                            <div className="text-center text-xs text-tf-orange-dark">KILLS</div>
                        </div>
                    </th>
                    <th scope="col" className="py-3 px-6">
                        <div>
                            <div className="-mb-1.5 flex">SUPPORT <div className="max-lg:hidden"> (SPT)</div></div>
                            <div className="text-center text-xs text-tf-orange-dark">ASSISTS</div>
                        </div>
                    </th>
                    <th scope="col" className="py-3 px-6">
                        <div>
                            <div className="-mb-1.5 flex">SURVIVAL <div className="max-lg:hidden"> (SVL)</div></div>
                            <div className="text-center text-xs text-tf-orange-dark">DEATHS</div>
                        </div>
                    </th>
                    <th scope="col" className="py-3 px-6">
                        <div>
                            <div className="-mb-1.5 flex">EFFICIENCY <div className="max-lg:hidden"> (EFF)</div></div>
                            <div className="text-center text-xs text-tf-orange-dark">KILLS/DEATHS</div>
                        </div>
                    </th>
                    <th scope="col" className="py-3 px-6">
                        <div>
                            <div className="-mb-1.5 flex">DAMAGE <div className="max-lg:hidden"> (DMG)</div></div>
                            <div className="text-center text-xs text-tf-orange-dark">DAMAGE</div>
                        </div>
                    </th>
                    <th scope="col" className="py-3 px-6">
                        <div>
                            <div className="-mb-1.5 flex">EVASION <div className="max-lg:hidden"> (EVA)</div></div>
                            <div className="text-center text-xs text-tf-orange-dark">DTM</div>
                        </div>
                    </th>
                    <th scope="col" className="sticky right-0 z-50 py-3 px-6 text-lg bg-warmscale-8">OVERALL</th>
                  </tr>
                </thead>
                <tbody className="font-robotomono text-lg  text-lightscale-6 font-semibold">
                  {leaderboardStats.map((playerStats: any, index: number) => {
                    const currentColor = findColor();
                    
                    if (playerStats.class === currentClassFilter || currentClassFilter === "all"){
                        currentRow++;
                        return (
                          <tr
                            key={index}
                            className={`border-t-2 align-middle ${
                                currentRow % 2 === 0 && "bg-warmscale-8 bg-opacity-20"
                            } border-warmscale-8 border-opacity-40 border`}
                          >
                            <td className="flex items-center justify-center relative ">
                              <div className="flex items-center absolute -top-2.5 left-1">
                                <div
                                  className={`w-1 h-8 rounded-full ${currentColor} mr-0.5 absolute`}
                                ></div>
                                <div
                                  className={`w-1 h-8 rounded-full ${currentColor} absolute  left-2`}
                                ></div>
                              </div>
                            </td>
                            <td className="text-center text-2xl text-lightscale-2">
                              {index + 1}
                            </td>
                            <td className="flex item-center py-1">
                              <div className="flex items-center">
                                <img
                                  src={`../../../class icons/Leaderboard_class_${playerStats.class}.png`}
                                  alt=""
                                  className="h-6 border-2 rounded-md border-warmscale-8 bg-warmscale-8 border-opacity-30 bg-opacity-20 object-contain mr-2 flex items-center"
                                />
                              </div>
                              <div className="flex font-extrabold text-2xl text-lightscale-2 font-robotomono w-48">
                                <div className=" truncate">
                                  <a href={`/profile/${playerStats.id64}`}>{playerStats.rglname}</a>
                                </div>
                              </div>
                            </td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50">{playerStats.cbt}</td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50">{playerStats.spt}</td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50">{playerStats.srv}</td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50">{playerStats.eff}</td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50">{playerStats.imp}</td>
                            <td className="text-center border-l border-warmscale-8 border-opacity-50">{playerStats.eva}</td>
                            <td className="text-center font-extrabold text-2xl text-lightscale-2 border-l sticky right-0 border-warmscale-8 border-opacity-50 max-xl:bg-warmscale-8" >
                              {Math.round(playerStats.avg_score)}
                            </td>
                          </tr>
                        );
                    }

                    function findColor() {
                      switch (playerStats.division) {
                        case "invite":
                          return "bg-yellow-600";
                        case "advanced":
                          return "bg-rose-800";
                        case "main":
                          return "bg-fuchsia-600";
                        case "intermediate":
                          return "bg-violet-600";
                        case "amateur":
                          return "bg-blue-600";
                        case "newcomer":
                          return "bg-gray-600";
                        default:
                          break;
                      }
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer/>

      </div>
    </div>
  );
};

export default Leaderboard;
