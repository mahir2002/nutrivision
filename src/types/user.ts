// User Profile Types

export type Sex = 'male' | 'female' | 'other';
export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'recomposition' | 'bulk' | 'general_fitness';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentAccess = 'none' | 'home_basic' | 'home_full' | 'gym';

export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Personal Info
  name: string;
  age: number;
  sex?: Sex;
  heightCm: number;
  weightKg: number;
  
  // Fitness Profile
  fitnessGoal: FitnessGoal;
  gymDaysPerWeek: number; // 3, 4, 5, or 6
  activityLevel: ActivityLevel;
  experienceLevel: ExperienceLevel;
  equipmentAccess: EquipmentAccess;
  
  // Health & Limitations
  injuries?: string[];
  limitations?: string;
  
  // Dietary Preferences
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  mealsPerDay: number;
  foodPreferences?: string[];
}

export type DietaryPreference = 
  | 'halal'
  | 'kosher'
  | 'vegan'
  | 'vegetarian'
  | 'pescatarian'
  | 'dairy_free'
  | 'gluten_free'
  | 'keto'
  | 'low_carb'
  | 'none';

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MacroBreakdown {
  protein: number;
  carbs: number;
  fat: number;
}

// Weight tracking
export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  notes?: string;
}

// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// Goal calorie adjustments
export const GOAL_ADJUSTMENTS: Record<FitnessGoal, { min: number; max: number }> = {
  fat_loss: { min: -700, max: -300 },
  muscle_gain: { min: 200, max: 400 },
  recomposition: { min: -100, max: 100 },
  bulk: { min: 300, max: 500 },
  general_fitness: { min: -200, max: 0 },
};

// Formatting helpers
export const GOAL_LABELS: Record<FitnessGoal, string> = {
  fat_loss: 'Fat Loss',
  muscle_gain: 'Muscle Gain',
  recomposition: 'Body Recomposition',
  bulk: 'Bulk',
  general_fitness: 'General Fitness',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  lightly_active: 'Lightly Active (1-3 days/week)',
  moderately_active: 'Moderately Active (3-5 days/week)',
  very_active: 'Very Active (6-7 days/week)',
  extremely_active: 'Extremely Active (athlete/physical job)',
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner (0-1 years)',
  intermediate: 'Intermediate (1-3 years)',
  advanced: 'Advanced (3+ years)',
};

export const EQUIPMENT_LABELS: Record<EquipmentAccess, string> = {
  none: 'No Equipment (Bodyweight Only)',
  home_basic: 'Home Basic (Dumbbells, Bands)',
  home_full: 'Home Gym (Barbell, Rack, etc.)',
  gym: 'Full Gym Access',
};
