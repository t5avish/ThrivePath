import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-5xl font-bold text-blue-600">ThrivePath</h1>
      <p className="text-lg text-gray-700 mt-4 max-w-2xl">
        ThrivePath is designed to support children with Failure to Thrive (FTT) in managing their daily lives,
        fostering growth, and building a healthier future.
      </p>
      <div className="mt-6 flex gap-4">
        {/* Use Link instead of <a> */}
        <Link to="/signup" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition">
          Sign Up
        </Link>
        <Link to="/signin" className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
