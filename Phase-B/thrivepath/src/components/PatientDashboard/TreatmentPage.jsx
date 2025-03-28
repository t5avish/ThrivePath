import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TreatmentPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchPatientTreatment = async () => {
      try {
        const response = await fetch(`/api/get-patient-treatment?patientId=${patientId}`, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const text = await response.text();

        if (!response.ok) {
          throw new Error(text || "Failed to fetch patient treatment");
        }

        const data = JSON.parse(text); // Parse response JSON
        setPatient(data.patient);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching patient treatment:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchPatientTreatment();
  }, [patientId, navigate]);

  const handleDownloadPlan = () => {
    alert("Download functionality to be implemented");
  };

  const handleGoBack = () => {
    navigate("/select-patient");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-500">Loading treatment plan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
    <header className="flex items-center justify-between border-b border-gray-200 px-10 py-4 bg-white">
    <div className="text-blue-600 text-xl font-bold">ThrivePath</div>
    <nav className="flex items-center w-full justify-end gap-8">
        <a className="text-blue-600 font-medium" href="#">Treatment</a>
        <a className="text-gray-700 hover:text-blue-600" href="#">Tracking</a>
        <button 
        onClick={handleGoBack}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
        Back to Patients
        </button>
    </nav>
    </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Treatment Plan</h1>
            <p className="text-gray-600">Personalized recommendations for {patient.name}</p>
          </div>
          <button 
            onClick={handleDownloadPlan}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Download Plan
          </button>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-600">Treatment plan details will be added soon.</p>
        </div>
      </main>
    </div>
  );
};

export default TreatmentPage;
