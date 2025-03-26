import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SelectPatient = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Kfir Sharoni" },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  const handleSelect = (id) => {
  };

  const handleAddNewChild = () => {
    navigate("/add-patient-info");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Select a Child</h1>
        <p className="text-gray-700 text-center mb-4">Please select a child to continue or add a new child.</p>
        <div className="space-y-4 mb-6">
          {patients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
              <span className="text-gray-800 font-medium">{patient.name}</span>
              <button 
                onClick={() => handleSelect(patient.id)}
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