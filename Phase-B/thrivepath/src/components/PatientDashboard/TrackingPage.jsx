import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { DateTime } from "luxon";

const TrackingPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const location = useLocation();
  const patient = location.state?.patient;

  const [historyData, setHistoryData] = useState([]);

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
    if (!patient) {
      navigate(`/treatment/${patientId}`);
    }

    if (patient?.history) {
      const formattedData = patient.history.map(entry => {
        const dateObj = DateTime.fromISO(entry.date, { zone: "utc" }).setZone("Asia/Jerusalem");
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

  const handleGoBack = () => {
    navigate("/select-patient");
  };

  const handleUpdateMeasurements = async () => {
    const weight = parseFloat(prompt("Enter current weight (kg):"));
    const height = parseFloat(prompt("Enter current height (cm):"));
    if (isNaN(weight) || isNaN(height)) {
      alert("Please enter valid numeric values.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/update-patient-history`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId, newEntry: { weight, height } }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update measurements.");
      }

      // Get new entry with UTC date
      const newDate = DateTime.now().toUTC().toISO(); // Save in UTC ISO format
      const ageMonths = DateTime.now().diff(DateTime.fromISO(patient.birthdate), 'months').months;
      const roundedAge = Math.max(1, Math.min(12, Math.round(ageMonths / 12)));

      const newEntry = {
        date: newDate,  // UTC ISO format
        weight,
        height,
        targetWeight: medianWeights[gender]?.[roundedAge] || null,
        targetHeight: medianHeights[gender]?.[roundedAge] || null
      };

      // Update state with new entry (the one added to the backend)
      setHistoryData(prev => [...prev, newEntry]);

      // After successful update, navigate to the treatment page
      navigate(`/treatment/${patientId}`);
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating measurements.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-gray-200 px-6 py-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-blue-600 text-xl font-bold">ThrivePath</div>
          <nav className="flex items-center justify-end gap-8">
            <a onClick={() => navigate(`/treatment/${patientId}`)} className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Treatment</a>
            <a onClick={() => navigate(`/tracking/${patientId}`)} className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 cursor-pointer">Tracking</a>
            <button onClick={handleGoBack} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Back to Patients</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Growth Tracking</h1>
            <p className="text-gray-600">Visual insights of weight and height over time</p>
          </div>
          <button onClick={handleUpdateMeasurements} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
            Update Physical Measurements
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weight Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#22c55e" strokeWidth={3} dot={{ stroke: '#22c55e', strokeWidth: 2, r: 6, fill: '#fff' }} />
                <Line type="monotone" dataKey="targetWeight" name="Target Weight" stroke="#ef4444" strokeDasharray="6 6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Height Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="height" name="Height (cm)" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 6, fill: '#fff' }} />
                <Line type="monotone" dataKey="targetHeight" name="Target Height" stroke="#ef4444" strokeDasharray="6 6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackingPage;