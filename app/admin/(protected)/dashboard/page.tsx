'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, Plus, TrendingUp, DollarSign, Loader2, AlertTriangle } from 'lucide-react'

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

      if (lowStock) {
        setLowStockProducts(lowStock as LowStockProduct[])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-xl font-bold">⚠️ 庫存不足警告</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product.id} className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
                <span className="font-semibold">{product.name}</span>
                <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                  剩餘 {product.stock} 件
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/products"
          className="bg-background border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                商品管理
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                查看、編輯、刪除商品
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </Link>

        <Link
          href="/admin/products/new"
          className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 hover:border-green-500 hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700">
                新增商品
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                上傳新商品到商店
              </p>
            </div>
            <Plus className="w-8 h-8 text-green-600" />
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-background border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">
                訂單管理
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                查看和處理客戶訂單
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">營運數據</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">總營收</h3>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.totalRevenue.toFixed(0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">累計銷售</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">今日營收</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.todayRevenue.toFixed(0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">今天的銷售</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">總訂單數</h3>
            <ShoppingCart className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalOrders}
          </p>
          <p className="text-xs text-gray-600 mt-1">累計訂單</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">待處理</h3>
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.pendingOrders}
          </p>
          <p className="text-xs text-gray-600 mt-1">需要處理的訂單</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-background border rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">熱銷商品 Top 5</h3>
        {stats.topProducts.length === 0 ? (
          <p className="text-gray-700 text-center py-8">尚無銷售數據</p>
        ) : (
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-700">
                      售出 {product.count} 件
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  ${product.revenue.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
