"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, Cookie, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { CartBadge } from '@/components/shop/CartBadge';

function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();

    return (
        <button
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-200/60 hover:bg-cream-300/60 text-chocolate-600 text-xs font-medium transition-apple"
            title={locale === 'zh' ? 'Switch to English' : '切換為中文'}
        >
            <Globe className="w-3.5 h-3.5" />
            {locale === 'zh' ? 'EN' : '中文'}
        </button>
    );
}

function ShopHeader() {
    const { t } = useLanguage();

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border/50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Cookie className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-chocolate-700">Sweet</span>
                    <span className="text-primary -ml-1.5">Shop</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 items-center flex-1 justify-center font-medium text-sm">
                    <Link href="/" className="text-chocolate-600 hover:text-primary transition-colors">
                        {t('common.home')}
                    </Link>
                    <Link href="/?category=All" className="text-chocolate-600 hover:text-primary transition-colors">
                        {t('common.allProducts')}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    <LanguageSwitcher />

                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10" aria-label={t('common.cart')}>
                            <ShoppingCart className="h-5 w-5 text-chocolate-600" />
                            <CartBadge />
                        </Button>
                    </Link>

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

function ShopFooter() {
    const { t } = useLanguage();

    return (
        <footer className="w-full bg-chocolate-700 text-cream-200 py-14 mt-20">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                        <Cookie className="h-5 w-5 text-primary" />
                        <span className="text-cream-100">SweetShop</span>
                    </Link>
                    <p className="text-sm text-cream-300/70 max-w-xs leading-relaxed">
                        {t('footer.description')}
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-4 text-cream-100">{t('footer.storeHours')}</h3>
                    <ul className="text-sm text-cream-300/70 space-y-2">
                        <li>{t('footer.weekdays')}</li>
                        <li>{t('footer.saturday')}</li>
                        <li>{t('footer.sunday')}</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4 text-cream-100">{t('footer.links')}</h3>
                    <ul className="text-sm text-cream-300/70 space-y-2">
                        <li><Link href="#" className="hover:text-cream-100 transition-colors">{t('footer.privacy')}</Link></li>
                        <li><Link href="#" className="hover:text-cream-100 transition-colors">{t('footer.terms')}</Link></li>
                        <li><Link href="/admin/login" className="text-cream-300/30 hover:text-cream-300/50 transition-colors">Admin</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-10 pt-8 border-t border-cream-300/10 text-center text-sm text-cream-300/50">
                &copy; {new Date().getFullYear()} SweetShop. All rights reserved.
            </div>
        </footer>
    );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <CartProvider>
                <div className="flex min-h-screen flex-col">
                    <ShopHeader />
                    <main className="flex-1">
                        {children}
                    </main>
                    <ShopFooter />
                </div>
            </CartProvider>
        </LanguageProvider>
    );
}
