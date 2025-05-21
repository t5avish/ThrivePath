import React from "react";
import { DateTime } from "luxon";

const StatsSummary = ({ latestEntry, historyData, onUpdateClick, activeTab, setActiveTab }) => (
  <>
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Growth Tracking</h1>
        <p className="text-gray-600 text-sm">Monitor and update patient growth measurements</p>
      </div>
      <button
        onClick={onUpdateClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow flex items-center gap-2 self-start"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Update Measurements
      </button>
    </div>

    {latestEntry && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Current Weight</div>
          <div className="text-2xl font-bold text-gray-800">{latestEntry.weight} kg</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Current Height</div>
          <div className="text-2xl font-bold text-gray-800">{latestEntry.height} cm</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Last Updated</div>
          <div className="text-lg font-bold text-gray-800">
            {latestEntry.recordDate ? 
              DateTime.fromFormat(latestEntry.recordDate, "dd/MM/yyyy HH:mm:ss").toFormat('dd MMM yyyy') : 
              "No date available"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {latestEntry.recordDate ? 
              DateTime.fromFormat(latestEntry.recordDate, "dd/MM/yyyy HH:mm:ss").toFormat('HH:mm') : 
              ""}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Total Records</div>
          <div className="text-2xl font-bold text-gray-800">{historyData.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {historyData.length > 0 && historyData[0].recordDate
              ? `First record: ${DateTime.fromFormat(historyData[0].recordDate, "dd/MM/yyyy HH:mm:ss").toFormat('dd MMM yyyy')}`
              : 'No records available'}
          </div>
        </div>
      </div>
    )}

    <div className="bg-white p-2 rounded-lg shadow-sm inline-flex mb-6">
      {['all', 'weight', 'height'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  </>
);

export default StatsSummary;