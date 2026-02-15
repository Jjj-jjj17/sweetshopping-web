import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

// Next.js 16/19 Secure Multi-Auth Supabase Client
export const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type SupabaseClient = typeof supabase;
