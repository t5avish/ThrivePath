import React from "react";

const MealPlan = ({ dailyMealPlan }) => {
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
      <div key={index} className="flex flex-col items-center p-2 mx-1 border rounded-lg bg-gray-50 shadow-sm">
        <div className="font-medium text-gray-800">
          {value} <span className="text-gray-600">{key.includes('(') ? '' : key}</span>
        </div>
        <div className="text-xs text-gray-500">
          {key.includes('(') ? key : ''}
        </div>
      </div>
    ));
  };

  const renderPortionItem = (ingredient) => {
    // Check if the ingredient has a quantity prefix (like "50 grams of" or "1 slice of")
    const match = ingredient.trim().match(/^(\d+\s*[a-zA-Z]*)\s+(of)\s+(.+)$/i);
    
    if (match) {
      const [_, quantity, connecting, item] = match;
      return (
        <li className="mb-2 font-normal">
          <span className="text-gray-900">{quantity}</span>
          <span className="text-gray-700"> {connecting} </span>
          <span className="text-gray-800">{item}</span>
        </li>
      );
    }
    
    // For ingredients without "of" (e.g. "1 slice whole wheat bread")
    const simpleMatch = ingredient.trim().match(/^(\d+\s*[a-zA-Z]*)\s+(.+)$/i);
    if (simpleMatch) {
      const [_, quantity, item] = simpleMatch;
      return (
        <li className="mb-2 font-normal">
          <span className="text-gray-900">{quantity}</span>
          <span className="text-gray-800"> {item}</span>
        </li>
      );
    }
    
    // If no quantity pattern is found, render the whole text
    return (
      <li className="mb-2 font-normal text-gray-800">{ingredient.trim()}</li>
    );
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
        <h2 className="text-2xl font-bold text-gray-900">Daily Meal Plan</h2>
      </div>

      <div className="space-y-10">
        {/* Breakfast */}
        <div className="border-b pb-8">
          <div className="flex items-center mb-5">
            <span className="bg-yellow-100 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Breakfast</h3>
          </div>

          <div className="pl-10">
            {dailyMealPlan.breakfast.map((item, index) => (
              <div key={index} className="py-4 border-l-2 border-yellow-200 pl-4 mb-4 last:mb-0 hover:border-yellow-400 transition-colors duration-200">
                <div className="text-gray-800 font-medium text-lg mb-3">{item.option}</div>
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-5 space-y-1">
                    {item.portion?.split(',').map((ingredient, i) => (
                      renderPortionItem(ingredient)
                    ))}
                  </ul>
                </div>
                {/* Render nutrition details inline */}
                <div className="flex flex-wrap gap-2">{renderNutrition(parseNutrition(item.nutrition))}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lunch */}
        <div className="border-b pb-8">
          <div className="flex items-center mb-5">
            <span className="bg-orange-100 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Lunch</h3>
          </div>

          <div className="pl-10">
            {dailyMealPlan.lunch.map((item, index) => (
              <div key={index} className="py-4 border-l-2 border-orange-200 pl-4 mb-4 last:mb-0 hover:border-orange-400 transition-colors duration-200">
                <div className="text-gray-800 font-medium text-lg mb-3">{item.option}</div>
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-5 space-y-1">
                    {item.portion?.split(',').map((ingredient, i) => (
                      renderPortionItem(ingredient)
                    ))}
                  </ul>
                </div>
                {/* Render nutrition details inline */}
                <div className="flex flex-wrap gap-2">{renderNutrition(parseNutrition(item.nutrition))}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dinner */}
        <div className="pb-6">
          <div className="flex items-center mb-5">
            <span className="bg-blue-100 p-2 rounded-full mr-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Dinner</h3>
          </div>

          <div className="pl-10">
            {dailyMealPlan.dinner.map((item, index) => (
              <div key={index} className="py-4 border-l-2 border-blue-200 pl-4 mb-4 last:mb-0 hover:border-blue-400 transition-colors duration-200">
                <div className="text-gray-800 font-medium text-lg mb-3">{item.option}</div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-5 space-y-1">
                    {item.portion?.split(',').map((ingredient, i) => (
                      renderPortionItem(ingredient)
                    ))}
                  </ul>
                </div>
                {/* Render nutrition details inline */}
                <div className="flex flex-wrap gap-2">{renderNutrition(parseNutrition(item.nutrition))}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Snacks */}
        {dailyMealPlan.snacks && dailyMealPlan.snacks.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center mb-5">
              <span className="bg-purple-100 p-2 rounded-full mr-3">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </span>
              <h3 className="text-lg font-semibold text-gray-900">Snacks</h3>
            </div>

            <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyMealPlan.snacks.map((snack, idx) => (
                <div key={idx} className="text-gray-800 py-2 px-4 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors duration-200">
                  {snack}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlan;