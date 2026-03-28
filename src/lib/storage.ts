// Local Storage abstraction for data persistence

import { UserProfile, WeightEntry } from '@/types/user';
import { DailyLog, Meal, FoodItem } from '@/types/meals';

// Re-export types
export type { WeightEntry } from '@/types/user';
export type { FoodItem } from '@/types/meals';

const STORAGE_KEYS = {
    USER_PROFILE: 'nutrivision_user_profile',
    DAILY_LOGS: 'nutrivision_daily_logs',
    MEAL_HISTORY: 'nutrivision_meal_history',
    SETTINGS: 'nutrivision_settings',
    WEIGHT_HISTORY: 'nutrivision_weight_history',
} as const;

// User Profile Storage
export function saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;

    const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
}

export function getUserProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as UserProfile;
    } catch {
        return null;
    }
}

export function clearUserProfile(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}

// Daily Logs Storage
export function getDailyLogs(): Record<string, DailyLog> {
    if (typeof window === 'undefined') return {};

    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (!stored) return {};

    try {
        return JSON.parse(stored);
    } catch {
        return {};
    }
}

export function getDailyLog(date: string): DailyLog | null {
    const logs = getDailyLogs();
    return logs[date] || null;
}

export function saveDailyLog(log: DailyLog): void {
    if (typeof window === 'undefined') return;

    const logs = getDailyLogs();
    logs[log.date] = log;

    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
}

export function addMealToDay(date: string, meal: Meal): DailyLog {
    let log = getDailyLog(date);

    if (!log) {
        log = {
            date,
            meals: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        };
    }

    log.meals.push(meal);

    // Recalculate totals
    log.totals = log.meals.reduce(
        (acc, m) => ({
            calories: acc.calories + m.totalCalories,
            protein: acc.protein + m.totalProtein,
            carbs: acc.carbs + m.totalCarbs,
            fat: acc.fat + m.totalFat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    saveDailyLog(log);
    return log;
}

export function removeMealFromDay(date: string, mealId: string): DailyLog | null {
    const log = getDailyLog(date);
    if (!log) return null;

    log.meals = log.meals.filter(m => m.id !== mealId);

    // Recalculate totals
    log.totals = log.meals.reduce(
        (acc, m) => ({
            calories: acc.calories + m.totalCalories,
            protein: acc.protein + m.totalProtein,
            carbs: acc.carbs + m.totalCarbs,
            fat: acc.fat + m.totalFat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    saveDailyLog(log);
    return log;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Get recent logs (last N days)
export function getRecentLogs(days: number = 7): DailyLog[] {
    const logs = getDailyLogs();
    const result: DailyLog[] = [];

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        if (logs[dateStr]) {
            result.push(logs[dateStr]);
        }
    }

    return result;
}

// Calculate weekly averages
export function getWeeklyAverages(): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    daysLogged: number;
} {
    const recentLogs = getRecentLogs(7);
    const daysLogged = recentLogs.length;

    if (daysLogged === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0, daysLogged: 0 };
    }

    const totals = recentLogs.reduce(
        (acc, log) => ({
            calories: acc.calories + log.totals.calories,
            protein: acc.protein + log.totals.protein,
            carbs: acc.carbs + log.totals.carbs,
            fat: acc.fat + log.totals.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
        calories: Math.round(totals.calories / daysLogged),
        protein: Math.round(totals.protein / daysLogged),
        carbs: Math.round(totals.carbs / daysLogged),
        fat: Math.round(totals.fat / daysLogged),
        daysLogged,
    };
}

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============ Water Tracking ============

export function saveWaterIntake(date: string, waterMl: number): void {
    const log = getDailyLog(date);
    
    if (!log) {
        const newLog: DailyLog = {
            date,
            meals: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            waterMl: waterMl,
        };
        saveDailyLog(newLog);
    } else {
        log.waterMl = waterMl;
        saveDailyLog(log);
    }
}

export function getWaterIntake(date: string): number {
    const log = getDailyLog(date);
    return log?.waterMl || 0;
}

export function addWaterToDay(date: string, amountMl: number): number {
    const currentWater = getWaterIntake(date);
    const newTotal = currentWater + amountMl;
    saveWaterIntake(date, newTotal);
    return newTotal;
}

// ============ Weight Tracking ============

export function getWeightHistory(): WeightEntry[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
    if (!stored) return [];
    
    try {
        return JSON.parse(stored) as WeightEntry[];
    } catch {
        return [];
    }
}

export function saveWeight(weightKg: number, date?: string, notes?: string): WeightEntry {
    if (typeof window === 'undefined') throw new Error('Cannot save weight on server');
    
    const entryDate = date || getTodayDate();
    const entry: WeightEntry = {
        id: generateId(),
        date: entryDate,
        weightKg,
        notes,
    };
    
    const history = getWeightHistory();
    
    // Check if there's already an entry for this date, replace if so
    const existingIndex = history.findIndex(e => e.date === entryDate);
    if (existingIndex >= 0) {
        history[existingIndex] = { ...entry, id: history[existingIndex].id };
    } else {
        history.push(entry);
    }
    
    // Sort by date descending
    history.sort((a, b) => b.date.localeCompare(a.date));
    
    localStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify(history));
    
    // Also update user profile with latest weight
    const profile = getUserProfile();
    if (profile) {
        profile.weightKg = weightKg;
        saveUserProfile(profile);
    }
    
    return entry;
}

export function getLatestWeight(): WeightEntry | null {
    const history = getWeightHistory();
    return history.length > 0 ? history[0] : null;
}

// ============ Workout Tracking ============

const WORKOUTS_KEY = 'nutrivision_workouts';

export interface Workout {
    id: string;
    date: string;
    type: string;
    duration: number; // in minutes
    exercises: WorkoutExercise[];
    caloriesBurned?: number;
    notes?: string;
    createdAt: string;
}

export interface WorkoutExercise {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number; // in minutes
    distance?: number; // in meters
    notes?: string;
}

export function getWorkouts(): Workout[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(WORKOUTS_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored) as Workout[];
    } catch {
        return [];
    }
}

export function getWorkoutById(id: string): Workout | null {
    const workouts = getWorkouts();
    return workouts.find(w => w.id === id) || null;
}

export function getWorkoutsByDateRange(startDate: string, endDate: string): Workout[] {
    const workouts = getWorkouts();
    return workouts.filter(w => w.date >= startDate && w.date <= endDate);
}

export function saveWorkout(workout: Workout): Workout {
    if (typeof window === 'undefined') throw new Error('Cannot save workout on server');

    const workouts = getWorkouts();
    
    // Check if updating existing workout
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    if (existingIndex >= 0) {
        workouts[existingIndex] = workout;
    } else {
        workouts.push(workout);
    }
    
    // Sort by date descending
    workouts.sort((a, b) => b.date.localeCompare(a.date));
    
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    
    return workout;
}

export function deleteWorkout(id: string): boolean {
    if (typeof window === 'undefined') return false;

    const workouts = getWorkouts();
    const filtered = workouts.filter(w => w.id !== id);
    
    if (filtered.length < workouts.length) {
        localStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
        return true;
    }
    
    return false;
}

// Meal Plan Storage
const MEAL_PLAN_KEY = 'nutrivision_meal_plan';

export interface MealPlanEntry {
    day: string; // YYYY-MM-DD
    meals: {
        breakfast?: string[];
        lunch?: string[];
        dinner?: string[];
        snack?: string[];
    };
}

export function getMealPlan(): MealPlanEntry[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(MEAL_PLAN_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveMealPlan(plan: MealPlanEntry[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
}

export function addToMealPlan(day: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', foods: string[]): void {
    const plan = getMealPlan();
    const existing = plan.find(p => p.day === day);
    if (existing) {
        existing.meals[mealType] = foods;
    } else {
        plan.push({ day, meals: { [mealType]: foods } });
    }
    saveMealPlan(plan);
}

export function generateGroceryList(plan: MealPlanEntry[]): { item: string; quantity: string; category: string }[] {
    const foodMap = new Map<string, number>();
    
    // Common food to category mapping
    const categoryMap: Record<string, string> = {
        'chicken': 'Protein',
        'beef': 'Protein',
        'salmon': 'Protein',
        'tuna': 'Protein',
        'eggs': 'Protein',
        'yogurt': 'Dairy',
        'cheese': 'Dairy',
        'milk': 'Dairy',
        'rice': 'Grains',
        'pasta': 'Grains',
        'bread': 'Grains',
        'oats': 'Grains',
        'potato': 'Vegetables',
        'sweet potato': 'Vegetables',
        'broccoli': 'Vegetables',
        'spinach': 'Vegetables',
        'tomato': 'Vegetables',
        'pepper': 'Vegetables',
        'banana': 'Fruits',
        'apple': 'Fruits',
        'berries': 'Fruits',
        'olive oil': 'Pantry',
        'butter': 'Pantry',
    };
    
    plan.forEach(entry => {
        Object.values(entry.meals).forEach(foods => {
            if (foods) {
                foods.forEach(food => {
                    const key = food.toLowerCase();
                    foodMap.set(key, (foodMap.get(key) || 0) + 1);
                });
            }
        });
    });
    
    const groceryList: { item: string; quantity: string; category: string }[] = [];
    foodMap.forEach((qty, food) => {
        const category = categoryMap[food] || 'Other';
        groceryList.push({ 
            item: food.charAt(0).toUpperCase() + food.slice(1), 
            quantity: `${qty} ${qty > 1 ? 'servings' : 'serving'}`,
            category 
        });
    });
    
    return groceryList.sort((a, b) => a.category.localeCompare(b.category));
}

// ============ Settings & Theme ============

export type Theme = 'dark' | 'light';

export interface AppSettings {
    theme: Theme;
}

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
};

export function getSettings(): AppSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return DEFAULT_SETTINGS;

    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings: Partial<AppSettings>): void {
    if (typeof window === 'undefined') return;

    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
}

export function getTheme(): Theme {
    return getSettings().theme;
}

export function setTheme(theme: Theme): void {
    saveSettings({ theme });
    document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme(): Theme {
    const current = getTheme();
    const newTheme: Theme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
}

// ============ Recent Foods ============

export interface RecentFoodEntry {
    food: FoodItem;
    loggedAt: string;
    date: string;
}

const MAX_RECENT_FOODS = 20;

export function getRecentFoods(): RecentFoodEntry[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem('nutrivision_recent_foods');
    if (!stored) return [];

    try {
        return JSON.parse(stored) as RecentFoodEntry[];
    } catch {
        return [];
    }
}

export function addRecentFood(food: FoodItem): void {
    if (typeof window === 'undefined') return;

    const recent = getRecentFoods();
    
    const filtered = recent.filter(r => r.food.id !== food.id);
    
    filtered.unshift({
        food,
        loggedAt: new Date().toISOString(),
        date: getTodayDate(),
    });
    
    const trimmed = filtered.slice(0, MAX_RECENT_FOODS);
    
    localStorage.setItem('nutrivision_recent_foods', JSON.stringify(trimmed));
}

// ============ Stats Calculations ============

export interface UserStats {
    streak: number;
    totalMeals: number;
    totalCalories: number;
    averageCalories: number;
    daysLogged: number;
    longestStreak: number;
}

export function getUserStats(): UserStats {
    const logs = getDailyLogs();
    const dates = Object.keys(logs).sort();
    
    if (dates.length === 0) {
        return {
            streak: 0,
            totalMeals: 0,
            totalCalories: 0,
            averageCalories: 0,
            daysLogged: 0,
            longestStreak: 0,
        };
    }
    
    let totalMeals = 0;
    let totalCalories = 0;
    const daysWithLogs: string[] = [];
    
    for (const date of dates) {
        const log = logs[date];
        if (log && log.meals.length > 0) {
            totalMeals += log.meals.length;
            totalCalories += log.totals.calories;
            daysWithLogs.push(date);
        }
    }
    
    const today = getTodayDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let streak = 0;
    let currentDate = today;
    
    if (logs[today]?.meals.length > 0) {
        streak = 1;
        currentDate = yesterdayStr;
    } else if (logs[yesterdayStr]?.meals.length > 0) {
        streak = 1;
        currentDate = yesterdayStr;
    }
    
    while (true) {
        const dateToCheck = new Date(currentDate);
        dateToCheck.setDate(dateToCheck.getDate() - 1);
        const prevDate = dateToCheck.toISOString().split('T')[0];
        
        if (logs[prevDate]?.meals.length > 0) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }
    
    let longestStreak = 0;
    let currentStreak = 0;
    const sortedDates = daysWithLogs.sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            currentStreak = 1;
        } else {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        }
        
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }
    }
    
    return {
        streak,
        totalMeals,
        totalCalories,
        averageCalories: daysWithLogs.length > 0 ? Math.round(totalCalories / daysWithLogs.length) : 0,
        daysLogged: daysWithLogs.length,
        longestStreak,
    };
}
