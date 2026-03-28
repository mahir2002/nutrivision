'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingDown, TrendingUp, Scale, Target, Plus, Calendar, Activity } from 'lucide-react';
import { UserProfile, GOAL_LABELS } from '@/types/user';
import { getUserProfile, getWeightHistory, saveWeight, getLatestWeight, WeightEntry } from '@/lib/storage';
import styles from './weight.module.css';

type TimeRange = '30d' | '90d' | 'all';

export default function WeightPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showLogForm, setShowLogForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userProfile = getUserProfile();
    if (!userProfile) {
      router.push('/onboarding');
      return;
    }

    setProfile(userProfile);
    setWeightHistory(getWeightHistory());
    setLoading(false);
  }, [router]);

  const handleSaveWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;
    
    setSaving(true);
    try {
      saveWeight(parseFloat(newWeight), logDate);
      setWeightHistory(getWeightHistory());
      setShowLogForm(false);
      setNewWeight('');
    } finally {
      setSaving(false);
    }
  };

  const calculateBMI = (weightKg: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'var(--color-info)' };
    if (bmi < 25) return { label: 'Normal', color: 'var(--color-success)' };
    if (bmi < 30) return { label: 'Overweight', color: 'var(--color-warning)' };
    return { label: 'Obese', color: 'var(--color-error)' };
  };

  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        startDate = new Date(0);
    }

    return weightHistory
      .filter((entry) => new Date(entry.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        ...entry,
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  };

  const getWeightChange = () => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[0];
    const oldest = weightHistory[weightHistory.length - 1];
    return latest.weightKg - oldest.weightKg;
  };

  const getGoalWeight = (): number | null => {
    // For now, assume goal weight is based on BMI 22 (middle of normal range)
    if (!profile) return null;
    const heightM = profile.heightCm / 100;
    return Math.round(22 * heightM * heightM * 10) / 10;
  };

  if (loading || !profile) {
    return (
      <div className={styles.loading}>
        <div className="spinner" />
        <p>Loading weight data...</p>
      </div>
    );
  }

  const latestWeight = weightHistory.length > 0 ? weightHistory[0].weightKg : profile.weightKg;
  const currentBMI = calculateBMI(latestWeight, profile.heightCm);
  const bmiCategory = getBMICategory(currentBMI);
  const weightChange = getWeightChange();
  const goalWeight = getGoalWeight();
  const chartData = getFilteredData();
  const goalProgress = goalWeight ? ((latestWeight - goalWeight) / (profile.weightKg - goalWeight)) * 100 : null;

  return (
    <div className="container">
      <header className={styles.header}>
        <h1 className={styles.title}>Weight Tracking</h1>
        <p className={styles.subtitle}>Monitor your progress towards your goals</p>
      </header>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon}>
            <Scale size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{latestWeight.toFixed(1)}</span>
            <span className={styles.statLabel}>Current Weight (kg)</span>
          </div>
        </div>

        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ background: bmiCategory.color + '20', color: bmiCategory.color }}>
            <Activity size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{currentBMI.toFixed(1)}</span>
            <span className={styles.statLabel}>BMI ({bmiCategory.label})</span>
          </div>
        </div>

        {weightChange !== null && (
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ 
              background: weightChange <= 0 ? 'var(--color-success)20' : 'var(--color-warning)20',
              color: weightChange <= 0 ? 'var(--color-success)' : 'var(--color-warning)'
            }}>
              {weightChange <= 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue} style={{ color: weightChange <= 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </span>
              <span className={styles.statLabel}>Total Change</span>
            </div>
          </div>
        )}

        {goalWeight && (
          <div className={`card ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ background: 'var(--color-primary)20', color: 'var(--color-primary)' }}>
              <Target size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{goalWeight} kg</span>
              <span className={styles.statLabel}>Goal Weight (BMI 22)</span>
            </div>
          </div>
        )}
      </div>

      {/* Goal Progress */}
      {goalWeight && (
        <div className={`card ${styles.goalCard}`}>
          <div className={styles.goalHeader}>
            <Target size={20} />
            <h3>Goal Progress</h3>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${Math.min(Math.max(goalProgress || 100, 0), 100)}%`,
                  background: goalProgress !== null && goalProgress >= 100 
                    ? 'var(--color-success)' 
                    : 'var(--color-primary)'
                }}
              />
            </div>
            <div className={styles.progressLabels}>
              <span>Start: {profile.weightKg} kg</span>
              <span>{goalProgress !== null && goalProgress >= 100 ? '✓ Goal Reached!' : `${Math.round(goalProgress || 0)}%`}</span>
              <span>Goal: {goalWeight} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className={`card ${styles.chartCard}`}>
        <div className={styles.chartHeader}>
          <h3>Weight Trend</h3>
          <div className={styles.timeRangeButtons}>
            {(['30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                className={`${styles.rangeButton} ${timeRange === range ? styles.active : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fill: 'var(--color-text-tertiary)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                  formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Weight']}
                />
                {goalWeight && (
                  <ReferenceLine 
                    y={goalWeight} 
                    stroke="var(--color-secondary)" 
                    strokeDasharray="5 5"
                    label={{ 
                      value: 'Goal', 
                      position: 'right',
                      fill: 'var(--color-secondary)',
                      fontSize: 11
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="weightKg"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fill="url(#weightGradient)"
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-bg-primary)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyChart}>
            <Scale size={48} strokeWidth={1} />
            <p>No weight data yet</p>
            <span>Start logging your weight to see your progress chart</span>
          </div>
        )}
      </div>

      {/* Log Weight Button / Form */}
      {showLogForm ? (
        <div className={`card ${styles.logForm}`}>
          <h3><Plus size={20} /> Log New Weight</h3>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label><Calendar size={16} /> Date</label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className={styles.formGroup}>
              <label><Scale size={16} /> Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="Enter weight"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className={styles.formButtons}>
            <button className="btn btn-secondary" onClick={() => setShowLogForm(false)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveWeight}
              disabled={!newWeight || saving}
            >
              {saving ? 'Saving...' : 'Save Weight'}
            </button>
          </div>
        </div>
      ) : (
        <button className={`btn btn-primary btn-lg ${styles.logButton}`} onClick={() => setShowLogForm(true)}>
          <Plus size={20} />
          Log New Weight
        </button>
      )}

      {/* Recent Entries */}
      {weightHistory.length > 0 && (
        <div className={styles.recentSection}>
          <h3>Recent Entries</h3>
          <div className={styles.recentList}>
            {weightHistory.slice(0, 10).map((entry) => (
              <div key={entry.id} className={`card ${styles.recentItem}`}>
                <div className={styles.recentDate}>
                  <Calendar size={16} />
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className={styles.recentWeight}>{entry.weightKg.toFixed(1)} kg</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
