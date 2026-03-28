// Meal & Food Tracking Types

export interface FoodItem {
    id: string;
    name: string;
    brand?: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

export interface LoggedFood extends FoodItem {
    quantity: number; // Number of servings
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
    id: string;
    type: MealType;
    timestamp: string;
    foods: LoggedFood[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    notes?: string;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    meals: Meal[];
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    waterMl?: number;
    notes?: string;
}

// Food Analysis Types
export interface FoodLabelAnalysis {
    productName?: string;
    ingredients: string[];
    nutrition: {
        servingSize: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
    };
    allergens: string[];
    fitScore: 'Good' | 'Moderate' | 'Poor';
    reasons: string[];
    portionRecommendation: string;
}

export interface MealPhotoAnalysis {
    detectedFoods: DetectedFood[];
    estimatedCalories: {
        min: number;
        max: number;
        average: number;
    };
    estimatedMacros: {
        protein: { min: number; max: number };
        carbs: { min: number; max: number };
        fat: { min: number; max: number };
    };
    confidence: 'High' | 'Medium' | 'Low';
    uncertainties: string[];
    followUpQuestions: string[];
}

export interface DetectedFood {
    name: string;
    estimatedPortion: string;
    estimatedCalories: number;
    confidence: number; // 0-1
}

// Meal type labels
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
};
