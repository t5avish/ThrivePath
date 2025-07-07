import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const getMaxDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getMinDate = () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 12);
  return today.toISOString().split("T")[0];
};

const AddPatient1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthdate: "",
    height: "",
    weight: "",
  });

  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = "Full name is required.";
    } else if (!/^[A-Za-z\s\-]{2,70}$/.test(formData.name)) {
      errs.name = "Only letters, spaces, and hyphens allowed (2-70 chars).";
    }

    if (!formData.gender) {
      errs.gender = "Gender is required.";
    }

    const birthDate = new Date(formData.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const isTooOld = age > 12 || (age === 12 && (monthDiff > 0 || (monthDiff === 0 && dayDiff > 0)));
    const isInFuture = birthDate > today;

    if (!formData.birthdate) {
      errs.birthdate = "Birthdate is required.";
    } else if (isInFuture) {
      errs.birthdate = "Birthdate cannot be in the future.";
    } else if (isTooOld) {
      errs.birthdate = "Child must be 12 years old or younger.";
    }

    const height = parseFloat(formData.height);
    if (!formData.height) {
      errs.height = "Height is required.";
    } else if (isNaN(height) || height < 30 || height > 200) {
      errs.height = "Enter valid height (30–200 cm).";
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight) {
      errs.weight = "Weight is required.";
    } else if (isNaN(weight) || weight < 2 || weight > 150) {
      errs.weight = "Enter valid weight (2–150 kg).";
    }

    return errs;
  };

  useEffect(() => {
    if (hasSubmitted) {
      const validationErrors = validate();
      setErrors(validationErrors);
    }
  }, [formData, hasSubmitted]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      navigate("/add-patient-file", { state: formData });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
      <div className="w-full max-w-2xl bg-white p-4 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mb-4 sm:mb-6">Add New Child</h1>
        <p className="text-gray-700 text-center mb-6 sm:mb-8 text-sm sm:text-base">Step 1: General Information</p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            {/* Full Name */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter child's full name"
              />
              {hasSubmitted && errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {hasSubmitted && errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Birth Date</label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-3 py-2 border rounded-lg"
              />
              {hasSubmitted && errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
            </div>

            {/* Height */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter height"
              />
              {hasSubmitted && errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter weight"
              />
              {hasSubmitted && errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/select-patient")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-700"
            >
              Next Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient1;