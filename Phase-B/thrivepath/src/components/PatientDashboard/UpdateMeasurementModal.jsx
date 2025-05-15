import React from "react";

const UpdateMeasurementModal = ({
  onClose,
  onSubmit,
  formWeight,
  setFormWeight,
  formHeight,
  setFormHeight,
  isLoading,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative animate-fadeIn">
      <button
        onClick={onClose}
        disabled={isLoading}
        className={`absolute top-4 right-4 text-gray-400 hover:text-gray-600 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Update Measurements</h2>
        <p className="text-gray-600 text-sm mt-1">Enter the latest growth measurements</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Weight (kg)</label>
          <input
            type="number"
            value={formWeight}
            onChange={(e) => setFormWeight(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter weight in kg"
            required
            step="0.1"
            min="0"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Height (cm)</label>
          <input
            type="number"
            value={formHeight}
            onChange={(e) => setFormHeight(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter height in cm"
            required
            step="0.1"
            min="0"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
              isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Processing..." : "Save Measurements"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default UpdateMeasurementModal;
