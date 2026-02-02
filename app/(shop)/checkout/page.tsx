"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Fixed import
import { MapPin, Truck, Store, CheckCircle, Loader2 } from 'lucide-react'; // Fixed icons
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { cart, total, clearCart } = useCart();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        specialRequests: '',
        shippingMethod: 'PICKUP' as 'PICKUP' | 'DELIVERY' | '7-11',
        sevenElevenStoreId: '',
        sevenElevenAddress: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    if (cart.length === 0 && !orderComplete) {
        router.push('/');
        return null;
    }

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Zod Validation
        try {
            // Simple schema definition inline
            const schema = z.object({
                name: z.string().min(2, "Name must be at least 2 characters"),
                phone: z.string().regex(/^09\d{8}$/, "Invalid Taiwan mobile number (e.g. 0912345678)"),
                email: z.string().email("Invalid email").optional().or(z.literal('')),
                sevenElevenStoreId: formData.shippingMethod === '7-11' ? z.string().min(1, "Store ID is required") : z.string().optional(),
                sevenElevenAddress: formData.shippingMethod === '7-11' ? z.string().min(1, "Store Address is required") : z.string().optional(),
            });

            schema.parse(formData);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                // Cast to any to avoid strict type checks
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err as any).errors.forEach((e: any) => {
                    if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
                });
                setErrors(fieldErrors);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .insert({
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    customer_email: formData.email,
                    shipping_method: formData.shippingMethod,
                    seven_eleven_store_id: formData.sevenElevenStoreId,
                    seven_eleven_address: formData.sevenElevenAddress,
                    special_requests: formData.specialRequests,
                    items: cart, // JSONB
                    total_amount: total,
                    status: 'PENDING'
                })
                .select() // Need to select to get the ID back!
                .single();

            if (error) throw error;

            clearCart();
            // Redirect to Success Page
            if (data) {
                router.push(`/checkout/success/${data.id}`);
            } else {
                // Fallback
                setOrderComplete(true);
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(err);
            alert("Order failed: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground mb-6">Thank you for your order, {formData.name}.<br />We will start baking shortly.</p>
                <Button onClick={() => router.push('/')}>Return to Shop</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/10 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Details */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Full Name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                data-testid="checkout-name"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                            <Input
                                placeholder="Phone Number"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                data-testid="checkout-phone"
                            />
                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                            <Input
                                placeholder="Email (Optional)"
                                type="email"
                                className="md:col-span-2"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                data-testid="checkout-email"
                            />
                            {errors.email && <p className="text-red-500 text-xs md:col-span-2">{errors.email}</p>}
                        </CardContent>
                    </Card>

                    {/* Shipping Method */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Shipping Method</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Button
                                    type="button"
                                    variant={formData.shippingMethod === 'PICKUP' ? 'default' : 'outline'}
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => setFormData({ ...formData, shippingMethod: 'PICKUP' })}
                                >
                                    <Store className="h-5 w-5" />
                                    Store Pickup
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.shippingMethod === '7-11' ? 'default' : 'outline'}
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => setFormData({ ...formData, shippingMethod: '7-11' })}
                                >
                                    <MapPin className="h-5 w-5" />
                                    7-11 Pickup
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.shippingMethod === 'DELIVERY' ? 'default' : 'outline'}
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => setFormData({ ...formData, shippingMethod: 'DELIVERY' })}
                                >
                                    <Truck className="h-5 w-5" />
                                    Home Delivery
                                </Button>
                            </div>

                            {/* 7-11 Logic */}
                            {formData.shippingMethod === '7-11' && (
                                <div className="bg-primary/5 p-4 rounded-md border border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-sm">7-11 Store Details</h4>
                                        <a
                                            href="https://emap.pcsc.com.tw/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 underline"
                                        >
                                            Find Store Map
                                        </a>
                                    </div>
                                    <Input
                                        placeholder="Store ID (e.g. 123456)"
                                        required
                                        value={formData.sevenElevenStoreId}
                                        onChange={e => setFormData({ ...formData, sevenElevenStoreId: e.target.value })}
                                        data-testid="checkout-store-id"
                                    />
                                    <Input
                                        placeholder="Store Name / Address"
                                        required
                                        value={formData.sevenElevenAddress}
                                        onChange={e => setFormData({ ...formData, sevenElevenAddress: e.target.value })}
                                        data-testid="checkout-store-address"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Please copy the Store ID and Address from the map link above.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Special Request */}
                    <Card className="md:col-span-2">
                        <CardContent className="pt-6">
                            <Input
                                placeholder="Special Requests (Allergies, Notes...)"
                                value={formData.specialRequests}
                                onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                            />
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="md:col-span-2">
                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting} data-testid="checkout-submit">
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Order'}
                            - ${total}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
