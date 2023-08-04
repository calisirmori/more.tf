import Navbar from "../shared-components/Navbar";
import React, { useEffect, useState, useRef } from "react";
import { S14summary, S15summary } from "../summary";

const SeasonSummary = () => {
  const summary = S15summary;

  const [currentDivision, setCurrentDivision] = useState<string>("invite");
  const [currentClass, setCurrentClass] = useState<string>("scout");
  const [displayArray, setDisplayArray] = useState<any>([]);
  const [currentSort, setCurrentSort] = useState("kills");
  let rowCount = 0;
  useEffect(() => {
    sortTable();
  }, [currentDivision, currentClass, currentSort]);

  function sortTable() {
    console.log(currentSort);
    let currentArray: any = Object.entries(summary[currentDivision]);
    let playersWithClassSelection: any = [];
    let sortedArray: any = [];
    
    for (
      let playerIndex = 0;
      playerIndex < currentArray.length;
      playerIndex++
    ) {
      if (currentArray[playerIndex][1].classPlayed[currentClass] !== undefined) {
        currentArray[playerIndex][1].classPlayed[currentClass].totalTime > 0 && playersWithClassSelection.push(currentArray[playerIndex]);
      }
    }
    let unsortedArray: any = playersWithClassSelection;
    for (
      let playerIndex = 0;
      playerIndex < unsortedArray.length + 1;
      playerIndex++
    ) {
      let min = Number.MIN_SAFE_INTEGER;
      let currentSpot = 0;
      for (
        let innerIndex = 0;
        innerIndex < unsortedArray.length;
        innerIndex++
      ) {
        let sortByStat;
        
        if (currentSort !== "kd" && currentSort !== "totalTime") {
          sortByStat =
            unsortedArray[innerIndex][1].classPlayed[currentClass][currentSort] /
            (unsortedArray[innerIndex][1].classPlayed[currentClass].totalTime / 60);
        } else if (currentSort === "totalTime"){
            sortByStat =unsortedArray[innerIndex][1].classPlayed[currentClass][currentSort];
        } else {
          sortByStat =
            unsortedArray[innerIndex][1].classPlayed[currentClass].kills /
            unsortedArray[innerIndex][1].classPlayed[currentClass].deaths;
        }
        if (sortByStat >= min) {
          min = sortByStat;
          currentSpot = innerIndex;
        }
      }
      sortedArray.push(unsortedArray[currentSpot]);
      unsortedArray.splice(currentSpot, 1);
      playerIndex = 0;
    }
    setDisplayArray(sortedArray);
  }

  return (
    <div className=" bg-warmscale-7 min-h-screen py-3">
      <Navbar />
      <div className="w-full h-full font-ubuntu max-sm:scale-50 max-sm:-mt-52 max-lg:scale-50 max-xl:scale-75 max-lg:-mt-36 max-xl:-mt-20 max-md:scale-50">
        <div className="flex justify-center mt-10 max-[450px]:scale-50 max-sm:scale-75 max-lg:scale-110">
          <div className="bg-warmscale-8 rounded-md">
            <div className="text-center text-lightscale-1 font-bold text-5xl  py-8">
              RGL HL S15 SUMMARY
            </div>
            <div className="flex text-lightscale-1 font-semibold text-xl">
              <div
                onClick={() => {
                  setCurrentDivision("invite");
                }}
                className={` ${
                  currentDivision === "invite"
                    ? "text-lightscale-1 border-b-2 border-tf-orange"
                    : "text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9"
                } select-none w-72 text-center py-2`}
              >
                INVITE
              </div>
              <div
                onClick={() => {
                  setCurrentDivision("advanced");
                }}
                className={` ${
                  currentDivision === "advanced"
                    ? "text-lightscale-1 border-b-2 border-tf-orange"
                    : "text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9"
                } select-none w-72 text-center py-2`}
              >
                ADVANCED
              </div>
              <div
                onClick={() => {
                  setCurrentDivision("main");
                }}
                className={` ${
                  currentDivision === "main"
                    ? "text-lightscale-1 border-b-2 border-tf-orange"
                    : "text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9"
                } select-none w-72 text-center py-2`}
              >
                MAIN
              </div>
              <div
                onClick={() => {
                  setCurrentDivision("im");
                }}
                className={` ${
                  currentDivision === "im"
                    ? "text-lightscale-1 border-b-2 border-tf-orange"
                    : "text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9"
                } select-none w-72 text-center py-2`}
              >
                INTERMEDIATE
              </div>
            </div>
            <div className="grid grid-cols-9 text-lightscale-1 font-semibold text-xl">
              {classHeader(setCurrentClass, currentClass, "scout")}
              {classHeader(setCurrentClass, currentClass, "soldier")}
              {classHeader(setCurrentClass, currentClass, "pyro")}
              {classHeader(setCurrentClass, currentClass, "demoman")}
              {classHeader(setCurrentClass, currentClass, "heavyweapons")}
              {classHeader(setCurrentClass, currentClass, "engineer")}
              {classHeader(setCurrentClass, currentClass, "medic")}
              {classHeader(setCurrentClass, currentClass, "sniper")}
              {classHeader(setCurrentClass, currentClass, "spy")}
            </div>
            <div className="p-2">
              <div className="grid grid-cols-[250px,repeat(7,1fr)] text-center text-lightscale-1 font-semibold py-1 ">
                <div className="text-left pl-3">PLAYER</div>
                <div
                  className="cursor-pointer relative group flex justify-center items-center"
                  onClick={() => setCurrentSort("kills")}
                >
                  {currentSort === "kills" && (
                    <div className="-ml-2">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="h-4 -ml-2"
                      >
                        <path
                          clipRule="evenodd"
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        ></path>
                      </svg>
                    </div>
                  )}
                  K/m
                  <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                    Kills Per Minute
                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <div
                  className="cursor-pointer group relative flex justify-center items-center"
                  onClick={() => setCurrentSort("assists")}
                >{currentSort === "assists" && (
                  <div className="-ml-2">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-4 -ml-2"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      ></path>
                    </svg>
                  </div>
                )}
                
                  A/m
                  <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                    Assists Per Minute
                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <div
                  className="cursor-pointer relative group flex justify-center items-center"
                  onClick={() => setCurrentSort("deaths")}
                >{currentSort === "deaths" && (
                  <div className="-ml-2">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-4 -ml-2"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      ></path>
                    </svg>
                  </div>
                )}
                  D/m
                  <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                    Deaths Per Minute
                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <div
                  className="cursor-pointer relative group flex justify-center items-center"
                  onClick={() => setCurrentSort("kd")}
                >{currentSort === "kd" && (
                  <div className="-ml-2">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-4 -ml-2"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      ></path>
                    </svg>
                  </div>
                )}
                  K/D
                  <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                    Kill / Deaths
                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <div
                  className="cursor-pointer relative group flex justify-center items-center"
                  onClick={() => setCurrentSort("damage")}
                >{currentSort === "damage" && (
                  <div className="-ml-2">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-4 -ml-2"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      ></path>
                    </svg>
                  </div>
                )}
                  DMG/m
                  <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                    Damage Per Minute
                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <div
                  className="cursor-pointer group relative flex justify-center items-center"
                  onClick={() => setCurrentSort("damageTaken")}
                >{currentSort === "damageTaken" && (
                  <div className="-ml-2">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-4 -ml-2"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      ></path>
                    </svg>
                  </div>
                )}
                  DT/m
                  <div className="absolute scale-0 w-40 bottom-9 bg-warmscale-7 px-2 py-1 group-hover:scale-100 left-1/2 transform -translate-x-1/2">
                    Damage Taken Per Minute
                    <div className="h-2 w-2 flex justify-center items-center bg-warmscale-7 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                </div>
                <div
                  className="cursor-pointer flex justify-center items-center"
                  onClick={() => setCurrentSort(`${currentClass === "medic" ? "heal" : currentClass === "sniper" ? "headshotsHit" : currentClass === "spy" ? "backstabs" : "totalTime"}`)}
                >{currentSort === `${currentClass === "medic" ? "heal" : currentClass === "sniper" ? "headshotsHit" : currentClass === "spy" ? "backstabs" : "totalTime"}` && (
                  <div className="-ml-2">
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="h-4 -ml-2"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      ></path>
                    </svg>
                  </div>
                )}
                  {currentClass === "medic" ? "Heals/m" : currentClass === "sniper" ? "HS/m" : currentClass === "spy" ? " BS/m" : "Playtime"}
                </div>
              </div>
              {displayArray.map((currentPlayer: any, index: number) => {
                
                const playtimeInMinutes = currentPlayer[1].classPlayed[currentClass] !== undefined ?  (currentPlayer[1].classPlayed[currentClass].totalTime/ 60) : 0;
                const playerObject = currentPlayer[1];

                if(playtimeInMinutes > 45 ){
                  rowCount++;
                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[250px,repeat(7,1fr)] text-center text-lightscale-4 items-center ${
                        rowCount % 2 === 1 && "bg-warmscale-85"
                      }`}
                    >
                      <div className="pl-3 text-left text-lightscale-2">
                        <div className="-mb-2 truncate ">
                          <a
                            href={`/profile/${playerObject.playerID64}`}
                            className="hover:text-tf-orange font-semibold"
                          >
                            {playerObject.playerUserName}
                          </a>
                        </div>
                        <div>
                          <a
                            href={`${
                              playerObject.teamId !== "none" &&
                              `https://rgl.gg/Public/Team.aspx?t=${playerObject.teamId}&r=24`
                            }`}
                            className={`${
                              playerObject.teamId !== "none" &&
                              "hover:text-tf-orange"
                            } select-none pl-0.5 text-xs text-lightscale-7`}
                          >
                            {playerObject.team}
                          </a>
                        </div>
                      </div>
                      <div
                        className={` py-2.5 ${
                          currentSort === "kills" && "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {(playerObject.classPlayed[currentClass].kills / playtimeInMinutes).toFixed(2)}
                      </div>
                      <div
                        className={` py-2.5 ${
                          currentSort === "assists" &&
                          "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {(playerObject.classPlayed[currentClass].assists / playtimeInMinutes).toFixed(2)}
                      </div>
                      <div
                        className={` py-2.5 ${
                          currentSort === "deaths" &&
                          "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {(playerObject.classPlayed[currentClass].deaths / playtimeInMinutes).toFixed(2)}
                      </div>
                      <div
                        className={` py-2.5 ${
                          currentSort === "kd" && "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {(playerObject.classPlayed[currentClass].kills / playerObject.classPlayed[currentClass].deaths).toFixed(2)}
                      </div>
                      <div
                        className={` py-2.5 ${
                          currentSort === "damage" &&
                          "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {(playerObject.classPlayed[currentClass].damage / playtimeInMinutes).toFixed(1)}
                      </div>
                      <div
                        className={` py-2.5 ${
                          currentSort === "damageTaken" &&
                          "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {(playerObject.classPlayed[currentClass].damageTaken / playtimeInMinutes).toFixed(
                          1
                        )}
                      </div>
                      <div
                        className={` py-2.5 ${
                          currentSort === `${currentClass === "medic" ? "heal" : currentClass === "sniper" ? "headshotsHit" : currentClass === "spy" ? "backstabs" : "totalTime"}` &&
                          "bg-warmscale-2 bg-opacity-5"
                        }`}
                      >
                        {currentClass === "medic" ? ((playerObject.classPlayed[currentClass].heal / playtimeInMinutes).toFixed(2)) : currentClass === "sniper" ? ((playerObject.classPlayed[currentClass].headshotsHit / playtimeInMinutes).toFixed(2)) : currentClass === "spy" ? ((playerObject.classPlayed[currentClass].backstabs / playtimeInMinutes).toFixed(2)) : (Math.ceil(playerObject.classPlayed[currentClass].totalTime/60) + " mins")}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            <div className=" text-right text-warmscale-5 mb-2 mr-3 font-bold">
              THANK YOU ZAHIR FOR COLLECTING THE LOGS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonSummary;

function classHeader(
  setCurrentClass: React.Dispatch<React.SetStateAction<string>>,
  currentClass: string,
  className: string
) {
  return (
    <div
      onClick={() => {
        setCurrentClass(className);
      }}
      className={`flex pt-2 justify-center items-center ${
        currentClass === className
          ? "text-lightscale-1 border-b-2 border-tf-orange"
          : "text-lightscale-8 border-b-2 bg-warmscale-85 border-warmscale-9 cursor-pointer hover:bg-warmscale-9"
      } select-none text-center py-2`}
    >
      <img
        src={`../../../class icons/Leaderboard_class_${className}.png`}
        alt=""
        className="h-8"
      />
    </div>
  );
}
