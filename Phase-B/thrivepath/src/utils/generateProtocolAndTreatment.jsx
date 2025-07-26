import ProtocolGenerator from "./ProtocolGenerator";
import ResponseParser from "./ResponseParser";

export function calculateAge(birthdate) {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function generateProtocolAndTreatment({ birthdate, gender, weight }) {
  const age = calculateAge(birthdate);
  const protocol = ProtocolGenerator({ age, gender, weight });

  const prompt = `
Based on the following protocol, generate a personalized daily plan divided into 4 sections,
using **Markdown formatting** and the same style and structure shown below:

### 1. Daily Meal Plan
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


### 2. Daily Hydration Recommendation
- *Total Water:* ... cups of water daily.
- *Tips to Stay Hydrated:*
  - ...
  - ...
  - ...

### 3. Physical Activity Plan
- *Type:* ...
- *Duration:* **Maximum 30 minutes daily**.
- *Timing Suggestions:*
  - *Morning:* ...
  - *Alternative:* ...
- *Muscle-strengthening Activities:* ...

### 4. Sleep Schedule
- *Bedtime:* ...
- *Wake Time:* ...
- *Bedtime Routine Tips:*
  - ...
  - ...
  - ...

Stick exactly to this formatting, keep the structure clean and easy to read, and avoid adding any extra headings or explanations outside this format.
In the nutrition part, give exact numbers, without approximations or "~".
Seperate the portion by "," and dont add parentheses.
Make sure the nutritional values ​​match those described in the protocol.

Protocol:
${Object.entries(protocol).map(([key, value]) => `${key}: ${value}`).join('\n')}
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

  const treatment = ResponseParser(data.response);
  return { protocol, treatment };
}
