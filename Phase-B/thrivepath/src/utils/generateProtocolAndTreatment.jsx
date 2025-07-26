import ProtocolGenerator from "./ProtocolGenerator";
import { calculateAge } from ".";

export const dailyMealPlanPromptJSON = `{
  "breakfast": {
    "option": "",
    "portion": "",
    "nutrition": "",
    "preparation": ""
  },
  "lunch": {
    "option": "",
    "portion": "",
    "nutrition": "",
    "preparation": ""
  },
  "dinner": {
    "option": "",
    "portion": "",
    "nutrition": "",
    "preparation": ""
  }
}`

export async function generateProtocolAndTreatment({ birthdate, gender, weight }) {
  const age = calculateAge(birthdate);
  const protocol = ProtocolGenerator({ age, gender, weight });

  const hydrationPromptJSON = `"hydration": {
    "totalWater": "",
    "tips": [
      "", "", ""
    ]
  }`

  const physicalActivityPromptJSON = `{
    "type": "",
    "duration": "",
    "timingSuggestions": {
      "morning": "",
      "alternative": ""
    },
    "muscleStrengtheningActivities": ""
  }`

  const sleepSchedulePromptJSON = `{
    "bedtime": "",
    "wakeTime": "",
    "routineTips": [
      "", "", ""
    ]
  }`

  const prompt = `
Based on the following protocol, generate a personalized daily plan.
The response must strictly follow this structure:

{
  "dailyMealPlan": ${dailyMealPlanPromptJSON},
  "hydration": ${hydrationPromptJSON},
  "physicalActivity": ${physicalActivityPromptJSON},
  "sleepSchedule": ${sleepSchedulePromptJSON}
}

Protocol:
${Object.entries(protocol).map(([key, value]) => `${key}: ${value}`).join('\n')}

Return only valid JSON ready to be parsed by code.

In the nutrition part, give exact numbers, without approximations or "~".
Make sure the nutritional values ​​match those described in the protocol.
Separate the portion by "," and dont add parentheses.
`;

  const token = localStorage.getItem("token");
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

  if (!response.ok) {
    throw new Error(data.message || "Failed to get treatment plan");
  }

  const treatment = JSON.parse(data.response);
  return { protocol, treatment };
}
