/*
  SignUpPage.jsx

  Handles user registration by collecting name, email, and password information.
  Validates that both password fields match before submitting.
  Sends the data to the backend for account creation.
  Displays success or error messages based on the response.
*/

import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  // Update form field values on user input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission and validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password confirmation check
    if (formData.password !== formData.confirm_password) {
      setErrorMessage("Passwords do not match.");
      setSuccessMessage(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Handle JSON and non-JSON responses
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const result = isJson ? await response.json() : await response.text();

      if (response.ok) {
        // Show success message and reset form
        setSuccessMessage("Signup successful! You can now log in.");
        setErrorMessage("");
        setFormData({ name: "", email: "", password: "", confirm_password: "" });
      } else {
        // Show server error
        setErrorMessage(result?.message || result || "An error occurred.");
        setSuccessMessage(false);
      }
    } catch (error) {
      // Show fallback error on request failure
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again later.");
      setSuccessMessage(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">Sign Up</h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">Create your account</p>
        </div>

        {/* Success and Error Messages */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mt-4 text-center text-sm sm:text-base">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mt-4 text-center text-sm sm:text-base">
            {successMessage}
          </div>
        )}

        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-5 text-center text-gray-600 text-sm sm:text-base">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-500 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;