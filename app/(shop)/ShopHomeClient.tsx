"use client";

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface ShopHomeClientProps {
    initialProducts: Product[];
}

export default function ShopHomeClient({ initialProducts }: ShopHomeClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLanguage();

    const urlCategory = searchParams.get('category') || 'All';
    const [searchTerm, setSearchTerm] = useState('');

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
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-28 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-50 to-background" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

                <div className="relative container mx-auto text-center space-y-8 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-chocolate-600 shadow-apple">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {t('hero.badge')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-chocolate-700">
                        {t('hero.title1')}
                        <span className="block text-primary mt-2">{t('hero.title2')}</span>
                    </h1>

                    <p className="text-lg md:text-xl text-chocolate-500 max-w-xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto pt-4">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-500/50 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-12 py-4 md:py-5 rounded-2xl bg-white shadow-apple-lg border border-border/50 text-lg text-foreground placeholder:text-chocolate-500/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-apple"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                                >
                                    <X className="h-4 w-4 text-chocolate-500" />
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
                    <div className="sticky top-24 space-y-2">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-chocolate-500/60 mb-4">Categories</h3>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-apple ${urlCategory === cat
                                    ? 'bg-primary text-primary-foreground shadow-apple'
                                    : 'text-chocolate-600 hover:bg-cream-200/60'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Mobile Categories */}
                <div className="md:hidden flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide -mx-2 px-2">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={urlCategory === cat ? 'default' : 'outline'}
                            onClick={() => handleCategoryClick(cat)}
                            className="snap-start whitespace-nowrap rounded-full px-5"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 min-w-0">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                {urlCategory === 'All' ? t('common.allProducts') : urlCategory}
                            </h2>
                            {searchTerm && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    搜尋「{searchTerm}」
                                </p>
                            )}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium tabular-nums">
                            {filteredProducts.length} {t('common.items')}
                        </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border bg-cream-50">
                            <p className="text-xl text-chocolate-500 mb-4">
                                {searchTerm ? t('common.noMatch') : t('common.noProducts')}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
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
