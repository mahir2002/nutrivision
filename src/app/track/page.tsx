'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/user';
import { DailyLog, Meal, MealType, LoggedFood, MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/types/meals';
import { FoodItem, COMMON_FOODS, searchFoods } from '@/data/foods';
import { getUserProfile, getDailyLog, getTodayDate, addMealToDay, removeMealFromDay, generateId } from '@/lib/storage';
import { calculateMacros, calculateProgress } from '@/lib/calculations';
import styles from './track.module.css';

export default function TrackPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
    const [showAddMeal, setShowAddMeal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userProfile = getUserProfile();

        if (!userProfile) {
            router.push('/onboarding');
            return;
        }

        setProfile(userProfile);
        setTodayLog(getDailyLog(getTodayDate()));
        setLoading(false);
    }, [router]);

    const refreshLog = () => {
        setTodayLog(getDailyLog(getTodayDate()));
    };

    const handleDeleteMeal = (mealId: string) => {
        const updatedLog = removeMealFromDay(getTodayDate(), mealId);
        setTodayLog(updatedLog);
    };

    if (loading || !profile) {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
                <p>Loading your food log...</p>
            </div>
        );
    }

    const targets = calculateMacros(profile);
    const totals = todayLog?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Food Tracker</h1>
                <p className={styles.date}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </header>

            {/* Daily Summary */}
            <section className={styles.summary}>
                <div className={styles.summaryMain}>
                    <div className={styles.caloriesCircle}>
                        <svg viewBox="0 0 100 100" className={styles.progressRing}>
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="var(--color-bg-tertiary)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke={totals.calories > targets.calories ? 'var(--color-warning)' : 'var(--color-primary)'}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${Math.min(calculateProgress(totals.calories, targets.calories), 100) * 2.83} 283`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className={styles.caloriesText}>
                            <span className={styles.caloriesCurrent}>{totals.calories}</span>
                            <span className={styles.caloriesRemaining}>
                                {targets.calories - totals.calories > 0
                                    ? `${targets.calories - totals.calories} left`
                                    : `${totals.calories - targets.calories} over`
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.macroSummary}>
                    <MacroProgress
                        label="Protein"
                        current={totals.protein}
                        target={targets.protein}
                        color="var(--color-primary)"
                    />
                    <MacroProgress
                        label="Carbs"
                        current={totals.carbs}
                        target={targets.carbs}
                        color="var(--color-secondary)"
                    />
                    <MacroProgress
                        label="Fat"
                        current={totals.fat}
                        target={targets.fat}
                        color="var(--color-accent)"
                    />
                </div>
            </section>

            {/* Add Meal Button */}
            <button
                className={styles.addButton}
                onClick={() => setShowAddMeal(true)}
            >
                <span>+</span> Add Meal
            </button>

            {/* Meals List */}
            <section className={styles.mealsSection}>
                <h2 className={styles.sectionTitle}>Today&apos;s Log</h2>

                {!todayLog || todayLog.meals.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>🍽️</span>
                        <p>No meals logged yet today</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddMeal(true)}
                        >
                            Log your first meal
                        </button>
                    </div>
                ) : (
                    <div className={styles.mealsList}>
                        {todayLog.meals.map((meal) => (
                            <MealCard
                                key={meal.id}
                                meal={meal}
                                onDelete={() => handleDeleteMeal(meal.id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Quick Add Suggestions */}
            <section className={styles.suggestionsSection}>
                <h2 className={styles.sectionTitle}>Quick Add</h2>
                <div className={styles.quickFoods}>
                    {COMMON_FOODS.slice(0, 6).map((food) => (
                        <QuickFoodCard key={food.id} food={food} onAdd={() => {
                            setShowAddMeal(true);
                        }} />
                    ))}
                </div>
            </section>

            {/* Add Meal Modal */}
            {showAddMeal && (
                <AddMealModal
                    onClose={() => setShowAddMeal(false)}
                    onAddMeal={(meal) => {
                        addMealToDay(getTodayDate(), meal);
                        refreshLog();
                        setShowAddMeal(false);
                    }}
                />
            )}
        </div>
    );
}

// Macro Progress Component
function MacroProgress({
    label,
    current,
    target,
    color
}: {
    label: string;
    current: number;
    target: number;
    color: string;
}) {
    const progress = Math.min((current / target) * 100, 100);

    return (
        <div className={styles.macroItem}>
            <div className={styles.macroHeader}>
                <span className={styles.macroLabel}>{label}</span>
                <span className={styles.macroValues}>{current}/{target}g</span>
            </div>
            <div className={styles.macroBar}>
                <div
                    className={styles.macroFill}
                    style={{ width: `${progress}%`, background: color }}
                />
            </div>
        </div>
    );
}

// Meal Card Component
function MealCard({ meal, onDelete }: { meal: Meal; onDelete: () => void }) {
    return (
        <div className={`card ${styles.mealCard}`}>
            <div className={styles.mealHeader}>
                <div className={styles.mealIcon}>
                    {MEAL_TYPE_ICONS[meal.type]}
                </div>
                <div className={styles.mealInfo}>
                    <h3 className={styles.mealType}>{MEAL_TYPE_LABELS[meal.type]}</h3>
                    <span className={styles.mealTime}>
                        {new Date(meal.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
                <div className={styles.mealCalories}>
                    {meal.totalCalories} kcal
                </div>
            </div>

            <div className={styles.mealFoods}>
                {meal.foods.map((food, index) => (
                    <div key={index} className={styles.foodItem}>
                        <span>{food.name}</span>
                        <span className={styles.foodCalories}>{food.totalCalories} kcal</span>
                    </div>
                ))}
            </div>

            <div className={styles.mealMacros}>
                <span>P: {meal.totalProtein}g</span>
                <span>C: {meal.totalCarbs}g</span>
                <span>F: {meal.totalFat}g</span>
            </div>

            <button className={styles.deleteButton} onClick={onDelete}>
                🗑️
            </button>
        </div>
    );
}

// Quick Food Card Component
function QuickFoodCard({ food, onAdd }: { food: FoodItem; onAdd: () => void }) {
    return (
        <button className={styles.quickFood} onClick={onAdd}>
            <span className={styles.quickFoodName}>{food.name}</span>
            <span className={styles.quickFoodCals}>{food.calories} kcal</span>
        </button>
    );
}

// Add Meal Modal Component
function AddMealModal({
    onClose,
    onAddMeal
}: {
    onClose: () => void;
    onAddMeal: (meal: Meal) => void;
}) {
    const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFoods, setSelectedFoods] = useState<LoggedFood[]>([]);
    const [searchResults, setSearchResults] = useState<FoodItem[]>(COMMON_FOODS.slice(0, 10));

    useEffect(() => {
        if (searchQuery.trim()) {
            setSearchResults(searchFoods(searchQuery));
        } else {
            setSearchResults(COMMON_FOODS.slice(0, 10));
        }
    }, [searchQuery]);

    const addFood = (food: FoodItem, quantity: number = 1) => {
        const loggedFood: LoggedFood = {
            ...food,
            quantity,
            totalCalories: Math.round(food.calories * quantity),
            totalProtein: Math.round(food.protein * quantity),
            totalCarbs: Math.round(food.carbs * quantity),
            totalFat: Math.round(food.fat * quantity),
        };
        setSelectedFoods([...selectedFoods, loggedFood]);
    };

    const removeFood = (index: number) => {
        setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (selectedFoods.length === 0) return;

        const meal: Meal = {
            id: generateId(),
            type: selectedMealType,
            timestamp: new Date().toISOString(),
            foods: selectedFoods,
            totalCalories: selectedFoods.reduce((sum, f) => sum + f.totalCalories, 0),
            totalProtein: selectedFoods.reduce((sum, f) => sum + f.totalProtein, 0),
            totalCarbs: selectedFoods.reduce((sum, f) => sum + f.totalCarbs, 0),
            totalFat: selectedFoods.reduce((sum, f) => sum + f.totalFat, 0),
        };

        onAddMeal(meal);
    };

    const mealTotals = {
        calories: selectedFoods.reduce((sum, f) => sum + f.totalCalories, 0),
        protein: selectedFoods.reduce((sum, f) => sum + f.totalProtein, 0),
        carbs: selectedFoods.reduce((sum, f) => sum + f.totalCarbs, 0),
        fat: selectedFoods.reduce((sum, f) => sum + f.totalFat, 0),
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Log Meal</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                {/* Meal Type Selector */}
                <div className={styles.mealTypeSelector}>
                    {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
                        <button
                            key={type}
                            className={`${styles.mealTypeButton} ${selectedMealType === type ? styles.mealTypeButtonActive : ''}`}
                            onClick={() => setSelectedMealType(type)}
                        >
                            <span>{MEAL_TYPE_ICONS[type]}</span>
                            <span>{MEAL_TYPE_LABELS[type]}</span>
                        </button>
                    ))}
                </div>

                {/* Food Search */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search foods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Search Results */}
                <div className={styles.searchResults}>
                    {searchResults.map((food) => (
                        <button
                            key={food.id}
                            className={styles.searchResultItem}
                            onClick={() => addFood(food)}
                        >
                            <div className={styles.resultInfo}>
                                <span className={styles.resultName}>{food.name}</span>
                                <span className={styles.resultServing}>
                                    {food.servingSize} {food.servingUnit}
                                </span>
                            </div>
                            <div className={styles.resultMacros}>
                                <span>{food.calories} kcal</span>
                                <span>P: {food.protein}g</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Selected Foods */}
                {selectedFoods.length > 0 && (
                    <div className={styles.selectedFoods}>
                        <h3>Selected Foods</h3>
                        {selectedFoods.map((food, index) => (
                            <div key={index} className={styles.selectedFoodItem}>
                                <span>{food.name}</span>
                                <span>{food.totalCalories} kcal</span>
                                <button onClick={() => removeFood(index)}>×</button>
                            </div>
                        ))}

                        <div className={styles.mealTotals}>
                            <span>Total: {mealTotals.calories} kcal</span>
                            <span>P: {mealTotals.protein}g</span>
                            <span>C: {mealTotals.carbs}g</span>
                            <span>F: {mealTotals.fat}g</span>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={handleSubmit}
                    disabled={selectedFoods.length === 0}
                >
                    Log Meal ({mealTotals.calories} kcal)
                </button>
            </div>
        </div>
    );
}
