"use client";

import React, { useState } from 'react';
import { useOrders } from '@/context/OrderContext';
import { LoginScreen } from '@/components/LoginScreen';
import { OrderCard } from '@/components/OrderCard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CreateOrderModal } from '@/components/CreateOrderModal';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Search, PlusCircle, LogOut, BarChart3, Package, ShoppingCart, Plus } from 'lucide-react';
import { OrderStatus } from '@/types';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading, orders, logout, warning } = useOrders();

  const [view, setView] = useState<'KITCHEN' | 'SETTINGS' | 'ANALYTICS'>('KITCHEN');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-bold text-primary">Loading Secure Environment...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    // 1. Text Search (Fuzzy-ish)
    const searchLower = search.toLowerCase();
    const matchText =
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower);

    if (!matchText) return false;

    // 2. Status Tab
    const isCompleted = ['COMPLETED', 'CANCELLED'].includes(order.status);
    if (statusFilter === 'ACTIVE') return !isCompleted;
    if (statusFilter === 'ARCHIVED') return isCompleted;

    return true;
  });

  // Sort: Active by Date (Oldest PENDING first), Archived by Date (Newest first)
  filteredOrders.sort((a, b) => {
    if (statusFilter === 'ACTIVE') {
      // High priority: Pending/Paid/Processing -> Newest First? Or Oldest first?
      // Kitchen usually wants "Oldest Active" first to clear backlog.
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // Archive: Newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const activeCount = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;

  return (
    <main className="min-h-screen bg-secondary/20 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
            SB
          </div>
          <h1 className="font-bold text-lg hidden md:block">SweetShop Secure</h1>
        </div>

        <div className="flex items-center gap-2">
          {warning && (
            <div className="hidden md:flex px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold border border-yellow-200">
              ⚠ {warning}
            </div>
          )}

          <Button
            variant={view === 'KITCHEN' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('KITCHEN')}
          >
            Kitchen ({activeCount})
          </Button>
          <Button
            variant={view === 'ANALYTICS' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('ANALYTICS')}
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Analytics
          </Button>
          <Button
            variant={view === 'SETTINGS' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setView('SETTINGS')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl p-4 space-y-6">
        {/* Quick Access Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products"
            className="bg-background border-2 border-blue-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-blue-600">商品管理</h3>
                <p className="text-sm text-muted-foreground mt-1">查看、編輯、刪除商品</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </Link>

          <Link
            href="/admin/products/new"
            className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-5 hover:border-green-500 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-green-700">新增商品</h3>
                <p className="text-sm text-muted-foreground mt-1">上傳新商品到商店</p>
              </div>
              <Plus className="w-8 h-8 text-green-600" />
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-background border-2 border-purple-200 rounded-lg p-5 hover:border-purple-400 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-purple-600">訂單管理</h3>
                <p className="text-sm text-muted-foreground mt-1">查看和處理客戶訂單</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </Link>
        </div>

        {view === 'KITCHEN' && (
          <>
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Customer, #ID..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <div className="flex bg-secondary p-1 rounded-lg">
                  <button
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-4 py-1 text-sm rounded-md transition-all ${statusFilter === 'ACTIVE' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('ARCHIVED')}
                    className={`px-4 py-1 text-sm rounded-md transition-all ${statusFilter === 'ARCHIVED' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
                  >
                    History
                  </button>
                </div>

                <Button className="ml-auto gap-2" onClick={() => setIsCreateModalOpen(true)}>
                  <PlusCircle className="h-4 w-4" /> New Order
                </Button>
              </div>
            </div>

            {/* Grid */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p>No orders found.</p>
                {search && <Button variant="link" onClick={() => setSearch('')}>Clear Search</Button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'SETTINGS' && (
          <div className="max-w-2xl mx-auto">
            <SettingsPanel />
          </div>
        )}

        {view === 'ANALYTICS' && (
          <AnalyticsPanel />
        )}
      </div>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </main>
  );
}
