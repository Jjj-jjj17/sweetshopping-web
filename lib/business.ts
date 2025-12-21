import { addDays, isWeekend, startOfDay, isBefore } from "date-fns";
import { format } from "date-fns-tz";

// Configuration
export const LEAD_TIME_DAYS = 14;
export const TIMEZONE = "Asia/Taipei";
export const MIN_QTY_PER_VARIANT = 10;
export const MIN_ORDER_SUBTOTAL = 500;

export function getEarliestAvailableDate(): Date {
    const today = startOfDay(new Date());
    let targetDate = addDays(today, LEAD_TIME_DAYS);

    // Find the first available weekend (Sat/Sun) on or after lead time
    while (!isWeekend(targetDate)) {
        targetDate = addDays(targetDate, 1);
    }
    return targetDate;
}

export function isValidOrderDate(date: Date): boolean {
    const earliest = getEarliestAvailableDate();
    // Check if date is before earliest allowed date
    if (isBefore(date, earliest)) return false;

    // Basic rule: Must be weekend (unless overridden by special calendar logic later)
    // If availableDates array (loaded from DB) is provided, check that too
    // Note: We can't fetch DB inside this synchronous helper easily if used in client components
    // So we assume the caller passes the overrides if needed.

    // Default logic if no overrides passed:
    if (!isWeekend(date)) return false;

    return true;
}

// New helper for full validation including DB overrides
export function isDateAvailable(date: Date, overrides: { date: Date | string; enabled: boolean }[]): boolean {
    const earliest = getEarliestAvailableDate();
    if (isBefore(date, earliest)) return false;

    // Check overrides
    const dateStr = date.toDateString();

    // Find *specific* override first
    const override = overrides.find(o => new Date(o.date).toDateString() === dateStr);

    if (override) {
        return override.enabled;
    }

    // Fallback to weekend rule
    return isWeekend(date);
}

export function formatDateForDisplay(date: Date): string {
    return format(date, "yyyy-MM-dd (EEEE)", { timeZone: TIMEZONE });
}

export interface ValidationError {
    code: "MIN_QTY_PER_DESIGN" | "MIN_SUBTOTAL" | "STORE_PICKUP_STORE_REQUIRED" | "INVALID_STORE_FIELDS" | "OTHER";
    message: string;
    details?: any;
}

export function validateCartBusinessRules(cartItems: { quantity: number; price: number; name: string }[]): ValidationError | null {
    // 1. Per-Item Minimum Quantity
    for (const item of cartItems) {
        if (item.quantity < MIN_QTY_PER_VARIANT) {
            return {
                code: "MIN_QTY_PER_DESIGN",
                message: `Minimum quantity per item is ${MIN_QTY_PER_VARIANT}. "${item.name}" has only ${item.quantity}.`,
                details: { productName: item.name, quantity: item.quantity }
            };
        }
    }

    // 2. Minimum Order Subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal <= MIN_ORDER_SUBTOTAL) {
        return {
            code: "MIN_SUBTOTAL",
            message: `Order subtotal must exceed NT$${MIN_ORDER_SUBTOTAL}. Current subtotal: NT$${subtotal}.`,
            details: { order_subtotal: subtotal }
        };
    }

    return null;
}

export const DEPOSIT_RATE = 0.3;

export function calculateDeposit(totalAmount: number): number {
    return Math.ceil(totalAmount * DEPOSIT_RATE);
}
