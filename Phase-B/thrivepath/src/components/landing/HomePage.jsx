/*
  HomePage.jsx

  The landing page of ThrivePath. 
  It introduces the app's purpose and provides navigation links for new users to sign up 
  or existing users to sign in.
*/

import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4 py-6">
      {/* App title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600">ThrivePath</h1>

      {/* Short app description */}
      <p className="text-base sm:text-lg text-gray-700 mt-3 sm:mt-4 max-w-2xl px-2 sm:px-4">
        ThrivePath is designed to support children with Failure to Thrive (FTT) in managing their daily lives,
        fostering growth, and building a healthier future.
      </p>

      {/* Navigation buttons to sign up or sign in */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md">
        <Link to="/signup" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base w-full">
          Sign Up
        </Link>
        <Link to="/signin" className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base w-full">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default HomePage;