'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Mail, Lock, Loader2 } from 'lucide-react';
import styles from './auth.module.css';

export default function AuthPage() {
    const router = useRouter();
    const { signIn, signUp, isConfigured } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isConfigured) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1>Setup Required</h1>
                    <p>Supabase is not configured. Please add your Supabase credentials to the environment variables.</p>
                    <div className={styles.envBox}>
                        <code>NEXT_PUBLIC_SUPABASE_URL=your_url</code>
                        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key</code>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    router.push('/');
                }
            } else {
                const { error } = await signUp(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    setSuccess('Check your email to confirm your account!');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className={styles.subtitle}>
                    {isLogin ? 'Sign in to continue' : 'Start your fitness journey'}
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail size={18} className={styles.inputIcon} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className={styles.input}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}

                    <button type="submit" disabled={loading} className={styles.button}>
                        {loading ? <Loader2 className={styles.spinner} /> : isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <p className={styles.toggle}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => setIsLogin(!isLogin)} type="button">
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
}
