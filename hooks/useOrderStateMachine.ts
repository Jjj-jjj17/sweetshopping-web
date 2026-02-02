import { OrderStatus, Order, AuditLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';

type TransitionRule = {
    [key in OrderStatus]: OrderStatus[];
};

const TRANSITIONS: TransitionRule = {
    'PENDING': ['PAID', 'CANCELLED'],
    'PAID': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // Final state
    'CANCELLED': [], // Final state
};

export const useOrderStateMachine = () => {
    const canTransition = (from: OrderStatus, to: OrderStatus): boolean => {
        if (from === to) return true; // No-op
        // Allow admin override or specific restoration? No, strict mode requested.
        // The user requirement said: "Allowed: PENDING -> PAID -> ... -> COMPLETED".
        // "Existing -> CANCELLED".

        // Check defined transitions
        const allowed = TRANSITIONS[from];
        return allowed.includes(to);
    };

    const validateTransition = (from: OrderStatus, to: OrderStatus) => {
        if (!canTransition(from, to)) {
            throw new Error(`Invalid Status Transition from ${from} to ${to}`);
        }
    };

    // Helper to create audit log
    const createAuditLog = (action: string, previous?: string, current?: string): AuditLog => {
        return {
            id: uuidv4(),
            timestamp: Date.now(),
            action,
            previousValue: previous,
            newValue: current,
            user: 'Admin', // In a real app this would come from auth context
        };
    };

    return {
        canTransition,
        validateTransition,
        createAuditLog,
        TRANSITIONS
    };
};
