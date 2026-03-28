'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange, isSupabaseConfigured, signIn, signUp, signOut } from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<any>;
    isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => ({ error: new Error('Not configured') }),
    signUp: async () => ({ error: new Error('Not configured') }),
    signOut: async () => ({ error: new Error('Not configured') }),
    isConfigured: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const isConfigured = isSupabaseConfigured();

    useEffect(() => {
        // Skip auth if not configured
        if (!isConfigured) {
            setLoading(false);
            return;
        }

        // Check current user on mount
        getCurrentUser().then(({ user }) => {
            setUser(user);
            setLoading(false);
        });

        // Listen for auth changes
        const result = onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Handle case where Supabase is not configured
        if ('data' in result && result.data && 'subscription' in result.data) {
            return () => result.data.subscription.unsubscribe();
        }
    }, [isConfigured]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signOut,
            isConfigured,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
