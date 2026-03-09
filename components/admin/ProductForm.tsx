"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ImageUpload } from './ImageUpload';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
    initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        category: initialData?.category || 'Dessert',
        stock: initialData?.stock || 0,
        images: initialData?.images || [],
        is_available: initialData !== undefined ? initialData.is_available : true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const productPayload = {
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            category: formData.category,
            stock: Number(formData.stock),
            images: formData.images,
            is_available: formData.is_available,
            updated_at: new Date().toISOString()
        };

        if (initialData?.id) {
            const { error } = await supabase
                .from('products')
                .update(productPayload)
                .eq('id', initialData.id);

            if (error) {
                alert(`Error saving product: ${error.message}`);
                setSaving(false);
                return;
            }
        } else {
            const { error } = await supabase
                .from('products')
                .insert([productPayload]);

            if (error) {
                alert(`Error creating product: ${error.message}`);
                setSaving(false);
                return;
            }
        }

        router.push('/admin/products');
        router.refresh();
    };

    const inputStyle = { backgroundColor: '#FFFFFF', color: '#1D1D1F', borderColor: 'rgba(0,0,0,0.12)' };
    const labelStyle = { color: '#1D1D1F' };
    const cardStyle = { backgroundColor: '#FFFFFF', color: '#1D1D1F' };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] text-[15px] font-medium rounded-lg transition-colors duration-150"
                    >
                        ← 返回
                    </Link>
                    <h1 style={{ color: '#1D1D1F', fontSize: '24px', fontWeight: 600 }}>
                        {initialData ? '編輯商品' : '新增商品'}
                    </h1>
                </div>
                <Button type="submit" disabled={saving} className="bg-[#FF6B6B] hover:bg-[#E85555] text-white px-5 py-2.5 rounded-lg font-semibold">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? '儲存中...' : '儲存商品'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-4 p-6 rounded-xl border border-black/[0.04] shadow-card" style={cardStyle}>
                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block tracking-wide" style={labelStyle}>商品名稱 *</label>
                            <input
                                required
                                placeholder="例如：招牌檸檬塔"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block tracking-wide" style={labelStyle}>商品描述 *</label>
                            <textarea
                                className="w-full min-h-[120px] px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all leading-relaxed"
                                placeholder="描述商品特色..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 p-6 rounded-xl border border-black/[0.04] shadow-card" style={cardStyle}>
                        <h3 className="text-[17px] font-semibold" style={labelStyle}>商品圖片</h3>
                        <ImageUpload
                            images={formData.images}
                            onChange={(images) => setFormData({ ...formData, images })}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="space-y-4 p-6 rounded-xl border border-black/[0.04] shadow-card" style={cardStyle}>
                        <h3 className="text-[17px] font-semibold" style={labelStyle}>價格與庫存</h3>
                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block tracking-wide" style={labelStyle}>價格 *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5" style={{ color: '#6E6E73' }}>$</span>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-7 px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block tracking-wide" style={labelStyle}>庫存數量 *</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 p-6 rounded-xl border border-black/[0.04] shadow-card" style={cardStyle}>
                        <h3 className="text-[17px] font-semibold" style={labelStyle}>分類設定</h3>
                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block tracking-wide" style={labelStyle}>商品分類</label>
                            <select
                                className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="Dessert">Dessert</option>
                                <option value="Cake">Cake</option>
                                <option value="Cookie">Cookie</option>
                                <option value="Bread">Bread</option>
                                <option value="Gift Box">Gift Box</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#F5F5F7] transition-colors">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                                    checked={formData.is_available}
                                    onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                                />
                                <span className="text-[15px] font-medium" style={labelStyle}>上架中（顯示於商店）</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
