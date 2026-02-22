"use client";

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchParams, useRouter } from 'next/navigation';

interface ShopHomeClientProps {
    initialProducts: Product[];
}

export default function ShopHomeClient({ initialProducts }: ShopHomeClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const urlCategory = searchParams.get('category') || 'All';
    const [searchTerm, setSearchTerm] = useState('');

    // Extract categories
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category).filter(Boolean));
        return ['All', ...Array.from(cats)];
    }, [initialProducts]);

    // Apply Filters
    const filteredProducts = useMemo(() => {
        let result = initialProducts;

        if (urlCategory !== 'All') {
            result = result.filter(p => p.category === urlCategory);
        }

        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                (p.description && p.description.toLowerCase().includes(lower))
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
            <section className="bg-gradient-to-b from-secondary/50 to-background py-16 text-center space-y-6 px-4 border-b">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Fresh Handmade Desserts
                </h1>
                <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                    Discover our collection of artisanal cakes, perfectly baked cookies, and beautiful gift boxes.
                </p>

                <div className="max-w-md mx-auto relative pt-4">
                    <Search className="absolute left-3 top-7 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search for something sweet..."
                        className="pl-10 shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">

                {/* Desktop Sidebar Filters */}
                <aside className="hidden md:block w-64 shrink-0 space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Categories</h3>
                        <div className="flex flex-col space-y-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${urlCategory === cat
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Mobile Categories (Horizontal Scroll) */}
                <div className="md:hidden flex overflow-x-auto pb-4 gap-2 snap-x scrollbar-hide">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={urlCategory === cat ? 'default' : 'outline'}
                            onClick={() => handleCategoryClick(cat)}
                            className="snap-start whitespace-nowrap rounded-full"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Product Grid Area */}
                <div className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {urlCategory === 'All' ? 'All Products' : urlCategory}
                        </h2>
                        <span className="text-sm text-muted-foreground font-medium">
                            {filteredProducts.length} items
                        </span>
                    </div>

                    {initialProducts.length === 0 ? (
                        <div className="text-center py-20 border rounded-lg bg-secondary/10">
                            <p className="text-muted-foreground text-lg">Currently no products available.</p>
                        </div>
                    ) : (
                        <ProductGrid products={filteredProducts} />
                    )}
                </div>
            </div>
        </div>
    );
}
