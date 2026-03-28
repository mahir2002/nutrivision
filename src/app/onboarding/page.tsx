'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    UserProfile,
    FitnessGoal,
    ActivityLevel,
    ExperienceLevel,
    EquipmentAccess,
    DietaryPreference,
    GOAL_LABELS,
    ACTIVITY_LABELS,
    EXPERIENCE_LABELS,
    EQUIPMENT_LABELS,
} from '@/types/user';
import { saveUserProfile, generateId } from '@/lib/storage';
import styles from './onboarding.module.css';

const TOTAL_STEPS = 5;

const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
    { value: 'none', label: 'No Restrictions' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'dairy_free', label: 'Dairy-Free' },
    { value: 'gluten_free', label: 'Gluten-Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'low_carb', label: 'Low Carb' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        sex: '' as 'male' | 'female' | 'other' | '',
        heightCm: '',
        weightKg: '',
        fitnessGoal: '' as FitnessGoal | '',
        gymDaysPerWeek: '',
        activityLevel: '' as ActivityLevel | '',
        experienceLevel: '' as ExperienceLevel | '',
        equipmentAccess: '' as EquipmentAccess | '',
        injuries: '',
        dietaryPreferences: [] as DietaryPreference[],
        allergies: '',
        mealsPerDay: '3',
    });

    const updateField = (field: string, value: string | DietaryPreference[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleDietaryPreference = (pref: DietaryPreference) => {
        setFormData(prev => {
            const current = prev.dietaryPreferences;
            if (pref === 'none') {
                return { ...prev, dietaryPreferences: ['none'] };
            }
            const filtered = current.filter(p => p !== 'none');
            if (filtered.includes(pref)) {
                return { ...prev, dietaryPreferences: filtered.filter(p => p !== pref) };
            }
            return { ...prev, dietaryPreferences: [...filtered, pref] };
        });
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.name && formData.age && formData.heightCm && formData.weightKg;
            case 2:
                return formData.fitnessGoal;
            case 3:
                return formData.activityLevel && formData.experienceLevel && formData.gymDaysPerWeek;
            case 4:
                return formData.equipmentAccess;
            case 5:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const profile: UserProfile = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: formData.name,
            age: parseInt(formData.age),
            sex: formData.sex || undefined,
            heightCm: parseFloat(formData.heightCm),
            weightKg: parseFloat(formData.weightKg),
            fitnessGoal: formData.fitnessGoal as FitnessGoal,
            gymDaysPerWeek: parseInt(formData.gymDaysPerWeek),
            activityLevel: formData.activityLevel as ActivityLevel,
            experienceLevel: formData.experienceLevel as ExperienceLevel,
            equipmentAccess: formData.equipmentAccess as EquipmentAccess,
            injuries: formData.injuries ? formData.injuries.split(',').map(s => s.trim()) : [],
            dietaryPreferences: formData.dietaryPreferences.length > 0 ? formData.dietaryPreferences : ['none'],
            allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
            mealsPerDay: parseInt(formData.mealsPerDay),
        };

        saveUserProfile(profile);

        // Simulate a brief loading state
        await new Promise(resolve => setTimeout(resolve, 500));

        router.push('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                    <span className={styles.progressText}>Step {step} of {TOTAL_STEPS}</span>
                </div>

                {/* Step Content */}
                <div className={styles.stepContent}>
                    {step === 1 && (
                        <div className={styles.step}>
                            <h1 className={styles.stepTitle}>Welcome to NutriVision</h1>
                            <p className={styles.stepSubtitle}>Let&apos;s get to know you better</p>

                            <div className={styles.formGrid}>
                                <div className="form-group">
                                    <label className="form-label">Your Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="25"
                                        min="13"
                                        max="100"
                                        value={formData.age}
                                        onChange={(e) => updateField('age', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sex (Optional)</label>
                                    <select
                                        className="form-select"
                                        value={formData.sex}
                                        onChange={(e) => updateField('sex', e.target.value)}
                                    >
                                        <option value="">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Height (cm)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="175"
                                        min="100"
                                        max="250"
                                        value={formData.heightCm}
                                        onChange={(e) => updateField('heightCm', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Weight (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="70"
                                        min="30"
                                        max="300"
                                        step="0.1"
                                        value={formData.weightKg}
                                        onChange={(e) => updateField('weightKg', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.step}>
                            <h1 className={styles.stepTitle}>What&apos;s Your Goal?</h1>
                            <p className={styles.stepSubtitle}>We&apos;ll tailor your plan accordingly</p>

                            <div className={styles.optionGrid}>
                                {(Object.keys(GOAL_LABELS) as FitnessGoal[]).map((goal) => (
                                    <button
                                        key={goal}
                                        type="button"
                                        className={`${styles.optionCard} ${formData.fitnessGoal === goal ? styles.optionCardActive : ''}`}
                                        onClick={() => updateField('fitnessGoal', goal)}
                                    >
                                        <span className={styles.optionIcon}>
                                            {goal === 'fat_loss' && '🔥'}
                                            {goal === 'muscle_gain' && '💪'}
                                            {goal === 'recomposition' && '⚖️'}
                                            {goal === 'bulk' && '📈'}
                                            {goal === 'general_fitness' && '🏃'}
                                        </span>
                                        <span className={styles.optionLabel}>{GOAL_LABELS[goal]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.step}>
                            <h1 className={styles.stepTitle}>Your Activity Level</h1>
                            <p className={styles.stepSubtitle}>Help us calculate your calorie needs</p>

                            <div className="form-group">
                                <label className="form-label">Daily Activity Level</label>
                                <select
                                    className="form-select"
                                    value={formData.activityLevel}
                                    onChange={(e) => updateField('activityLevel', e.target.value)}
                                >
                                    <option value="">Select activity level</option>
                                    {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                                        <option key={level} value={level}>
                                            {ACTIVITY_LABELS[level]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Training Experience</label>
                                <select
                                    className="form-select"
                                    value={formData.experienceLevel}
                                    onChange={(e) => updateField('experienceLevel', e.target.value)}
                                >
                                    <option value="">Select experience level</option>
                                    {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((level) => (
                                        <option key={level} value={level}>
                                            {EXPERIENCE_LABELS[level]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">How many days can you train per week?</label>
                                <div className={styles.daysGrid}>
                                    {[3, 4, 5, 6].map((days) => (
                                        <button
                                            key={days}
                                            type="button"
                                            className={`${styles.dayButton} ${formData.gymDaysPerWeek === days.toString() ? styles.dayButtonActive : ''}`}
                                            onClick={() => updateField('gymDaysPerWeek', days.toString())}
                                        >
                                            {days} days
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.step}>
                            <h1 className={styles.stepTitle}>Equipment Access</h1>
                            <p className={styles.stepSubtitle}>We&apos;ll select exercises based on what you have</p>

                            <div className={styles.optionGrid}>
                                {(Object.keys(EQUIPMENT_LABELS) as EquipmentAccess[]).map((eq) => (
                                    <button
                                        key={eq}
                                        type="button"
                                        className={`${styles.optionCard} ${formData.equipmentAccess === eq ? styles.optionCardActive : ''}`}
                                        onClick={() => updateField('equipmentAccess', eq)}
                                    >
                                        <span className={styles.optionIcon}>
                                            {eq === 'none' && '🤸'}
                                            {eq === 'home_basic' && '🏠'}
                                            {eq === 'home_full' && '🏋️'}
                                            {eq === 'gym' && '💎'}
                                        </span>
                                        <span className={styles.optionLabel}>{EQUIPMENT_LABELS[eq]}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                                <label className="form-label">Any injuries or limitations? (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., lower back pain, knee injury"
                                    value={formData.injuries}
                                    onChange={(e) => updateField('injuries', e.target.value)}
                                />
                                <span className="form-helper">Separate multiple with commas</span>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className={styles.step}>
                            <h1 className={styles.stepTitle}>Dietary Preferences</h1>
                            <p className={styles.stepSubtitle}>Help us personalize your nutrition plan</p>

                            <div className={styles.dietaryGrid}>
                                {DIETARY_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`${styles.dietaryChip} ${formData.dietaryPreferences.includes(option.value) ? styles.dietaryChipActive : ''}`}
                                        onClick={() => toggleDietaryPreference(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                                <label className="form-label">Allergies or intolerances (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., nuts, shellfish, lactose"
                                    value={formData.allergies}
                                    onChange={(e) => updateField('allergies', e.target.value)}
                                />
                                <span className="form-helper">Separate multiple with commas</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Meals per day</label>
                                <select
                                    className="form-select"
                                    value={formData.mealsPerDay}
                                    onChange={(e) => updateField('mealsPerDay', e.target.value)}
                                >
                                    <option value="2">2 meals</option>
                                    <option value="3">3 meals</option>
                                    <option value="4">4 meals</option>
                                    <option value="5">5 meals</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className={styles.navButtons}>
                    {step > 1 && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                        style={{ marginLeft: 'auto' }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18 }} />
                                Creating...
                            </>
                        ) : step === TOTAL_STEPS ? (
                            'Create My Plan'
                        ) : (
                            'Continue'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
