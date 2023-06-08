import React from "react";
import moretfWhiteLogo from "../../assets/moretf-white-medium.png";

const Navbar = () => {
  return (
    <div className="w-full">
      <div className="flex px-4 flex-wrap justify-between w-full">
        <a href="/">
          <img className="object-contain ml-2" src={moretfWhiteLogo} alt="logo" />
        </a>
        {/* <div className="flex items-center pt-1">
          <input className="bg-grayscale-9 h-9 text-white border border-grayscale-4 rounded-l-sm w-96 duration-300 max-lg:w-72 max-md:w-40 max-sm:w-0 max-sm:border-0" type="text" />
          <button className="bg-grayscale-6 h-9 px-4 rounded-r-sm text-white font-medium">SEARCH</button>
        </div> */}
        <div className="flex text-white font-semibold text-2xl px-3 gap-8 pt-1 font-cantarell">
          <a href="/season-15-summary">S15 LIVE</a>
          <a href="/api/myprofile">Profile</a>
        </div>
      </div>
      <div className="bg-tf-orange h-4 mt-3 text-xs flex justify-center font-semibold font-cantarell">this app is still really early in its development, to report bugs, share ideas, or to contact the developer reach out to Mori#8885 on discord or click discord link: <a className="ml-3 underline" target="_blank" href="https://discord.gg/yytQq44pBE">Discord</a></div>
    </div>
  );
};

export default Navbar;
