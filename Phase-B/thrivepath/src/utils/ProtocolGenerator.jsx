const getMedianWeight = (gender, age) => {
    const medianWeights = {
        male: { 1: 10.2, 2: 12.3, 3: 14.6, 4: 16.7, 5: 18.7, 6: 20.6, 7: 22.9, 8: 25.6, 9: 28.7, 10: 32.1, 11: 36.4, 12: 40.8 },
        female: { 1: 9.6, 2: 11.8, 3: 14.1, 4: 16.3, 5: 18.4, 6: 20.6, 7: 23.2, 8: 26.3, 9: 29.9, 10: 33.8, 11: 38.4, 12: 42.9 }
    };
    return medianWeights[gender]?.[age] || null;
};

const calculateDailyCalories = (currentWeight, medianWeight) => {
    if (!medianWeight) return null;
    return (120 * (medianWeight / currentWeight)) * currentWeight;
};

const calculateDailyCarbohydrates = (DCV) => {
    if (!DCV) return null;
    return (DCV * 0.55) / 4;
};

const calculateDailyProteins = (DCV) => {
    if (!DCV) return null;
    return (DCV * 0.15) / 4;
};

const calculateDailyFats = (DCV) => {
    if (!DCV) return null;
    return (DCV * 0.30) / 9;
};

const calculateCalcium = (age) => { 
    if (age >= 1 && age <= 3) {
        return 500;
    } else if (age >= 4 && age <= 8) {
        return 700;
    } else if (age >= 9 && age <= 12) {
        return 1100;
    } else {
        return "Invalid nutrient or age.";
    }
};

const calculateIron = (age, gender) => {
    if (age >= 1 && age <= 3) {
        return 7;
    } else if (age >= 4 && age <= 8) {
        return 10;
    } else if (age >= 9 && age <= 12) {
        if (gender === "male") {
            return 12;
        } else if (gender === "female") {
            return 15;
        }
    } else {
        return "Invalid gender or age.";
    }
};

const calculateVitaminC = (age) => {
    if (age >= 1 && age <= 3) {
        return 15;
    } else if (age >= 4 && age <= 8) {
        return 25;
    } else if (age >= 9 && age <= 12) {
        return 45;
    } else {
        return "Invalid nutrient or age.";
    }
};

const calculateVitaminD = (age) => {
    if (age >= 1 && age <= 3) {
        return 10;
    } else if (age >= 4 && age <= 8) {
        return 10;
    } else if (age >= 9 && age <= 12) {
        return 15;
    } else {
        return "Invalid nutrient or age.";
    }
};

const calculateVitaminE = (age) => {
    if (age >= 1 && age <= 3) {
        return 6;
    } else if (age >= 4 && age <= 8) {
        return 7;
    } else if (age >= 9 && age <= 12) {
        return 11;
    } else {
        return "Invalid nutrient or age.";
    }
};

const calculateSleepHours = (age) => {
    if (age === 0) {
        return "12-16";
    } else if (age >= 1 && age <= 2) {
        return "11-14";
    } else if (age >= 3 && age <= 5) {
        return "10-13";
    } else if (age >= 6 && age <= 12) {
        return "9-12";
    } else {
        return "Invalid age";
    }
};

const calculateHydration = (age) => {
    if (age === 0) {
        return "Most of the water needs are met through breast milk or formula. 3-4";
    } else if (age >= 1 && age <= 3) {
        return "4";
    } else if (age >= 4 && age <= 8) {
        return "6";
    } else if (age >= 9 && age <= 12) {
        return "8";
    } else {
        return "Invalid age.";
    }
};

const calculatePhysicalActivity = (age) => {
    if (age === 0) {
        return "Spend at least 30 minutes in tummy time throughout the day while awake.";
    } else if (age >= 1 && age <= 2) {
        return "Spend at least 180 minutes in physical activities of any intensity throughout the day. Include moderate- to vigorous-intensity physical activities.";
    } else if (age >= 3 && age <= 4) {
        return "Accumulate at least 180 minutes of physical activities spread throughout the day. Ensure at least 60 minutes of moderate- to vigorous-intensity physical activity.";
    } else if (age >= 5 && age <= 11) {
        return "Engage in at least 60 minutes of moderate- to vigorous-intensity physical activity daily. Incorporate muscle-strengthening activities at least three days per week.";
    } else if (age === 12) {
        return "Participate in activities such as running, swimming, and team sports. Include muscle- and bone-strengthening activities three times a week.";
    } else {
        return "Invalid age";
    }
};

const ProtocolGenerator = ({ gender, age, weight }) => {
    const medianWeight = getMedianWeight(gender, age);
    const DCV = calculateDailyCalories(weight, medianWeight);
    const dailyCarbohydrates = calculateDailyCarbohydrates(DCV);
    const dailyProteins = calculateDailyProteins(DCV);
    const dailyFats = calculateDailyFats(DCV);
    const Zinc = 25; // mg
    const Calcium = calculateCalcium(age); // mg
    const Iron = calculateIron(age, gender); // mg
    const VitaminC = calculateVitaminC(age); // mg
    const VitaminD = calculateVitaminD(age); // mg
    const VitaminE = calculateVitaminE(age); // mg
    const dailySleepHours = calculateSleepHours(age); // hours
    const dailyHydration = calculateHydration(age); // cups
    const dailyPhysicalActivity = calculatePhysicalActivity(age);

    const protocol = {
        age: `${age} years old`,
        gender: gender,
        weight: `${weight} kg`,
        dailyCalories: DCV ? `${DCV.toFixed(2)} kcal` : null,
        dailyCarbohydrates: dailyCarbohydrates ? `${dailyCarbohydrates.toFixed(2)} grams` : null,
        dailyProteins: dailyProteins ? `${dailyProteins.toFixed(2)} grams` : null,
        dailyFats: dailyFats ? `${dailyFats.toFixed(2)} grams` : null,
        dailyZinc: `${Zinc} mg`,
        dailyCalcium: `${Calcium} mg`,
        dailyIron: `${Iron} mg`,
        dailyVitaminC: `${VitaminC} mg`,
        dailyVitaminD: `${VitaminD} mg`,
        dailyVitaminE: `${VitaminE} mg`,
        dailySleepHours: `${dailySleepHours} hours`,
        dailyHydration: `${dailyHydration} cups`,
        dailyPhysicalActivity: dailyPhysicalActivity,
    };
    
    return protocol;
};


export default ProtocolGenerator;
