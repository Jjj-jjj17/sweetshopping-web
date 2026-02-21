"use client";

import { ProductForm } from '@/components/admin/ProductForm';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
    const params = useParams();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (data && !error) {
                setProduct(data as Product);
            } else {
                console.error("Failed to load product", error);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!product) {
        return <div className="p-6 text-center text-muted-foreground">Product not found.</div>;
    }

    return (
        <div className="py-6">
            <ProductForm initialData={product} />
        </div>
    );
}
