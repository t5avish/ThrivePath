import React, { useState, useEffect } from "react";
import parseAIResponse from "../../../utils/ResponseParser"

const MealPlan = ({ dailyMealPlan, patient }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMealsVisible, setIsMealsVisible] = useState(true); 
  const [currentMealPlan, setCurrentMealPlan] = useState(dailyMealPlan);
  const [showSpecialRequest, setShowSpecialRequest] = useState(false);
  const [specialRequest, setSpecialRequest] = useState("");
  
  useEffect(() => {
    setPatientData(patient);
    setCurrentMealPlan(dailyMealPlan);
  }, [patient, dailyMealPlan]);

  const parseNutrition = (nutritionString) => {
    const nutritionArray = nutritionString.split(",").map(item => item.trim());
    const nutritionData = {};

    nutritionArray.forEach(item => {
      const parts = item.split(" ");
      const value = parts[0];
      const unit = parts.slice(1).join(" ");

      if (value && unit) {
        nutritionData[unit] = value;
      }
    });

    return nutritionData;
  };

  const renderNutrition = (nutritionData) => {
    return Object.entries(nutritionData).map(([key, value], index) => (
      <div key={index} className="flex items-center px-3 py-2 rounded-md bg-gray-50 shadow-sm text-xs sm:text-sm border border-gray-200">
        <div className="font-medium text-gray-800">
          {value} <span className="text-gray-600">{key.includes('(') ? '' : key}</span>
        </div>
        <div className="text-xs text-gray-500 ml-1">
          {key.includes('(') ? key : ''}
        </div>
      </div>
    ));
  };

  const renderPortionItem = (ingredient) => {
    const match = ingredient.trim().match(/^(\d+\s*[a-zA-Z]*)\s+(of)\s+(.+)$/i);
    if (match) {
      const [_, quantity, connecting, item] = match;
      return (
        <li className="mb-2 leading-relaxed text-sm sm:text-base flex items-baseline">
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
        <li className="mb-2 leading-relaxed text-sm sm:text-base">
          <span className="text-gray-900 font-medium">{quantity}</span>
          <span className="text-gray-800"> {item}</span>
        </li>
      );
    }

    return (
      <li className="mb-2 leading-relaxed text-sm sm:text-base text-gray-800">{ingredient.trim()}</li>
    );
  };

  const handleRefresh = async () => {
    setShowSpecialRequest(false);
    setLoading(true);
    setIsMealsVisible(false);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to use this feature.");
      setLoading(false);
      return;
    }

    const prompt = `
    Based on the following protocol and current treatment plan, generate a personalized daily meal plan divided into 4 sections. 
    Make sure that the new meal plan is different from the existing one provided below. Use **Markdown formatting** and the same style and structure shown.
    Make sure the output strictly follows the structure shown below and does not deviate in any way.
  
    ### 1. Current Daily Meal Plan (For reference, do not replicate these meals):
    *Breakfast:*
    - *Option:* ${currentMealPlan.breakfast[0].option}
    - *Portion:* ${currentMealPlan.breakfast[0].portion}
    - *Nutrition:* ${currentMealPlan.breakfast[0].nutrition}
    - *How to Prepare:* ${currentMealPlan.breakfast[0].preparation}
  
    *Lunch:*
    - *Option:* ${currentMealPlan.lunch[0].option}
    - *Portion:* ${currentMealPlan.lunch[0].portion}
    - *Nutrition:* ${currentMealPlan.lunch[0].nutrition}
    - *How to Prepare:* ${currentMealPlan.lunch[0].preparation}
  
    *Dinner:*
    - *Option:* ${currentMealPlan.dinner[0].option}
    - *Portion:* ${currentMealPlan.dinner[0].portion}
    - *Nutrition:* ${currentMealPlan.dinner[0].nutrition}
    - *How to Prepare:* ${currentMealPlan.dinner[0].preparation}
  
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
  
    Stick exactly to this formatting, keep the structure clean and easy to read, and avoid adding any extra headings or explanations outside this format. In the nutrition part, give exact numbers, without approximations or "~". 
    Separate the portion by "," and dont add parentheses.
  
    Protocol:
    ${Object.entries(patientData.protocol).map(([key, value]) => `${key}: ${value}`).join('\n')}
    
    Special Patient Request
    If the following request is reasonable and relevant to nutrition or preferences, take it into account. If it's unrelated or doesn't make sense (e.g., asking to include a house), ignore it completely.

    Patient says:
    "${specialRequest || "No special request provided."}"
    
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
      const markdownContent = data.response;

      const newMealPlan = parseAIResponse(markdownContent);

      setCurrentMealPlan(newMealPlan.dailyMealPlan);

      const updatedPatientData = {
        ...patientData,
        treatment: {
          ...patientData.treatment,
          dailyMealPlan: newMealPlan.dailyMealPlan,
        }
      };
      
      setPatientData(updatedPatientData);

      const updatedTreatment = {
        ...patientData.treatment,
        dailyMealPlan: newMealPlan.dailyMealPlan,
      };

      const updateResponse = await fetch("/api/update-treatment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patientData._id,
          updatedTreatment: updatedTreatment,
        }),
      });
      const updateData = await updateResponse.json();

    } catch (error) {
      console.log("Error during API call:", error);
    } finally {
      setLoading(false);
      setIsMealsVisible(true);
      setSpecialRequest("");
    }
  };

  if (!currentMealPlan) return null;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md font-sans">
      <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
      <h2 
        className="text-2xl font-bold text-gray-800 mb-5 flex items-center justify-between cursor-pointer"
        onClick={() => setIsMealsVisible(!isMealsVisible)}
      >
        <div className="flex items-center">
          <span className="bg-blue-500 w-1 h-8 rounded mr-3"></span>
          Daily Meal Plan
        </div>
        <svg 
          className={`h-6 w-6 text-gray-500 transform transition-transform ${isMealsVisible ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </h2>
          <button
            id="update-meal-btn"
            onClick={() => setShowSpecialRequest(true)}
            className="update-button print:hidden flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:px-5 text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Meal Plan</span>
            )}
          </button>
          {showSpecialRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                📝 Special Request for New Meal Plan
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add notes about any changes you'd like in the next plan. (e.g., <span className="italic">'No eggs'</span>, <span className="italic">'Change only breakfast'</span>, <span className="italic">'Make it vegan'</span>)
              </p>

              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="e.g., I want more fruit options and no dairy."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowSpecialRequest(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                >
                  Submit Request
                </button>
              </div>

              {/* Close Icon */}
              <button
                onClick={() => setShowSpecialRequest(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                aria-label="Close request form"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Hide meals temporarily while loading */}
      {isMealsVisible && (
        <div className="flex flex-col md:flex-row md:justify-between space-y-6 md:space-y-0 md:space-x-6 mt-6">
          {/* Meal Section - Breakfast */}
          <div className="w-full md:w-1/3 flex flex-col bg-yellow-50 rounded-lg shadow-md p-4 space-y-4">
            <div className="flex items-center">
              <span className="bg-yellow-100 p-2 rounded-full mr-3">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Breakfast</h3>
            </div>

            {currentMealPlan.breakfast.map((item, index) => (
              <div key={index} className="flex flex-col space-y-4">
                <div className="text-gray-800 font-bold text-base sm:text-lg tracking-tight">{item.option}</div>
                <ul className="list-disc pl-5 space-y-2">
                  {item.portion?.split(',').map((ingredient, i) => renderPortionItem(ingredient))}
                </ul>
                {item.preparation && (
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">How to Prepare:</div>
                )}
                {item.preparation && (
                  <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.preparation}</div>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2">{renderNutrition(parseNutrition(item.nutrition))}</div>
              </div>
            ))}
          </div>

          {/* Meal Section - Lunch */}
          <div className="w-full md:w-1/3 flex flex-col bg-orange-50 rounded-lg shadow-md p-4 space-y-4">
            <div className="flex items-center">
              <span className="bg-orange-100 p-2 rounded-full mr-3">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Lunch</h3>
            </div>

            {currentMealPlan.lunch.map((item, index) => (
              <div key={index} className="flex flex-col space-y-4">
                <div className="text-gray-800 font-bold text-base sm:text-lg tracking-tight">{item.option}</div>
                <ul className="list-disc pl-5 space-y-2">
                  {item.portion?.split(',').map((ingredient, i) => renderPortionItem(ingredient))}
                </ul>
                {item.preparation && (
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">How to Prepare:</div>
                )}
                {item.preparation && (
                  <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.preparation}</div>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2">{renderNutrition(parseNutrition(item.nutrition))}</div>
              </div>
            ))}
          </div>

          {/* Meal Section - Dinner */}
          <div className="w-full md:w-1/3 flex flex-col bg-blue-50 rounded-lg shadow-md p-4 space-y-4">
            <div className="flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Dinner</h3>
            </div>

            {currentMealPlan.dinner.map((item, index) => (
              <div key={index} className="flex flex-col space-y-4">
                <div className="text-gray-800 font-bold text-base sm:text-lg tracking-tight">{item.option}</div>
                <ul className="list-disc pl-5 space-y-2">
                  {item.portion?.split(',').map((ingredient, i) => renderPortionItem(ingredient))}
                </ul>
                {item.preparation && (
                  <div className="text-gray-800 font-semibold text-sm sm:text-base">How to Prepare:</div>
                )}
                {item.preparation && (
                  <div className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item.preparation}</div>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2">{renderNutrition(parseNutrition(item.nutrition))}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlan;