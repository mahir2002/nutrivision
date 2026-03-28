'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserProfile, GOAL_LABELS } from '@/types/user';
import { NutritionTargets } from '@/types/user';
import { DailyLog } from '@/types/meals';
import { getUserProfile, getDailyLog, getTodayDate, getWeeklyAverages, addWaterToDay, getWaterIntake, getWeightHistory, saveWeight, getLatestWeight } from '@/lib/storage';
import { calculateMacros, calculateProgress, getCalculationBreakdown } from '@/lib/calculations';
import { Settings, Utensils, Camera, Dumbbell, TrendingUp, Flame, Target, Zap, Droplets, Scale } from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [weeklyAvg, setWeeklyAvg] = useState<{ calories: number; protein: number; carbs: number; fat: number; daysLogged: number } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Water & Weight state
  const [waterIntake, setWaterIntake] = useState(0);
  const [latestWeight, setLatestWeight] = useState<{ weightKg: number; date: string } | null>(null);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [waterAmount, setWaterAmount] = useState(250);
  const [weightValue, setWeightValue] = useState('');

  // Add water
  const handleAddWater = () => {
    const newTotal = addWaterToDay(getTodayDate(), waterAmount);
    setWaterIntake(newTotal);
    setShowWaterModal(false);
  };

  // Log weight
  const handleLogWeight = () => {
    const weight = parseFloat(weightValue);
    if (weight > 0) {
      saveWeight(weight);
      setLatestWeight({ weightKg: weight, date: getTodayDate() });
      setShowWeightModal(false);
      setWeightValue('');
    }
  };

  useEffect(() => {
    const userProfile = getUserProfile();

    if (!userProfile) {
      router.push('/onboarding');
      return;
    }

    setProfile(userProfile);
    setTargets(calculateMacros(userProfile));
    setTodayLog(getDailyLog(getTodayDate()));
    setWeeklyAvg(getWeeklyAverages());
    
    // Load water and weight
    setWaterIntake(getWaterIntake(getTodayDate()));
    const weight = getLatestWeight();
    if (weight) {
      setLatestWeight({ weightKg: weight.weightKg, date: weight.date });
    }
    
    setLoading(false);
  }, [router]);

  if (loading || !profile || !targets) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const todayTotals = todayLog?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const breakdown = getCalculationBreakdown(profile);

  return (
    <div className="container">
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            Hey, {profile.name.split(' ')[0]}!
          </h1>
          <p className={styles.subGreeting}>
            Let&apos;s crush your {GOAL_LABELS[profile.fitnessGoal].toLowerCase()} goals today
          </p>
        </div>
        <Link href="/onboarding" className={styles.profileButton}>
          <Settings className={styles.profileIcon} />
        </Link>
      </header>

      {/* Daily Progress Card */}
      <section className={styles.progressSection}>
        <div className={`card ${styles.progressCard}`}>
          <div className={styles.progressHeader}>
            <h2>Today&apos;s Progress</h2>
            <span className={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className={styles.caloriesRing}>
            <ProgressRing
              progress={calculateProgress(todayTotals.calories, targets.calories)}
              size={160}
              strokeWidth={12}
            />
            <div className={styles.caloriesCenter}>
              <span className={styles.caloriesCurrent}>{todayTotals.calories}</span>
              <span className={styles.caloriesTarget}>/ {targets.calories}</span>
              <span className={styles.caloriesLabel}>kcal</span>
            </div>
          </div>

          <div className={styles.macrosGrid}>
            <MacroBar
              label="Protein"
              current={todayTotals.protein}
              target={targets.protein}
              unit="g"
              color="var(--color-primary)"
            />
            <MacroBar
              label="Carbs"
              current={todayTotals.carbs}
              target={targets.carbs}
              unit="g"
              color="var(--color-secondary)"
            />
            <MacroBar
              label="Fat"
              current={todayTotals.fat}
              target={targets.fat}
              unit="g"
              color="var(--color-accent)"
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.actionsSection}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionsGrid}>
          <Link href="/track" className={styles.actionCard}>
            <Utensils className={styles.actionIcon} />
            <span className={styles.actionLabel}>Log Meal</span>
          </Link>
          <Link href="/scan" className={styles.actionCard}>
            <Camera className={styles.actionIcon} />
            <span className={styles.actionLabel}>Scan Food</span>
          </Link>
          <Link href="/workout" className={styles.actionCard}>
            <Dumbbell className={styles.actionIcon} />
            <span className={styles.actionLabel}>Workout</span>
          </Link>
          <Link href="/nutrition" className={styles.actionCard}>
            <TrendingUp className={styles.actionIcon} />
            <span className={styles.actionLabel}>Meal Plan</span>
          </Link>
        </div>
      </section>

      {/* Stats Cards */}
      <section className={styles.statsSection}>
        <h3 className={styles.sectionTitle}>Your Targets</h3>
        <div className={styles.statsGrid}>
          <div className={`card ${styles.statCard}`}>
            <Flame className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statValue}>{targets.calories}</span>
              <span className={styles.statLabel}>Daily Calories</span>
            </div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <Dumbbell className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statValue}>{targets.protein}g</span>
              <span className={styles.statLabel}>Protein Target</span>
            </div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <Zap className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statValue}>{breakdown.tdee}</span>
              <span className={styles.statLabel}>Maintenance TDEE</span>
            </div>
          </div>
          <div className={`card ${styles.statCard}`}>
            <Target className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statValue}>{breakdown.adjustment > 0 ? '+' : ''}{breakdown.adjustment}</span>
              <span className={styles.statLabel}>Calorie Adjustment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Summary */}
      {weeklyAvg && weeklyAvg.daysLogged > 0 && (
        <section className={styles.weeklySection}>
          <h3 className={styles.sectionTitle}>Weekly Averages</h3>
          <div className={`card ${styles.weeklyCard}`}>
            <div className={styles.weeklyStats}>
              <div className={styles.weeklyStat}>
                <span className={styles.weeklyValue}>{weeklyAvg.calories}</span>
                <span className={styles.weeklyLabel}>Avg Calories</span>
              </div>
              <div className={styles.weeklyStat}>
                <span className={styles.weeklyValue}>{weeklyAvg.protein}g</span>
                <span className={styles.weeklyLabel}>Avg Protein</span>
              </div>
              <div className={styles.weeklyStat}>
                <span className={styles.weeklyValue}>{weeklyAvg.daysLogged}</span>
                <span className={styles.weeklyLabel}>Days Logged</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        💡 NutriVision provides estimates based on your inputs. Consult a healthcare professional before starting any diet or exercise program.
      </p>
    </div>
  );
}

// Progress Ring Component
function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className={styles.ring}>
      <circle
        className={styles.ringBg}
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={styles.ringFill}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          stroke: progress > 100 ? 'var(--color-warning)' : 'var(--color-primary)'
        }}
      />
    </svg>
  );
}

// Macro Progress Bar Component
function MacroBar({
  label,
  current,
  target,
  unit,
  color
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div className={styles.macroItem}>
      <div className={styles.macroHeader}>
        <span className={styles.macroLabel}>{label}</span>
        <span className={styles.macroValue}>
          {current} / {target}{unit}
        </span>
      </div>
      <div className={styles.macroBarBg}>
        <div
          className={styles.macroBarFill}
          style={{
            width: `${progress}%`,
            background: color
          }}
        />
      </div>
    </div>
  );
}
