import React from "react";

const PhysicalActivity = ({ activity }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Physical Activity</h2>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white p-3 rounded shadow-sm flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Duration</span>
              <p className="font-medium">{activity.duration}</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <span className="text-sm text-gray-500">Type</span>
              <p className="font-medium">{activity.type}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Suggested Timing</h3>
        <div className="space-y-2">
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <span className="mr-2">☀️</span>
            <p>{activity.timingSuggestions.morning}</p>
          </div>
          <div className="flex items-center p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
            <span className="mr-2">🔄</span>
            <p>{activity.timingSuggestions.alternative}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
        <h3 className="font-medium text-green-800 mb-2 flex items-center">
          <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Muscle Strengthening
        </h3>
        <p className="text-green-800">{activity.muscleStrengtheningActivities}</p>
      </div>
    </div>
  );
};

export default PhysicalActivity;
