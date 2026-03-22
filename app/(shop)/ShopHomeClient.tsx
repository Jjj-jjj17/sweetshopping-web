"use client";

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Search, Sparkles, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface ShopHomeClientProps {
    initialProducts: Product[];
    siteContent?: Record<string, string>;
}

export default function ShopHomeClient({ initialProducts, siteContent = {} }: ShopHomeClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLanguage();

    const urlCategory = searchParams.get('category') || 'All';
    const [searchTerm, setSearchTerm] = useState('');

    // Dynamic content: DB values override language translations
    const heroTitle = siteContent.hero_title || t('hero.title1');
    const heroTitle2 = siteContent.hero_title2 || t('hero.title2');
    const heroSubtitle = siteContent.hero_subtitle || t('hero.subtitle');
    const heroBadge = siteContent.hero_badge || t('hero.badge');
    const heroAnnouncement = siteContent.hero_announcement || '';

    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category).filter(Boolean));
        return ['All', ...Array.from(cats)];
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        let result = initialProducts;

        if (urlCategory !== 'All') {
            result = result.filter(p => p.category === urlCategory);
        }

        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                (p.description && p.description.toLowerCase().includes(lower)) ||
                (p.category && p.category.toLowerCase().includes(lower))
            );
        }

        return result;
    }, [initialProducts, urlCategory, searchTerm]);

    const handleCategoryClick = (cat: string) => {
        if (cat === 'All') {
            router.push('/');
        } else {
            router.push(`/?category=${encodeURIComponent(cat)}`);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F5F5F7]">
            {/* Announcement Banner */}
            {heroAnnouncement && (
                <div style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF', textAlign: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 500 }}>
                    {heroAnnouncement}
                </div>
            )}

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-28 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-50 to-[#F5F5F7]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

                <div className="relative container mx-auto text-center space-y-8 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-[#6E6E73] shadow-card">
                        <Sparkles className="h-4 w-4 text-[#FF6B6B]" />
                        {heroBadge}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight" style={{ color: '#1D1D1F' }}>
                        {heroTitle}
                        <span className="block mt-2" style={{ color: '#FF6B6B' }}>{heroTitle2}</span>
                    </h1>

                    <p className="text-lg md:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: '#6E6E73' }}>
                        {heroSubtitle}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto pt-4">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AEAEB2] group-focus-within:text-[#FF6B6B] transition-colors" />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-12 py-4 md:py-5 rounded-2xl bg-white shadow-card border border-black/[0.06] text-lg text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/30 focus:border-[#FF6B6B]/50 transition-all duration-200"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#FF6B6B]/10 transition-colors"
                                >
                                    <X className="h-4 w-4 text-[#6E6E73]" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row gap-10">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-56 shrink-0">
                    <div className="sticky top-24 bg-white rounded-xl p-4 shadow-card border border-black/[0.04]">
                        <p className="text-[11px] font-semibold text-[#6E6E73] tracking-widest uppercase mb-3">Categories</p>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-[15px] transition-colors duration-150 ${urlCategory === cat
                                        ? 'bg-[#FF6B6B] text-white font-medium'
                                        : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Mobile Categories */}
                <div className="md:hidden flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide -mx-2 px-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`snap-start whitespace-nowrap rounded-full px-5 py-2 text-[15px] font-medium transition-colors duration-150 ${urlCategory === cat
                                ? 'bg-[#FF6B6B] text-white'
                                : 'bg-white text-[#1D1D1F] border border-black/[0.06]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 min-w-0">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h2 style={{ color: '#1D1D1F', fontSize: '24px', fontWeight: 600, letterSpacing: '-0.015em' }}>
                                {urlCategory === 'All' ? t('common.allProducts') : urlCategory}
                            </h2>
                            {searchTerm && (
                                <p className="text-[13px] mt-1" style={{ color: '#6E6E73' }}>
                                    搜尋「{searchTerm}」
                                </p>
                            )}
                        </div>
                        <span className="text-[13px] font-medium tabular-nums" style={{ color: '#6E6E73' }}>
                            {filteredProducts.length} {t('common.items')}
                        </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 rounded-xl border-2 border-dashed border-black/[0.06] bg-white">
                            <p className="text-xl mb-4" style={{ color: '#6E6E73' }}>
                                {searchTerm ? t('common.noMatch') : t('common.noProducts')}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-[#FF6B6B] hover:text-[#E85555] font-semibold transition-colors"
                                >
                                    {t('common.clearSearch')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <ProductGrid products={filteredProducts} />
                    )}
                </div>
            </div>
        </div>
    );
}
