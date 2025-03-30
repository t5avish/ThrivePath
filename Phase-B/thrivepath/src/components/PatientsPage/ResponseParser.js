function parseAIResponse(markdownString) {
    // Initialize the result object
    const result = {
      dailyMealPlan: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      hydration: {
        totalWater: "",
        tips: []
      },
      physicalActivity: {
        type: "",
        duration: "",
        timingSuggestions: {
          morning: "",
          alternative: ""
        },
        muscleStrengtheningActivities: ""
      },
      sleepSchedule: {
        bedtime: "",
        wakeTime: "",
        routineTips: []
      }
    };
  
    // Split the markdown into sections
    const sections = markdownString.split(/###\s+\d+\.\s+/);
    
    // Process each section
    sections.forEach(section => {
      if (!section.trim()) return;
      
      // Determine which section we're in
      if (section.includes("Daily Meal Plan")) {
        parseMealPlan(section, result);
      } else if (section.includes("Daily Hydration")) {
        parseHydration(section, result);
      } else if (section.includes("Physical Activity Plan")) {
        parsePhysicalActivity(section, result);
      } else if (section.includes("Sleep Schedule")) {
        parseSleepSchedule(section, result);
      }
    });
    
    return result;
  }
  
  function parseMealPlan(section, result) {
    // Define helper function to parse meal data
    function parseMeal(mealText, mealType) {
      // Look for option entries which are bullet points after the meal type
      const optionRegex = /-\s+\*Option:\*\s+(.*?)(?=\n|$)/g;
      let optionMatch;
      let mealItems = [];
      
      // Create an array to store all matches
      const allMatches = [];
      while ((optionMatch = optionRegex.exec(mealText)) !== null) {
        allMatches.push({
          option: optionMatch[1].trim(),
          index: optionMatch.index
        });
      }
      
      // Process each option
      for (let i = 0; i < allMatches.length; i++) {
        const currentMatch = allMatches[i];
        const nextMatchIndex = (i < allMatches.length - 1) ? allMatches[i + 1].index : mealText.length;
        const optionBlock = mealText.substring(currentMatch.index, nextMatchIndex);
        
        // Extract portion and nutrition for this option
        const portionMatch = optionBlock.match(/-\s+\*Portion:\*\s+(.*?)(?=\n|$)/);
        const nutritionMatch = optionBlock.match(/-\s+\*Nutrition:\*\s+(.*?)(?=\n|$)/);
        
        mealItems.push({
          option: currentMatch.option,
          portion: portionMatch ? portionMatch[1].trim() : "",
          nutrition: nutritionMatch ? nutritionMatch[1].trim() : ""
        });
      }
      
      return mealItems;
    }
  
    // Extract meal sections using robust patterns
    const breakfastSection = section.match(/\*Breakfast:\*([\s\S]*?)(?=\*Lunch:\*|\*Dinner:\*|\*Snacks:\*|$)/);
    const lunchSection = section.match(/\*Lunch:\*([\s\S]*?)(?=\*Dinner:\*|\*Snacks:\*|$)/);
    const dinnerSection = section.match(/\*Dinner:\*([\s\S]*?)(?=\*Snacks:\*|$)/);
    const snacksSection = section.match(/\*Snacks:\*([\s\S]*?)(?=$|###)/);
    
    // Parse each meal section
    if (breakfastSection) {
      result.dailyMealPlan.breakfast = parseMeal(breakfastSection[1], "breakfast");
    }
    
    if (lunchSection) {
      result.dailyMealPlan.lunch = parseMeal(lunchSection[1], "lunch");
    }
    
    if (dinnerSection) {
      result.dailyMealPlan.dinner = parseMeal(dinnerSection[1], "dinner");
    }
    
    // Parse snacks (which have a simpler format)
    if (snacksSection) {
      const snackItems = snacksSection[1].match(/-\s+\*Option:\*\s+(.*?)(?=\n|$)/g);
      if (snackItems) {
        result.dailyMealPlan.snacks = snackItems.map(snack => {
          return snack.replace(/-\s+\*Option:\*\s+/, "").trim();
        });
      }
    }
  }
  
  function parseHydration(section, result) {
    // Extract total water recommendation
    const waterMatch = section.match(/\*Total Water:\*\s*(.*?)(?=\.|\n|$)/);
    if (waterMatch) {
      result.hydration.totalWater = waterMatch[1].trim();
    }
    
    // Extract hydration tips
    const tipsSection = section.match(/\*Tips to Stay Hydrated:\*([\s\S]*?)(?=###|$)/);
    if (tipsSection) {
      const tips = tipsSection[1].match(/-\s+(.*?)(?=\n|$)/g);
      if (tips) {
        result.hydration.tips = tips.map(tip => tip.replace(/^-\s+/, "").trim()).filter(tip => tip.length > 0);
      }
    }
  }
  
  function parsePhysicalActivity(section, result) {
    // Extract activity type
    const typeMatch = section.match(/\*Type:\*\s*(.*?)(?=\n|$)/);
    if (typeMatch) {
      result.physicalActivity.type = typeMatch[1].trim();
    }
    
    // Extract duration
    const durationMatch = section.match(/\*Duration:\*\s*\*\*(.*?)\*\*/);
    if (durationMatch) {
      result.physicalActivity.duration = durationMatch[1].trim();
    }
    
    // Extract timing suggestions
    const morningMatch = section.match(/\*Morning:\*\s*(.*?)(?=\n|$)/);
    if (morningMatch) {
      result.physicalActivity.timingSuggestions.morning = morningMatch[1].trim();
    }
    
    const alternativeMatch = section.match(/\*Alternative:\*\s*(.*?)(?=\n|$)/);
    if (alternativeMatch) {
      result.physicalActivity.timingSuggestions.alternative = alternativeMatch[1].trim();
    }
    
    // Extract muscle-strengthening activities
    const strengthMatch = section.match(/\*Muscle-strengthening Activities:\*\s*(.*?)(?=\n|$)/);
    if (strengthMatch) {
      result.physicalActivity.muscleStrengtheningActivities = strengthMatch[1].trim();
    }
  }
  
  function parseSleepSchedule(section, result) {
    // Extract bedtime
    const bedtimeMatch = section.match(/\*Bedtime:\*\s*(.*?)(?=\n|$)/);
    if (bedtimeMatch) {
      result.sleepSchedule.bedtime = bedtimeMatch[1].trim();
    }
    
    // Extract wake time
    const wakeTimeMatch = section.match(/\*Wake Time:\*\s*(.*?)(?=\n|$)/);
    if (wakeTimeMatch) {
      result.sleepSchedule.wakeTime = wakeTimeMatch[1].trim();
    }
    
    // Extract bedtime routine tips
    const routineTipsSection = section.match(/\*Bedtime Routine Tips:\*([\s\S]*?)(?=###|$)/);
    if (routineTipsSection) {
      const tips = routineTipsSection[1].match(/-\s+(.*?)(?=\n|$)/g);
      if (tips) {
        result.sleepSchedule.routineTips = tips.map(tip => tip.replace(/^-\s+/, "").trim()).filter(tip => tip.length > 0);
      }
    }
  }
  
  // Export the parser function
  module.exports = parseAIResponse;