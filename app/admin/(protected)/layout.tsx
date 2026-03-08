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

                console.log('=== ADMIN LAYOUT CHECK ===');
                console.log('Session:', !!session);
                console.log('Email:', session?.user?.email);

                if (!session) {
                    if (mounted) {
                        setLoading(false);
                        router.push('/admin/login');
                    }
                    return;
                }

                const userEmail = session.user.email?.toLowerCase() || '';
                const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
                    .split(',')
                    .map((e: string) => e.trim().toLowerCase());

                console.log('Admin emails:', adminEmails);
                console.log('Is admin:', adminEmails.includes(userEmail));

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

        // Listen for auth state changes (e.g. sign in completing after OAuth redirect)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, session: any) => {
                if (!mounted) return;

                if (_event === 'SIGNED_IN' && session) {
                    // Re-check admin status when a sign-in event fires
                    const userEmail = session.user.email?.toLowerCase() || '';
                    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
                        .split(',')
                        .map((e: string) => e.trim().toLowerCase());

                    if (adminEmails.includes(userEmail)) {
                        setIsAuthenticated(true);
                        setLoading(false);
                    }
                } else if (_event === 'SIGNED_OUT') {
                    setIsAuthenticated(false);
                    router.push('/admin/login');
                }
            }
        );

        checkAdmin();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []); // Only run once on mount — no pathname/router dep to avoid re-triggers

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Frosted Glass Navigation */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-primary transition-colors"
                            >
                                <span className="text-2xl">🍰</span>
                                SweetShop
                            </Link>
                            <div className="hidden md:flex space-x-1">
                                <Link
                                    href="/admin/dashboard"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive('/admin/dashboard')
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    儀表板
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActivePrefix('/admin/orders')
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    訂單管理
                                </Link>
                                <Link
                                    href="/admin/products"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActivePrefix('/admin/products')
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    商品管理
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/" target="_blank" className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg" title="View Shop">
                                <Home className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium shadow-sm"
                            >
                                登出
                            </button>
                        </div>
                    </div>
                    {/* Mobile nav */}
                    <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
                        <Link
                            href="/admin/dashboard"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive('/admin/dashboard') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            儀表板
                        </Link>
                        <Link
                            href="/admin/orders"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActivePrefix('/admin/orders') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            訂單
                        </Link>
                        <Link
                            href="/admin/products"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActivePrefix('/admin/products') ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'
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
