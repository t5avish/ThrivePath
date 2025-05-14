import React from "react";

const Hydration = ({ hydration }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Daily Hydration</h2>
      </div>

      <div className="bg-cyan-50 p-3 sm:p-4 rounded-lg mb-4 flex items-center">
        <div className="bg-cyan-100 p-2 sm:p-3 rounded-full mr-3">
          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="..." />
          </svg>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-cyan-700">Total Water</p>
          <p className="text-xl sm:text-2xl font-bold text-cyan-900">{hydration.totalWater}</p>
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-2 sm:mb-3 flex items-center">
          Hydration Tips
        </h3>
        <div className="space-y-2">
          {hydration.tips.map((tip, idx) => (
            <div key={idx} className="flex items-start p-2 bg-white rounded border border-blue-100">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="..." />
              </svg>
              <p className="text-sm text-blue-800">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hydration;