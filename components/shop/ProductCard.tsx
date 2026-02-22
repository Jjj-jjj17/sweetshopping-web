"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: coverImage || undefined
        });
        toast.success(`Added ${product.name} to cart`);
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
            <Link href={`/products/${product.id}`} className="block relative aspect-square bg-secondary cursor-pointer">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground opacity-50" />
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-white font-bold bg-black/60 px-4 py-2 rounded-md">
                            SOLD OUT
                        </span>
                    </div>
                )}
                {product.category && (
                    <div className="absolute top-2 left-2 bg-white/90 text-black text-xs px-2 py-1 rounded-full shadow-sm">
                        {product.category}
                    </div>
                )}
            </Link>

            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg flex justify-between items-start gap-2">
                    <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors line-clamp-1 flex-1">
                        {product.name}
                    </Link>
                </CardTitle>
                <CardDescription className="font-bold text-lg text-foreground">
                    ${Number(product.price).toFixed(2)}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex-1">
                <p className="line-clamp-2">{product.description || "Fresh and delicious."}</p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </CardFooter>
        </Card>
    );
}
