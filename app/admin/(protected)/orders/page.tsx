'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, ChevronDown, ArrowLeft, Clock, Package, CheckCircle, XCircle } from 'lucide-react'
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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    pending: { label: '待處理', bg: 'bg-yellow-100', text: 'text-yellow-900', icon: Clock },
    processing: { label: '處理中', bg: 'bg-blue-500', text: 'text-white', icon: Package },
    completed: { label: '已完成', bg: 'bg-green-500', text: 'text-white', icon: CheckCircle },
    cancelled: { label: '已取消', bg: 'bg-red-500', text: 'text-white', icon: XCircle },
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
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (fetchError) {
                setError(fetchError.message)
            } else {
                setOrders(data || [])
            }
        } catch (err) {
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
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            )
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">載入中...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <div className="bg-white rounded-2xl shadow-apple border border-red-100 p-8 text-center">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">載入失敗</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
                    >
                        重試
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="py-4">
            <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600 font-medium mb-8 shadow-sm text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                返回儀表板
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">訂單管理</h1>
                    <p className="text-lg text-gray-500 mt-1">
                        共 {orders.length} 筆訂單
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-700 font-medium shadow-sm text-sm"
                >
                    <RefreshCw className="h-4 w-4" />
                    刷新
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-apple border border-gray-100 p-16 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">目前沒有訂單</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                        const StatusIcon = statusConf.icon
                        const items: any[] = typeof order.items === 'string'
                            ? JSON.parse(order.items)
                            : (order.items || [])

                        return (
                            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-apple border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
                                {/* Header: Customer + Total */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{order.customer_name}</h3>
                                        <p className="text-sm text-gray-600">{order.customer_email}</p>
                                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-3xl font-bold text-primary mb-1">
                                            ${Number(order.total).toFixed(0)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(order.created_at).toLocaleString('zh-TW')}
                                        </p>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="mb-4 p-4 bg-cream-100 rounded-xl">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">📍 取貨門市</p>
                                    <p className="text-sm text-gray-700">{order.delivery_address}</p>
                                </div>

                                {/* Special Instructions */}
                                {order.special_instructions && (
                                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <p className="text-sm font-semibold text-gray-900 mb-1">📝 備註</p>
                                        <p className="text-sm text-gray-700">{order.special_instructions}</p>
                                    </div>
                                )}

                                {/* Status + Order ID */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-gray-600">狀態：</span>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`px-4 py-2 border-0 rounded-full text-sm font-bold ${statusConf.bg} ${statusConf.text} cursor-pointer focus:ring-2 focus:ring-primary/30`}
                                        >
                                            <option value="pending">⏳ 待處理</option>
                                            <option value="processing">📦 處理中</option>
                                            <option value="completed">✅ 已完成</option>
                                            <option value="cancelled">❌ 已取消</option>
                                        </select>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">
                                        #{order.id.split('-')[0].toUpperCase()}
                                    </span>
                                </div>

                                {/* Expandable Items */}
                                <details className="mt-4 group">
                                    <summary className="cursor-pointer text-sm text-primary font-medium hover:text-primary/80 flex items-center gap-1 transition-colors">
                                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                                        查看訂單明細 ({items.length} 項商品)
                                    </summary>
                                    <div className="mt-3 divide-y border border-gray-100 rounded-xl overflow-hidden">
                                        {items.map((item: any, idx: number) => (
                                            <div key={idx} className="p-4 flex justify-between items-center text-sm bg-gray-50/50">
                                                <div>
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                    <span className="text-gray-500 ml-2">× {item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    ${(Number(item.price) * item.quantity).toFixed(0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
