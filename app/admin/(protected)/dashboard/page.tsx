'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Plus, TrendingUp, DollarSign, AlertCircle, Clock } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  pendingOrders: number
  topProducts: Array<{ name: string; count: number; revenue: number }>
}

interface LowStockProduct {
  id: string
  name: string
  stock: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    topProducts: []
  })
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!orders) { setLoading(false); return }

      const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.total), 0)
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = orders.filter((o: any) => o.created_at.startsWith(today))
      const todayRevenue = todayOrders.reduce((sum: number, order: any) => sum + Number(order.total), 0)
      const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length

      const productSales: Record<string, { count: number; revenue: number }> = {}
      orders.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const name = item.name || 'Unknown'
            if (!productSales[name]) productSales[name] = { count: 0, revenue: 0 }
            productSales[name].count += item.quantity || 1
            productSales[name].revenue += (item.price || 0) * (item.quantity || 1)
          })
        }
      })

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setStats({ totalRevenue, todayRevenue, totalOrders: orders.length, pendingOrders, topProducts })

      const { data: lowStock } = await supabase
        .from('products')
        .select('id, name, stock')
        .lte('stock', 5)
        .eq('is_available', true)
        .order('stock', { ascending: true })

      if (lowStock) setLowStockProducts(lowStock as LowStockProduct[])
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="py-2">
      {/* Header */}
      <div className="mb-10">
        <h1 style={{ color: '#1D1D1F', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>儀表板</h1>
        <p style={{ color: '#6E6E73', fontSize: '17px', marginTop: '4px' }}>歡迎回來，這是今天的營運概況</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="mb-10 bg-gradient-to-r from-[#FF9500] to-[#FF9500]/90 rounded-xl p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-lg p-2.5 shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[20px] font-semibold text-white mb-3">庫存不足警告</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-3.5 flex justify-between items-center">
                    <span className="font-semibold text-white text-[15px]">{product.name}</span>
                    <span className="bg-white text-[#B36A00] px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.06em]">
                      剩餘 {product.stock} 件
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <Link
          href="/admin/products"
          className="group bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] rounded-xl p-7 shadow-card hover:scale-[1.02] transition-transform duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-semibold text-white mb-1">商品管理</h3>
              <p className="text-white/70 text-[13px]">查看、編輯、刪除商品</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 group-hover:bg-white/30 transition-colors">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/products/new"
          className="group bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] rounded-xl p-7 shadow-card hover:scale-[1.02] transition-transform duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-semibold text-white mb-1">新增商品</h3>
              <p className="text-white/70 text-[13px]">上傳新商品到商店</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 group-hover:bg-white/30 transition-colors">
              <Plus className="w-7 h-7 text-white" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="group bg-gradient-to-br from-[#34C759] to-[#30D158] rounded-xl p-7 shadow-card hover:scale-[1.02] transition-transform duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-semibold text-white mb-1">訂單管理</h3>
              <p className="text-white/70 text-[13px]">查看和處理客戶訂單</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 group-hover:bg-white/30 transition-colors">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white rounded-xl p-5 shadow-card border border-black/[0.04] hover:shadow-hover transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#34C759]/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#34C759]" />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-ink-tertiary tracking-[0.06em] uppercase mb-1.5">總營收</p>
          <p className="text-[32px] font-bold text-ink-primary leading-[1.2] tracking-[-0.02em]">${stats.totalRevenue.toFixed(0)}</p>
          <p className="text-[13px] text-ink-disabled mt-1">累計銷售</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-card border border-black/[0.04] hover:shadow-hover transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#34C759]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#34C759]" />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-ink-tertiary tracking-[0.06em] uppercase mb-1.5">今日營收</p>
          <p className="text-[32px] font-bold text-ink-primary leading-[1.2] tracking-[-0.02em]">${stats.todayRevenue.toFixed(0)}</p>
          <p className="text-[13px] text-ink-disabled mt-1">今天的銷售</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-card border border-black/[0.04] hover:shadow-hover transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#007AFF]/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#007AFF]" />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-ink-tertiary tracking-[0.06em] uppercase mb-1.5">總訂單數</p>
          <p className="text-[32px] font-bold text-ink-primary leading-[1.2] tracking-[-0.02em]">{stats.totalOrders}</p>
          <p className="text-[13px] text-ink-disabled mt-1">累計訂單</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-card border border-black/[0.04] hover:shadow-hover transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FF9500]/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#FF9500]" />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-ink-tertiary tracking-[0.06em] uppercase mb-1.5">待處理</p>
          <p className="text-[32px] font-bold text-ink-primary leading-[1.2] tracking-[-0.02em]">{stats.pendingOrders}</p>
          <p className="text-[13px] text-ink-disabled mt-1">需要處理的訂單</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl p-6 shadow-card border border-black/[0.04]">
        <h3 className="text-[24px] font-semibold tracking-[-0.015em] text-ink-primary mb-5">熱銷商品 Top 5</h3>
        {stats.topProducts.length === 0 ? (
          <div className="text-center py-14">
            <Package className="w-10 h-10 text-ink-disabled mx-auto mb-3" />
            <p className="text-ink-tertiary text-[15px]">尚無銷售數據</p>
          </div>
        ) : (
          <div>
            {stats.topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-4 py-4 border-b border-black/[0.04] last:border-0 hover:bg-surface-base/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 text-ink-inverse rounded-lg font-bold text-[15px] shadow-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-primary text-[17px] truncate">{product.name}</p>
                  <p className="text-[13px] text-ink-tertiary">售出 {product.count} 件</p>
                </div>
                <p className="text-[24px] font-bold text-brand-500 shrink-0 tracking-[-0.015em]">${product.revenue.toFixed(0)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
