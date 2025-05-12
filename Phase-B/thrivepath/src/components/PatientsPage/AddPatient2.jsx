import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateProtocolAndTreatment } from "../../utils/generateProtocolAndTreatment";

const AddPatient2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to use this feature.");
      setIsLoading(false);
      return;
    }

    try {
      const { protocol, treatment } = await generateProtocolAndTreatment({
        birthdate: location.state.birthdate,
        gender: location.state.gender,
        weight: location.state.weight,
      });

      const currentDate = new Date().toISOString();

      const patientData = {
        ...location.state,
        treatment,
        protocol,
        history: [
          {
            date: currentDate,
            weight: Number(location.state.weight),
            height: Number(location.state.height),
          },
        ],
      };

      const saveResponse = await fetch("/api/add-new-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.message || "Failed to save patient");
      }

      navigate("/select-patient");
    } catch (error) {
      console.error("Error saving patient:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
      <div className="w-full max-w-2xl bg-white p-4 sm:p-8 rounded-lg shadow-md">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="w-full bg-blue-500 rounded-full h-2"></div>
            </div>
            <div className="flex-1">
              <div className="w-full bg-blue-500 rounded-full h-2"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm">
            <span className="text-blue-600 font-medium">General Information</span>
            <span className="text-blue-600 font-medium">Diagnostic Information</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-4 sm:mb-6">Add New Child</h1>
        <p className="text-gray-700 text-center mb-6 sm:mb-8 text-sm sm:text-base">Step 2: Diagnostic Information</p>

        {error && (
          <div className="mb-4 text-red-600 text-center text-sm sm:text-base">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p className="text-base sm:text-lg font-medium text-gray-700">Diagnostic File</p>
              <p className="mt-2 text-sm sm:text-base text-gray-600">To be decided</p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">This feature will be implemented later</p>
            </div>
          </div>

          <div className="flex justify-between pt-4 sm:pt-6">
            <button 
              type="button" 
              onClick={() => navigate("/add-patient-info", { state: location.state })}
              className="px-3 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
              disabled={isLoading}
            >
              Previous
            </button>
            <button 
              type="submit" 
              className="px-3 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xs sm:text-sm">Loading</span>
                </div>
              ) : (
                "Complete"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient2;