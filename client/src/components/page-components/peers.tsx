import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { useSpring, animated } from "react-spring";
import Footer from "../shared-components/Footer";

type SortField = 'count_with' | 'count_against' | 'winrate_with' | 'winrate_against';


const Peers = () => {
  const id = window.location.href;
  const idArray = id.split("/");
  const playerId = idArray[4];

  const [playerSteamInfo, setPlayerSteamInfo] = useState<any>({});
  const [peers, setPeers] = useState<any>([]);
  const [sortField, setSortField] = useState<SortField>('count_with');
  const [sortOrder, setSortOrder] = useState<any>(true);
  const [maxMatchesWith, setMaxMatchesWith] = useState<number>(0);
  const [maxMatchesAgainst, setMaxMatchesAgainst] = useState<number>(0);

  useEffect(() => {
    steamInfoCallProfile();
    peersCall();
  }, []);

  useEffect(() => {
    if (peers.length > 0) {
      sortPeers();
    }
  }, [sortField, sortOrder]);

  function header(setSortField: React.Dispatch<React.SetStateAction<SortField>>, sortField: string, sortVariable: any, name: string) {
    return <th onClick={() => { setSortField(sortVariable);  sortField === sortVariable ? setSortOrder(!sortOrder) : setSortOrder(true)} } className="px-6 py-3 h-12 border-b border-warmscale-6/40 text-left leading-4 text-lightscale-5 tracking-wider hover:text-lightscale-2 hover:cursor-pointer duration-200 group" style={{ width: '15%' }}>
        <div className="flex items-center">
            <div>{name}</div>
            {sortField !== sortVariable && <svg fill="none" strokeWidth={3} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 mt-0.5 ml-0.5 stroke-warmscale-2 group-hover:stroke-lightscale-6 duration-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>}
            {sortField === sortVariable && sortOrder && <svg fill="none" strokeWidth={4} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 mt-0.5 ml-0.5 stroke-tf-orange">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
            </svg>}
            {sortField === sortVariable && !sortOrder && <svg fill="none" strokeWidth={4} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 mt-0.5 ml-0.5 stroke-tf-orange">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
            </svg>}
        </div>
    </th>;
}


  async function steamInfoCallProfile() {
    let response: any = {};
    try {
      response = await fetch(
        `/api/steam-info?ids=${playerId}`,
        FetchResultTypes.JSON
      );
      setPlayerSteamInfo(response.response.players[0]);
    } catch (error) {
      console.log(error);
      console.log(response);
      response.personaname = "Steam Error";
      response.avatarfull = "Steam Error";
      setPlayerSteamInfo(response);
    }
  }

  async function peersCall() {
    try {
      const response:any = await fetch(
        `/api/peers-page/${playerId}`,
        FetchResultTypes.JSON
      );
      const peersData = response.rows;

      // Calculate the maximum matches with and against
      const maxWith = Math.max(...peersData.map((peer: any) => parseInt(peer.count_with)));
      const maxAgainst = Math.max(...peersData.map((peer: any) => parseInt(peer.count_against)));

      setMaxMatchesWith(maxWith);
      setMaxMatchesAgainst(maxAgainst);

      setPeers(peersData);
    } catch (error) {
      console.error('Error fetching peers:', error);
    }
  }

  const calculateWinrate = (wins: string, total: string) => {
    return parseInt(wins) / (parseInt(total) || 1);
  };

  const sortPeers = () => {
    const sortedPeers = [...peers].sort((a, b) => {
      let valueA: number;
      let valueB: number;

      if (sortField.startsWith('winrate')) {
        valueA = calculateWinrate(a['w_' + sortField.split('_')[1]], a['count_' + sortField.split('_')[1]]);
        valueB = calculateWinrate(b['w_' + sortField.split('_')[1]], b['count_' + sortField.split('_')[1]]);
      } else {
        valueA = parseInt(a[sortField]);
        valueB = parseInt(b[sortField]);
      }

      if (sortOrder === true) {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });
    setPeers(sortedPeers);

  };

  return (
    <div className=" bg-warmscale-7 min-h-screen ">
      <Navbar />
      <div className="flex flex-col">
        <div className="relative w-full h-fit flex-grow">
          <div className="flex justify-center w-full items-center bg-warmscale-8 py-8">
            <div className="w-[76rem] justify-between px-2 md:flex">
              <div className="flex items-center max-md:justify-center ">
                <img
                  src={playerSteamInfo.avatarfull}
                  alt=""
                  className="rounded-md sm:h-24 max-sm:h-16"
                />
                <div className="ml-5 mb-3  font-cantarell ">
                  <div className="text-lightscale-2 font-bold sm:text-5xl max-sm:text-3xl">
                    {playerSteamInfo.personaname}{" "}
                  </div>
                </div>
              </div>
              <div
                id="links"
                className="flex gap-2 items-center max-md:justify-center max-md:mt-3 "
              >
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
                  <img
                    src="../../../site icons/rgl.png"
                    alt=""
                    className="h-7"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="w-full mt-6 flex justify-center items-center">
            <div className="bg-warmscale-85 w-[76rem] mx-6 rounded-md drop-shadow h-fit" >
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-warmscale-8 rounded-t-md ">
                    <thead>
                      <tr className="font-cantarell">
                        <th className="px-6 py-3  border-b border-warmscale-6/40 text-left leading-4 text-lightscale-5 tracking-wider" style={{ width: '20%' }}>Player</th>
                        {header(setSortField, sortField, "count_with", "Matches With")}
                        {header(setSortField, sortField, "winrate_with", "Win Rate")}
                        {header(setSortField, sortField, "count_against", "Matches Against")}
                        {header(setSortField, sortField, "winrate_against", "Win Rate")}
                        <th className="px-6 py-3 h-12 border-b border-warmscale-6/40 text-left text-sm leading-4 text-lightscale-5 tracking-wider" style={{ width: '10%' }}>Last Match</th>
                      </tr>
                    </thead>
                    <tbody className="text-lightscale-5 font-semibold font-cantarell bg-warmscale-85">
                      {peers.map((peer:any, index:any) => {
                        console.log(peer)
                            const timestamp = peer.last_played * 1000; // Convert to milliseconds

                            const options:any = { year: 'numeric', month: 'short', day: '2-digit' };
                            const date = new Date(timestamp).toLocaleDateString('en-US', options);

                         return (<tr className=" text-sm font-semibold text-end">
                            <td className="px-6 py-2 border-b border-warmscale-7/50 flex items-center  ">
                                <div>
                                    <img src="/new-logo.png" alt="" className="h-8 min-w-[2rem] mr-2 " />
                                </div>
                                <div className="text-md truncate">{peer.peer_id64}</div>
                            </td>
                            <td className="pr-3  border-b border-warmscale-7/50 border-l ">
                                <div className="flex items-center">
                                    <div className="min-w-[40px]">{peer.count_with}</div>
                                    <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7">
                                        <div className="bg-tf-orange h-2 rounded-sm" style={{ width: `${( peer.count_with/ maxMatchesWith) *100}%` }}> </div>
                                    </div>
                                </div>
                            </td>
                            <td className="pr-3 pl-3 py-2 border-b border-warmscale-7/50 border-r">
                                <div className="flex items-center">
                                    <div className="min-w-[40px]">{Math.round(peer.w_with/peer.count_with*1000)/10}%</div>
                                    <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7">
                                        <div className={`bg-tf-orange h-2 rounded-sm ${Math.round(peer.w_with/peer.count_with*1000)/10 >= 50 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${Math.round(peer.w_with/peer.count_with*1000)/10}%` }}> </div>
                                    </div>
                                </div>
                            </td>
                            <td className="pr-3  py-2 border-b border-warmscale-7/50">
                                <div className="flex items-center">
                                    <div className="min-w-[40px]">{peer.count_against}</div>
                                    <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7">
                                        <div className="bg-tf-orange h-2 rounded-l-sm" style={{ width: `${( peer.count_against/ maxMatchesAgainst) *100}%` }}> </div>
                                    </div>
                                </div>
                            </td>
                            <td className="pr-3 pl-3 py-2 border-b border-warmscale-7/50 border-r">
                                <div className="flex items-center">
                                    <div className="min-w-[40px]">{Math.round(peer.w_against/peer.count_against*1000)/10}%</div>
                                    <div className="w-full h-2 ml-2 rounded-sm bg-warmscale-7 ">
                                        <div className={`bg-tf-orange h-2 rounded-sm ${Math.round(peer.w_against/peer.count_against*1000)/10 >= 50 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${Math.round(peer.w_against/peer.count_against*1000)/10}%` }}> </div>
                                    </div>
                                </div>
                            </td>
                            <td className="pr-4 py-2 border-b border-warmscale-7/50">
                                <div>{date}</div>
                            </td>
                          </tr>)
                      })}
                    </tbody>
                  </table>
                </div>
                <div className=""></div>
            </div>
            
          </div>
        </div>
        <div className="mt-6">
          <Footer/>
        </div>
      </div>     
    </div>
  );
};

export default Peers;

