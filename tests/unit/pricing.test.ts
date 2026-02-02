import { describe, it, expect } from 'vitest';
import { calculateTotal, addItemToCartLogic, CartItem } from '@/hooks/useCart';
import { Product } from '@/types';

// Mock Product
const mockProduct: Product = {
    id: 'p1',
    name: 'Test Cake',
    price: 100,
    stock_status: 'IN_STOCK',
    is_active: true,
    created_at: '2023-01-01'
};

const mockProduct2: Product = {
    id: 'p2',
    name: 'Cookie',
    price: 50,
    stock_status: 'IN_STOCK',
    is_active: true,
    created_at: '2023-01-01'
};

describe('Pricing Logic (Cart)', () => {
    it('should calculate total correctly for single item', () => {
        const cart: CartItem[] = [
            { id: 'p1', name: 'Test Cake', quantity: 2, price: 100, maxStock: 99 }
        ];
        expect(calculateTotal(cart)).toBe(200);
    });

    it('should calculate total correctly for multiple items', () => {
        const cart: CartItem[] = [
            { id: 'p1', name: 'Test Cake', quantity: 1, price: 100, maxStock: 99 },
            { id: 'p2', name: 'Cookie', quantity: 3, price: 50, maxStock: 99 }
        ];
        // 100 * 1 + 50 * 3 = 100 + 150 = 250
        expect(calculateTotal(cart)).toBe(250);
    });

    it('should handle empty cart', () => {
        expect(calculateTotal([])).toBe(0);
    });
});

describe('Cart Logic (State Mutations)', () => {
    it('should add new item to cart', () => {
        const initialCart: CartItem[] = [];
        const newCart = addItemToCartLogic(initialCart, mockProduct, 2);

        expect(newCart).toHaveLength(1);
        expect(newCart[0].id).toBe('p1');
        expect(newCart[0].quantity).toBe(2);
    });

    it('should increment quantity if item exists', () => {
        const initialCart: CartItem[] = [
            { id: 'p1', name: 'Test Cake', quantity: 1, price: 100, maxStock: 99 }
        ];
        // Add same product again (qty 3)
        const newCart = addItemToCartLogic(initialCart, mockProduct, 3);

        expect(newCart).toHaveLength(1);
        expect(newCart[0].quantity).toBe(4); // 1 + 3
    });

    it('should handle multiple different items', () => {
        const initialCart: CartItem[] = [
            { id: 'p1', name: 'Test Cake', quantity: 1, price: 100, maxStock: 99 }
        ];
        const newCart = addItemToCartLogic(initialCart, mockProduct2, 1);

        expect(newCart).toHaveLength(2);
        expect(newCart[0].id).toBe('p1');
        expect(newCart[1].id).toBe('p2');
    });
});
