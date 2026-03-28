'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, GOAL_LABELS } from '@/types/user';
import { getUserProfile, generateGroceryList, getMealPlan, MealPlanEntry } from '@/lib/storage';
import { calculateMacros, getCalculationBreakdown, calculateMacroPercentages } from '@/lib/calculations';
import { ShoppingCart, Copy, Plus, X } from 'lucide-react';
import styles from './nutrition.module.css';

interface MealSuggestion {
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foods: string[];
}

export default function NutritionPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGroceryList, setShowGroceryList] = useState(false);
    const [groceryList, setGroceryList] = useState<{ item: string; quantity: string; category: string }[]>([]);
    const [mealPlan, setMealPlan] = useState<MealPlanEntry[]>([]);

    useEffect(() => {
        const userProfile = getUserProfile();

        if (!userProfile) {
            router.push('/onboarding');
            return;
        }

        setProfile(userProfile);
        setMealPlan(getMealPlan());
        
        // Generate initial grocery list from meal plan
        const plan = getMealPlan();
        if (plan.length > 0) {
            setGroceryList(generateGroceryList(plan));
        }
        
        setLoading(false);
    }, [router]);

    if (loading || !profile) {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
                <p>Creating your nutrition plan...</p>
            </div>
        );
    }

    const targets = calculateMacros(profile);
    const breakdown = getCalculationBreakdown(profile);
    const percentages = calculateMacroPercentages(targets);

    // Generate meal suggestions based on profile
    const meals = generateMealSuggestions(profile, targets);

    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Nutrition Plan</h1>
                <p className={styles.subtitle}>
                    Personalized for your {GOAL_LABELS[profile.fitnessGoal].toLowerCase()} goal
                </p>
            </header>

            {/* Calorie Breakdown */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Your Daily Targets</h2>

                <div className={`card ${styles.targetCard}`}>
                    <div className={styles.calorieDisplay}>
                        <span className={styles.calorieNumber}>{targets.calories}</span>
                        <span className={styles.calorieLabel}>calories / day</span>
                    </div>

                    <div className={styles.calculation}>
                        <div className={styles.calcRow}>
                            <span>Basal Metabolic Rate (BMR)</span>
                            <span>{breakdown.bmr} kcal</span>
                        </div>
                        <div className={styles.calcRow}>
                            <span>Activity Multiplier</span>
                            <span>× {(breakdown.tdee / breakdown.bmr).toFixed(2)}</span>
                        </div>
                        <div className={styles.calcRow}>
                            <span>Maintenance (TDEE)</span>
                            <span>{breakdown.tdee} kcal</span>
                        </div>
                        <div className={`${styles.calcRow} ${styles.calcRowHighlight}`}>
                            <span>Goal Adjustment ({profile.fitnessGoal.replace('_', ' ')})</span>
                            <span className={breakdown.adjustment < 0 ? styles.deficit : styles.surplus}>
                                {breakdown.adjustment > 0 ? '+' : ''}{breakdown.adjustment} kcal
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Macro Split */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Macro Breakdown</h2>

                <div className={styles.macroCards}>
                    <div className={`card ${styles.macroCard}`} style={{ '--macro-color': 'var(--color-primary)' } as React.CSSProperties}>
                        <div className={styles.macroIcon}>🥩</div>
                        <div className={styles.macroInfo}>
                            <span className={styles.macroValue}>{targets.protein}g</span>
                            <span className={styles.macroName}>Protein</span>
                            <span className={styles.macroPercent}>{percentages.protein}% of calories</span>
                        </div>
                        <div className={styles.macroDetail}>
                            {(targets.protein / profile.weightKg).toFixed(1)}g/kg
                        </div>
                    </div>

                    <div className={`card ${styles.macroCard}`} style={{ '--macro-color': 'var(--color-secondary)' } as React.CSSProperties}>
                        <div className={styles.macroIcon}>🍚</div>
                        <div className={styles.macroInfo}>
                            <span className={styles.macroValue}>{targets.carbs}g</span>
                            <span className={styles.macroName}>Carbs</span>
                            <span className={styles.macroPercent}>{percentages.carbs}% of calories</span>
                        </div>
                        <div className={styles.macroDetail}>
                            {(targets.carbs / profile.weightKg).toFixed(1)}g/kg
                        </div>
                    </div>

                    <div className={`card ${styles.macroCard}`} style={{ '--macro-color': 'var(--color-accent)' } as React.CSSProperties}>
                        <div className={styles.macroIcon}>🥑</div>
                        <div className={styles.macroInfo}>
                            <span className={styles.macroValue}>{targets.fat}g</span>
                            <span className={styles.macroName}>Fat</span>
                            <span className={styles.macroPercent}>{percentages.fat}% of calories</span>
                        </div>
                        <div className={styles.macroDetail}>
                            {(targets.fat / profile.weightKg).toFixed(1)}g/kg
                        </div>
                    </div>
                </div>

                {/* Visual Bar */}
                <div className={styles.macroBar}>
                    <div
                        className={styles.macroBarSegment}
                        style={{
                            width: `${percentages.protein}%`,
                            background: 'var(--color-primary)'
                        }}
                    />
                    <div
                        className={styles.macroBarSegment}
                        style={{
                            width: `${percentages.carbs}%`,
                            background: 'var(--color-secondary)'
                        }}
                    />
                    <div
                        className={styles.macroBarSegment}
                        style={{
                            width: `${percentages.fat}%`,
                            background: 'var(--color-accent)'
                        }}
                    />
                </div>
            </section>

            {/* Meal Suggestions */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Daily Meal Plan</h2>
                <p className={styles.sectionSubtitle}>
                    Based on {profile.mealsPerDay} meals per day
                </p>

                <div className={styles.mealList}>
                    {meals.map((meal, index) => (
                        <div key={index} className={`card ${styles.mealCard}`}>
                            <div className={styles.mealHeader}>
                                <div className={styles.mealTime}>
                                    <span className={styles.mealTimeIcon}>
                                        {index === 0 ? '🌅' : index === meals.length - 1 ? '🌙' : '☀️'}
                                    </span>
                                    <span>{meal.time}</span>
                                </div>
                                <span className={styles.mealCalories}>{meal.calories} kcal</span>
                            </div>

                            <h3 className={styles.mealName}>{meal.name}</h3>

                            <div className={styles.mealFoods}>
                                {meal.foods.map((food, i) => (
                                    <span key={i} className={styles.foodTag}>{food}</span>
                                ))}
                            </div>

                            <div className={styles.mealMacros}>
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>F: {meal.fat}g</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tips */}
            <section className={styles.section}>
                <div className={`card ${styles.tipsCard}`}>
                    <h3 className={styles.tipsTitle}>Nutrition Tips for {GOAL_LABELS[profile.fitnessGoal]}</h3>
                    <ul className={styles.tipsList}>
                        {getNutritionTips(profile.fitnessGoal).map((tip, index) => (
                            <li key={index}>{tip}</li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Grocery List Button */}
            <section className={styles.section}>
                <button 
                    className={`btn btn-primary ${styles.groceryButton}`}
                    onClick={() => {
                        const plan = getMealPlan();
                        const list = generateGroceryList(plan.length > 0 ? plan : [{ day: new Date().toISOString().split('T')[0], meals: { breakfast: ['chicken', 'rice', 'broccoli'], lunch: ['salad', 'tuna'], dinner: ['fish', 'potato', 'vegetables'] } }]);
                        setGroceryList(list);
                        setShowGroceryList(true);
                    }}
                >
                    <ShoppingCart size={20} />
                    Generate Grocery List
                </button>
            </section>

            {/* Grocery List Modal */}
            {showGroceryList && (
                <div className={styles.modalOverlay} onClick={() => setShowGroceryList(false)}>
                    <div className={`card ${styles.modal}`} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Grocery List</h2>
                            <button onClick={() => setShowGroceryList(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        {groceryList.length === 0 ? (
                            <p className={styles.emptyText}>No items in your meal plan. Add meals to generate a list.</p>
                        ) : (
                            <>
                                <div className={styles.groceryCategories}>
                                    {Array.from(new Set(groceryList.map(g => g.category))).map(category => (
                                        <div key={category} className={styles.groceryCategory}>
                                            <h3>{category}</h3>
                                            <ul>
                                                {groceryList.filter(g => g.category === category).map((item, i) => (
                                                    <li key={i}>
                                                        <span>{item.item}</span>
                                                        <span className={styles.quantity}>{item.quantity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    className={`btn btn-secondary ${styles.copyButton}`}
                                    onClick={() => {
                                        const text = groceryList.map(g => `- ${g.item} (${g.quantity})`).join('\n');
                                        navigator.clipboard.writeText(text);
                                        alert('Copied to clipboard!');
                                    }}
                                >
                                    <Copy size={18} />
                                    Copy to Clipboard
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Dietary Note */}
            {profile.dietaryPreferences.length > 0 && profile.dietaryPreferences[0] !== 'none' && (
                <div className={styles.dietaryNote}>
                    <span>🍽️</span>
                    <span>
                        Meal suggestions consider your dietary preferences: {' '}
                        {profile.dietaryPreferences.map(p => p.replace('_', ' ')).join(', ')}
                    </span>
                </div>
            )}
        </div>
    );
}

function generateMealSuggestions(profile: UserProfile, targets: { calories: number; protein: number; carbs: number; fat: number }): MealSuggestion[] {
    const mealsPerDay = profile.mealsPerDay;
    const caloriesPerMeal = Math.round(targets.calories / mealsPerDay);
    const proteinPerMeal = Math.round(targets.protein / mealsPerDay);
    const carbsPerMeal = Math.round(targets.carbs / mealsPerDay);
    const fatPerMeal = Math.round(targets.fat / mealsPerDay);

    const isVegetarian = profile.dietaryPreferences.includes('vegetarian') || profile.dietaryPreferences.includes('vegan');
    const isVegan = profile.dietaryPreferences.includes('vegan');

    const mealTemplates: MealSuggestion[] = [];

    // Breakfast
    mealTemplates.push({
        name: 'Power Breakfast',
        time: '7:00 - 8:00 AM',
        calories: Math.round(caloriesPerMeal * 1.1),
        protein: Math.round(proteinPerMeal * 1.1),
        carbs: Math.round(carbsPerMeal * 1.2),
        fat: Math.round(fatPerMeal * 0.9),
        foods: isVegan
            ? ['Oatmeal', 'Banana', 'Almond butter', 'Chia seeds']
            : isVegetarian
                ? ['Greek Yogurt', 'Oats', 'Berries', 'Honey']
                : ['Eggs', 'Whole grain toast', 'Avocado', 'Turkey bacon'],
    });

    // Lunch
    mealTemplates.push({
        name: 'Balanced Lunch',
        time: '12:00 - 1:00 PM',
        calories: Math.round(caloriesPerMeal * 1.0),
        protein: Math.round(proteinPerMeal * 1.1),
        carbs: carbsPerMeal,
        fat: fatPerMeal,
        foods: isVegan
            ? ['Quinoa bowl', 'Tofu', 'Mixed vegetables', 'Tahini dressing']
            : isVegetarian
                ? ['Brown rice', 'Paneer tikka', 'Mixed salad', 'Hummus']
                : ['Grilled chicken', 'Brown rice', 'Steamed vegetables', 'Olive oil'],
    });

    if (mealsPerDay >= 3) {
        // Dinner
        mealTemplates.push({
            name: 'Recovery Dinner',
            time: '6:00 - 7:00 PM',
            calories: Math.round(caloriesPerMeal * 0.9),
            protein: proteinPerMeal,
            carbs: Math.round(carbsPerMeal * 0.8),
            fat: Math.round(fatPerMeal * 1.1),
            foods: isVegan
                ? ['Lentil soup', 'Sweet potato', 'Leafy greens', 'Walnuts']
                : isVegetarian
                    ? ['Cottage cheese', 'Whole wheat pasta', 'Tomato sauce', 'Spinach']
                    : ['Salmon', 'Roasted potatoes', 'Asparagus', 'Lemon butter'],
        });
    }

    if (mealsPerDay >= 4) {
        // Snack
        mealTemplates.splice(2, 0, {
            name: 'Afternoon Snack',
            time: '3:00 - 4:00 PM',
            calories: Math.round(caloriesPerMeal * 0.5),
            protein: Math.round(proteinPerMeal * 0.5),
            carbs: Math.round(carbsPerMeal * 0.4),
            fat: Math.round(fatPerMeal * 0.6),
            foods: isVegan
                ? ['Mixed nuts', 'Apple', 'Protein bar']
                : ['Greek yogurt', 'Almonds', 'Apple'],
        });
    }

    if (mealsPerDay >= 5) {
        // Post-workout or evening snack
        mealTemplates.push({
            name: 'Evening Snack',
            time: '8:00 - 9:00 PM',
            calories: Math.round(caloriesPerMeal * 0.4),
            protein: Math.round(proteinPerMeal * 0.6),
            carbs: Math.round(carbsPerMeal * 0.3),
            fat: Math.round(fatPerMeal * 0.4),
            foods: isVegan
                ? ['Casein-free protein shake', 'Berries']
                : ['Casein protein shake', 'Cottage cheese', 'Berries'],
        });
    }

    return mealTemplates;
}

function getNutritionTips(goal: string): string[] {
    switch (goal) {
        case 'fat_loss':
            return [
                'Prioritize protein at every meal to preserve muscle mass',
                'Eat vegetables first to increase satiety',
                'Stay hydrated - drink at least 2-3L of water daily',
                'Avoid liquid calories and sugary beverages',
                'Plan meals ahead to avoid impulsive eating',
            ];
        case 'muscle_gain':
            return [
                'Distribute protein evenly across all meals (30-40g each)',
                'Eat carbs around your workout for energy and recovery',
                'Don\'t skip post-workout nutrition - eat within 2 hours',
                "Include healthy fats for hormone production",
                'If struggling to eat enough, add calorie-dense foods like nuts and oils',
            ];
        case 'recomposition':
            return [
                'High protein is essential - aim for the upper range (2g/kg)',
                'Time carbs around workouts for performance',
                'Eat at maintenance on training days, slight deficit on rest days',
                'Focus on food quality and micronutrient density',
                'Be patient - recomposition is a slower process',
            ];
        case 'bulk':
            return [
                'Eat in a consistent surplus - don\'t skip meals',
                'Include easy-to-digest carbs for extra calories',
                'Have a substantial pre-bed meal with casein protein',
                'Track your weight weekly and adjust intake as needed',
                'Prioritize whole foods, limit junk food bulking',
            ];
        default:
            return [
                'Aim for balanced meals with protein, carbs, and fats',
                'Eat plenty of fruits and vegetables for micronutrients',
                'Stay hydrated throughout the day',
                'Practice mindful eating and listen to hunger cues',
                'Allow flexibility - consistency beats perfection',
            ];
    }
}
