function parseAIResponse(markdownString) {
  const result = {
    dailyMealPlan: {
      breakfast: [],
      lunch: [],
      dinner: [],
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

  const sections = markdownString.split(/###\s+\d+\.\s+/);

  sections.forEach(section => {
    if (!section.trim()) return;

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
  function parseMeal(mealText) {
    const optionRegex = /-\s+\*Option:\*\s+(.*?)(?=\n|$)/g;
    const prepareRegex = /-\s+\*How to Prepare:\*\s+(.*?)(?=\n|$)/g;
    let optionMatch, prepareMatch;
    let mealItems = [];

    const allMatches = [];
    while ((optionMatch = optionRegex.exec(mealText)) !== null) {
      allMatches.push({
        option: optionMatch[1].trim(),
        index: optionMatch.index
      });
    }

    for (let i = 0; i < allMatches.length; i++) {
      const currentMatch = allMatches[i];
      const nextMatchIndex = (i < allMatches.length - 1) ? allMatches[i + 1].index : mealText.length;
      const optionBlock = mealText.substring(currentMatch.index, nextMatchIndex);
      
      const portionMatch = optionBlock.match(/-\s+\*Portion:\*\s+(.*?)(?=\n|$)/);
      const nutritionMatch = optionBlock.match(/-\s+\*Nutrition:\*\s+(.*?)(?=\n|$)/);
      const prepareMatch = optionBlock.match(/-\s+\*How to Prepare:\*\s+(.*?)(?=\n|$)/);

      mealItems.push({
        option: currentMatch.option,
        portion: portionMatch ? portionMatch[1].trim() : "",
        nutrition: nutritionMatch ? nutritionMatch[1].trim() : "",
        preparation: prepareMatch ? prepareMatch[1].trim() : ""
      });
    }

    return mealItems;
  }

  const breakfastSection = section.match(/\*Breakfast:\*([\s\S]*?)(?=\*Lunch:\*|\*Dinner:\*|$)/);
  const lunchSection = section.match(/\*Lunch:\*([\s\S]*?)(?=\*Dinner:\*|$)/);
  const dinnerSection = section.match(/\*Dinner:\*([\s\S]*?)(?=$)/);

  if (breakfastSection) {
    result.dailyMealPlan.breakfast = parseMeal(breakfastSection[1]);
  }

  if (lunchSection) {
    result.dailyMealPlan.lunch = parseMeal(lunchSection[1]);
  }

  if (dinnerSection) {
    result.dailyMealPlan.dinner = parseMeal(dinnerSection[1]);
  }
}

function parseHydration(section, result) {
  const waterMatch = section.match(/\*Total Water:\*\s*(.*?)(?=\.|\n|$)/);
  if (waterMatch) {
    result.hydration.totalWater = waterMatch[1].trim();
  }

  const tipsSection = section.match(/\*Tips to Stay Hydrated:\*([\s\S]*?)(?=###|$)/);
  if (tipsSection) {
    const tips = tipsSection[1].match(/-\s+(.*?)(?=\n|$)/g);
    if (tips) {
      result.hydration.tips = tips.map(tip => tip.replace(/^-\s+/, "").trim()).filter(tip => tip.length > 0);
    }
  }
}

function parsePhysicalActivity(section, result) {
  const typeMatch = section.match(/\*Type:\*\s*(.*?)(?=\n|$)/);
  if (typeMatch) {
    result.physicalActivity.type = typeMatch[1].trim();
  }

  const durationMatch = section.match(/\*Duration:\*\s*\*\*(.*?)\*\*/);
  if (durationMatch) {
    result.physicalActivity.duration = durationMatch[1].trim();
  }

  const morningMatch = section.match(/\*Morning:\*\s*(.*?)(?=\n|$)/);
  if (morningMatch) {
    result.physicalActivity.timingSuggestions.morning = morningMatch[1].trim();
  }

  const alternativeMatch = section.match(/\*Alternative:\*\s*(.*?)(?=\n|$)/);
  if (alternativeMatch) {
    result.physicalActivity.timingSuggestions.alternative = alternativeMatch[1].trim();
  }

  const strengthMatch = section.match(/\*Muscle-strengthening Activities:\*\s*(.*?)(?=\n|$)/);
  if (strengthMatch) {
    result.physicalActivity.muscleStrengtheningActivities = strengthMatch[1].trim();
  }
}

function parseSleepSchedule(section, result) {
  const bedtimeMatch = section.match(/\*Bedtime:\*\s*(.*?)(?=\n|$)/);
  if (bedtimeMatch) {
    result.sleepSchedule.bedtime = bedtimeMatch[1].trim();
  }

  const wakeTimeMatch = section.match(/\*Wake Time:\*\s*(.*?)(?=\n|$)/);
  if (wakeTimeMatch) {
    result.sleepSchedule.wakeTime = wakeTimeMatch[1].trim();
  }

  const routineTipsSection = section.match(/\*Bedtime Routine Tips:\*([\s\S]*?)(?=###|$)/);
  if (routineTipsSection) {
    const tips = routineTipsSection[1].match(/-\s+(.*?)(?=\n|$)/g);
    if (tips) {
      result.sleepSchedule.routineTips = tips.map(tip => tip.replace(/^-\s+/, "").trim()).filter(tip => tip.length > 0);
    }
  }
}

module.exports = parseAIResponse;
