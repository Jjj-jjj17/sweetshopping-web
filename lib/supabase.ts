import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Can't throw in module scope without breaking build if vars are missing during CI/CD
    // but we warn for DX.
    console.warn("Missing Supabase Environment Variables");
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// Helper for TypeScript
export type SupabaseClient = typeof supabase;
