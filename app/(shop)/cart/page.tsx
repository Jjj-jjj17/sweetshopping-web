"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="rounded-full p-6 mb-6" style={{ backgroundColor: '#F5F5F7' }}>
                    <ShoppingBag className="h-12 w-12" style={{ color: '#6E6E73' }} />
                </div>
                <h1 style={{ color: '#1D1D1F', fontSize: '24px', fontWeight: 700 }}>購物車是空的</h1>
                <p className="max-w-md mx-auto mb-8 mt-2" style={{ color: '#6E6E73', fontSize: '15px' }}>
                    你還沒有加入任何甜點，快去逛逛我們的新鮮手工甜點！
                </p>
                <Link
                    href="/"
                    className="px-8 py-3 rounded-xl text-lg font-semibold transition-colors duration-150"
                    style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                >
                    開始購物
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl" style={{ minHeight: '100vh' }}>
            <h1 style={{ color: '#1D1D1F', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }} className="mb-8">
                購物車
            </h1>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Cart Items List */}
                <div className="flex-1 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.productId}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl p-4"
                            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)' }}
                        >
                            <Link href={`/products/${item.productId}`} className="shrink-0 relative h-24 w-24 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs" style={{ backgroundColor: '#F5F5F7', color: '#6E6E73' }}>No Image</div>
                                )}
                            </Link>

                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full">
                                <div className="space-y-1 mb-4 sm:mb-0">
                                    <Link href={`/products/${item.productId}`} className="font-semibold text-lg hover:underline line-clamp-1" style={{ color: '#1D1D1F' }}>
                                        {item.name}
                                    </Link>
                                    <p style={{ color: '#6E6E73', fontSize: '13px' }}>
                                        ${Number(item.price).toFixed(2)} / 件
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    {/* Quantity Adjuster */}
                                    <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="px-2 py-1 sm:px-3 sm:py-2 disabled:opacity-50 transition-colors"
                                            style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}
                                        >
                                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                        <div
                                            className="px-3 py-1 sm:px-4 sm:py-2 font-semibold text-sm sm:text-base min-w-[2.5rem] sm:min-w-[3rem] text-center"
                                            style={{ color: '#1D1D1F', borderLeft: '1px solid rgba(0,0,0,0.12)', borderRight: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#FFFFFF' }}
                                        >
                                            {item.quantity}
                                        </div>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            disabled={item.quantity >= 10}
                                            className="px-2 py-1 sm:px-3 sm:py-2 disabled:opacity-50 transition-colors"
                                            style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}
                                        >
                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                    </div>

                                    {/* Line Total */}
                                    <div className="font-bold w-[70px] text-right" style={{ color: '#1D1D1F' }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>

                                    <button
                                        className="p-2 rounded-lg transition-colors"
                                        onClick={() => removeFromCart(item.productId)}
                                        aria-label="Remove item"
                                        style={{ color: '#6E6E73' }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-start">
                        <button
                            className="text-[15px] font-medium px-4 py-2 rounded-lg transition-colors"
                            onClick={clearCart}
                            style={{ color: '#6E6E73' }}
                        >
                            清空購物車
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-[350px] shrink-0">
                    <div className="rounded-xl p-6 sticky top-24" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#1D1D1F', fontSize: '20px', fontWeight: 700 }} className="mb-4">訂單摘要</h2>

                        <div className="space-y-3 mb-6 text-sm">
                            <div className="flex justify-between">
                                <span style={{ color: '#6E6E73' }}>小計</span>
                                <span style={{ color: '#1D1D1F' }}>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: '#6E6E73' }}>運費</span>
                                <span style={{ color: '#6E6E73' }}>結帳時計算</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <span style={{ color: '#1D1D1F' }}>總計</span>
                                <span style={{ color: '#1D1D1F' }}>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-base font-semibold transition-colors duration-150"
                            style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                        >
                            前往結帳
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <p className="text-xs text-center mt-4" style={{ color: '#6E6E73' }}>
                            稅金和運費將在結帳時計算
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
