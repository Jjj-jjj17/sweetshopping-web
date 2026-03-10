"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        instructions: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const inputStyle = { backgroundColor: '#FFFFFF', color: '#1D1D1F', borderColor: 'rgba(0,0,0,0.12)' };
    const labelStyle = { color: '#1D1D1F' } as const;

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <h1 style={{ color: '#1D1D1F', fontSize: '24px', fontWeight: 700 }}>購物車是空的</h1>
                <p className="mb-6 mt-2" style={{ color: '#6E6E73', fontSize: '15px' }}>請先將商品加入購物車再結帳。</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2.5 rounded-xl text-[15px] font-semibold transition-colors"
                    style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                >
                    返回商店
                </button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const schema = z.object({
                name: z.string().min(2, "請輸入名字"),
                email: z.string().email("請輸入有效的 Email"),
                phone: z.string().min(8, "請輸入有效的電話號碼"),
                address: z.string().min(10, "請輸入完整的取貨門市地址"),
            });
            schema.parse(formData);
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(fieldErrors);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const productIds = items.map(i => i.productId);
            const { data: stockData, error: stockError } = await supabase
                .from('products')
                .select('id, name, stock, is_available')
                .in('id', productIds);

            if (stockError) throw stockError;

            for (const cartItem of items) {
                const dbProduct = stockData?.find((p: { id: string, name: string, stock: number, is_available: boolean }) => p.id === cartItem.productId);
                if (!dbProduct || !dbProduct.is_available) {
                    throw new Error(`${cartItem.name} 已下架。`);
                }
                if (dbProduct.stock < cartItem.quantity) {
                    throw new Error(`${cartItem.name} 庫存不足，僅剩 ${dbProduct.stock} 件。`);
                }
            }

            const insertResponse = await supabase
                .from('orders')
                .insert({
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    delivery_address: formData.address,
                    items: items,
                    total: total,
                    status: 'pending',
                    special_instructions: formData.instructions
                })
                .select('id')
                .single();

            const { data: orderData, error: orderError } = insertResponse;

            if (orderError) throw orderError;
            if (!orderData || !orderData.id) {
                throw new Error("No order ID returned from database.");
            }

            for (const cartItem of items) {
                const dbProduct = stockData?.find((p: { id: string, name: string, stock: number, is_available: boolean }) => p.id === cartItem.productId);
                if (dbProduct) {
                    await supabase.from('products').update({
                        stock: dbProduct.stock - cartItem.quantity
                    }).eq('id', cartItem.productId);
                }
            }

            clearCart();
            toast.success("訂單已送出！");

            setTimeout(() => {
                router.push(`/order-confirmation/${orderData.id}`);
            }, 800);

        } catch (err: any) {
            console.error("Error:", err);
            toast.error(err.message || "訂單提交失敗，請聯繫客服。");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl" style={{ minHeight: '100vh' }}>
            <h1 style={{ color: '#1D1D1F', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }} className="mb-8">
                安全結帳
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    {/* Customer Details */}
                    <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#1D1D1F', fontSize: '20px', fontWeight: 600 }}>顧客資料</h2>
                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block" style={labelStyle}>姓名 *</label>
                            <input
                                placeholder="請輸入您的姓名"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all"
                                style={inputStyle}
                            />
                            {errors.name && <p className="text-[13px] mt-1" style={{ color: '#FF3B30' }}>{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[13px] font-semibold mb-1.5 block" style={labelStyle}>Email *</label>
                                <input
                                    placeholder="email@example.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all"
                                    style={inputStyle}
                                />
                                {errors.email && <p className="text-[13px] mt-1" style={{ color: '#FF3B30' }}>{errors.email}</p>}
                            </div>
                            <div>
                                <label className="text-[13px] font-semibold mb-1.5 block" style={labelStyle}>電話 *</label>
                                <input
                                    placeholder="0912-345-678"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all"
                                    style={inputStyle}
                                />
                                {errors.phone && <p className="text-[13px] mt-1" style={{ color: '#FF3B30' }}>{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#1D1D1F', fontSize: '20px', fontWeight: 600 }}>取貨資訊</h2>
                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block" style={labelStyle}>7-ELEVEN 取貨門市地址 *</label>
                            <textarea
                                placeholder="請輸入您附近的7-ELEVEN門市完整地址（例如：彰化縣彰化市中山路二段100號）"
                                required
                                rows={3}
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all leading-relaxed"
                                style={inputStyle}
                            />
                            <p className="text-[13px] mt-1" style={{ color: '#6E6E73' }}>
                                訂單將配送至您指定的7-ELEVEN門市，請確保地址完整正確
                            </p>
                            {errors.address && <p className="text-[13px] mt-1" style={{ color: '#FF3B30' }}>{errors.address}</p>}
                        </div>

                        <div>
                            <label className="text-[13px] font-semibold mb-1.5 block" style={labelStyle}>備註（選填）</label>
                            <textarea
                                placeholder="特殊需求或備註..."
                                rows={2}
                                value={formData.instructions}
                                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-lg text-[15px] border focus:ring-2 focus:ring-[#FF6B6B]/15 focus:border-[#FF6B6B] outline-none transition-all leading-relaxed"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full h-14 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-60"
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin h-5 w-5" /> 處理中...</>
                        ) : (
                            `確認下單 • $${total.toFixed(2)}`
                        )}
                    </button>
                </form>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="rounded-xl p-6 sticky top-24" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ color: '#1D1D1F', fontSize: '17px', fontWeight: 600 }} className="mb-4">訂單摘要</h2>
                        <div className="space-y-3 text-sm max-h-[400px] overflow-y-auto">
                            {items.map(item => (
                                <div key={item.productId} className="flex justify-between items-start gap-2 pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                    <div className="flex-1">
                                        <p className="font-semibold line-clamp-1" style={{ color: '#1D1D1F' }}>{item.name}</p>
                                        <p style={{ color: '#6E6E73', fontSize: '12px' }}>數量: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium whitespace-nowrap" style={{ color: '#1D1D1F' }}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <span className="font-bold text-lg" style={{ color: '#1D1D1F' }}>總計</span>
                            <span className="font-bold text-lg" style={{ color: '#FF6B6B' }}>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
