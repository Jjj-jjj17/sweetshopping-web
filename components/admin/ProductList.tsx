"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Plus, Edit2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setProducts(data as Product[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleAvailability = async (product: Product) => {
        const newStatus = !product.is_available;

        // Optimistic UI update
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: newStatus } : p));

        const { error } = await supabase
            .from('products')
            .update({ is_available: newStatus })
            .eq('id', product.id);

        if (error) {
            alert("Update failed, reverting...");
            fetchProducts();
        }
    };

    const deleteProduct = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

        // In a real system you might soft-delete if it has linked orders.
        // For now, based on instructions, we allow direct deletion from DB or just flipping is_available.
        // Let's do a real delete to match CRUD exactly.
        const { error } = await supabase.from('products').delete().eq('id', id);

        if (error) {
            alert("Delete failed: " + error.message);
        } else {
            fetchProducts();
        }
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">Manage your store's inventory and offerings.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchProducts}>Refresh</Button>
                    <Link href="/admin/products/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">Get started by creating your first product.</p>
                    <Link href="/admin/products/new">
                        <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => {
                        const hasImages = product.images && product.images.length > 0;
                        const coverImage = hasImages ? product.images[0] : null;

                        return (
                            <Card key={product.id} className={`overflow-hidden transition-all hover:shadow-md ${!product.is_available ? 'opacity-75 grayscale' : ''}`}>
                                <div className="aspect-[4/3] relative bg-secondary border-b">
                                    {coverImage ? (
                                        <Image src={coverImage} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center"><ImageIcon className="h-10 w-10 text-muted-foreground opacity-50" /></div>
                                    )}

                                    <div className="absolute top-2 right-2">
                                        <Button
                                            size="sm"
                                            variant={product.is_available ? 'default' : 'secondary'}
                                            className={`shadow-sm ${product.is_available ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                            onClick={() => toggleAvailability(product)}
                                        >
                                            {product.is_available ? 'ACTIVE' : 'HIDDEN'}
                                        </Button>
                                    </div>
                                    {hasImages && product.images.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                                            1/{product.images.length}
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-lg leading-tight truncate" title={product.name}>
                                            {product.name}
                                        </CardTitle>
                                        <div className="text-lg font-bold shrink-0">
                                            ${product.price}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {product.category && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{product.category}</span>}
                                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4" title={product.description}>
                                        {product.description || "No description provided."}
                                    </p>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/products/${product.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Edit2 className="h-4 w-4 mr-2" /> Edit
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={() => deleteProduct(product.id, product.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
