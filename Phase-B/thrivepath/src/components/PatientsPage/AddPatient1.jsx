import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddPatient1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthdate: "",
    height: "",
    weight: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/add-patient-file", { state: formData });
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
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm">
            <span className="text-blue-600 font-medium">General Information</span>
            <span className="text-gray-400 font-medium">Upload a diagnostic file</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-4 sm:mb-6">Add New Child</h1>
        <p className="text-gray-700 text-center mb-6 sm:mb-8 text-sm sm:text-base">Step 1: General Information</p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                     className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                     placeholder="Enter child's full name" />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base">
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Birth Date</label>
              <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required
                     className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" />
            </div>

            {/* Height */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} required
                     className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                     placeholder="Enter height" />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} required
                     className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                     placeholder="Enter weight" />
            </div>
          </div>

          <div className="flex justify-between pt-4 sm:pt-6">
            <button type="button" onClick={() => navigate("/select-patient")}
                    className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base">
              Cancel
            </button>
            <button type="submit" className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
              Next Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient1;