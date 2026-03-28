// Calorie & Macro Calculation Engine

import {
    UserProfile,
    NutritionTargets,
    ACTIVITY_MULTIPLIERS,
    GOAL_ADJUSTMENTS,
    FitnessGoal
} from '@/types/user';

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * More accurate than Harris-Benedict for modern populations
 */
export function calculateBMR(
    weightKg: number,
    heightCm: number,
    age: number,
    sex?: 'male' | 'female' | 'other'
): number {
    // Base calculation (uses average if sex not specified)
    const baseBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age);

    if (sex === 'male') {
        return Math.round(baseBMR + 5);
    } else if (sex === 'female') {
        return Math.round(baseBMR - 161);
    } else {
        // Average of male and female for 'other' or unspecified
        return Math.round(baseBMR - 78);
    }
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(profile: UserProfile): number {
    const bmr = calculateBMR(
        profile.weightKg,
        profile.heightCm,
        profile.age,
        profile.sex
    );

    const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
    return Math.round(bmr * multiplier);
}

/**
 * Get target calories based on goal
 */
export function calculateTargetCalories(profile: UserProfile): number {
    const tdee = calculateTDEE(profile);
    const adjustment = GOAL_ADJUSTMENTS[profile.fitnessGoal];

    // Use middle of the adjustment range
    const avgAdjustment = (adjustment.min + adjustment.max) / 2;

    return Math.round(tdee + avgAdjustment);
}

/**
 * Calculate macro targets based on calories and bodyweight
 * Returns protein, carbs, and fat in grams
 */
export function calculateMacros(profile: UserProfile): NutritionTargets {
    const targetCalories = calculateTargetCalories(profile);

    // Protein: 1.6-2.2g per kg based on goal
    const proteinPerKg = getProteinMultiplier(profile.fitnessGoal);
    const protein = Math.round(profile.weightKg * proteinPerKg);

    // Fat: 25% of calories (within 0.6g/kg minimum)
    const fatFromPercent = Math.round((targetCalories * 0.25) / 9);
    const fatMinimum = Math.round(profile.weightKg * 0.6);
    const fat = Math.max(fatFromPercent, fatMinimum);

    // Remaining calories go to carbs
    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const remainingCalories = targetCalories - proteinCalories - fatCalories;
    const carbs = Math.max(0, Math.round(remainingCalories / 4));

    // Fiber target: ~14g per 1000 calories
    const fiber = Math.round((targetCalories / 1000) * 14);

    return {
        calories: targetCalories,
        protein,
        carbs,
        fat,
        fiber,
    };
}

/**
 * Get protein multiplier based on fitness goal
 */
function getProteinMultiplier(goal: FitnessGoal): number {
    switch (goal) {
        case 'fat_loss':
            return 2.2; // Higher protein to preserve muscle in deficit
        case 'muscle_gain':
            return 2.0;
        case 'recomposition':
            return 2.0;
        case 'bulk':
            return 1.8;
        case 'general_fitness':
        default:
            return 1.6;
    }
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(targets: NutritionTargets): {
    protein: number;
    carbs: number;
    fat: number;
} {
    const proteinCals = targets.protein * 4;
    const carbsCals = targets.carbs * 4;
    const fatCals = targets.fat * 9;
    const total = proteinCals + carbsCals + fatCals;

    return {
        protein: Math.round((proteinCals / total) * 100),
        carbs: Math.round((carbsCals / total) * 100),
        fat: Math.round((fatCals / total) * 100),
    };
}

/**
 * Get detailed calculation breakdown for display
 */
export function getCalculationBreakdown(profile: UserProfile): {
    bmr: number;
    tdee: number;
    adjustment: number;
    targetCalories: number;
    targets: NutritionTargets;
    percentages: { protein: number; carbs: number; fat: number };
} {
    const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
    const tdee = calculateTDEE(profile);
    const targets = calculateMacros(profile);
    const adjustment = targets.calories - tdee;
    const percentages = calculateMacroPercentages(targets);

    return {
        bmr,
        tdee,
        adjustment,
        targetCalories: targets.calories,
        targets,
        percentages,
    };
}

/**
 * Calculate progress percentage for daily tracking
 */
export function calculateProgress(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

/**
 * Evaluate if daily intake is within acceptable range
 */
export function evaluateIntake(current: number, target: number): {
    status: 'under' | 'good' | 'over';
    difference: number;
    percentage: number;
} {
    const percentage = calculateProgress(current, target);
    const difference = current - target;

    if (percentage < 90) {
        return { status: 'under', difference, percentage };
    } else if (percentage <= 110) {
        return { status: 'good', difference, percentage };
    } else {
        return { status: 'over', difference, percentage };
    }
}
