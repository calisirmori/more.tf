import moretfWhiteLogo from "../../assets/moretf-white-medium.png";
import { useState, useEffect} from 'react';
import SearchBox from "./searchUsername";
import { getCurrentRGLHL, getCurrentRGL6S, getCurrentOZFHL, getCurrentOZF6S } from "../../data/seasons";

const Navbar = () => {
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileID, setProfileID] = useState<any>({});

  // Function to toggle the menu's state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getCookies = () => {
    const cookies = document.cookie.split(';').reduce((cookieObject:any, cookieString) => {
      const [cookieName, cookieValue] = cookieString.trim().split('=');
      cookieObject[cookieName] = cookieValue;
      return cookieObject;
    }, {});
    setProfileID(cookies);
  };
  
  const loginButton = <div className="flex justify-center items-center">
  <a href="/api/myprofile">
    <div className="flex justify-center items-center border rounded-md h-8 px-3 border-warmscale-3 bg-warmscale-6 bg-opacity-20 hover:border-warmscale-2 hover:bg-opacity-60 hover:cursor-pointer duration-200">
      {profileID.userid === undefined && <svg height="18" viewBox="0 0 24 24" className="fill-lightscale-2 mr-2">
        <path d="M23.938 12c0 6.595-5.353 11.938-11.957 11.938A11.95 11.95 0 0 1 .476 15.254l4.583 1.892a3.382 3.382 0 0 0 6.696-.823l4.067-2.898a4.512 4.512 0 0 0 4.611-4.5 4.511 4.511 0 0 0-9.02 0v.057l-2.85 4.125a3.37 3.37 0 0 0-2.094.583L.062 11.042C.553 4.895 5.7.062 11.981.062 18.585.062 23.938 5.405 23.938 12zm-16.38 6.176l-1.469-.607a2.541 2.541 0 0 0 1.31 1.242 2.544 2.544 0 0 0 3.32-1.367 2.51 2.51 0 0 0 .005-1.94A2.53 2.53 0 0 0 7.48 14.1l1.516.625a1.862 1.862 0 0 1 1.006 2.44 1.87 1.87 0 0 1-2.445 1.012zm8.365-6.253c-1.656 0-3.004-1.348-3.004-2.999s1.348-2.999 3.004-2.999 3.004 1.348 3.004 3-1.343 2.998-3.004 2.998zm.005-.75a2.254 2.254 0 0 0 0-4.505 2.257 2.257 0 0 0-2.258 2.251 2.263 2.263 0 0 0 2.258 2.253z"></path>
      </svg>}
      <div className="text-lightscale-2 hover:text-lightscale-0 duration-200 font-semibold text-xs">{profileID.userid === undefined ? "LOGIN" : "PROFILE"}</div>
    </div>
  </a>
  </div>;

  useEffect(() => {
    getCookies();
  }, []);
  
  useEffect(() => {
  }, [profileID])

  return (
    <div className="relative h-28">
      <div className="bg-warmscale-9 px-3 top-0 font-cantarell w-full absolute z-50 drop-shadow-sm border-b border-warmscale-7/70">
      <div className="h-14 flex justify-between ">
        <div className="flex justify-center  items-center w-fit">
          <div className="md:hidden mr-2">
              <button
                onClick={toggleMenu} // Set the onClick handler
                className="p-2 rounded-md focus:outline-none focus:bg-warmscale-7/70"
                aria-label="Open menu"
              >
                {/* SVG for hamburger icon */}
                <svg
                  className="h-6 w-6 stroke-lightscale-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"

                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={`M4 6h16M4 12h${isMenuOpen ? '7' : '16'} m-7 6h7`}
                  />
                </svg>
              </button>
            </div>

            {/* This is the menu that gets toggled */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden`}>
              <div className="absolute w-screen h-[400px] bg-warmscale-82 top-0 left-0 py-2 px-3 drop-shadow border-b-2 border-warmscale-7/70">
              <button
                onClick={toggleMenu} // Set the onClick handler
                className="p-2 rounded-md focus:outline-none focus:bg-warmscale-7/70"
                aria-label="Open menu"
              >
                {/* SVG for hamburger icon */}
                <svg
                  className="h-6 w-6 stroke-lightscale-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"

                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={`M4 6h16M4 12h${isMenuOpen ? '7' : '16'} m-7 6h7`}
                  />
                </svg>
              </button>
                <div className="w-full flex justify-center">
                  <div className="mt-4">
                    <SearchBox />
                  </div>
                </div>
                <div className="">
                  <div className=" text-lightscale-5 text-lg font-semibold  hover:text-lightscale-1 mt-10 duration-200 flex justify-center">
                    <a href={`/season-summary/${getCurrentRGLHL()}`} className="">HL SUMMARY</a>
                  </div>
                  <div className=" text-lightscale-5 text-lg font-semibold  hover:text-lightscale-1 mt-10 duration-200 flex justify-center">
                    <a href={`/season-summary/${getCurrentRGL6S()}`} className="">6S SUMMARY</a>
                  </div>
                  <div className=" text-lightscale-5 text-lg font-semibold  hover:text-lightscale-1 mt-10 duration-200 flex justify-center">
                    <a href={`/season-summary-ozf/${getCurrentOZFHL()}`} className="">OZFORTRESS HL</a>
                  </div>
                  <div className=" text-lightscale-5 text-lg font-semibold  hover:text-lightscale-1 mt-10 duration-200 flex justify-center">
                    <a href={`/season-summary-ozf/${getCurrentOZF6S()}`} className="">OZFORTRESS 6S</a>
                  </div>
                  <div className=" text-lightscale-5  text-lg  font-semibold  hover:text-lightscale-1 mt-6 duration-200 flex justify-center">
                    <a href="/leaderboard" className="">LEADERBOARD</a>
                  </div>
                </div>
              </div>
            </div>
          <a className="flex hover:opacity-80 duration-200" href="/">
            <img
              className="object-contain h-9 max-md:h-8 max-md:mr-2 "
              src="/new-logo-big.png"
              alt="icon"
            />
            <img
              className="object-contain h-8 max-md:h-8 max-md:scale-0 max-md:w-0 md:ml-2"
              src={moretfWhiteLogo}
              alt="logo"
            />
          </a>
          <div className=" text-lightscale-5 text-sm font-semibold md:ml-20 max-md:ml-10 max-sm:ml-0 max-sm:scale-0 max-sm:w-0 hover:text-lightscale-1 duration-200">
            <a href={`/season-summary/${getCurrentRGLHL()}`} className="">HL SUMMARY</a>
          </div>
          <div className=" text-lightscale-5  text-sm  font-semibold md:ml-10 max-md:ml-5 max-sm:ml-0  max-sm:scale-0 max-sm:w-0 hover:text-lightscale-1 duration-200">
            <a href={`/season-summary/${getCurrentRGL6S()}`} className="">6S SUMMARY</a>
          </div>
          <div className=" text-lightscale-5  text-sm  font-semibold md:ml-10 max-md:ml-5 max-sm:ml-0  max-sm:scale-0 max-sm:w-0 hover:text-lightscale-1 duration-200">
            <a href={`/season-summary-ozf/${getCurrentOZFHL()}`} className="">OZ HL</a>
          </div>
          <div className=" text-lightscale-5  text-sm  font-semibold md:ml-10 max-md:ml-5 max-sm:ml-0  max-sm:scale-0 max-sm:w-0 hover:text-lightscale-1 duration-200">
            <a href={`/season-summary-ozf/${getCurrentOZF6S()}`} className="">OZ 6S</a>
          </div>
          <div className=" text-lightscale-5  text-sm  font-semibold md:ml-10 max-md:ml-5 max-sm:ml-0  max-sm:scale-0 max-sm:w-0 hover:text-lightscale-1 duration-200">
            <a href="/leaderboard" className="">LEADERBOARD</a>
          </div>
        </div>
        
        <div className="flex justify-end gap-5 items-center">
          <div className="max-md:scale-0 max-md:w-0 ml-3">
              <SearchBox />
          </div>
          {loginButton}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Navbar;
