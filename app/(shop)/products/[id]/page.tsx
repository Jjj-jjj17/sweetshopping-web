"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function fetchProduct() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (data && !error && data.is_available) {
                setProduct(data as Product);
            }
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center space-y-4">
                <h1 className="text-2xl font-bold">Product Not Found</h1>
                <p className="text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
                <Link href="/">
                    <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop</Button>
                </Link>
            </div>
        );
    }

    const isOutOfStock = product.stock <= 0;

    const handleQuantityChange = (change: number) => {
        const newQ = quantity + change;
        if (newQ >= 1 && newQ <= product.stock && newQ <= 10) {
            setQuantity(newQ);
        }
    };

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || undefined
        }, quantity);
        toast.success(`Added ${quantity} ${product.name} to cart`);
        // Reset qty after adding just in case they want to add more later
        setQuantity(1);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                {/* Left: Image Gallery */}
                <div className="w-full max-w-lg mx-auto md:mx-0">
                    <ProductImageGallery images={product.images || []} name={product.name} />
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col space-y-6">
                    <div className="space-y-2">
                        {product.category && (
                            <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider rounded-full">
                                {product.category}
                            </span>
                        )}
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                            {product.name}
                        </h1>
                        <p className="text-2xl font-semibold text-primary">
                            ${Number(product.price).toFixed(2)}
                        </p>
                    </div>

                    <div className="prose prose-sm sm:prose-base text-muted-foreground">
                        <p className="whitespace-pre-line leading-relaxed">
                            {product.description || "No description provided."}
                        </p>
                    </div>

                    <div className="pt-6 border-t space-y-6">
                        {isOutOfStock ? (
                            <div className="p-4 bg-red-50 text-red-800 border-red-200 border rounded-md font-medium text-center">
                                Currently Out of Stock
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-sm">Quantity</span>
                                    <div className="flex items-center border rounded-md overflow-hidden bg-background">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="px-3 py-2 hover:bg-secondary disabled:opacity-50 transition-colors"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <div className="px-4 py-2 font-semibold min-w-[3rem] text-center border-x">
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stock || quantity >= 10}
                                            className="px-3 py-2 hover:bg-secondary disabled:opacity-50 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-muted-foreground ml-2">
                                        {product.stock} available
                                    </span>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full md:w-auto min-w-[200px] h-14 text-lg font-semibold shadow-sm"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="h-5 w-5 mr-3" />
                                    Add to Cart - ${(Number(product.price) * quantity).toFixed(2)}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Delivery Info Block */}
                    <div className="bg-secondary/30 rounded-lg p-5 mt-auto border">
                        <ul className="text-sm space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">✓</span>
                                Freshly made to order for guaranteed quality.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">✓</span>
                                Safe and secure checkout process.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">✓</span>
                                Carefully packaged to arrive in perfect condition.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
