import React, { useEffect, useState, useRef } from "react";
import Navbar from "../shared-components/Navbar";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import Footer from '../shared-components/Footer';
import SearchBox from "../shared-components/searchUsername";

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
    }, 1500);
  
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
    
    setSearchSteamData(finalObject);
  }

  return (
    <div className="bg-warmscale-82 min-h-screen">
      <div className="h-fit">
        <img className="absolute top-0 max-h-screen object-cover w-screen h-screen opacity-[0.15]" src="https://external-preview.redd.it/7Jrx530CBou3DFt_zXb-iLIG3s4XtR1lpMkEYbvO7xU.jpg?auto=webp&s=5c115bc4032529447bc8987b178a1bbe14d8af84" alt="" />
        <div className="absolute top-0 flex max-h-screen h-full w-full justify-center items-center">
          <div>
            <div className=" flex justify-center">
              <div className=" p-2 rounded-full w-fit bg-gradient-to-br from-tf-orange-dark via-tf-orange to-tf-orange-dark">
                <img src="\new-logo-big.png" className="h-32 bg-warmscale-8 p-3 rounded-full select-none" alt="" />
              </div>
            </div>
              <img src="\moretf-white.png" alt="" className="-mt-4 select-none" />
              <div className="text-center -mt-4 text-xl font-roboto font-bold text-lightscale-2">Team Fortress 2 Analytics</div>
              <div className="mt-6">
                <SearchBox/>
              </div>
          </div>
          <div className="absolute z-40 bottom-2 text-lightscale-6 font-semibold">
            what is more.tf?
            <div className="flex justify-center">
              <svg fill="none" className="h-8 -mt-1" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
        <Navbar />  
      </div>
      <div className="top-full absolute bg-warmscale-9 w-full">
        <div className="">
          {/* <div className="h-[1300px] w-[1300px] bg-warmscale-6/10 rotate-45 absolute"></div> */}
        </div>
        <div >
        <div className="absolute bg-repeat-y inset-0 bg-contain opacity-[0.015]" style={{ backgroundImage: `url('\achivement-background.png')` }}></div>
        </div>
        <div className="min-h-screen flex justify-center items-center relative py-10">
          <div className="lg:flex justify-center items-center w-[80%] gap-12">
            <div className="font-ubuntu lg:w-1/2 max-lg:w-full">
              <h1 className=" text-4xl text-lightscale-1 font-bold">What is more.tf?</h1>
              <p className="my-4 text-lightscale-3 text-sm">Immerse yourself in the analytical side of Team Fortress 2 with more.tf, where every match you play is dissected into actionable insights. It's not just about looking at your scores; it's about understanding the strategies that led to those moments. As the dust settles on the battlefield, more.tf stands ready to guide you through a detailed post-mortem of your gaming prowess. <br /><br />
                With more.tf, you're not just revisiting your past games; you're preparing for the next challenge. The site offers an intuitive interface where you can easily navigate through your performance data, match history, and personal statistics that tell the tale of your TF2 journey. It's a place to celebrate your critical hits and learn from the misses, all with the goal of honing your skills.<br /><br />
                But more.tf isn't only about reflection—it's about connection. Compare your stats with friends, analyze your team's dynamics, and see where you stand in the broader TF2 community. Whether you're a scout zipping through the frontlines or an engineer fortifying your base, more.tf provides the numbers that matter to you.</p>
            </div>
          <div className="lg:w-1/2 flex min-h-fit mb-10 justify-center items-center min-w-fit max-lg:w-full">
            <div>
            <div className="bg-warmscale-8 p-3 w-fit border border-warmscale-7 rounded-md">
              <div className=" text-sm text-lightscale-5 font-semibold font-ubuntu mb-2">Team Fortress 2 Matches Parsed</div>
              <div className="flex items-baseline">
                <div className="text-4xl font-robotomono font-bold text-tf-orange px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">1</div>
                <div className="text-4xl font-roboto font-extrabold text-tf-orange mx-0.5 ">,</div>
                <div className="text-4xl font-robotomono font-bold text-tf-orange px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">4</div>
                <div className="text-4xl font-robotomono font-bold text-tf-orange px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">7</div>
                <div className="text-4xl font-robotomono font-bold text-tf-orange px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">0</div>
                <div className="text-4xl font-roboto font-extrabold text-tf-orange mx-0.5 ">,</div>
                <div className="text-4xl font-robotomono font-bold text-tf-orange px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">9</div>
                <div className="text-4xl font-robotomono font-bold text-tf-orange px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">5</div>
                <div className="text-4xl font-robotomono font-bold text-tf-orange px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">4</div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="bg-warmscale-8 p-3 w-fit border border-warmscale-7 rounded-md mt-4">
                <div className=" text-sm text-lightscale-5 font-semibold font-ubuntu mb-2">Profile Pages</div>
                  <div className="flex items-baseline">
                    <div className="text-4xl font-robotomono font-bold text-lightscale-2 px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">8</div>
                    <div className="text-4xl font-robotomono font-bold text-lightscale-2 px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">7</div>
                    <div className="text-4xl font-roboto font-extrabold text-lightscale-2 mx-0.5 ">,</div>
                    <div className="text-4xl font-robotomono font-bold text-lightscale-2 px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">9</div>
                    <div className="text-4xl font-robotomono font-bold text-lightscale-2 px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">6</div>
                    <div className="text-4xl font-robotomono font-bold text-lightscale-2 px-1.5 py-1 border border-warmscale-6 bg-warmscale-82/40 rounded-md mx-0.5">4</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          </div>
          <div className="absolute z-40 bottom-2 text-lightscale-6 font-semibold max-md:opacity-0 max-md:h-0">
            Profile Pages
            <div className="flex justify-center">
              <svg fill="none" className="h-8 -mt-1" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="min-h-screen flex justify-center items-center relative py-10">
          <div className="lg:flex justify-center items-center w-[80%] gap-10 h-fit">
            <div className="font-ubuntu lg:w-1/2 max-lg:w-full">
              <h1 className=" text-4xl text-lightscale-1 font-bold">All about you!</h1>
              <p className="my-4 text-lightscale-3 text-sm">Team Fortress 2 is more than a game—it's a community where every player's actions can leave a lasting impact. At more.tf, we celebrate this by giving every player a personal spotlight.<br /><br />
                 Here's what your profile on more.tf will showcase, all for free: <br /><br />

                 <strong>• Total Matches:</strong> See all the battles you've fought.<br />
                 <strong>• Overall Win Rates:</strong> Track your victories and learn from losses.<br />
                 <strong>• Personalized Match View:</strong> Every game has a story. Find yours.<br />
                 <strong>• Seasonal Player Cards:</strong> Celebrate your TF2 journey with custom stats snapshots.<br />
                 <strong>• Win Rate per Map:</strong> Know where you shine or where to improve.<br />
                 <strong>• Class Specific Stats:</strong> Deep dive into how you perform with each class.<br />
                 <strong>• Recent Activity:</strong> Stay up-to-date with your latest TF2 escapades.<br />
                 <strong>• Teammates:</strong> Remember the comrades who've got your back.<br /><br />

                 And we're just getting started! We're also mapping out the entire TF2 community through tier rankings and broadcasting spectacular in-game achievements with our global highlights reel, featured across the site.<br /><br />

                 Hop into more.tf and let's make your TF2 experience as legendary as your gameplay!</p>
            </div>
            <div className="lg:w-1/2 flex min-h-fit max-lg:mb-10 justify-center items-center min-w-fit max-lg:w-full ">
              <div className="">
                <img src="\profile-page-example.png" alt="" className=" object-contain w-full h-full max-h-[70vh] border-2 border-warmscale-5 drop-shadow-md lg:rotate-2 rounded-md" />
              </div>
            </div>
          </div>
          <div className="absolute z-40 bottom-2 text-lightscale-6 font-semibold max-md:opacity-0 max-md:h-0">
            Logs
            <div className="flex justify-center">
              <svg fill="none" className="h-8 -mt-1" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="min-h-screen flex justify-center items-center relative py-10">
          <div className="lg:flex justify-center items-center w-[80%] gap-10 h-fit">
            <div className="font-ubuntu lg:w-1/2 max-lg:w-full">
              <h1 className=" text-4xl text-lightscale-1 font-bold">Get more from your logs!</h1>
              <p className="my-4 text-lightscale-3 text-sm">Team Fortress 2 is a game of moments and mastery, and at more.tf, we turn every log from logs.tf into a trove of personal insights. Here's what you can unearth in the "Logs" section, tailored to help you fine-tune your gameplay:<br /> <br />
                <strong>• Damage Dealt & Taken:</strong> Break down the give-and-take of your battles by class.<br />
                <strong>• Kill Map:</strong> Visualize where you claim victory and where you meet your fate on the battlefield.<br />
                <strong>• Class Comparisons:</strong> Stack up your performance against different classes to see where you excel.<br />
                <strong>• DPM & HPM Charts:</strong> Gauge your impact with damage and heals per minute at a glance.<br />
                <strong>• Highlander Class Stats:</strong> Specialized metrics for the highlander aficionados.<br />
                <strong>• Deathscreen Time:</strong> Analyze downtime to improve survival strategies.<br />
                <strong>• Crossbow Healings:</strong> Track your Medic's marksmanship and support prowess.<br /><br />
                ...and that's just the beginning. We've got heaps more data points and personalized stats that we can't wait for you to explore.<br /><br />
                Suit up, log in, and let's dive deep into your TF2 legacy at more.tf—where every number is a step towards greatness.</p>
            </div>
            <div className="lg:w-1/2 flex min-h-fit max-lg:mb-10 justify-center items-center max-lg:w-full  ">
              <div className="">
                <img src="\logs-page-example.png" alt="" className=" object-contain w-full h-full max-h-[70vh] border-2 border-warmscale-5 drop-shadow-md lg:rotate-2 rounded-md" />
              </div>
            </div>
          </div>
          <div className="absolute z-40 bottom-2 text-lightscale-6 font-semibold max-md:opacity-0 max-md:h-0">
          Season Summary
            <div className="flex justify-center">
              <svg fill="none" className="h-8 -mt-1" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
        <div className="min-h-screen flex justify-center items-center relative py-10">
          <div className="lg:flex justify-center items-center w-[80%] gap-10 h-fit">
            <div className="font-ubuntu lg:w-1/2 max-lg:w-full">
              <h1 className=" text-4xl text-lightscale-1 font-bold">Get more from your logs!</h1>
              <p className="my-4 text-lightscale-3 text-sm">In Team Fortress 2, every season unfolds new stories and opportunities for growth. That's why at more.tf, we bring you the "Season Summary," a feature that refreshes weekly to encapsulate your journey. It's a snapshot of your gameplay's influence on your seasonal averages, offering a clear view of your evolving tactics and skills. <br /><br />
                As you navigate through the season, our summary doesn't just track your progress—it also places it in the context of the broader TF2 arena. Compare your performance with that of your peers to see how you stack up, providing a competitive edge and a motivational boost.<br /><br />
                But it's not all about competition; it's about personal development. The "Season Summary" helps you identify the areas you excel in and the aspects you could polish. It's an insightful guide pointing you toward the areas that, once improved, can turn a good season into a great one.<br /><br />
                Tune into more.tf weekly. It's where your stats tell the story of a season, and where you can script the next chapter with strategic gameplay and an eye on improvement.</p>
            </div>
            <div className="lg:w-1/2 flex min-h-fit max-lg:mb-10 justify-center items-center max-lg:w-full  ">
              <div className="">
                <img src="\ss-example-page.png" alt="" className=" object-contain w-full h-full max-h-[70vh] border-2 border-warmscale-5 drop-shadow-md lg:rotate-2 rounded-md" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
