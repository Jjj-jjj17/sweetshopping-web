"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        checkAdmin();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user?.email) {
                    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
                        .split(',').map(e => e.trim());
                    if (adminEmails.includes(session.user.email)) {
                        setIsAdmin(true);
                    } else {
                        router.push('/admin/login');
                    }
                } else if (event === 'SIGNED_OUT') {
                    router.push('/admin/login');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function checkAdmin() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return; // Wait for onAuthStateChange

        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
            .split(',').map(e => e.trim());

        if (adminEmails.includes(session.user.email || '')) {
            setIsAdmin(true);
        } else {
            router.push('/admin/login');
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    if (isAdmin === null) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
                Loading...
            </div>
        );
    }

    if (!isAdmin) return null;

    const isActive = (path: string) => pathname === path;
    const isActivePrefix = (prefix: string) => pathname?.startsWith(prefix);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F7' }} className="flex flex-col">
            {/* Nav bar */}
            <nav className="sticky top-0 z-50" style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-[52px]">
                        <div className="flex items-center space-x-8">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-2 text-[20px] font-semibold transition-colors leading-[1.3] tracking-[-0.01em]"
                                style={{ color: '#1D1D1F' }}
                            >
                                <span className="text-xl">🍰</span>
                                SweetShop
                            </Link>
                            <div className="hidden md:flex space-x-1">
                                <Link
                                    href="/admin/dashboard"
                                    className="px-4 py-1.5 rounded-lg text-[15px] transition-all duration-150"
                                    style={{ color: isActive('/admin/dashboard') ? '#1D1D1F' : '#6E6E73', fontWeight: isActive('/admin/dashboard') ? 600 : 400 }}
                                >
                                    儀表板
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className="px-4 py-1.5 rounded-lg text-[15px] transition-all duration-150"
                                    style={{ color: isActivePrefix('/admin/orders') ? '#1D1D1F' : '#6E6E73', fontWeight: isActivePrefix('/admin/orders') ? 600 : 400 }}
                                >
                                    訂單管理
                                </Link>
                                <Link
                                    href="/admin/products"
                                    className="px-4 py-1.5 rounded-lg text-[15px] transition-all duration-150"
                                    style={{ color: isActivePrefix('/admin/products') ? '#1D1D1F' : '#6E6E73', fontWeight: isActivePrefix('/admin/products') ? 600 : 400 }}
                                >
                                    商品管理
                                </Link>
                                <Link
                                    href="/admin/content"
                                    className="px-4 py-1.5 rounded-lg text-[15px] transition-all duration-150"
                                    style={{ color: isActivePrefix('/admin/content') ? '#1D1D1F' : '#6E6E73', fontWeight: isActivePrefix('/admin/content') ? 600 : 400 }}
                                >
                                    內容管理
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                target="_blank"
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: '#6E6E73' }}
                                title="View Shop"
                            >
                                <Home className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2 rounded-lg text-[15px] font-semibold transition-colors"
                                style={{ backgroundColor: '#1D1D1F', color: '#FFFFFF' }}
                            >
                                登出
                            </button>
                        </div>
                    </div>
                    {/* Mobile nav */}
                    <div className="md:hidden flex gap-1 pb-2.5 overflow-x-auto">
                        <Link
                            href="/admin/dashboard"
                            className="px-3 py-1 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all"
                            style={{ color: isActive('/admin/dashboard') ? '#1D1D1F' : '#6E6E73', fontWeight: isActive('/admin/dashboard') ? 600 : 400 }}
                        >
                            儀表板
                        </Link>
                        <Link
                            href="/admin/orders"
                            className="px-3 py-1 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all"
                            style={{ color: isActivePrefix('/admin/orders') ? '#1D1D1F' : '#6E6E73', fontWeight: isActivePrefix('/admin/orders') ? 600 : 400 }}
                        >
                            訂單
                        </Link>
                        <Link
                            href="/admin/products"
                            className="px-3 py-1 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all"
                            style={{ color: isActivePrefix('/admin/products') ? '#1D1D1F' : '#6E6E73', fontWeight: isActivePrefix('/admin/products') ? 600 : 400 }}
                        >
                            商品
                        </Link>
                        <Link
                            href="/admin/content"
                            className="px-3 py-1 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all"
                            style={{ color: isActivePrefix('/admin/content') ? '#1D1D1F' : '#6E6E73', fontWeight: isActivePrefix('/admin/content') ? 600 : 400 }}
                        >
                            內容
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
