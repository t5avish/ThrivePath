import React, { useState, useEffect } from "react";

const MealPlan = ({ dailyMealPlan, patient }) => {
  const [patientData, setPatientData] = useState(null); // State to store the entire patient object

  // Set the patient data when the component is mounted or when the patient prop changes
  useEffect(() => {
    setPatientData(patient);
  }, [patient]); // The effect runs whenever the 'patient' prop changes

  const parseNutrition = (nutritionString) => {
    const nutritionArray = nutritionString.split(",").map(item => item.trim());
    const nutritionData = {};

    nutritionArray.forEach(item => {
      const parts = item.split(" ");
      const value = parts[0];
      const unit = parts.slice(1).join(" "); // Join anything after the first part as the unit

      if (value && unit) {
        nutritionData[unit] = value; // Save the value and unit correctly
      }
    });

    return nutritionData;
  };

  const renderNutrition = (nutritionData) => {
    return Object.entries(nutritionData).map(([key, value], index) => (
      <div key={index} className="flex items-center p-2 mx-1 border rounded-lg bg-gray-50 shadow-sm">
        <div className="font-semibold text-gray-800">
          {value} <span className="text-gray-600 font-medium">{key.includes('(') ? '' : key}</span>
        </div>
        <div className="text-xs text-gray-500 italic">
          {key.includes('(') ? key : '' }
        </div>
      </div>
    ));
  };

  const renderPortionItem = (ingredient) => {
    const match = ingredient.trim().match(/^(\d+\s*[a-zA-Z]*)\s+(of)\s+(.+)$/i);
    if (match) {
      const [_, quantity, connecting, item] = match;
      return (
        <li className="mb-2 leading-relaxed">
          <span className="text-gray-900 font-medium">{quantity}</span>
          <span className="text-gray-600"> {connecting} </span>
          <span className="text-gray-800">{item}</span>
        </li>
      );
    }

    const simpleMatch = ingredient.trim().match(/^(\d+\s*[a-zA-Z]*)\s+(.+)$/i);
    if (simpleMatch) {
      const [_, quantity, item] = simpleMatch;
      return (
        <li className="mb-2 leading-relaxed">
          <span className="text-gray-900 font-medium">{quantity}</span>
          <span className="text-gray-800"> {item}</span>
        </li>
      );
    }

    return (
      <li className="mb-2 leading-relaxed text-gray-800">{ingredient.trim()}</li>
    );
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to use this feature.");
      return;
    }
    
    const prompt = `
    Based on the following protocol and current treatment plan, generate a personalized daily meal plan divided into 4 sections. Make sure that the new meal plan is different from the existing one provided below. Use **Markdown formatting** and the same style and structure shown.
    
    ### 1. Current Daily Meal Plan (For reference, do not replicate these meals):
    *Breakfast:*
    - *Option:* ${dailyMealPlan.breakfast[0].option}
    - *Portion:* ${dailyMealPlan.breakfast[0].portion}
    - *Nutrition:* ${dailyMealPlan.breakfast[0].nutrition}
    - *How to Prepare:* ${dailyMealPlan.breakfast[0].preparation}
    
    *Lunch:*
    - *Option:* ${dailyMealPlan.lunch[0].option}
    - *Portion:* ${dailyMealPlan.lunch[0].portion}
    - *Nutrition:* ${dailyMealPlan.lunch[0].nutrition}
    - *How to Prepare:* ${dailyMealPlan.lunch[0].preparation}
    
    *Dinner:*
    - *Option:* ${dailyMealPlan.dinner[0].option}
    - *Portion:* ${dailyMealPlan.dinner[0].portion}
    - *Nutrition:* ${dailyMealPlan.dinner[0].nutrition}
    - *How to Prepare:* ${dailyMealPlan.dinner[0].preparation}
    
    *Snacks:*
    - *Option:* ${dailyMealPlan.snacks[0].option}
    
    ### 2. New Daily Meal Plan (Generate a new, different meal plan):
    
    *Breakfast:*
    - *Option:* ...
      - *Portion:* ...
      - *Nutrition:* ...
      - *How to Prepare:* ...
    
    *Lunch:*
    - *Option:* ...
      - *Portion:* ...
      - *Nutrition:* ...
      - *How to Prepare:* ...
    
    *Dinner:*
    - *Option:* ...
      - *Portion:* ...
      - *Nutrition:* ...
      - *How to Prepare:* ...
    
    *Snacks:*
    - *Option:* ...
    - *Option:* ...
    
    Stick exactly to this formatting, keep the structure clean and easy to read, and avoid adding any extra headings or explanations outside this format. In the nutrition part, give exact numbers, without approximations or "~".
    
    Protocol:
    ${Object.entries(patientData.protocol).map(([key, value]) => `${key}: ${value}`).join('\n')}
    `;
    
    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      console.log(data);
      // Assuming the response contains a property 'response' which has the meal plan content
    } catch (error) {
      console.log("Error during API call:", error);
    }
  };

  if (!dailyMealPlan) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md font-sans">
      <div className="flex items-center mb-8">
        <div className="bg-green-100 p-3 rounded-full mr-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Meal Plan</h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-4"
        >
          Refresh
        </button>
      </div>

      {/* Render each meal section like breakfast, lunch, dinner */}
      <div className="flex justify-between space-x-6">
        {/* Render breakfast, lunch, dinner similar to how you already did */}
      </div>
    </div>
  );
};

export default MealPlan;
