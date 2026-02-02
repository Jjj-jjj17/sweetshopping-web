"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductDetailViewProps {
    id: string;
}

export default function ProductDetailView({ id }: ProductDetailViewProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function fetchProduct() {
            if (!id) return;
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setProduct(data as Product);
            } else {
                console.error(error);
            }
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            router.push('/cart');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (!product) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <p>Product not found.</p>
            <Link href="/"><Button>Back to Shop</Button></Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
                    </Button>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Image */}
                    <div className="aspect-square relative bg-secondary rounded-xl overflow-hidden shadow-sm">
                        {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                            <p className="text-2xl font-light text-primary">${product.price}</p>
                        </div>

                        <div className="prose prose-sm text-muted-foreground">
                            <p>{product.description || "No description available."}</p>
                        </div>

                        <div className="pt-6 border-t space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="font-medium">Quantity</span>
                                <div className="flex items-center gap-2 border rounded-md">
                                    <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">{quantity}</span>
                                    <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button size="lg" className="flex-1 text-lg h-14" onClick={handleAddToCart} disabled={product.stock_status !== 'IN_STOCK'}>
                                    <ShoppingCart className="mr-2" />
                                    {product.stock_status === 'IN_STOCK' ? 'Add to Cart' : 'Sold Out'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
