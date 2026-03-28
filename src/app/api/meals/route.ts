// Meals API Route - GET/POST /api/meals

import { NextRequest, NextResponse } from 'next/server';
import {
    getDailyLogs,
    addMealToDay,
    getDailyLog,
    generateId,
    getTodayDate,
} from '@/lib/storage';
import { CreateMealSchema, MealSchema } from '@/lib/schemas';
import {
    successResponse,
    errorResponse,
    validationErrorResponse,
    getValidatedBody,
} from '@/lib/api-utils';
import { Meal, DailyLog } from '@/types/meals';

// GET /api/meals - Retrieve meals for a date range
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const date = searchParams.get('date');

        // If a specific date is provided, return meals for that date
        if (date) {
            const log = getDailyLog(date);
            if (!log) {
                return NextResponse.json(
                    successResponse({ date, meals: [] })
                );
            }
            return NextResponse.json(successResponse(log));
        }

        // If startDate and endDate are provided, return meals for that range
        if (startDate && endDate) {
            const logs = getDailyLogs();
            const result: DailyLog[] = [];

            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                if (logs[dateStr]) {
                    result.push(logs[dateStr]);
                } else {
                    // Include empty logs for dates in range
                    result.push({
                        date: dateStr,
                        meals: [],
                        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                    });
                }
            }

            return NextResponse.json(successResponse(result));
        }

        // Default: return today's meals
        const today = getTodayDate();
        const log = getDailyLog(today);
        return NextResponse.json(
            successResponse(log || { date: today, meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } })
        );
    } catch (error) {
        console.error('Error fetching meals:', error);
        return NextResponse.json(
            errorResponse('Failed to fetch meals', 'INTERNAL_ERROR'),
            { status: 500 }
        );
    }
}

// POST /api/meals - Add a new meal
export async function POST(request: NextRequest) {
    try {
        const validation = await getValidatedBody(request, CreateMealSchema);

        if (!validation.success) {
            return NextResponse.json(validation.error, { status: 400 });
        }

        const mealData = validation.data;

        // Determine the date for the meal
        const date = mealData.date || getTodayDate();
        const timestamp = mealData.timestamp || new Date().toISOString();

        // Calculate totals from foods
        const totalCalories = mealData.foods.reduce((sum, f) => sum + f.totalCalories, 0);
        const totalProtein = mealData.foods.reduce((sum, f) => sum + f.totalProtein, 0);
        const totalCarbs = mealData.foods.reduce((sum, f) => sum + f.totalCarbs, 0);
        const totalFat = mealData.foods.reduce((sum, f) => sum + f.totalFat, 0);

        const meal: Meal = {
            id: mealData.id || generateId(),
            type: mealData.type,
            timestamp,
            foods: mealData.foods,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat,
            notes: mealData.notes,
        };

        // Validate the complete meal
        const fullValidation = MealSchema.safeParse(meal);
        if (!fullValidation.success) {
            const errors: Record<string, string[]> = {};
            fullValidation.error.issues.forEach((err) => {
                const path = err.path.join('.');
                if (!errors[path]) errors[path] = [];
                errors[path].push(err.message);
            });
            return NextResponse.json(validationErrorResponse(errors), { status: 400 });
        }

        // Add meal to the daily log
        const updatedLog = addMealToDay(date, meal);

        return NextResponse.json(
            successResponse({ meal, dailyLog: updatedLog }, 'Meal added successfully'),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding meal:', error);
        return NextResponse.json(
            errorResponse('Failed to add meal', 'INTERNAL_ERROR'),
            { status: 500 }
        );
    }
}
