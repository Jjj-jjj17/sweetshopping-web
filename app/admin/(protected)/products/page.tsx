"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { compressImage } from '@/utils/imageCompression';
import { Loader2, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Dessert',
        image: null as File | null,
    });
    const [uploading, setUploading] = useState(false);

    // Fetch Products
    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data as Product[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle Form Submit
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;

        setUploading(true);
        let imageUrl = '';

        // 1. Upload Image
        if (formData.image) {
            try {
                const compressed = await compressImage(formData.image);
                const fileName = `${Date.now()}-${compressed.name}`;

                const { data, error } = await supabase.storage
                    .from('products')
                    .upload(fileName, compressed);

                if (error) {
                    console.error(error);
                    alert("Image Upload Failed");
                    setUploading(false);
                    return;
                }

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            } catch (err) {
                console.error(err);
                setUploading(false);
                return;
            }
        }

        // 2. Insert Record
        const { error: dbError } = await supabase
            .from('products')
            .insert({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                image_url: imageUrl,
                stock_status: 'IN_STOCK',
                is_active: true
            });

        if (dbError) {
            alert("Failed to create product: " + dbError.message);
        } else {
            // Reset Form
            setFormData({ name: '', description: '', price: '', category: 'Dessert', image: null });
            fetchProducts(); // Refresh list
        }
        setUploading(false);
    };

    // Toggle Stock (Mom-Friendly)
    const toggleStock = async (product: Product) => {
        const newStatus = product.stock_status === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';

        // Optimistic Update
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_status: newStatus } : p));

        const { error } = await supabase
            .from('products')
            .update({ stock_status: newStatus })
            .eq('id', product.id);

        if (error) {
            alert("Update failed, reverting...");
            fetchProducts();
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        await supabase.from('products').update({ is_active: false }).eq('id', id); // Soft Delete
        fetchProducts();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Product Manager</h2>
                <Button variant="outline" onClick={fetchProducts} size="sm">Refresh</Button>
            </div>

            {/* Add Product Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Dessert</CardTitle>
                    <CardDescription>Upload a photo and details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <Input
                                    placeholder="Product Name (e.g. Vanilla Custard)"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Description (Optional)"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        placeholder="Price"
                                        className="pl-7"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Dessert">Select Category</option>
                                    <option value="Cake">Cake</option>
                                    <option value="Cookie">Cookie</option>
                                    <option value="Bread">Bread</option>
                                    <option value="Gift Box">Gift Box</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Image Upload Area */}
                            <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={e => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                />
                                {formData.image ? (
                                    <div className="text-sm font-medium text-primary">
                                        {formData.image.name}
                                        <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-xs text-muted-foreground">Click to upload photo<br />(Max 5MB)</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <Button type="submit" disabled={uploading} className="w-full">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            {uploading ? 'Processing...' : 'Create Product'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                    <Card key={product.id} className={`overflow-hidden ${product.stock_status === 'OUT_OF_STOCK' ? 'opacity-75 grayscale' : ''}`}>
                        <div className="aspect-video relative bg-secondary">
                            {product.image_url ? (
                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                            )}

                            <div className="absolute top-2 right-2">
                                <Button
                                    size="sm"
                                    variant={product.stock_status === 'IN_STOCK' ? 'default' : 'secondary'}
                                    className={product.stock_status === 'IN_STOCK' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}
                                    onClick={() => toggleStock(product)}
                                >
                                    {product.stock_status === 'IN_STOCK' ? 'IN STOCK' : 'SOLD OUT'}
                                </Button>
                            </div>
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base flex justify-between">
                                {product.name}
                                <div className="flex flex-col items-end">
                                    <span>${product.price}</span>
                                    {product.category && <span className="text-xs text-muted-foreground border px-1 rounded">{product.category}</span>}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2 h-10">{product.description}</p>
                            <Button variant="ghost" size="sm" className="w-full mt-2 text-destructive hover:bg-red-50 hover:text-destructive" onClick={() => deleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
