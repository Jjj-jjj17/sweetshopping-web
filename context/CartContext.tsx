"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCart as useCartHook, CartItem } from '@/hooks/useCart';
import { Product } from '@/types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
    isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const cartUtils = useCartHook();

    return (
        <CartContext.Provider value={cartUtils}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
