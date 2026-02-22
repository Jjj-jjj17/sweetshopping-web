"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="bg-secondary/50 rounded-full p-6 mb-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Your cart is empty</h1>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Looks like you haven't added any sweet treats to your cart yet. Discover our fresh handmade desserts!
                </p>
                <Link href="/">
                    <Button size="lg" className="px-8 shadow-sm">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            <h1 className="text-3xl font-extrabold tracking-tight mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Cart Items List */}
                <div className="flex-1 space-y-6">
                    {items.map((item) => (
                        <div key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card border rounded-lg p-4 shadow-sm">
                            <Link href={`/products/${item.productId}`} className="shrink-0 relative h-24 w-24 bg-secondary rounded-md overflow-hidden border">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs bg-muted">No Image</div>
                                )}
                            </Link>

                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full">
                                <div className="space-y-1 mb-4 sm:mb-0">
                                    <Link href={`/products/${item.productId}`} className="font-semibold text-lg hover:underline line-clamp-1">
                                        {item.name}
                                    </Link>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        ${Number(item.price).toFixed(2)} each
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    {/* Quantity Adjuster */}
                                    <div className="flex items-center border rounded-md overflow-hidden bg-background">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="px-2 py-1 sm:px-3 sm:py-2 hover:bg-secondary disabled:opacity-50 transition-colors"
                                        >
                                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                        <div className="px-3 py-1 sm:px-4 sm:py-2 font-semibold text-sm sm:text-base min-w-[2.5rem] sm:min-w-[3rem] text-center border-x">
                                            {item.quantity}
                                        </div>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            disabled={item.quantity >= 10} // Absolute hard limit to prevent hoarding here
                                            className="px-2 py-1 sm:px-3 sm:py-2 hover:bg-secondary disabled:opacity-50 transition-colors"
                                        >
                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </button>
                                    </div>

                                    {/* Line Total */}
                                    <div className="font-bold w-[70px] text-right">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive hover:bg-red-50"
                                        onClick={() => removeFromCart(item.productId)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-start">
                        <Button variant="ghost" className="text-muted-foreground" onClick={clearCart}>
                            Clear Cart
                        </Button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-[350px] shrink-0">
                    <div className="bg-secondary/30 rounded-xl p-6 border sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link href="/checkout" className="block w-full">
                            <Button size="lg" className="w-full shadow-sm text-base h-12">
                                Proceed to Checkout
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Taxes and shipping calculated at checkout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
