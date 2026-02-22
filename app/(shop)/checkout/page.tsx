"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        instructions: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Prevent access if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold mb-2">Cart is Empty</h1>
                <p className="text-muted-foreground mb-6">You need to add items to your cart before checking out.</p>
                <Button onClick={() => router.push('/')}>Return to Shop</Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Validation
        try {
            const schema = z.object({
                name: z.string().min(2, "Name is required"),
                email: z.string().email("Valid email is required"),
                phone: z.string().min(8, "Valid phone number required"),
                address: z.string().min(10, "Full delivery address is required"),
            });
            schema.parse(formData);
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(fieldErrors);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            // Re-check stock before submission
            const productIds = items.map(i => i.productId);
            const { data: stockData, error: stockError } = await supabase
                .from('products')
                .select('id, name, stock, is_available')
                .in('id', productIds);

            if (stockError) throw stockError;

            // Validate all items
            for (const cartItem of items) {
                const dbProduct = stockData?.find((p: { id: string, name: string, stock: number, is_available: boolean }) => p.id === cartItem.productId);

                if (!dbProduct || !dbProduct.is_available) {
                    throw new Error(`Item ${cartItem.name} is no longer available.`);
                }

                if (dbProduct.stock < cartItem.quantity) {
                    throw new Error(`Not enough stock for ${cartItem.name}. Only ${dbProduct.stock} left.`);
                }
            }

            // Insert Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    delivery_address: formData.address,
                    items: items, // JSONB Array
                    total: total,
                    status: 'pending',
                    special_instructions: formData.instructions
                })
                .select('id')
                .single();

            if (orderError) throw orderError;

            if (orderData) {
                // Decrement stock for all items
                // Note: In a production App, RPC is safer here to prevent race conditions
                for (const cartItem of items) {
                    const dbProduct = stockData?.find((p: { id: string, name: string, stock: number, is_available: boolean }) => p.id === cartItem.productId);
                    if (dbProduct) {
                        await supabase.from('products').update({
                            stock: dbProduct.stock - cartItem.quantity
                        }).eq('id', cartItem.productId);
                    }
                }

                clearCart();
                router.push(`/order-confirmation/${orderData.id}`);
            }

        } catch (err: any) {
            console.error(err);
            alert("Order failed: " + err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
            <h1 className="text-3xl font-extrabold mb-8">Secure Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        placeholder="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <Input
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Textarea
                                    placeholder="Full Delivery Address"
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, address: e.target.value })}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            <div>
                                <Textarea
                                    placeholder="Special Instructions (Optional)"
                                    rows={2}
                                    value={formData.instructions}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, instructions: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing...</>
                        ) : (
                            `Complete Order • $${total.toFixed(2)}`
                        )}
                    </Button>
                </form>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 bg-secondary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm max-h-[400px] overflow-y-auto">
                            {items.map(item => (
                                <div key={item.productId} className="flex justify-between items-start gap-2 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <p className="font-semibold line-clamp-1">{item.name}</p>
                                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium whitespace-nowrap">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                        <div className="p-6 pt-0 mt-4 border-t border-border/50">
                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-lg text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
