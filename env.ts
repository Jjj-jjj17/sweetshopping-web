import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
    NEXTAUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    ADMIN_EMAILS: z.string().transform((str) =>
        str.split(',').map((email) => email.trim().toLowerCase())
    ),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid or Missing Environment Variables:');
    console.error(JSON.stringify(_env.error.flatten().fieldErrors, null, 2));
    throw new Error('Invalid environment variables - Process Aborted.');
}

export const env = _env.data;
