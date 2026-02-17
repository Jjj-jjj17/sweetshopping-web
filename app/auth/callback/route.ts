import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('Auth callback error:', error);
                return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
            }

            // Check if user's email is in admin list
            const userEmail = data.session?.user?.email;
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').map(e => e.trim());

            if (userEmail && adminEmails.includes(userEmail)) {
                // Admin user - redirect to dashboard
                return NextResponse.redirect(`${origin}/admin/dashboard`);
            } else {
                // Not an admin - sign them out and redirect to login
                await supabase.auth.signOut();
                return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
            }
        } catch (err) {
            console.error('Unexpected error in auth callback:', err);
            return NextResponse.redirect(`${origin}/admin/login?error=unexpected`);
        }
    }

    // No code present - redirect to login
    return NextResponse.redirect(`${origin}/admin/login?error=no_code`);
}
