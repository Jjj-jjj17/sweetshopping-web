"use client";

import { ProductForm } from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {
    return (
        <div className="py-6">
            <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-secondary text-gray-800 rounded-lg hover:bg-secondary/80 transition text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                返回商品列表
            </Link>
            <ProductForm />
        </div>
    );
}
