import React from "react";
import { assets } from "../assets/assets";
import { ArrowRight, CalculatorIcon, Clock10Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
      <img src={assets.marvelLogo} alt="" className="max-h-11 lg:h-11 mt-20" />
      <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
        Guardians <br /> of the Galaxy
      </h1>

      <div className="flex flex-col items-center gap-4 text-gray-300">
        <div className="flex gap-5 max-w-md  mr-16">
          <span>Action | Adventure | Sci-Fi</span>
          <div className="flex items-center gap-1">
            <CalculatorIcon className="w-4.5 h-4.5" />
            2018
          </div>
          <div className="flex items-center gap-1">
            <Clock10Icon className="w-4.5 h-4.5" />
            2h 8m 2018
          </div>
        </div>

        <p className="max-w-md text-gray-300">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Adipisci,
          quam expedita debitis officiis voluptatem sed eum fugit veniam quod
          delectus id impedit accusantium sit blanditiis autem maiores ea quasi?
          Veritatis!
        </p>
        <button
          onClick={() => navigate("/movies")}
          className="flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Explore Movies
          <ArrowRight className="w-5 h-5"></ArrowRight>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
