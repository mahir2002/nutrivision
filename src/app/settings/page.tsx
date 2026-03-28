'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/storage';
import { UserProfile } from '@/types/user';
import { Moon, Sun, Bell, Volume2, Download, Trash2, ChevronRight } from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [soundEffects, setSoundEffects] = useState(false);

    useEffect(() => {
        const userProfile = getUserProfile();
        if (!userProfile) {
            router.push('/onboarding');
            return;
        }
        setProfile(userProfile);
        
        // Load settings from localStorage
        const savedTheme = localStorage.getItem('nutrivision_theme');
        if (savedTheme === 'light') {
            setDarkMode(false);
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, [router]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
        localStorage.setItem('nutrivision_theme', newMode ? 'dark' : 'light');
    };

    const exportData = () => {
        const data = {
            profile: localStorage.getItem('nutrivision_user_profile'),
            meals: localStorage.getItem('nutrivision_daily_logs'),
            weight: localStorage.getItem('nutrivision_weight_history'),
            workouts: localStorage.getItem('nutrivision_workouts'),
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutrivision_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearData = () => {
        if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
            localStorage.clear();
            router.push('/onboarding');
        }
    };

    if (!profile) return null;

    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                
                <div className={`card ${styles.settingCard}`}>
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                            <span>Dark Mode</span>
                        </div>
                        <button 
                            className={`${styles.toggle} ${darkMode ? styles.active : ''}`}
                            onClick={toggleTheme}
                        >
                            <span className={styles.toggleThumb} />
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Notifications</h2>
                
                <div className={`card ${styles.settingCard}`}>
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <Bell size={20} />
                            <span>Push Notifications</span>
                        </div>
                        <button 
                            className={`${styles.toggle} ${notifications ? styles.active : ''}`}
                            onClick={() => setNotifications(!notifications)}
                        >
                            <span className={styles.toggleThumb} />
                        </button>
                    </div>
                    
                    <div className={styles.settingRow}>
                        <div className={styles.settingInfo}>
                            <Volume2 size={20} />
                            <span>Sound Effects</span>
                        </div>
                        <button 
                            className={`${styles.toggle} ${soundEffects ? styles.active : ''}`}
                            onClick={() => setSoundEffects(!soundEffects)}
                        >
                            <span className={styles.toggleThumb} />
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Data</h2>
                
                <div className={`card ${styles.settingCard}`}>
                    <button className={styles.settingButton} onClick={exportData}>
                        <Download size={20} />
                        <span>Export Data</span>
                        <ChevronRight size={20} className={styles.chevron} />
                    </button>
                    
                    <button className={styles.settingButton} onClick={clearData}>
                        <Trash2 size={20} />
                        <span>Delete All Data</span>
                        <ChevronRight size={20} className={styles.chevron} />
                    </button>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Account</h2>
                
                <div className={`card ${styles.profileCard}`}>
                    <div className={styles.profileAvatar}>
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.profileInfo}>
                        <h3>{profile.name}</h3>
                        <p>{profile.fitnessGoal.replace('_', ' ')}</p>
                    </div>
                </div>
            </section>

            <p className={styles.version}>NutriVision v1.0.0</p>
        </div>
    );
}
