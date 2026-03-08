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

      const pendingOrders = orders.filter((o: any) =>
        o.status === 'pending' || o.status === 'processing'
      ).length

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

      // Fetch low stock products
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
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">儀表板</h1>
        <p className="text-lg text-gray-500">歡迎回來，這是今天的營運概況</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="mb-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 shadow-apple-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">庫存不足警告</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex justify-between items-center">
                    <span className="font-semibold text-white">{product.name}</span>
                    <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link
          href="/admin/products"
          className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-apple-lg hover:shadow-apple-hover transform hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">商品管理</h3>
              <p className="text-blue-100 text-sm">查看、編輯、刪除商品</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 group-hover:bg-white/30 transition-colors">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/products/new"
          className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 shadow-apple-lg hover:shadow-apple-hover transform hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">新增商品</h3>
              <p className="text-green-100 text-sm">上傳新商品到商店</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 group-hover:bg-white/30 transition-colors">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 shadow-apple-lg hover:shadow-apple-hover transform hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">訂單管理</h3>
              <p className="text-purple-100 text-sm">查看和處理客戶訂單</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 group-hover:bg-white/30 transition-colors">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-apple border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 rounded-xl p-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">總營收</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-400">累計銷售</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-apple border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 rounded-xl p-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">今日營收</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">${stats.todayRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-400">今天的銷售</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-apple border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 rounded-xl p-3">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">總訂單數</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</p>
          <p className="text-xs text-gray-400">累計訂單</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-apple border border-gray-100 hover:shadow-apple-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 rounded-xl p-3">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">待處理</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingOrders}</p>
          <p className="text-xs text-gray-400">需要處理的訂單</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-8 shadow-apple border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">熱銷商品 Top 5</h3>
        {stats.topProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-2xl p-8 inline-block">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">尚無銷售數據</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-4 p-5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl font-bold text-lg shadow-md shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-lg truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">售出 {product.count} 件</p>
                </div>
                <p className="text-2xl font-bold text-primary shrink-0">${product.revenue.toFixed(0)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
