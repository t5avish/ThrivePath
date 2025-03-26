import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AddPatient2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please upload a file before completing the process.");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/get-user-info", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user information");
      }

      const userData = await response.json();

      const patientData = {
        ...location.state,
        diagnosticFile: file.name,
        user: {
          name: userData.name,
          email: userData.email
        }
      };
      
      const saveResponse = await fetch("/api/add-new-patient", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.message || "Failed to save patient");
      }

      navigate("/select-patient");
    } catch (error) {
      console.error("Error saving patient:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="w-full bg-blue-500 rounded-full h-2"></div>
            </div>
            <div className="flex-1">
              <div className="w-full bg-blue-500 rounded-full h-2"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-blue-600 font-medium">General Information</span>
            <span className="text-blue-600 font-medium">Upload a diagnostic file</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Add New Child</h1>
        <p className="text-gray-700 text-center mb-8">Step 2: Upload a diagnostic file</p>

        {error && (
          <div className="mb-4 text-red-600 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="mt-1 text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-gray-500">CSV file up to 10MB</p>
            <input type="file" accept=".csv" id="file-upload" name="file-upload" className="hidden" onChange={handleFileChange} />
            <button type="button" onClick={() => document.getElementById("file-upload").click()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Select File
            </button>
            {file && <p className="mt-2 text-sm text-gray-700">Selected File: {file.name}</p>}
          </div>

          <div className="flex justify-between pt-6">
            <button type="button" onClick={() => navigate("/add-child-step-1", { state: location.state })}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Previous Step
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
              Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient2;