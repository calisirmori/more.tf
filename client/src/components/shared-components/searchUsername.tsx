import { fetch, FetchResultTypes } from "@sapphire/fetch";
import React, { useEffect, useState, useRef } from "react";

const searchByUsername = async (input: string): Promise<any> => {
    const [searchInternalData, setSearchInternalData] = useState<any>({});
    const [searchSteamData, setSearchSteamData] = useState<any>({});
  try {
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
  
      let steamIds: any = [];
      for (let index = 0; index < response.rows.length; index++) {
        steamIds.push(response.rows[index].id64);
      }
  
      const getSteamInfo = async (steamIds: any) => {
        const idsString = steamIds.join(',');
        let response: any = await fetch(`/api/steam-info?ids=${idsString}`, FetchResultTypes.JSON);
        return response;
      }
  
      const steamInfo = await getSteamInfo(steamIds);
      let finalObject = {};
      for (let index = 0; index < steamInfo.response.players.length; index++) {
        finalObject = {...finalObject, [steamInfo.response.players[index].steamid]: steamInfo.response.players[index]}
      }

      return (finalObject);
  } catch (error) {
    // Handle errors as needed
    console.error('Error fetching data: ', error);
    return null; // or you could re-throw the error, depending on your error handling strategy
  }
};

export default searchByUsername;