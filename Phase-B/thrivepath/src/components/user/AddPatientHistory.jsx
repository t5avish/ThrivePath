import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateProtocolAndTreatment } from "../../utils/generateProtocolAndTreatment";

const AddPatient2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [growthHistory, setGrowthHistory] = useState([]);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
    
    // Generate growth history entries if birthdate is available
    if (location.state?.birthdate) {
      generateGrowthEntries(location.state.birthdate);
    }
  }, [navigate, location.state]);
  
  // Generate half-year interval entries from birthdate to current date
  const generateGrowthEntries = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    const entries = [];
    
    // Start with birthdate (age 0)
    let currentDate = new Date(birthDate);
    let ageInYears = 0;
    
    // Add entry for birthdate with initial height/weight as blank (will be filled in by user)
    entries.push({
      date: currentDate.toISOString().split('T')[0],
      ageLabel: "Age 0",
      ageInYears: 0,
      height: "",
      weight: "",
    });
    
    // Generate entries for every half year
    while (true) {
      // Add 6 months
      currentDate.setMonth(currentDate.getMonth() + 6);
      
      // Break if we've passed today's date
      if (currentDate > today) break;
      
      // Calculate age in years with one decimal place
      ageInYears += 0.5;
      
      entries.push({
        date: currentDate.toISOString().split('T')[0],
        ageLabel: `Age ${ageInYears % 1 === 0 ? ageInYears : ageInYears.toFixed(1)}`,
        ageInYears: ageInYears,
        height: "",
        weight: "",
      });
    }
    
    // Add current measurements (today) from AddPatient1
    const ageInYearsCurrent = calculateAgeInYears(birthDate, today);
    entries.push({
      date: today.toISOString().split('T')[0],
      ageLabel: `Current (Age ${ageInYearsCurrent.toFixed(1)})`,
      ageInYears: ageInYearsCurrent,
      height: location.state?.height || "",
      weight: location.state?.weight || "",
    });
    
    setGrowthHistory(entries);
  };
  
  // Calculate age in decimal years
  const calculateAgeInYears = (birthDate, currentDate) => {
    const ageInMilliseconds = currentDate - birthDate;
    const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.25;
    return ageInMilliseconds / millisecondsPerYear;
  };
  
  const handleGrowthChange = (index, field, value) => {
    const updatedHistory = [...growthHistory];
    updatedHistory[index][field] = value;
    setGrowthHistory(updatedHistory);
  };
  
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    growthHistory.forEach((entry, index) => {
      // Only validate entries that have at least one value filled in
      if (entry.height || entry.weight) {
        // Validate height if provided
        if (entry.height) {
          const height = parseFloat(entry.height);
          if (isNaN(height) || height < 30 || height > 200) {
            newErrors[`height-${index}`] = "Enter valid height (30–200 cm)";
            isValid = false;
          }
        }
        
        // Validate weight if provided
        if (entry.weight) {
          const weight = parseFloat(entry.weight);
          if (isNaN(weight) || weight < 2 || weight > 150) {
            newErrors[`weight-${index}`] = "Enter valid weight (2–150 kg)";
            isValid = false;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate entries
    if (!validateForm()) {
      return;
    }
    
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

      // Format history entries from growth history
      const historyEntries = growthHistory
        .filter(entry => entry.height || entry.weight) // Only include entries with at least one measurement
        .map(entry => ({
          date: entry.date,
          height: entry.height ? Number(entry.height) : undefined,
          weight: entry.weight ? Number(entry.weight) : undefined,
          ageInYears: entry.ageInYears
        }));

      const patientData = {
        ...location.state,
        treatment,
        protocol,
        history: historyEntries,
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
            <span className="text-blue-600 font-medium">Growth History</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-4 sm:mb-6">Add New Child</h1>
        <p className="text-gray-700 text-center mb-6 sm:mb-8 text-sm sm:text-base">Step 2: Growth History</p>

        {error && (
          <div className="mb-4 text-red-600 text-center text-sm sm:text-base">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Age</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Height (cm)</th>
                  <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {growthHistory.map((entry, index) => {
                  const isCurrentEntry = entry.ageLabel.startsWith("Current");
                  return (
                  <tr key={index} className={isCurrentEntry ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2 px-3 text-sm text-gray-700 font-medium">
                      {isCurrentEntry ? <span className="text-blue-600">{entry.ageLabel}</span> : entry.ageLabel}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full px-2 py-1 text-sm border rounded ${isCurrentEntry ? "border-blue-400" : ""}`}
                        value={entry.height}
                        onChange={(e) => handleGrowthChange(index, "height", e.target.value)}
                        placeholder="Height"
                      />
                      {errors[`height-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`height-${index}`]}</p>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full px-2 py-1 text-sm border rounded ${isCurrentEntry ? "border-blue-400" : ""}`}
                        value={entry.weight}
                        onChange={(e) => handleGrowthChange(index, "weight", e.target.value)}
                        placeholder="Weight"
                      />
                      {errors[`weight-${index}`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`weight-${index}`]}</p>
                      )}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
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