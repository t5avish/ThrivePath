/*
  Hydration.jsx

  This component displays hydration guidelines and recommendations for patients.
  It shows the daily water intake target and provides expandable tips for 
  maintaining proper hydration throughout the day. The component features a 
  collapsible interface with visual icons and structured recommendations.

*/

import React, { useState } from "react";

const Hydration = ({ hydration }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
      {/* Header with expand/collapse functionality */}
      <h2 
        className="text-2xl font-bold text-gray-800 mb-5 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className="bg-blue-500 w-1 h-8 rounded mr-3"></span>
          Hydration
        </div>
        {/* Chevron icon that rotates based on expanded state */}
        <svg 
          className={`h-6 w-6 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </h2>
      
      {/* Content shown only when expanded */}
      {isExpanded && (
        <>
          {/* Daily target section */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 font-medium">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Daily Target
              </div>
              {/* Display total water intake target from hydration prop */}
              <div className="text-gray-800 font-semibold text-lg">{hydration.totalWater}</div>
            </div>
          </div>

          {/* Recommendations section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-500 w-1 h-6 rounded mr-2"></span>
              Recommendations
            </h3>
            <div className="space-y-5">
              {/* Render each hydration tip with checkmark icon */}
              {hydration.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional hydration reminder section */}
          <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <span className="bg-blue-500 p-1 rounded mr-2"></span>
              <h3 className="text-lg font-semibold text-gray-800">Stay Hydrated</h3>
            </div>
            <p className="text-gray-700">Remember to keep a water bottle with you throughout the day for consistent hydration.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Hydration;