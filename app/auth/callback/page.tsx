'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            console.log('=== AUTH CALLBACK DEBUG ===')
            console.log('Event:', event)
            console.log('Session user:', session?.user?.email)
            console.log('Has session:', !!session)

            if (event === 'SIGNED_IN' && session?.user) {
                const email = session.user.email ?? ''
                const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '')
                    .split(',')
                    .map(e => e.trim().toLowerCase())

                console.log('Email:', email)
                console.log('Admin emails:', adminEmails)
                console.log('Is admin:', adminEmails.includes(email.toLowerCase()))

                if (adminEmails.includes(email.toLowerCase())) {
                    console.log('Redirecting to /admin/dashboard')
                    localStorage.setItem('admin_logged_in', 'true')
                    // Add a small delay to ensure session is persisted across React boundaries
                    await new Promise(resolve => setTimeout(resolve, 500))
                    router.push('/admin/dashboard')
                } else {
                    console.log('Unauthorized - signing out')
                    await supabase.auth.signOut()
                    router.push('/admin/login?error=unauthorized')
                }
            } else if (event === 'SIGNED_OUT') {
                console.log('Signed out - redirecting to login')
                router.push('/admin/login')
            }
        })
    }, [router])

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Authenticating...</p>
        </div>
    )
}
