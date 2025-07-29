/*
  PhysicalActivity.jsx

  This component displays physical activity guidelines and recommendations for patients.
  It shows activity duration, type, timing suggestions, and muscle strengthening
  activities. Features an expandable interface for better user experience and
  structured presentation of exercise recommendations.

*/

import React, { useState } from "react";

const PhysicalActivity = ({ activity }) => {
  // State to control the expand/collapse functionality of the activity section
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
          Activity Guidelines
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
          {/* Duration and Activity Type grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Duration section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 font-medium">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration
              </div>
              {/* Display activity duration from activity prop */}
              <div className="text-gray-800 font-semibold text-lg">{activity.duration}</div>
            </div>

            {/* Activity Type section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 font-medium">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" />
                </svg>
                Activity Type
              </div>
              {/* Display activity type from activity prop */}
              <div className="text-gray-800 font-semibold text-lg">{activity.type}</div>
            </div>
          </div>

          {/* Optimal Timing section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-500 w-1 h-6 rounded mr-2"></span>
              Optimal Timing
            </h3>
            <div className="space-y-5">
              {/* Morning session timing */}
              <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Morning Session</p>
                  {/* Display morning timing suggestion from activity prop */}
                  <p className="text-gray-600">{activity.timingSuggestions.morning}</p>
                </div>
              </div>
              {/* Alternative timing section */}
              <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Alternative</p>
                  {/* Display alternative timing suggestion from activity prop */}
                  <p className="text-gray-600">{activity.timingSuggestions.alternative}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strength Training section */}
          <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <span className="bg-blue-500 p-1 rounded mr-2"></span>
              <h3 className="text-lg font-semibold text-gray-800">Strength Training</h3>
            </div>
            {/* Display muscle strengthening activities from activity prop */}
            <p className="text-gray-700">{activity.muscleStrengtheningActivities}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PhysicalActivity;