// Auth service - handles user authentication
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if real Supabase is configured (not placeholder)
const isRealSupabase = supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('placeholder');

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
    if (!isRealSupabase) return null;
    
    if (!supabase) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabase;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
}

export async function signUp(email: string, password: string) {
    const client = getSupabase();
    if (!client) {
        return { data: null, error: new Error('Auth not configured') };
    }
    const { data, error } = await client.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

export async function signIn(email: string, password: string) {
    const client = getSupabase();
    if (!client) {
        return { data: null, error: new Error('Auth not configured') };
    }
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const client = getSupabase();
    if (!client) {
        return { error: null };
    }
    const { error } = await client.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const client = getSupabase();
    if (!client) {
        return { user: null, error: null };
    }
    const { data: { user }, error } = await client.auth.getUser();
    return { user, error };
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
    const client = getSupabase();
    if (!client) {
        // Return dummy subscription
        return { unsubscribe: () => {} };
    }
    return client.auth.onAuthStateChange(callback);
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return isRealSupabase;
}
