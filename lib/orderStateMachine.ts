/**
 * Order State Machine
 * 
 * Defines canonical order states and allowed transitions.
 * This is the SINGLE SOURCE OF TRUTH for order flow logic.
 */

import { OrderStatus } from "@prisma/client";

// Canonical States (matching Prisma enum exactly)
export const ORDER_STATES = {
    PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
    PENDING_PAYMENT: "PENDING_PAYMENT",
    PENDING_RECONCILIATION: "PENDING_RECONCILIATION",
    PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
    IN_PRODUCTION: "IN_PRODUCTION",
    SHIPPED_OR_READY: "SHIPPED_OR_READY",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
} as const;

export type OrderState = keyof typeof ORDER_STATES;

// Terminal states - no further transitions allowed
export const TERMINAL_STATES: OrderState[] = ["COMPLETED", "CANCELLED"];

/**
 * Allowed State Transitions (Admin-controlled)
 * Key = Current State
 * Value = Array of Valid Next States
 * 
 * Flow: PENDING_CONFIRMATION → PENDING_PAYMENT → PENDING_RECONCILIATION → 
 *       PAYMENT_CONFIRMED → IN_PRODUCTION → SHIPPED_OR_READY → COMPLETED
 */
export const ALLOWED_TRANSITIONS: Record<OrderState, OrderState[]> = {
    PENDING_CONFIRMATION: ["PENDING_PAYMENT", "CANCELLED"],
    PENDING_PAYMENT: ["PENDING_RECONCILIATION", "CANCELLED"],
    PENDING_RECONCILIATION: ["PAYMENT_CONFIRMED", "CANCELLED"],
    PAYMENT_CONFIRMED: ["IN_PRODUCTION", "CANCELLED"],
    IN_PRODUCTION: ["SHIPPED_OR_READY"],
    SHIPPED_OR_READY: ["COMPLETED"],
    COMPLETED: [], // Terminal
    CANCELLED: [], // Terminal
};

/**
 * Human-readable labels for each state
 */
export const STATE_LABELS: Record<OrderState, string> = {
    PENDING_CONFIRMATION: "Pending Confirmation",
    PENDING_PAYMENT: "Awaiting Deposit",
    PENDING_RECONCILIATION: "Deposit Submitted (Verifying)",
    PAYMENT_CONFIRMED: "Payment Confirmed",
    IN_PRODUCTION: "In Production",
    SHIPPED_OR_READY: "Shipped / Ready for Pickup",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

/**
 * Validates if a state transition is allowed
 * @returns true if transition is valid, false otherwise
 */
export function isTransitionAllowed(fromState: OrderState, toState: OrderState): boolean {
    const allowedNextStates = ALLOWED_TRANSITIONS[fromState];
    return allowedNextStates?.includes(toState) ?? false;
}

/**
 * Gets all valid next states from a given state
 */
export function getValidNextStates(currentState: OrderState): OrderState[] {
    return ALLOWED_TRANSITIONS[currentState] || [];
}

/**
 * Checks if a state is terminal (no further transitions)
 */
export function isTerminalState(state: OrderState): boolean {
    return TERMINAL_STATES.includes(state);
}

/**
 * Validates transition and returns error message if invalid
 */
export function validateTransition(fromState: OrderState, toState: OrderState): { valid: boolean; error?: string } {
    if (isTerminalState(fromState)) {
        return { valid: false, error: `Cannot transition from terminal state: ${STATE_LABELS[fromState]}` };
    }

    if (!isTransitionAllowed(fromState, toState)) {
        const validNext = getValidNextStates(fromState);
        const validLabels = validNext.map(s => STATE_LABELS[s]).join(", ");
        return {
            valid: false,
            error: `Invalid transition from "${STATE_LABELS[fromState]}" to "${STATE_LABELS[toState]}". Valid options: ${validLabels || "None"}`
        };
    }

    return { valid: true };
}
