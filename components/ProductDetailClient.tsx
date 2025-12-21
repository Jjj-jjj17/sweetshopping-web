"use client";

import { useState } from "react";
import { Product, ProductImage, CustomizationField, CustomizationOption } from "@prisma/client";
import Image from "next/image";
import { addToCart, generateVariantKey } from "@/lib/cart";

type ProductWithDetails = Omit<Product, "price"> & {
    price: number;
    images: ProductImage[];
    fields: (CustomizationField & { options: CustomizationOption[] })[];
};

export default function ProductDetailClient({ product }: { product: ProductWithDetails }) {
    const [mainImage, setMainImage] = useState(product.images[0]?.url || "/placeholder-dessert.jpg");
    const [quantity, setQuantity] = useState(1);
    const [customization, setCustomization] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleAddToCart = () => {
        setError("");
        setSuccess("");

        // Validate required fields
        const missingFields = product.fields.filter(f => f.required && !customization[f.fieldKey]);
        if (missingFields.length > 0) {
            setError(`Please select options for: ${missingFields.map(f => f.label).join(", ")}`);
            return;
        }

        const variantKey = generateVariantKey(product.id, customization);

        addToCart({
            productId: product.id,
            variantKey,
            name: product.name,
            price: Number(product.price),
            quantity,
            image: product.images[0]?.url,
            customization
        });

        setSuccess("Added to cart!");
        setTimeout(() => setSuccess(""), 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Images */}
            <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {product.images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.images.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => setMainImage(img.url)}
                                className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition ${mainImage === img.url ? "border-black" : "border-transparent"
                                    }`}
                            >
                                <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Details */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                    <p className="text-2xl font-medium text-gray-900 mt-2">TWD ${Number(product.price).toFixed(0)}</p>
                </div>

                <div className="prose text-gray-500">
                    <p>{product.description}</p>
                </div>

                <hr />

                {/* Customization Fields */}
                {product.fields.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="font-medium text-gray-900">Customization</h3>
                        {product.fields.map((field) => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === "ENUM" ? (
                                    <div className="flex flex-wrap gap-2">
                                        {field.options.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setCustomization(prev => ({ ...prev, [field.fieldKey]: option.value }))}
                                                className={`px-4 py-2 text-sm rounded-full border ${customization[field.fieldKey] === option.value
                                                    ? "bg-black text-white border-black"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black"
                                        placeholder={`Enter ${field.label}`}
                                        onChange={(e) => setCustomization(prev => ({ ...prev, [field.fieldKey]: e.target.value }))}
                                        value={customization[field.fieldKey] || ""}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Add to Cart Actions */}
                <div className="pt-4 space-y-4">
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}

                    <div className="flex gap-4">
                        <div className="w-32 flex items-center border border-gray-300 rounded-md">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-2 text-gray-600 hover:text-black w-10"
                            >-</button>
                            <span className="flex-1 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-3 py-2 text-gray-600 hover:text-black w-10"
                            >+</button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!product.active}
                            className="flex-1 bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {product.active ? "Add to Cart" : "Sold Out"}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Minimum order quantity of 20 items applies to total cart.
                    </p>
                </div>
            </div>
        </div>
    );
}
