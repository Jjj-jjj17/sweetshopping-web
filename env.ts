import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_ADMIN_EMAIL: z.string().min(1), // Comma separated list of admin emails
    // Optional for server-side
    RESEND_API_KEY: z.string().optional(),
});

// Validate process.env
const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
});

if (!parsed.success) {
    console.error('❌ [FATAL] Invalid or Missing Environment Variables:');
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    throw new Error('Invalid environment variables - Process Aborted.');
}

export const env = parsed.data;
