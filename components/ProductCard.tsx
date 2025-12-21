import type { Product, ProductImage } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
    product: Product & { images: ProductImage[] };
}

export default function ProductCard({ product }: ProductCardProps) {
    const mainImage = product.images[0]?.url || "/placeholder-dessert.jpg";

    return (
        <Link href={`/products/${product.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                {/* Fallback for Image or use Next/Image if we have a valid width/height - for uploaded images which are arbitrary, simple img tag or object-cover is robust */}
                <img
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                />
                {!product.active && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <span className="bg-white px-2 py-1 text-xs font-bold uppercase tracking-wide text-gray-900">Sold Out</span>
                    </div>
                )}
            </div>
            <div className="mt-4 flex flex-col gap-1">
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <p className="mt-1 text-lg font-medium text-gray-900">
                    TWD ${Number(product.price).toFixed(0)}
                </p>
            </div>
        </Link>
    );
}
