import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Dashboard from "./Dashboard"; // adjust the path if needed

const TreatmentPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [treatment, setTreatment] = useState(null);
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
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await response.text();

        if (!response.ok) {
          throw new Error(text || "Failed to fetch patient treatment");
        }

        const data = JSON.parse(text);
        setPatient(data.patient);
        setTreatment(data.patient.treatment);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-blue-500 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading treatment plan...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
          <span className="font-medium">Error:</span> {error}
        </div>
      </div>
    );
  }

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
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
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
            <h1 className="text-2xl font-bold text-gray-900">Treatment Plan</h1>
            <p className="text-gray-600">Personalized recommendations for {patient?.name}</p>
          </div>
          <button
            onClick={handleDownloadPlan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download Plan
          </button>
        </div>

        <Dashboard treatment={treatment} />
      </main>
    </div>
  );
};

export default TreatmentPage;
