"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const hasImages = product.images && product.images.length > 0;
    const coverImage = hasImages ? product.images[0] : null;
    const isOutOfStock = product.stock <= 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: coverImage || undefined
        });
        toast.success(`已加入購物車 ✨`, {
            description: product.name
        });
    };

    return (
        <Link
            href={`/products/${product.id}`}
            className="group block rounded-2xl bg-card overflow-hidden shadow-apple hover:shadow-apple-lg transition-apple"
        >
            {/* Image */}
            <div className="relative aspect-square bg-cream-100 overflow-hidden">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-chocolate-500/20" />
                    </div>
                )}

                {/* Out of stock overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-white font-bold bg-black/60 px-5 py-2 rounded-full text-sm tracking-wide">
                            SOLD OUT
                        </span>
                    </div>
                )}

                {/* Category badge */}
                {product.category && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-chocolate-600 text-xs font-medium px-3 py-1 rounded-full shadow-apple">
                        {product.category}
                    </div>
                )}

                {/* Add to cart button - appears on hover */}
                {!isOutOfStock && (
                    <button
                        onClick={handleAddToCart}
                        className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-3 rounded-full shadow-apple-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-apple active:scale-95"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.description || "Fresh and delicious."}
                </p>
                <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-foreground">
                        ${Number(product.price).toFixed(0)}
                    </span>
                    {!isOutOfStock && (
                        <span className="text-xs text-muted-foreground font-medium">
                            In Stock
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
