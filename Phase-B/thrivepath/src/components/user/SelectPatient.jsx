/*
  SelectPatient.jsx

  Displays a list of patients associated with the logged-in user.
  Fetches patients from the backend using the stored auth token.
  Allows the user to select a patient to view treatment details,
  add a new patient, logout, and delete existing patients with confirmation.
  Handles authentication redirects if no valid token is found.
*/

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SelectPatient = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to signin if no token is found
      navigate("/signin");
      return;
    }

    // Fetch patients belonging to the current user
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

  // Navigate to treatment page for selected patient
  const handleSelect = (patientId) => {
    navigate(`/treatment/${patientId}`);
  };

  // Navigate to form for adding a new patient
  const handleAddNewChild = () => {
    navigate("/add-patient-info");
  };

  // Clear token and redirect to signin on logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };
  
  // Show confirmation modal before deleting patient
  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };
  
  // Confirm deletion and call backend to delete patient
  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/delete-patient", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId: patientToDelete._id }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }
      
      // Remove deleted patient from local state
      setPatients(patients.filter(p => p._id !== patientToDelete._id));
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Failed to delete patient. Please try again.");
    }
  };
  
  // Cancel the deletion process
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPatientToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-blue-500">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
      <div className="w-full max-w-lg bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="relative mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600 text-center pr-16">Select a Child</h1>
          <button 
            onClick={handleLogout}
            className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm absolute right-0 top-0"
          >
            Logout
          </button>
        </div>
        
        {error && (
          <div className="mb-4 text-red-600 text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        <p className="text-gray-700 text-center mb-4 text-sm sm:text-base">
          {patients.length === 0 
            ? "No patients found. Add a new child to get started." 
            : "Please select a child to continue or add a new child."}
        </p>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {patients.map((patient) => (
            <div key={patient._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg">
              <span className="text-gray-800 font-medium text-sm sm:text-base mb-2 sm:mb-0">{patient.name}</span>
              <div className="flex space-x-2 self-end sm:self-auto">
                <button 
                  onClick={() => handleDeleteClick(patient)}
                  className="px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm">
                  Delete
                </button>
                <button 
                  onClick={() => handleSelect(patient._id)}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm">
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button 
            onClick={handleAddNewChild}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition text-sm sm:text-base">
            Add New Child
          </button>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
              Are you sure you want to delete {patientToDelete?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectPatient;