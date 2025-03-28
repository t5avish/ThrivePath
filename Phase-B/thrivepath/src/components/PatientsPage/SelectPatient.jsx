import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SelectPatient = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/get-user-patients", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }

        const data = await response.json();
        setPatients(data.patients);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [navigate]);

  const handleSelect = (patientId) => {
    navigate(`/treatment/${patientId}`);
  };

  const handleAddNewChild = () => {
    navigate("/add-patient-info");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-500">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Select a Child</h1>
        
        {error && (
          <div className="mb-4 text-red-600 text-center">
            {error}
          </div>
        )}

        <p className="text-gray-700 text-center mb-4">
          {patients.length === 0 
            ? "No patients found. Add a new child to get started." 
            : "Please select a child to continue or add a new child."}
        </p>

        <div className="space-y-4 mb-6">
          {patients.map((patient) => (
            <div key={patient._id} className="flex items-center justify-between p-4 border rounded-lg">
              <span className="text-gray-800 font-medium">{patient.name}</span>
              <button 
                onClick={() => handleSelect(patient._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
                Select
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={handleAddNewChild}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            Add New Child
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectPatient;