"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, total, count } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-muted-foreground">Your cart is empty</h2>
                <Link href="/">
                    <Button>Browse Desserts</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/10 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Shopping Cart ({count})</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Items List */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.map(item => (
                            <Card key={item.id} className="flex flex-row items-center p-4 gap-4">
                                {/* Thumbnail (Mock or Real) */}
                                <div className="h-20 w-20 bg-secondary rounded-md flex items-center justify-center shrink-0 overflow-hidden relative">
                                    {/* Ideally we'd pass image_url in cart item, for now placeholder */}
                                    <span className="text-xs text-muted-foreground">Photo</span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">${item.price}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>

                                <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${total}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-xs italic">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                    <span>Total</span>
                                    <span>${total}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/checkout" className="w-full">
                                    <Button className="w-full" size="lg">
                                        Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
