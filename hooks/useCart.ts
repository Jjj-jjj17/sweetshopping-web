import { useState, useEffect } from 'react';
import { Product, OrderItem } from '@/types';

// Simple types for the Cart
export interface CartItem extends OrderItem {
    id: string; // Product ID
    price: number;
    maxStock: number;
}

const CART_STORAGE_KEY = 'lfs_boms_guest_cart';

export const useCart = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCart(JSON.parse(stored) as CartItem[]);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prev => addItemToCartLogic(prev, product, quantity));
    };


    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        count,
        isLoaded
    };
};

// --- Pure Functions for Testing ---

export const calculateTotal = (cart: CartItem[]) => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const addItemToCartLogic = (currentCart: CartItem[], product: Product, quantity: number): CartItem[] => {
    const existing = currentCart.find(item => item.id === product.id);
    if (existing) {
        return currentCart.map(item =>
            item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
        );
    }
    return [...currentCart, {
        id: product.id,
        name: product.name,
        quantity,
        price: product.price,
        maxStock: product.stock > 0 ? product.stock : 0,
        notes: ''
    }];
};

