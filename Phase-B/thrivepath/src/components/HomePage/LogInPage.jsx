import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

const SignInPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/select-patient");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">Sign In</h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">Welcome back! Please log in.</p>
        </div>

        {error && (
          <div className="mt-4 text-red-600 text-center text-sm sm:text-base font-medium">{error}</div>
        )}

        <form className="mt-6" onSubmit={handleSubmit}>
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

          <div className="mb-5">
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

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium"
          >
            Sign In
          </button>
        </form>

        <p className="mt-5 text-center text-gray-600 text-sm sm:text-base">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;