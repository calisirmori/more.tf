import React from "react";
import moretfWhiteLogo from "../../assets/moretf-white-medium.png";

const Navbar = () => {
  return (
    <div className="w-full  ">
      <div className="flex bg-warmscale-9 bg-opacity-60 px-4 pb-2 pt-2 flex-wrap justify-between w-full">
        <a className="flex items-center justify-center" href="/">
          <img className="object-contain ml-2 h-10" src="/new-logo-big.png" alt="icon"  />
          <img className="object-contain ml-2 mb-1" src={moretfWhiteLogo} alt="logo" />
        </a>
        {/* <div className="flex items-center pt-1">
          <input className="bg-grayscale-9 h-9 text-white border border-grayscale-4 rounded-l-sm w-96 duration-300 max-lg:w-72 max-md:w-40 max-sm:w-0 max-sm:border-0" type="text" />
          <button className="bg-grayscale-6 h-9 px-4 rounded-r-sm text-white font-medium">SEARCH</button>
        </div> */}
        <div className="flex text-white font-semibold text-2xl px-3 gap-8 pt-1.5 font-cantarell">
          <a href="/season-16-summary">S16 LIVE</a>
          <a href="/api/myprofile">Profile</a>
        </div>
      </div>
      <div className=" bg-gradient-to-b from-warmscale-9 to-transparent opacity-60 h-4  text-xs flex justify-center font-semibold font-cantarell"></div>
    </div>
  );
};

export default Navbar;
