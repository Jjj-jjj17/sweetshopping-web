import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

        if (session?.user?.email) {
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
                .split(',')
                .map(e => e.trim().toLowerCase())

            if (adminEmails.includes(session.user.email.toLowerCase())) {
                return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin))
            }
        }
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin))
}
