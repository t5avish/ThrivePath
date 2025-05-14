import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Dashboard from "./Dashboard";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TreatmentPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardRef = useRef();

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
    const element = dashboardRef.current;
  
    // הסתר זמנית את הכפתור
    const updateBtn = document.getElementById("update-meal-btn");
    const originalDisplay = updateBtn?.style.display;
    if (updateBtn) updateBtn.style.display = "none";
  
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        });
  
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgProps = {
          width: canvas.width,
          height: canvas.height,
        };
  
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [imgProps.width, imgProps.height],
        });
  
        pdf.addImage(imgData, "JPEG", 0, 0, imgProps.width, imgProps.height);
        pdf.save(`${patient?.name || "treatment"}-plan.pdf`);
      } finally {
        // החזרת הכפתור לאחר יצירת ה־PDF
        if (updateBtn) updateBtn.style.display = originalDisplay || "flex";
      }
    }, 100);
  };

  const handleGoBack = () => {
    navigate("/select-patient");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
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
        <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200 mx-4">
          <span className="font-medium">Error:</span> {error}
        </div>
      </div>
    );
  }

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
              className="text-blue-600 font-semibold px-3 py-2 rounded-md bg-blue-50"
            >
              Treatment
            </a>
            <a 
              onClick={() => navigate(`/tracking/${patientId}`, { state: { patient } })} 
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer px-3 py-2 rounded-md hover:bg-gray-100"
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
                className="block py-2 px-3 text-blue-600 font-semibold rounded-md bg-blue-50"
              >
                Treatment
              </a>
              <a 
                onClick={() => { navigate(`/tracking/${patientId}`, { state: { patient } }); setMenuOpen(false); }} 
                className="block py-2 px-3 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100"
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Treatment Plan</h1>
            <p className="text-gray-600 text-sm">
              Personalized nutritional recommendations for {patient?.name}
            </p>
          </div>
          <button
            onClick={handleDownloadPlan}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow flex items-center gap-2 self-start"
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

        <div ref={dashboardRef}>
          <Dashboard treatment={treatment} patient={patient} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ThrivePath - Patient Treatment System
        </div>
      </footer>
    </div>
  );
};

export default TreatmentPage;