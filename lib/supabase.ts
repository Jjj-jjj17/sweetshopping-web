import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/env';

// Next.js 16/19 Secure Multi-Auth Supabase Client (Client-side)
export const supabase = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Export createClient function for server-side usage
export function createClient() {
    return createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export type SupabaseClient = typeof supabase;
