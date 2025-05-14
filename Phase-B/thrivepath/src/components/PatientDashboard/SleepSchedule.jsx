import React, { useState } from "react";

const SleepSchedule = ({ sleep }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
      <h2 
        className="text-2xl font-bold text-gray-800 mb-5 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className="bg-blue-500 w-1 h-8 rounded mr-3"></span>
          Rest & Recovery
        </div>
        <svg 
          className={`h-6 w-6 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </h2>
      
      {isExpanded && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 font-medium">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Bedtime
              </div>
              <div className="text-gray-800 font-semibold text-lg">{sleep.bedtime}</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 font-medium">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Wake Time
              </div>
              <div className="text-gray-800 font-semibold text-lg">{sleep.wakeTime}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-500 w-1 h-6 rounded mr-2"></span>
              Recommended Routine
            </h3>
            <div className="space-y-5">
              {sleep.routineTips.map((tip, idx) => (
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

          <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <span className="bg-blue-500 p-1 rounded mr-2"></span>
              <h3 className="text-lg font-semibold text-gray-800">Quality Sleep</h3>
            </div>
            <p className="text-gray-700">Consistent sleep and wake times, even on weekends, help regulate your body's internal clock.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default SleepSchedule;