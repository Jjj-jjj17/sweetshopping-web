import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (!code) {
        return NextResponse.redirect(`${origin}/admin/login?error=no_code`);
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
    }

    const email = data.user.email ?? '';
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase());

    if (!adminEmails.includes(email.toLowerCase())) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
    }

    return NextResponse.redirect(`${origin}/admin/dashboard`);
}
