"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ProductSkeleton } from '@/components/ProductSkeleton';

// Placeholder for now
export default function ShopHome() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, count } = useCart();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Hardcoded categories for now, effectively acts as "Tags" if db doesn't have strict relations
    const CATEGORIES = ['All', 'Cake', 'Cookie', 'Bread', 'Gift Box'];

    useEffect(() => {
        async function fetchProducts() {
            // In a real scenario, fetch from Supabase. 
            // For now, if no env vars, we might show empty or mock.
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true);

            if (data) {
                setProducts(data as Product[]);
                setFilteredProducts(data as Product[]);
            }
            setLoading(false);
        }

        fetchProducts();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = products;

        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                p.description?.toLowerCase().includes(lower)
            );
        }

        setFilteredProducts(result);
    }, [searchTerm, selectedCategory, products]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-primary">SweetShop</Link>
                <div className="flex gap-4 items-center">
                    <Link href="/cart">
                        <Button variant="outline" className="relative">
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Cart
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {count}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-secondary/30 py-12 text-center space-y-4 px-4">
                <h2 className="text-4xl font-extrabold">Fresh Handmade Desserts</h2>
                <div className="max-w-md mx-auto relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search for something sweet..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {CATEGORIES.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                            className="rounded-full"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </section>

            {/* Grid */}
            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No products found matching your criteria.</p>
                        <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear Filters</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group" data-testid={`product-card-${product.id}`}>
                                <Link href={`/product/${product.id}`} className="block relative aspect-square bg-secondary cursor-pointer">
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">No Photo</div>
                                    )}
                                    {product.stock_status !== 'IN_STOCK' && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                                            {product.stock_status?.replace('_', ' ')}
                                        </div>
                                    )}
                                </Link>
                                <CardHeader className="p-4 pb-0">
                                    <CardTitle className="text-lg flex justify-between">
                                        <Link href={`/product/${product.id}`} className="hover:underline">
                                            {product.name}
                                        </Link>
                                        <span>${product.price}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 text-sm text-muted-foreground">
                                    {product.description || "Detailed description coming soon..."}
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button
                                        className="w-full"
                                        disabled={product.stock_status !== 'IN_STOCK'}
                                        onClick={() => addToCart(product)}
                                        data-testid={`add-to-cart-${product.id}`}
                                    >
                                        Add to Cart
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
