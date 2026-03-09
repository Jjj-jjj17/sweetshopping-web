"use client";

import { ProductForm } from '@/components/admin/ProductForm';
import Link from 'next/link';

export default function NewProductPage() {
    return (
        <div className="py-2">
            <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] text-[15px] font-medium rounded-lg transition-colors duration-150 mb-8"
            >
                ← 返回商品列表
            </Link>
            <h1 style={{ color: '#1D1D1F', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>新增商品</h1>
            <p style={{ color: '#6E6E73', fontSize: '15px', marginTop: '4px' }}>上傳新商品到商店</p>
            <div className="mt-8">
                <ProductForm />
            </div>
        </div>
    );
}
