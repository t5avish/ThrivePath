import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import { DateTime } from "luxon";
import { generateProtocolAndTreatment } from "../../utils/generateProtocolAndTreatment";

const CustomXAxisTick = ({ x, y, payload }) => {
  const dateTime = DateTime.fromFormat(payload.value, "dd/MM/yyyy HH:mm:ss");
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="middle" 
        fill="#666" 
        fontSize={12}
      >
        {dateTime.toFormat('dd/MM')}
      </text>
      <text 
        x={0} 
        y={16} 
        dy={12} 
        textAnchor="middle" 
        fontSize={10} 
        fill="#666"
      >
        {dateTime.toFormat('HH:mm')}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dateTime = DateTime.fromFormat(label, "dd/MM/yyyy HH:mm:ss");
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800 mb-2">{dateTime.toFormat('dd/MM/yyyy')}</p>
        <p className="text-sm text-gray-600 mb-3">{dateTime.toFormat('HH:mm:ss')}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
            <p className="text-gray-700">
              <span className="font-medium">{entry.name}:</span> {entry.value} {entry.name.includes('Weight') ? 'kg' : 'cm'}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TrackingPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const location = useLocation();
  const patient = location.state?.patient;
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formWeight, setFormWeight] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "weight", "height"

  const medianWeights = {
    male: { 1: 10.2, 2: 12.3, 3: 14.6, 4: 16.7, 5: 18.7, 6: 20.6, 7: 22.9, 8: 25.6, 9: 28.7, 10: 32.1, 11: 36.4, 12: 40.8 },
    female: { 1: 9.6, 2: 11.8, 3: 14.1, 4: 16.3, 5: 18.4, 6: 20.6, 7: 23.2, 8: 26.3, 9: 29.9, 10: 33.8, 11: 38.4, 12: 42.9 }
  };
  const medianHeights = {
    male: { 1: 67.5, 2: 87.1, 3: 96.1, 4: 103.3, 5: 109.4, 6: 115.9, 7: 121.7, 8: 127.3, 9: 132.6, 10: 137.8, 11: 143.1, 12: 148.3 },
    female: { 1: 66.0, 2: 85.7, 3: 95.1, 4: 102.7, 5: 109.4, 6: 115.1, 7: 121.0, 8: 127.0, 9: 133.0, 10: 138.5, 11: 144.0, 12: 149.5 }
  };
  const gender = patient?.protocol?.gender?.toLowerCase() || "male";

  useEffect(() => {
    if (!patient) navigate(`/treatment/${patientId}`);
    if (patient?.history) {
      const formattedData = patient.history.map(entry => {
        const dateObj = DateTime.fromISO(entry.date).setZone("Asia/Jerusalem");
        const ageMonths = DateTime.fromISO(entry.date).diff(DateTime.fromISO(patient.birthdate), 'months').months;
        const roundedAge = Math.max(1, Math.min(12, Math.round(ageMonths / 12)));
        return {
          date: dateObj.toFormat("dd/MM/yyyy HH:mm:ss"),
          weight: entry.weight,
          height: entry.height,
          targetWeight: medianWeights[gender]?.[roundedAge] || null,
          targetHeight: medianHeights[gender]?.[roundedAge] || null
        };
      });
      setHistoryData(formattedData);
    }
  }, [patient, patientId, navigate]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const weight = parseFloat(formWeight);
    const height = parseFloat(formHeight);
    if (isNaN(weight) || isNaN(height)) {
      alert("Please enter valid numbers.");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const { protocol, treatment } = await generateProtocolAndTreatment({
        birthdate: patient.birthdate,
        gender: patient.protocol.gender,
        weight,
      });

      const response = await fetch(`/api/update-patient-history`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId, newEntry: { weight, height }, protocol, treatment }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed.");

      const newDate = DateTime.now().toUTC().toISO();
      const ageMonths = DateTime.now().diff(DateTime.fromISO(patient.birthdate), 'months').months;
      const roundedAge = Math.max(1, Math.min(12, Math.round(ageMonths / 12)));

      const newEntry = {
        date: newDate,
        weight,
        height,
        targetWeight: medianWeights[gender]?.[roundedAge] || null,
        targetHeight: medianHeights[gender]?.[roundedAge] || null,
      };

      setHistoryData(prev => [...prev, {
        date: DateTime.fromISO(newDate).setZone("Asia/Jerusalem").toFormat("dd/MM/yyyy HH:mm:ss"),
        weight,
        height,
        targetWeight: newEntry.targetWeight,
        targetHeight: newEntry.targetHeight
      }]);
      setShowForm(false);
      setFormWeight("");
      setFormHeight("");
      navigate(`/treatment/${patientId}`);
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating measurements.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => navigate("/select-patient");
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/signin"); };

  // Get the latest measurements
  const latestEntry = historyData.length > 0 ? historyData[historyData.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-4 bg-white shadow sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-blue-600 text-xl font-bold">ThrivePath</div>
          </div>
          
          <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <nav className="hidden md:flex items-center justify-end gap-4">
            <a 
              onClick={() => navigate(`/treatment/${patientId}`)} 
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Treatment
            </a>
            <a 
              onClick={() => navigate(`/tracking/${patientId}`)} 
              className="text-blue-600 font-semibold px-3 py-2 rounded-md bg-blue-50"
            >
              Tracking
            </a>
            <button 
              onClick={handleGoBack} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Patients
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors shadow-sm flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </nav>
        </div>
        
        {menuOpen && (
          <div className="md:hidden py-2 px-2 border-t border-gray-100 bg-white mt-2">
            <div className="space-y-1">
              <a 
                onClick={() => { navigate(`/treatment/${patientId}`); setMenuOpen(false); }} 
                className="block py-2 px-3 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100"
              >
                Treatment
              </a>
              <a 
                onClick={() => { navigate(`/tracking/${patientId}`); setMenuOpen(false); }} 
                className="block py-2 px-3 text-blue-600 font-semibold rounded-md bg-blue-50"
              >
                Tracking
              </a>
              <button 
                onClick={() => { handleGoBack(); setMenuOpen(false); }} 
                className="w-full text-left py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Patients
              </button>
              <button 
                onClick={() => { handleLogout(); setMenuOpen(false); }} 
                className="w-full text-left py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto py-6 px-4 max-w-6xl">
        {/* Header and stats summary */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Growth Tracking</h1>
              <p className="text-gray-600 text-sm">
                Monitor and update patient growth measurements
              </p>
            </div>
            <button 
              onClick={() => setShowForm(true)} 
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
                {latestEntry.targetWeight && (
                  <div className="text-xs text-gray-500 mt-1">
                    Target: {latestEntry.targetWeight} kg
                    <span className={`ml-2 ${latestEntry.weight >= latestEntry.targetWeight ? 'text-green-500' : 'text-yellow-500'}`}>
                      {latestEntry.weight >= latestEntry.targetWeight ? '✓' : '⚠'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
                <div className="text-sm text-gray-500 mb-1">Current Height</div>
                <div className="text-2xl font-bold text-gray-800">{latestEntry.height} cm</div>
                {latestEntry.targetHeight && (
                  <div className="text-xs text-gray-500 mt-1">
                    Target: {latestEntry.targetHeight} cm
                    <span className={`ml-2 ${latestEntry.height >= latestEntry.targetHeight ? 'text-green-500' : 'text-yellow-500'}`}>
                      {latestEntry.height >= latestEntry.targetHeight ? '✓' : '⚠'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="text-lg font-bold text-gray-800">
                  {DateTime.fromFormat(latestEntry.date, "dd/MM/yyyy HH:mm:ss").toFormat('dd MMM yyyy')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {DateTime.fromFormat(latestEntry.date, "dd/MM/yyyy HH:mm:ss").toFormat('HH:mm')}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
                <div className="text-sm text-gray-500 mb-1">Total Records</div>
                <div className="text-2xl font-bold text-gray-800">{historyData.length}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {historyData.length > 0 ? 
                    `First record: ${DateTime.fromFormat(historyData[0].date, "dd/MM/yyyy HH:mm:ss").toFormat('dd MMM yyyy')}` : 
                    'No records available'}
                </div>
              </div>
            </div>
          )}

          {/* Chart view selector */}
          <div className="bg-white p-2 rounded-lg shadow-sm inline-flex mb-6">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Charts
            </button>
            <button 
              onClick={() => setActiveTab("weight")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "weight" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Weight
            </button>
            <button 
              onClick={() => setActiveTab("height")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "height" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Height
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className={`grid ${activeTab === "all" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
          {/* Weight Chart */}
          {(activeTab === "all" || activeTab === "weight") && (
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Weight Tracking (kg)
              </h2>
              <div className="bg-gray-50 p-2 rounded-lg mb-4 text-sm text-gray-600">
                Track the patient's weight progress compared to target values for their age group.
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={<CustomXAxisTick />} 
                    interval="preserveStartEnd" 
                    height={60}
                  />
                  <YAxis 
                    label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: '#666' } }} 
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    name="Actual Weight" 
                    stroke="#22c55e" 
                    strokeWidth={3} 
                    activeDot={{ r: 8, strokeWidth: 2, fill: '#22c55e', stroke: 'white' }}
                    dot={{ r: 5, strokeWidth: 2, fill: '#22c55e', stroke: 'white' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="targetWeight" 
                    name="Target Weight" 
                    stroke="#ef4444" 
                    strokeDasharray="6 6" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1, fill: '#ef4444', stroke: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Height Chart */}
          {(activeTab === "all" || activeTab === "height") && (
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Height Tracking (cm)
              </h2>
              <div className="bg-gray-50 p-2 rounded-lg mb-4 text-sm text-gray-600">
                Monitor height growth compared to age-appropriate target values.
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={<CustomXAxisTick />} 
                    interval="preserveStartEnd" 
                    height={60}
                  />
                  <YAxis 
                    label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: '#666' } }} 
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="height" 
                    name="Actual Height" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    activeDot={{ r: 8, strokeWidth: 2, fill: '#3b82f6', stroke: 'white' }}
                    dot={{ r: 5, strokeWidth: 2, fill: '#3b82f6', stroke: 'white' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="targetHeight" 
                    name="Target Height" 
                    stroke="#ef4444" 
                    strokeDasharray="6 6" 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 1, fill: '#ef4444', stroke: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ThrivePath - Patient Growth Tracking System
        </div>
      </footer>

      {/* Add Measurement Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative animate-fadeIn">
            <button 
              onClick={() => !isLoading && setShowForm(false)} 
              disabled={isLoading}
              className={`absolute top-4 right-4 text-gray-400 hover:text-gray-600 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Update Measurements</h2>
              <p className="text-gray-600 text-sm mt-1">Enter the latest growth measurements</p>
            </div>
            
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Weight (kg)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formWeight} 
                    onChange={(e) => setFormWeight(e.target.value)} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                    placeholder="Enter weight in kg"
                    required 
                    step="0.1"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    kg
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Height (cm)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={formHeight} 
                    onChange={(e) => setFormHeight(e.target.value)} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                    placeholder="Enter height in cm"
                    required 
                    step="0.1"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    cm
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                    isLoading 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </div>
                  ) : "Save Measurements"}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 text-center mt-4">
                This update will be used to adjust the treatment protocol
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data table for mobile view (displays automatically on smaller screens) */}
      {historyData.length > 0 && activeTab !== "all" && (
        <div className="md:hidden mt-6 bg-white rounded-xl p-4 shadow-md">
          <h3 className="font-medium text-gray-800 mb-3">Measurement History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  {activeTab === "weight" && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                  )}
                  {activeTab === "height" && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height (cm)</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...historyData].reverse().map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {DateTime.fromFormat(entry.date, "dd/MM/yyyy HH:mm:ss").toFormat('dd/MM/yyyy')}
                    </td>
                    {activeTab === "weight" && (
                      <td className="px-4 py-2 text-sm text-gray-800">
                        <span className="font-medium">{entry.weight}</span>
                        {entry.targetWeight && (
                          <span className="text-xs text-gray-500 ml-2">
                            (Target: {entry.targetWeight})
                          </span>
                        )}
                      </td>
                    )}
                    {activeTab === "height" && (
                      <td className="px-4 py-2 text-sm text-gray-800">
                        <span className="font-medium">{entry.height}</span>
                        {entry.targetHeight && (
                          <span className="text-xs text-gray-500 ml-2">
                            (Target: {entry.targetHeight})
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;