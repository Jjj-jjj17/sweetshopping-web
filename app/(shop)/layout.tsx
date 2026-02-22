import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartProvider } from '@/context/CartContext';
import { CartBadge } from '@/components/shop/CartBadge';

function ShopHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    <Cookie className="h-6 w-6 text-primary" />
                    <span>SweetShop</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 items-center flex-1 justify-center font-medium text-sm">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <Link href="/?category=All" className="hover:text-primary transition-colors">Products</Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Cart">
                            <ShoppingCart className="h-5 w-5" />
                            <CartBadge />
                        </Button>
                    </Link>

                    {/* Mobile Menu Button - Minimal impl, full menu could be added later */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

function ShopFooter() {
    return (
        <footer className="w-full bg-secondary/50 py-12 mt-16 border-t">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                        <Cookie className="h-5 w-5 text-primary" />
                        <span>SweetShop</span>
                    </Link>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Handcrafted desserts and fresh pastries delivered with care. Treat yourself to something sweet!
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Store Hours</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li>Monday - Friday: 9am - 7pm</li>
                        <li>Saturday: 10am - 5pm</li>
                        <li>Sunday: Closed</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Legal</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 flex flex-col items-start">
                        <li><Link href="#" className="hover:underline">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:underline">Terms of Service</Link></li>
                        <li><Link href="/admin/login" className="hover:underline text-muted-foreground/50">Admin Login</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} SweetShop. All rights reserved.
            </div>
        </footer>
    );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <div className="flex min-h-screen flex-col">
                <ShopHeader />
                <main className="flex-1">
                    {children}
                </main>
                <ShopFooter />
            </div>
        </CartProvider>
    );
}
