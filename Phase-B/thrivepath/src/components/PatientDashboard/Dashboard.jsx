import React from "react";
import MealPlan from "./treatment/MealPlan";
import PhysicalActivity from "./treatment/PhysicalActivity";
import SleepSchedule from "./treatment/SleepSchedule";
import Hydration from "./treatment/Hydration";

const Dashboard = ({ treatment, patient, protocol }) => {
  if (!treatment) return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  );

  return (
    <div className="px-2 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <MealPlan dailyMealPlan={treatment.dailyMealPlan} patient={patient} />
      <PhysicalActivity activity={treatment.physicalActivity} />
      <SleepSchedule sleep={treatment.sleepSchedule} />
      <Hydration hydration={treatment.hydration} />
    </div>
  );
};

export default Dashboard;