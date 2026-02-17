import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (!code) {
        return NextResponse.redirect(`${origin}/admin/login?error=no_code`)
    }

    const cookieStore = await cookies()
    const response = NextResponse.redirect(`${origin}/admin/dashboard`)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options as any)
                    )
                },
            },
        }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
        return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
    }

    const email = data.user.email ?? ''
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase())

    if (!adminEmails.includes(email.toLowerCase())) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`)
    }

    return response
}
