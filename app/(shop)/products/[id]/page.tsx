"use client";

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { Loader2, ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
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
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#FF6B6B' }} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center space-y-4">
                <h1 style={{ color: '#1D1D1F', fontSize: '24px', fontWeight: 700 }}>找不到商品</h1>
                <p style={{ color: '#6E6E73', fontSize: '15px' }}>該商品不存在或已被下架。</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[15px] font-medium transition-colors duration-150"
                    style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F', border: '1px solid rgba(0,0,0,0.1)' }}
                >
                    <ArrowLeft className="h-4 w-4" /> 返回商店
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
        toast.success(`已加入 ${quantity} 個 ${product.name}`);
        setQuantity(1);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl" style={{ minHeight: '100vh' }}>
            <Link
                href="/"
                className="inline-flex items-center gap-1.5 mb-8 text-[15px] font-medium transition-colors duration-150"
                style={{ color: '#6E6E73' }}
            >
                <ArrowLeft className="h-4 w-4" />
                返回商品列表
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
                            <span
                                className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                                style={{ backgroundColor: '#F5F5F7', color: '#6E6E73' }}
                            >
                                {product.category}
                            </span>
                        )}
                        <h1 style={{ color: '#1D1D1F', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            {product.name}
                        </h1>
                        <p style={{ color: '#FF6B6B', fontSize: '24px', fontWeight: 600 }}>
                            ${Number(product.price).toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <p className="whitespace-pre-line leading-relaxed" style={{ color: '#6E6E73', fontSize: '15px' }}>
                            {product.description || "No description provided."}
                        </p>
                    </div>

                    <div className="pt-6 space-y-6" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        {isOutOfStock ? (
                            <div
                                className="p-4 rounded-lg font-medium text-center"
                                style={{ backgroundColor: '#FF3B30', color: '#FFFFFF' }}
                            >
                                目前缺貨
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span style={{ color: '#1D1D1F', fontSize: '15px', fontWeight: 500 }}>數量</span>
                                    <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="px-3 py-2 disabled:opacity-50 transition-colors"
                                            style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <div
                                            className="px-4 py-2 font-semibold min-w-[3rem] text-center"
                                            style={{ color: '#1D1D1F', borderLeft: '1px solid rgba(0,0,0,0.12)', borderRight: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#FFFFFF' }}
                                        >
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stock || quantity >= 10}
                                            className="px-3 py-2 disabled:opacity-50 transition-colors"
                                            style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span style={{ color: '#6E6E73', fontSize: '13px' }}>
                                        剩餘 {product.stock} 件
                                    </span>
                                </div>

                                <button
                                    className="w-full md:w-auto min-w-[200px] h-14 text-lg font-semibold rounded-xl flex items-center justify-center gap-3 transition-colors duration-150"
                                    onClick={handleAddToCart}
                                    style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    加入購物車 - ${(Number(product.price) * quantity).toFixed(2)}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Delivery Info Block */}
                    <div className="rounded-xl p-5 mt-auto" style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
                        <ul className="text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span style={{ color: '#FF6B6B' }} className="font-bold">✓</span>
                                <span style={{ color: '#6E6E73' }}>新鮮現做，品質保證。</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span style={{ color: '#FF6B6B' }} className="font-bold">✓</span>
                                <span style={{ color: '#6E6E73' }}>安全加密結帳流程。</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span style={{ color: '#FF6B6B' }} className="font-bold">✓</span>
                                <span style={{ color: '#6E6E73' }}>精心包裝，完美送達。</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
