"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Truck, MapPin, Store, ArrowRight, Home } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            // First try to find it in the public 'orders' table if RLS allows specific row reading?
            // Actually, RLS usually blocks reading unless you own it.
            // Since we don't have user accounts for guests, we might not be able to fetch it back easily 
            // WITHOUT a secure token or if functionality allows "Insert but not Select".
            // However, typical "Thank You" pages might rely on local state OR we open up reading by ID temporarily?
            // Alternatively, for this MVP, if we can't read it back due to RLS, we display a generic success.
            // But let's try to fetch it. If it fails, we show a generic "Success" message.

            // To make this robust for a "Guest", normally we'd return the created Order object in the Checkout response 
            // and pass it via query params or state. But passing via URL is cleaner if we can fetch.

            // Assumption: RLS might block this.
            // Workaround: We will try. If error, we show "Order Placed Successfully" without details.

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (data) {
                // Map DB keys to App keys if needed - but our context handles this usually.
                // But wait, our Types define camelCase (customerName) but DB is snake_case (customer_name).
                // We need a mapper here since we are bypassing the Context/Reducer usually used.
                // OR we just use the raw data and cast gently or map it manually.
                const mappedOrder: Order = {
                    id: data.id,
                    customerName: data.customer_name,
                    customerPhone: data.customer_phone,
                    customerEmail: data.customer_email,
                    shippingMethod: data.shipping_method,
                    sevenElevenAddress: data.seven_eleven_address,
                    sevenElevenStoreId: data.seven_eleven_store_id,
                    items: data.items,
                    specialRequests: data.special_requests,
                    status: data.status,
                    totalAmount: data.total_amount,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at
                };
                setOrder(mappedOrder);
            } else {
                console.log("Could not fetch order details (likely RLS)", error);
            }
            setLoading(false);
        };

        fetchOrder();
    }, [orderId]);

    // Shipping Icon Logic
    const getShippingIcon = (method: string) => {
        if (method === '7-11') return <Store className="h-6 w-6 text-orange-500" />;
        if (method === 'DELIVERY') return <Truck className="h-6 w-6 text-purple-500" />;
        return <Store className="h-6 w-6 text-blue-500" />;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-secondary/10 p-4 md:p-8 flex items-center justify-center">
            <Card className="max-w-xl w-full text-center p-6 shadow-lg">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
                <p className="text-muted-foreground mb-8">
                    Your order has been placed successfully.<br />
                    We have sent a confirmation to your email.
                </p>

                {order ? (
                    <div className="text-left bg-secondary/20 p-4 rounded-lg mb-8 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-semibold text-sm">Order ID</span>
                            <span className="font-mono text-xs">{order.id}</span>
                        </div>

                        <div className="flex items-start gap-3">
                            {getShippingIcon(order.shippingMethod)}
                            <div className="text-sm">
                                <p className="font-bold">{order.shippingMethod} Shipping</p>
                                {order.shippingMethod === '7-11' && (
                                    <p className="text-muted-foreground">
                                        Store: {order.sevenElevenStoreId}<br />
                                        {order.sevenElevenAddress}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-2 mt-2">
                            <p className="font-semibold text-sm mb-2">Items</p>
                            <ul className="space-y-1">
                                {order.items.map((item: any, idx: number) => (
                                    <li key={idx} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>${(item.price || 0) * item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-between font-bold text-lg border-t mt-2 pt-2">
                                <span>Total</span>
                                <span>${order.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-8 text-sm">
                        Note: Order details could not be retrieved securely, but rest assured our kitchen has received it!
                    </div>
                )}

                <div className="space-y-3">
                    <Link href="/">
                        <Button className="w-full" size="lg">
                            <Home className="mr-2 h-4 w-4" /> Return to Home
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
