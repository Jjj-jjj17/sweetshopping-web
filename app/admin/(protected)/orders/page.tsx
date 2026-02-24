'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, RefreshCw, ChevronDown, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Order {
    id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    delivery_address: string
    total: number
    status: string
    created_at: string
    special_instructions?: string
    items: any[]
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-900' },
    processing: { label: '處理中', color: 'bg-blue-100 text-blue-900' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-900' },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-900' },
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        setLoading(true)
        setError(null)
        try {
            console.log('Fetching orders...')

            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            console.log('Orders fetch result:', { count: data?.length, error: fetchError })

            if (fetchError) {
                console.error('Fetch error:', fetchError)
                setError(fetchError.message)
            } else {
                setOrders(data || [])
            }
        } catch (err) {
            console.error('Catch error:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    async function updateOrderStatus(orderId: string, newStatus: string) {
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (updateError) {
            alert('Failed to update status: ' + updateError.message)
        } else {
            // Optimistic update
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            )
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Orders</h2>
                        <p className="text-red-700 mb-4">{error}</p>
                        <Button onClick={fetchOrders} variant="destructive">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div>
            <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-secondary text-gray-800 rounded-lg hover:bg-secondary/80 transition text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                返回儀表板
            </Link>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">訂單管理</h1>
                    <p className="text-sm text-gray-700 mt-1">
                        共 {orders.length} 筆訂單
                    </p>
                </div>
                <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    刷新
                </Button>
            </div>

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        目前沒有訂單
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
                        const items: any[] = typeof order.items === 'string'
                            ? JSON.parse(order.items)
                            : (order.items || [])

                        return (
                            <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    {/* Top Row: Customer + Total */}
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{order.customer_name}</h3>
                                            <p className="text-sm text-gray-700">{order.customer_email}</p>
                                            <p className="text-sm text-gray-700">{order.customer_phone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary">
                                                ${Number(order.total).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(order.created_at).toLocaleString('zh-TW')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="mb-4 p-3 bg-secondary/30 rounded-md">
                                        <p className="text-sm font-semibold text-gray-900 mb-1">取貨門市：</p>
                                        <p className="text-sm text-gray-800">{order.delivery_address}</p>
                                    </div>

                                    {/* Special Instructions */}
                                    {order.special_instructions && (
                                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <p className="text-sm font-semibold text-gray-900 mb-1">備註：</p>
                                            <p className="text-sm text-gray-800">{order.special_instructions}</p>
                                        </div>
                                    )}

                                    {/* Status + Order ID */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">狀態：</span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className={`px-3 py-1.5 border rounded-md text-sm font-medium ${statusInfo.color}`}
                                            >
                                                <option value="pending">待處理</option>
                                                <option value="processing">處理中</option>
                                                <option value="completed">已完成</option>
                                                <option value="cancelled">已取消</option>
                                            </select>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            #{order.id.split('-')[0].toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Expandable Items */}
                                    <details className="mt-4 group">
                                        <summary className="cursor-pointer text-sm text-primary hover:underline flex items-center gap-1">
                                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                                            查看訂單明細 ({items.length} 項商品)
                                        </summary>
                                        <div className="mt-3 divide-y border rounded-md overflow-hidden">
                                            {items.map((item: any, idx: number) => (
                                                <div key={idx} className="p-3 flex justify-between items-center text-sm bg-background">
                                                    <div>
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                                                    </div>
                                                    <span className="font-semibold">
                                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
