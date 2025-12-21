export interface CartItem {
    productId: string;
    variantKey: string; // Unique key for this specific customization combo
    name: string;
    price: number;
    quantity: number;
    image?: string;
    customization: Record<string, string>; // fieldKey -> optionValue
}

const CART_KEY = "sweets_cart";

export function getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    const json = localStorage.getItem(CART_KEY);
    return json ? JSON.parse(json) : [];
}

export function addToCart(item: CartItem) {
    const cart = getCart();

    // Check if identical item exists (same product + same customization)
    const existingIndex = cart.findIndex(
        (i) => i.productId === item.productId && i.variantKey === item.variantKey
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += item.quantity;
    } else {
        cart.push(item);
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch event for UI updates if needed (e.g. storage event or custom event)
    window.dispatchEvent(new Event("cart-updated"));
}

export function updateCartItemQuantity(variantKey: string, quantity: number) {
    const cart = getCart();
    const index = cart.findIndex((i) => i.variantKey === variantKey);

    if (index > -1) {
        if (quantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = quantity;
        }
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-updated"));
    }
}

export function removeFromCart(variantKey: string) {
    const cart = getCart();
    const index = cart.findIndex((i) => i.variantKey === variantKey);

    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-updated"));
    }
}

export function generateVariantKey(productId: string, customization: Record<string, string>): string {
    // Sort keys to ensure consistent order
    const keys = Object.keys(customization).sort();
    const combo = keys.map(k => `${k}:${customization[k]}`).join("|");
    return `${productId}-${combo}`;
}
