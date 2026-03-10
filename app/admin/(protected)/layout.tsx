"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Home, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkAdmin = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    // No session yet — wait for onAuthStateChange to fire (OAuth flow)
                    return;
                }

                const userEmail = session.user.email?.toLowerCase() || '';
                const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
                    .split(',')
                    .map((e: string) => e.trim().toLowerCase());

                if (adminEmails.includes(userEmail)) {
                    if (mounted) {
                        setIsAuthenticated(true);
                        setLoading(false);
                    }
                } else {
                    if (mounted) {
                        setLoading(false);
                        router.push('/admin/login');
                    }
                }
            } catch (error) {
                console.error('Admin check error:', error);
                if (mounted) {
                    setLoading(false);
                    router.push('/admin/login');
                }
            }
        };

        // Listen for auth state changes (handles OAuth redirect completion)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: string, session: any) => {
                if (!mounted) return;

                if (event === 'SIGNED_IN' && session?.user?.email) {
                    const userEmail = session.user.email.toLowerCase();
                    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
                        .split(',')
                        .map((e: string) => e.trim().toLowerCase());

                    if (adminEmails.includes(userEmail)) {
                        setIsAuthenticated(true);
                        setLoading(false);
                    } else {
                        setLoading(false);
                        router.push('/admin/login');
                    }
                } else if (event === 'SIGNED_OUT') {
                    setIsAuthenticated(false);
                    router.push('/admin/login');
                }
            }
        );

        // Initial check for existing session
        checkAdmin();

        // Fallback: if neither checkAdmin nor onAuthStateChange resolves within 3s, redirect
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false);
                router.push('/admin/login');
            }
        }, 3000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <p className="text-gray-700 text-sm">驗證中...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const isActive = (path: string) => pathname === path;
    const isActivePrefix = (prefix: string) => pathname?.startsWith(prefix);

    return (
        <div className="min-h-screen bg-surface-base flex flex-col">
            {/* Nav bar: bg-white/90 backdrop-blur-xl border-b border-black/[0.06] h-[52px] px-6 */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] shadow-nav">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-[52px]">
                        <div className="flex items-center space-x-8">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-2 text-[20px] font-semibold text-ink-primary hover:text-brand-500 transition-colors leading-[1.3] tracking-[-0.01em]"
                            >
                                <span className="text-xl">🍰</span>
                                SweetShop
                            </Link>
                            <div className="hidden md:flex space-x-1">
                                <Link
                                    href="/admin/dashboard"
                                    className={`px-4 py-1.5 rounded-lg text-[15px] transition-all duration-150 ${isActive('/admin/dashboard')
                                        ? 'text-ink-primary font-semibold'
                                        : 'text-ink-tertiary hover:text-ink-primary'
                                        }`}
                                >
                                    儀表板
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className={`px-4 py-1.5 rounded-lg text-[15px] transition-all duration-150 ${isActivePrefix('/admin/orders')
                                        ? 'text-ink-primary font-semibold'
                                        : 'text-ink-tertiary hover:text-ink-primary'
                                        }`}
                                >
                                    訂單管理
                                </Link>
                                <Link
                                    href="/admin/products"
                                    className={`px-4 py-1.5 rounded-lg text-[15px] transition-all duration-150 ${isActivePrefix('/admin/products')
                                        ? 'text-ink-primary font-semibold'
                                        : 'text-ink-tertiary hover:text-ink-primary'
                                        }`}
                                >
                                    商品管理
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/" target="_blank" className="text-ink-disabled hover:text-ink-secondary transition p-2 hover:bg-surface-base rounded-lg" title="View Shop">
                                <Home className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2 bg-ink-primary text-ink-inverse rounded-lg hover:bg-ink-secondary transition-colors text-[15px] font-semibold"
                            >
                                登出
                            </button>
                        </div>
                    </div>
                    {/* Mobile nav */}
                    <div className="md:hidden flex gap-1 pb-2.5 overflow-x-auto">
                        <Link
                            href="/admin/dashboard"
                            className={`px-3 py-1 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${isActive('/admin/dashboard') ? 'text-ink-primary font-semibold' : 'text-ink-tertiary'
                                }`}
                        >
                            儀表板
                        </Link>
                        <Link
                            href="/admin/orders"
                            className={`px-3 py-1 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${isActivePrefix('/admin/orders') ? 'text-ink-primary font-semibold' : 'text-ink-tertiary'
                                }`}
                        >
                            訂單
                        </Link>
                        <Link
                            href="/admin/products"
                            className={`px-3 py-1 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${isActivePrefix('/admin/products') ? 'text-ink-primary font-semibold' : 'text-ink-tertiary'
                                }`}
                        >
                            商品
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}

