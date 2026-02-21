"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from './ImageUpload';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
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
            // Update
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
            // Insert
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

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="outline" size="icon" type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {initialData ? 'Edit Product' : 'Create Product'}
                    </h1>
                </div>
                <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Product'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-4 p-6 bg-card rounded-lg border shadow-sm">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Product Name *</label>
                            <Input
                                required
                                placeholder="E.g., Signature Lemon Tart"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description</label>
                            <textarea
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 leading-relaxed"
                                placeholder="Describe the product..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4 p-6 bg-card rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">Images</h3>
                        <ImageUpload
                            images={formData.images}
                            onChange={(images) => setFormData({ ...formData, images })}
                        />
                    </div>
                </div>

                {/* Sidebar Setup */}
                <div className="space-y-6">
                    <div className="space-y-4 p-6 bg-card rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">Pricing & Inventory</h3>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Price *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="pl-7"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Stock Quantity *</label>
                            <Input
                                required
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 p-6 bg-card rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">Organization</h3>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Category</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
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
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-secondary transition-colors">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={formData.is_available}
                                    onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                                />
                                <span className="text-sm font-medium">Active (Visible in shop)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
