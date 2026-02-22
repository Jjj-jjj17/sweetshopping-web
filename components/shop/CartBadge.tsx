"use client";

import { useCart } from "@/context/CartContext";

export function CartBadge() {
    const { count } = useCart();

    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
            {count > 99 ? '99+' : count}
        </span>
    );
}
