'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, ChevronDown, ArrowLeft, Clock, Package, CheckCircle, XCircle, Download } from 'lucide-react'
import Link from 'next/link'
import { exportSalesReport } from '@/lib/export-sales'

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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: '待處理', bg: 'bg-[#FF9500]/10', text: 'text-[#B36A00]' },
    processing: { label: '處理中', bg: 'bg-[#007AFF]/10', text: 'text-[#0055B3]' },
    completed: { label: '已完成', bg: 'bg-[#34C759]/10', text: 'text-[#1A7A30]' },
    cancelled: { label: '已取消', bg: 'bg-[#FF3B30]/10', text: 'text-[#B32200]' },
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
                    <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-ink-tertiary text-[15px]">載入中...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <div className="bg-white rounded-xl shadow-card border border-black/[0.04] p-8 text-center">
                    <XCircle className="w-10 h-10 text-[#FF3B30] mx-auto mb-4" />
                    <h2 className="text-[20px] font-semibold text-ink-primary mb-2">載入失敗</h2>
                    <p className="text-[15px] text-ink-tertiary mb-6">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="px-5 py-2.5 bg-ink-primary text-ink-inverse rounded-lg hover:bg-ink-secondary transition-colors text-[15px] font-semibold"
                    >
                        重試
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="py-2">
            <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface-base hover:bg-[#EBEBED] rounded-lg transition-colors text-ink-primary text-[15px] font-medium mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                返回儀表板
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-primary">訂單管理</h1>
                    <p className="text-[17px] text-ink-tertiary mt-1">
                        共 {orders.length} 筆訂單
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => exportSalesReport(orders)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#34C759] hover:bg-[#2DB84E] rounded-lg transition-colors text-white text-[15px] font-semibold"
                    >
                        <Download className="h-4 w-4" />
                        匯出報表
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-base hover:bg-[#EBEBED] rounded-lg transition-colors text-ink-primary text-[15px] font-medium"
                    >
                        <RefreshCw className="h-4 w-4" />
                        刷新
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-card border border-black/[0.04] p-16 text-center">
                    <Package className="w-10 h-10 text-ink-disabled mx-auto mb-4" />
                    <p className="text-ink-tertiary text-[17px]">目前沒有訂單</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((order) => {
                        const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                        const items: any[] = typeof order.items === 'string'
                            ? JSON.parse(order.items)
                            : (order.items || [])

                        return (
                            <div key={order.id} className="bg-white rounded-xl p-5 shadow-card border border-black/[0.04] hover:shadow-hover transition-shadow duration-200">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5">
                                    <div>
                                        <h3 className="text-[20px] font-semibold text-ink-primary mb-1">{order.customer_name}</h3>
                                        <p className="text-[15px] text-ink-secondary">{order.customer_email}</p>
                                        <p className="text-[15px] text-ink-secondary">{order.customer_phone}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[32px] font-bold text-brand-500 leading-[1.2] tracking-[-0.02em] mb-1">
                                            ${Number(order.total).toFixed(0)}
                                        </p>
                                        <p className="text-[13px] text-ink-disabled">
                                            {new Date(order.created_at).toLocaleString('zh-TW')}
                                        </p>
                                    </div>
                                </div>

                                {/* Delivery */}
                                <div className="mb-4 p-4 bg-cream-100 rounded-lg">
                                    <p className="text-[13px] font-semibold text-ink-primary mb-1">📍 取貨門市</p>
                                    <p className="text-[15px] text-ink-secondary">{order.delivery_address}</p>
                                </div>

                                {/* Special Instructions */}
                                {order.special_instructions && (
                                    <div className="mb-4 p-4 bg-[#FF9500]/5 border border-[#FF9500]/15 rounded-lg">
                                        <p className="text-[13px] font-semibold text-ink-primary mb-1">📝 備註</p>
                                        <p className="text-[15px] text-ink-secondary">{order.special_instructions}</p>
                                    </div>
                                )}

                                {/* Status + ID */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] font-semibold text-ink-tertiary">狀態：</span>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`px-2.5 py-0.5 border-0 rounded-full text-[11px] font-semibold tracking-[0.06em] ${statusConf.bg} ${statusConf.text} cursor-pointer focus:ring-2 focus:ring-brand-500/15 focus:outline-none`}
                                        >
                                            <option value="pending">⏳ 待處理</option>
                                            <option value="processing">📦 處理中</option>
                                            <option value="completed">✅ 已完成</option>
                                            <option value="cancelled">❌ 已取消</option>
                                        </select>
                                    </div>
                                    <span className="text-[11px] text-ink-disabled font-mono tracking-[0.06em]">
                                        #{order.id.split('-')[0].toUpperCase()}
                                    </span>
                                </div>

                                {/* Items */}
                                <details className="mt-4 group">
                                    <summary className="cursor-pointer text-[15px] text-brand-500 font-medium hover:text-brand-600 flex items-center gap-1 transition-colors">
                                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                                        查看訂單明細 ({items.length} 項商品)
                                    </summary>
                                    <div className="mt-3 rounded-lg overflow-hidden border border-black/[0.04]">
                                        {items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-[15px] py-4 px-4 border-b border-black/[0.04] last:border-0 hover:bg-surface-base/50">
                                                <div>
                                                    <span className="font-medium text-ink-primary">{item.name}</span>
                                                    <span className="text-ink-tertiary ml-2">× {item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-ink-primary">
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
