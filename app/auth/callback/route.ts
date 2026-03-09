import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

        if (session?.user?.email) {
            const { data: adminUser } = await supabase
                .from('admin_users')
                .select('email')
                .eq('email', session.user.email)
                .single()

            if (adminUser) {
                return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin))
            }
        }
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin))
}
