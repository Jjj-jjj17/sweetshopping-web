"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming you have this path for supabase client
import { useOrders } from '@/context/OrderContext'; // Keep this if logout is still handled by it, or remove if logout is also moved to supabase
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, LogOut, Home, Loader2 } from 'lucide-react'; // Added Loader2
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useOrders(); // Keep this if logout is still handled by useOrders
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // New state for authentication status

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase());

            if (session?.user?.email && adminEmails.includes(session.user.email.toLowerCase())) {
                setIsAuthenticated(true);
                if (pathname === '/admin/login') {
                    router.push('/admin/dashboard');
                }
            } else {
                setIsAuthenticated(false);
                router.push('/admin/login');
            }
            setLoading(false);
        };

        // Subscribe to Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase());

            if (session?.user?.email && adminEmails.includes(session.user.email.toLowerCase())) {
                setIsAuthenticated(true);
                if (pathname === '/admin/login') {
                    router.push('/admin/dashboard');
                }
            } else {
                setIsAuthenticated(false);
                router.push('/admin/login');
            }
        });

        checkAuth();

        return () => subscription.unsubscribe();
    }, [pathname, router]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!isAuthenticated) {
        return null; // The useEffect will handle redirect
    }

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-secondary/10 flex flex-col">
            {/* Admin Header */}
            <header className="bg-white border-b sticky top-0 z-20 px-4 py-3 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-md">
                        <span className="font-bold text-primary">Admin</span>
                    </div>
                </div>

                <nav className="flex items-center gap-1 md:gap-4 overflow-x-auto">
                    <Link href="/admin/dashboard">
                        <Button variant={isActive('/admin/dashboard') ? 'default' : 'ghost'} size="sm" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden md:inline">Orders</span>
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant={isActive('/admin/products') ? 'default' : 'ghost'} size="sm" className="gap-2">
                            <Package className="h-4 w-4" />
                            <span className="hidden md:inline">Products</span>
                        </Button>
                    </Link>
                </nav>

                <div className="flex gap-2">
                    <Link href="/" target="_blank">
                        <Button variant="outline" size="icon" title="View Shop">
                            <Home className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
