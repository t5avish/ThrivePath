import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DateTime } from "luxon";
import { generateProtocolAndTreatment } from "../../../utils/generateProtocolAndTreatment";
import HeaderSection from "./HeaderSection";
import StatsSummary from "./StatsSummary";
import GrowthCharts from "./GrowthCharts";
import UpdateMeasurementModal from "./UpdateMeasurementModal";

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
  const [activeTab, setActiveTab] = useState("all");

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
        const birthDate = DateTime.fromISO(patient.birthdate);
        const ageInYears = dateObj.diff(birthDate, 'years').years;
        const ageMonths = dateObj.diff(birthDate, 'months').months;
        const roundedAgeYear = Math.max(1, Math.min(12, Math.round(ageMonths / 12)));
        
        return {
          ageYears: parseFloat(ageInYears.toFixed(2)),
          recordDate: dateObj.toFormat("dd/MM/yyyy HH:mm:ss"),
          date: entry.date, // Keep original date for reference
          weight: entry.weight,
          height: entry.height,
          targetWeight: medianWeights[gender]?.[roundedAgeYear] || null,
          targetHeight: medianHeights[gender]?.[roundedAgeYear] || null
        };
      });
      
      // Sort data by age to ensure proper chart rendering
      formattedData.sort((a, b) => a.ageYears - b.ageYears);
      
      // Log the data to check if ageYears is calculated correctly
      console.log("Formatted History Data:", formattedData);
      
      setHistoryData(formattedData);
    }
  }, [patient, patientId, navigate]);

  // Handle checkpoint deletion
  const handleDeleteCheckpoint = (dateToDelete) => {
    // Remove the deleted entry from the local state
    setHistoryData(prev => prev.filter(entry => entry.date !== dateToDelete));
    
    // Optionally navigate back to treatment page to refresh data
    // navigate(`/treatment/${patientId}`);
  };

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
      const dateObj = DateTime.fromISO(newDate).setZone("Asia/Jerusalem");
      const birthDate = DateTime.fromISO(patient.birthdate);
      const ageInYears = dateObj.diff(birthDate, 'years').years;
      const ageMonths = dateObj.diff(birthDate, 'months').months;
      const roundedAgeYear = Math.max(1, Math.min(12, Math.round(ageMonths / 12)));
      
      const newEntry = {
        ageYears: parseFloat(ageInYears.toFixed(2)),
        recordDate: dateObj.toFormat("dd/MM/yyyy HH:mm:ss"),
        date: newDate, // Add date for consistency
        weight,
        height,
        targetWeight: medianWeights[gender]?.[roundedAgeYear] || null,
        targetHeight: medianHeights[gender]?.[roundedAgeYear] || null,
      };
      
      setHistoryData(prev => {
        const newData = [...prev, newEntry];
        return newData.sort((a, b) => a.ageYears - b.ageYears);
      });
      
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

  const latestEntry = historyData.length > 0 ? historyData[historyData.length - 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderSection
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        navigate={navigate}
        patientId={patientId}
      />

      <main className="flex-1 container mx-auto py-6 px-4 max-w-6xl">
        <StatsSummary
          latestEntry={latestEntry}
          historyData={historyData}
          onUpdateClick={() => setShowForm(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <GrowthCharts
          historyData={historyData}
          activeTab={activeTab}
          birthDate={patient?.birthdate} // Pass as string, not DateTime object
          patientId={patientId} // Pass patientId for deletion API
          onDeleteCheckpoint={handleDeleteCheckpoint} // Pass deletion callback
        />
      </main>

      <footer className="mt-8 py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ThrivePath
        </div>
      </footer>

      {showForm && (
        <UpdateMeasurementModal
          onClose={() => !isLoading && setShowForm(false)}
          onSubmit={handleSubmitForm}
          formWeight={formWeight}
          setFormWeight={setFormWeight}
          formHeight={formHeight}
          setFormHeight={setFormHeight}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TrackingPage;