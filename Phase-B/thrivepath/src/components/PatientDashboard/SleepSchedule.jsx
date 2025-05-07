import React from "react";

const SleepSchedule = ({ sleep }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 p-2 rounded-full mr-3">
          <svg className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Sleep Schedule</h2>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4 bg-indigo-50 p-3 md:p-4 rounded-lg">
        <div className="flex items-center mb-2 md:mb-0">
          <p className="text-xs md:text-sm text-gray-500">Bedtime</p>
          <p className="font-medium text-indigo-900 ml-2">{sleep.bedtime}</p>
        </div>
        <div className="flex items-center">
          <p className="text-xs md:text-sm text-gray-500">Wake Time</p>
          <p className="font-medium text-indigo-900 ml-2">{sleep.wakeTime}</p>
        </div>
      </div>

      <div className="p-3 md:p-4 bg-indigo-50 rounded-lg">
        <h3 className="font-medium text-indigo-900 mb-3 flex items-center">
          <svg className="h-4 w-4 md:h-5 md:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z..." />
          </svg>
          Routine Tips
        </h3>
        <div className="space-y-2">
          {sleep.routineTips.map((tip, idx) => (
            <div key={idx} className="flex items-start p-2 bg-white rounded border border-indigo-100">
              <svg className="h-4 w-4 md:h-5 md:w-5 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z..." />
              </svg>
              <p className="text-sm md:text-base text-indigo-800">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SleepSchedule;