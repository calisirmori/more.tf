import React from "react";
import moretfWhiteLogo from "../../assets/moretf-white-medium.png";
const Navbar = () => {
  return (
    <div className="flex px-4 flex-wrap justify-between">
      <a href="/">
        <img className="object-contain ml-2" src={moretfWhiteLogo} alt="logo" />
      </a>
      {/* <div className="flex items-center pt-1">
        <input className="bg-grayscale-9 h-9 text-white border border-grayscale-4 rounded-l-sm w-96 duration-300 max-lg:w-72 max-md:w-40 max-sm:w-0 max-sm:border-0" type="text" />
        <button className="bg-grayscale-6 h-9 px-4 rounded-r-sm text-white font-medium">SEARCH</button>
      </div> */}
      <div className="flex text-white font-semibold text-2xl px-3 pt-1 font-cantarell">
        <a href="/season-14-summary"> S14 Summary</a>
      </div>
    </div>
  );
};

export default Navbar;
