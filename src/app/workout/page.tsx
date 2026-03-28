'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/user';
import { getUserProfile } from '@/lib/storage';
import { generateWorkoutPlan, WorkoutPlan, getSplitName } from '@/lib/workouts';
import styles from './workout.module.css';

export default function WorkoutPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [selectedDay, setSelectedDay] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userProfile = getUserProfile();

        if (!userProfile) {
            router.push('/onboarding');
            return;
        }

        setProfile(userProfile);
        setWorkoutPlan(generateWorkoutPlan(userProfile));
        setLoading(false);
    }, [router]);

    if (loading || !profile || !workoutPlan) {
        return (
            <div className={styles.loading}>
                <div className="spinner" />
                <p>Generating your workout plan...</p>
            </div>
        );
    }

    const currentDay = workoutPlan.days[selectedDay];

    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Your Workout Plan</h1>
                <div className={styles.badge}>
                    <span className="badge badge-primary">{getSplitName(workoutPlan.split)}</span>
                    <span className="badge badge-secondary">{workoutPlan.daysPerWeek} days/week</span>
                </div>
            </header>

            {/* Day Selector */}
            <div className={styles.daySelectorWrapper}>
                <div className={styles.daySelector}>
                    {workoutPlan.days.map((day, index) => (
                        <button
                            key={index}
                            className={`${styles.dayButton} ${selectedDay === index ? styles.dayButtonActive : ''}`}
                            onClick={() => setSelectedDay(index)}
                        >
                            <span className={styles.dayNumber}>Day {index + 1}</span>
                            <span className={styles.dayName}>{day.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Workout Content */}
            <div className={styles.workoutContent}>
                <div className={styles.dayHeader}>
                    <div>
                        <h2 className={styles.dayTitle}>{currentDay.name}</h2>
                        <p className={styles.dayFocus}>{currentDay.focus}</p>
                    </div>
                    <div className={styles.duration}>
                        <span className={styles.durationIcon}>⏱️</span>
                        <span>{currentDay.estimatedDuration} min</span>
                    </div>
                </div>

                {/* Exercises List */}
                <div className={styles.exerciseList}>
                    {currentDay.exercises.map((item, index) => (
                        <div key={index} className={`card ${styles.exerciseCard}`}>
                            <div className={styles.exerciseHeader}>
                                <span className={styles.exerciseNumber}>{index + 1}</span>
                                <div className={styles.exerciseInfo}>
                                    <h3 className={styles.exerciseName}>{item.exercise.name}</h3>
                                    <p className={styles.exerciseMuscle}>
                                        {item.exercise.muscleGroups.slice(0, 3).join(' • ')}
                                    </p>
                                </div>
                                {item.exercise.isCompound && (
                                    <span className={styles.compoundBadge}>Compound</span>
                                )}
                            </div>

                            <div className={styles.exerciseDetails}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Sets</span>
                                    <span className={styles.detailValue}>{item.sets}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Reps</span>
                                    <span className={styles.detailValue}>{item.repsMin}-{item.repsMax}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Rest</span>
                                    <span className={styles.detailValue}>{item.restSeconds}s</span>
                                </div>
                            </div>

                            {item.exercise.tips.length > 0 && (
                                <div className={styles.tips}>
                                    <span className={styles.tipIcon}>💡</span>
                                    <span className={styles.tipText}>{item.exercise.tips[0]}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Warmup & Progression */}
                <div className={styles.infoSection}>
                    <div className={`card ${styles.infoCard}`}>
                        <h3 className={styles.infoTitle}>🔥 Warm-Up Guidance</h3>
                        <ul className={styles.infoList}>
                            {workoutPlan.warmupGuidance.slice(0, 3).map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={`card ${styles.infoCard}`}>
                        <h3 className={styles.infoTitle}>📈 Progression Tips</h3>
                        <ul className={styles.infoList}>
                            {workoutPlan.progressionNotes.slice(0, 3).map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
