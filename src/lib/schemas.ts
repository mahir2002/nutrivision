// Validation Schemas for NutriVision API

import { z } from 'zod';

// User Profile Schemas
export const SexSchema = z.enum(['male', 'female', 'other']);
export const FitnessGoalSchema = z.enum(['fat_loss', 'muscle_gain', 'recomposition', 'bulk', 'general_fitness']);
export const ActivityLevelSchema = z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']);
export const ExperienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const EquipmentAccessSchema = z.enum(['none', 'home_basic', 'home_full', 'gym']);
export const DietaryPreferenceSchema = z.enum([
  'halal', 'kosher', 'vegan', 'vegetarian', 'pescatarian', 
  'dairy_free', 'gluten_free', 'keto', 'low_carb', 'none'
]);

export const UserProfileSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  
  // Personal Info
  name: z.string().min(1, 'Name is required').max(100),
  age: z.number().int().min(13, 'Must be at least 13 years old').max(120),
  sex: SexSchema.optional(),
  heightCm: z.number().positive().min(50).max(300),
  weightKg: z.number().positive().min(20).max(500),
  
  // Fitness Profile
  fitnessGoal: FitnessGoalSchema,
  gymDaysPerWeek: z.number().int().min(0).max(7),
  activityLevel: ActivityLevelSchema,
  experienceLevel: ExperienceLevelSchema,
  equipmentAccess: EquipmentAccessSchema,
  
  // Health & Limitations
  injuries: z.array(z.string()).optional(),
  limitations: z.string().optional(),
  
  // Dietary Preferences
  dietaryPreferences: z.array(DietaryPreferenceSchema),
  allergies: z.array(z.string()),
  mealsPerDay: z.number().int().min(1).max(10),
  foodPreferences: z.array(z.string()).optional(),
});

export const CreateUserProfileSchema = UserProfileSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  id: z.string().optional(),
});

// Meal Schemas
export const MealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

export const FoodItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Food name is required').max(200),
  brand: z.string().optional(),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
});

export const LoggedFoodSchema = FoodItemSchema.extend({
  quantity: z.number().positive(),
  totalCalories: z.number().min(0),
  totalProtein: z.number().min(0),
  totalCarbs: z.number().min(0),
  totalFat: z.number().min(0),
});

export const MealSchema = z.object({
  id: z.string(),
  type: MealTypeSchema,
  timestamp: z.string().datetime(),
  foods: z.array(LoggedFoodSchema),
  totalCalories: z.number().min(0),
  totalProtein: z.number().min(0),
  totalCarbs: z.number().min(0),
  totalFat: z.number().min(0),
  notes: z.string().optional(),
});

export const CreateMealSchema = MealSchema.omit({ 
  id: true, 
  timestamp: true,
  totalCalories: true,
  totalProtein: true,
  totalCarbs: true,
  totalFat: true,
}).extend({
  id: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Nutrition Stats Schemas
export const NutritionTotalsSchema = z.object({
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
});

export const DailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meals: z.array(MealSchema),
  totals: NutritionTotalsSchema,
  waterMl: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const NutritionStatsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period: z.enum(['daily', 'weekly']).optional(),
});

// Type exports
export type Sex = z.infer<typeof SexSchema>;
export type FitnessGoal = z.infer<typeof FitnessGoalSchema>;
export type ActivityLevel = z.infer<typeof ActivityLevelSchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export type EquipmentAccess = z.infer<typeof EquipmentAccessSchema>;
export type DietaryPreference = z.infer<typeof DietaryPreferenceSchema>;
export type MealType = z.infer<typeof MealTypeSchema>;
export type UserProfileInput = z.infer<typeof CreateUserProfileSchema>;
export type MealInput = z.infer<typeof CreateMealSchema>;
