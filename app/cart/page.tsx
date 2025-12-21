"use client";

import { useEffect, useState } from "react";
import { CartItem, getCart, updateCartItemQuantity, removeFromCart } from "@/lib/cart";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load cart from local storage
        setCart(getCart());
        setIsLoaded(true);

        const handleStorage = () => setCart(getCart());
        window.addEventListener("cart-updated", handleStorage);
        return () => window.removeEventListener("cart-updated", handleStorage);
    }, []);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Simplified update (full reload from storage usually, but here we might want to implement remove/update logic directly in lib/cart later)
    // For now, read-only view with "Checkout" button.

    if (!isLoaded) return <div className="p-8 text-center">Loading cart...</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Reuse Header for consistency (Should be Layout) */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">Sweet's</Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/cart" className="text-sm font-medium text-black">Cart ({totalItems})</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 mb-4">Your cart is currently empty.</p>
                        <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        <section className="lg:col-span-7">
                            <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                                {cart.map((item) => (
                                    <li key={item.variantKey} className="flex py-6 sm:py-10">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.image || "/placeholder-dessert.jpg"}
                                                alt={item.name}
                                                className="w-24 h-24 rounded-md object-cover object-center sm:w-32 sm:h-32"
                                            />
                                        </div>
                                        <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                            <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                <div>
                                                    <div className="flex justify-between">
                                                        <h3 className="text-sm">
                                                            <Link href={`/products/${item.productId}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                                {item.name}
                                                            </Link>
                                                        </h3>
                                                    </div>
                                                    <div className="mt-1 flex text-sm">
                                                        <p className="text-gray-500">
                                                            {Object.entries(item.customization).map(([key, value]) => (
                                                                <span key={key} className="mr-2 px-2 py-0.5 rounded bg-gray-100 text-xs">
                                                                    {value}
                                                                </span>
                                                            ))}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                                        ${item.price}
                                                    </p>
                                                </div>

                                                <div className="mt-4 sm:mt-0 sm:pr-9">
                                                    <label className="sr-only">Quantity</label>
                                                    <div className="flex items-center border border-gray-300 rounded-md max-w-[100px]">
                                                        <button
                                                            onClick={() => updateCartItemQuantity(item.variantKey, item.quantity - 1)}
                                                            className="px-2 py-1 text-gray-600 hover:text-black"
                                                        >-</button>
                                                        <span className="flex-1 text-center text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateCartItemQuantity(item.variantKey, item.quantity + 1)}
                                                            className="px-2 py-1 text-gray-600 hover:text-black"
                                                        >+</button>
                                                    </div>

                                                    <div className="absolute top-0 right-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.variantKey)}
                                                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                        >
                                                            <span className="sr-only">Remove</span>
                                                            {/* X Icon */}
                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Order Summary */}
                        <section className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                            <dl className="mt-6 space-y-4">
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">${total}</dd>
                                </div>
                            </dl>

                            {total < 500 && (
                                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                                    Minimum order subtotal is NT$500 to ship. Current subtotal: NT${total}.
                                </div>
                            )}

                            <div className="mt-6">
                                <Link
                                    href="/checkout"
                                    className={`block w-full text-center bg-black border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-black ${total <= 500 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    Checkout
                                </Link>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
