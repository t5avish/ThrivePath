import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const TrackingPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const data = [
    { month: "Jan", weight: 20, height: 110, targetWeight: 24, targetHeight: 118 },
    { month: "Feb", weight: 21, height: 112, targetWeight: 26, targetHeight: 121 },
    { month: "Mar", weight: 21.5, height: 113.5, targetWeight: 27.5, targetHeight: 124 },
    { month: "Apr", weight: 22, height: 115, targetWeight: 29, targetHeight: 127 },
    { month: "May", weight: 22.5, height: 116.5, targetWeight: 30.5, targetHeight: 130 },
    { month: "Jun", weight: 23, height: 118, targetWeight: 32, targetHeight: 133 }
  ];

  const handleGoBack = () => {
    navigate("/select-patient");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 px-6 py-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-blue-600 text-xl font-bold">ThrivePath</div>
          <nav className="flex items-center justify-end gap-8">
            <a
              onClick={() => navigate(`/treatment/${patientId}`)}
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Treatment
            </a>
            <a
              onClick={() => navigate(`/tracking/${patientId}`)}
              className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 cursor-pointer"
            >
              Tracking
            </a>
            <button
              onClick={handleGoBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Back to Patients
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Growth Tracking</h1>
            <p className="text-gray-600">Visual insights of weight and height over time</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            Update Physical Measurements
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weight Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ stroke: '#22c55e', strokeWidth: 2, r: 6, fill: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="targetWeight"
                  name="Target Weight"
                  stroke="#ef4444"
                  strokeDasharray="6 6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Height Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="height"
                  name="Height (cm)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 6, fill: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="targetHeight"
                  name="Target Height"
                  stroke="#ef4444"
                  strokeDasharray="6 6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackingPage;