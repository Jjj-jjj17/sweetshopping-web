"use client";

import { ProductList } from '@/components/admin/ProductList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProductsPage() {
    return (
        <div>
            <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-secondary text-gray-800 rounded-lg hover:bg-secondary/80 transition text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                返回儀表板
            </Link>
            <ProductList />
        </div>
    );
}
