import React from "react";
import Navbar from "../shared-components/Navbar";

const Profile = () => {
  return (
    <div className="bg-grayscale-8 w-screen h-screen py-3">
      <Navbar />
      <div className="relative">
        <img
          className="top-2 absolute z-0 w-full h-60 object-cover object-top "
          src="https://preview.redd.it/u0s66muqalpy.jpg?auto=webp&s=0b1f90148db69c777c08df12cd7df8ffe694e159"
          alt=""
        />
        <div className="h-10 z-50 absolute top-2 w-full bg-gradient-to-b from-grayscale-8"></div>
        <div className="z-40 absolute top-2 w-full h-60 bg-black opacity-60"></div>
        <div className="absolute z-50 top-56 w-full">
            <div className="h-12 bg-grayscale-7 w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
