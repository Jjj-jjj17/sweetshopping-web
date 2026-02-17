'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const email = session.user.email ?? ''
                const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '')
                    .split(',')
                    .map(e => e.trim().toLowerCase())

                if (adminEmails.includes(email.toLowerCase())) {
                    router.push('/admin/dashboard')
                } else {
                    await supabase.auth.signOut()
                    router.push('/admin/login?error=unauthorized')
                }
            } else if (event === 'SIGNED_OUT') {
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
