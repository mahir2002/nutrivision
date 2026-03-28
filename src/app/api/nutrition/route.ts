// Nutrition API Route - GET /api/nutrition

import { NextRequest, NextResponse } from 'next/server';
import {
    getDailyLogs,
    getDailyLog,
    getRecentLogs,
    getWeeklyAverages,
    getTodayDate,
} from '@/lib/storage';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { DailyLog } from '@/types/meals';

interface NutritionStats {
    period: string;
    startDate: string;
    endDate: string;
    totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    averages: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    daysLogged: number;
    dailyBreakdown: Array<{
        date: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    }>;
}

// GET /api/nutrition - Get daily/weekly nutrition statistics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const period = searchParams.get('period') || 'daily';

        const today = getTodayDate();

        // If custom date range provided
        if (startDate && endDate) {
            const logs = getDailyLogs();
            const dailyBreakdown: NutritionStats['dailyBreakdown'] = [];
            let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            let daysLogged = 0;

            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const log = logs[dateStr];

                if (log) {
                    dailyBreakdown.push({
                        date: dateStr,
                        calories: log.totals.calories,
                        protein: log.totals.protein,
                        carbs: log.totals.carbs,
                        fat: log.totals.fat,
                    });
                    totals.calories += log.totals.calories;
                    totals.protein += log.totals.protein;
                    totals.carbs += log.totals.carbs;
                    totals.fat += log.totals.fat;
                    daysLogged++;
                } else {
                    dailyBreakdown.push({
                        date: dateStr,
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0,
                    });
                }
            }

            const daysInRange = Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

            const stats: NutritionStats = {
                period: 'custom',
                startDate,
                endDate,
                totals,
                averages: {
                    calories: daysLogged > 0 ? Math.round(totals.calories / daysLogged) : 0,
                    protein: daysLogged > 0 ? Math.round(totals.protein / daysLogged) : 0,
                    carbs: daysLogged > 0 ? Math.round(totals.carbs / daysLogged) : 0,
                    fat: daysLogged > 0 ? Math.round(totals.fat / daysLogged) : 0,
                },
                daysLogged,
                dailyBreakdown,
            };

            return NextResponse.json(successResponse(stats));
        }

        // Weekly stats (default)
        if (period === 'weekly' || !startDate) {
            const weekAverages = getWeeklyAverages();
            const recentLogs = getRecentLogs(7);

            const dailyBreakdown = recentLogs.map((log) => ({
                date: log.date,
                calories: log.totals.calories,
                protein: log.totals.protein,
                carbs: log.totals.carbs,
                fat: log.totals.fat,
            }));

            // Calculate week totals
            const totals = recentLogs.reduce(
                (acc, log) => ({
                    calories: acc.calories + log.totals.calories,
                    protein: acc.protein + log.totals.protein,
                    carbs: acc.carbs + log.totals.carbs,
                    fat: acc.fat + log.totals.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            const stats: NutritionStats = {
                period: 'weekly',
                startDate: recentLogs[recentLogs.length - 1]?.date || today,
                endDate: recentLogs[0]?.date || today,
                totals,
                averages: weekAverages,
                daysLogged: weekAverages.daysLogged,
                dailyBreakdown,
            };

            return NextResponse.json(successResponse(stats));
        }

        // Daily stats (specific date)
        const log = getDailyLog(startDate || today);
        const dailyBreakdown = log
            ? [
                  {
                      date: log.date,
                      calories: log.totals.calories,
                      protein: log.totals.protein,
                      carbs: log.totals.carbs,
                      fat: log.totals.fat,
                  },
              ]
            : [];

        const stats: NutritionStats = {
            period: 'daily',
            startDate: startDate || today,
            endDate: startDate || today,
            totals: log?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            averages: log?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            daysLogged: log ? 1 : 0,
            dailyBreakdown,
        };

        return NextResponse.json(successResponse(stats));
    } catch (error) {
        console.error('Error fetching nutrition stats:', error);
        return NextResponse.json(
            errorResponse('Failed to fetch nutrition statistics', 'INTERNAL_ERROR'),
            { status: 500 }
        );
    }
}
