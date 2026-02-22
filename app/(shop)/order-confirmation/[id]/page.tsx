"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Truck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    productId: string;
    image?: string;
}

interface OrderDetails {
    id: string;
    customer_name: string;
    customer_email: string;
    delivery_address: string;
    items: OrderItem[];
    total: number;
    status: string;
    created_at: string;
}

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (data && !error) {
                setOrder(data as OrderDetails);
            }
            setLoading(false);
        }

        fetchOrder();
    }, [id]);

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                <p className="text-muted-foreground mb-8">We couldn't find the details for this order. It might be invalid or deleted.</p>
                <Link href="/"><Button>Back to Shop</Button></Link>
            </div>
        );
    }

    // Parse items if they accidentally come back as an unparsed string
    const items: OrderItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-10">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Order Confirmed!</h1>
                <p className="text-lg text-muted-foreground">
                    Thank you, <span className="font-semibold text-foreground">{order.customer_name}</span>. Your order has been received.
                </p>
                <div className="bg-secondary px-4 py-2 rounded-md mt-2 font-mono text-sm inline-block">
                    Order #{order.id.split('-')[0].toUpperCase()}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6 flex gap-4">
                        <Package className="h-6 w-6 text-primary shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Items Ordered</h3>
                            <p className="text-sm text-muted-foreground">{items.length} unique items</p>
                            <p className="font-bold text-lg mt-2">${Number(order.total).toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex gap-4">
                        <Truck className="h-6 w-6 text-primary shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Delivery Info</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{order.delivery_address}</p>
                            <p className="text-sm text-muted-foreground mt-1">{order.customer_email}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Line Items */}
            <Card className="mb-10 overflow-hidden">
                <div className="bg-secondary/50 px-6 py-4 border-b">
                    <h2 className="font-semibold text-lg">Order Summary</h2>
                </div>
                <div className="divide-y">
                    {items.map((item, idx) => (
                        <div key={idx} className="p-6 flex justify-between items-center sm:items-start">
                            <div className="flex-1">
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <div className="font-bold">
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-secondary/10 px-6 py-4 flex justify-between items-center border-t">
                    <span className="font-semibold">Total Paid</span>
                    <span className="text-xl font-bold text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
            </Card>

            <div className="flex justify-center">
                <Link href="/">
                    <Button variant="outline" size="lg">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
                    </Button>
                </Link>
            </div>
        </div>
    );
}
