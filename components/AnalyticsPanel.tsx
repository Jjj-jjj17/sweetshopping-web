"use client";

import React, { useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Package, Activity } from 'lucide-react';

export function AnalyticsPanel() {
    const { orders } = useOrders();

    const metrics = useMemo(() => {
        const total = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Today's Revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(o => new Date(o.createdAt).getTime() >= today.getTime());
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Status Counts
        const statusCounts: Record<string, number> = {};
        orders.forEach(o => {
            statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });

        // Top Products
        const productSales: Record<string, number> = {};
        orders.forEach(o => {
            o.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });
        const sortedProducts = Object.entries(productSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return { total, todayRevenue, statusCounts, sortedProducts, totalOrders: orders.length };
    }, [orders]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.total.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime sales</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.todayRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Since midnight</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Lifetime orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Pending processing</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top 5 Bestsellers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {metrics.sortedProducts.map(([name, qty], idx) => (
                                <div key={name} className="flex items-center">
                                    <div className="w-8 font-bold text-muted-foreground">#{idx + 1}</div>
                                    <div className="flex-1 font-medium">{name}</div>
                                    <div className="font-bold">{qty} sold</div>
                                </div>
                            ))}
                            {metrics.sortedProducts.length === 0 && <p className="text-muted-foreground text-sm">No sales data yet.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(metrics.statusCounts).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between text-sm">
                                    <span className="font-medium bg-secondary px-2 py-1 rounded-md min-w-[100px] text-center">{status}</span>
                                    <div className="flex-1 mx-4 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(count / metrics.totalOrders) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-bold w-12 text-right">{Math.round((count / metrics.totalOrders) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
