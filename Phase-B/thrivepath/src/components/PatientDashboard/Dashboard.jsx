import React from "react";
import MealPlan from "./MealPlan";
import PhysicalActivity from "./PhysicalActivity";
import SleepSchedule from "./SleepSchedule";
import Hydration from "./Hydration";

const Dashboard = ({ treatment }) => {
  if (!treatment) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <MealPlan dailyMealPlan={treatment.dailyMealPlan} />
      <PhysicalActivity activity={treatment.physicalActivity} />
      <SleepSchedule sleep={treatment.sleepSchedule} />
      <Hydration hydration={treatment.hydration} />
    </div>
  );
};

export default Dashboard;
