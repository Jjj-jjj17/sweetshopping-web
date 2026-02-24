import React from 'react';
import { ProductCard } from '@/components/shop/ProductCard';
import { Product } from '@/types';

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20 text-chocolate-500 bg-cream-50 rounded-2xl border-2 border-dashed border-border">
                <p className="text-lg">No products found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
