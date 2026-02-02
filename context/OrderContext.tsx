"use client";

import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { Order, OrderStatus, AppState } from '@/types';
import { StorageService } from '@/services/storage';
import { useOrderStateMachine } from '@/hooks/useOrderStateMachine';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase'; // Correct top-level import
import { toast } from 'sonner';

// Actions
type Action =
    | { type: 'INIT_DATA'; payload: AppState }
    | { type: 'ADD_ORDER'; payload: Order }
    | { type: 'UPDATE_ORDER'; payload: Order }
    | { type: 'UPDATE_STATUS'; payload: { id: string; status: OrderStatus } }
    | { type: 'DELETE_ORDER'; payload: string }
    | { type: 'IMPORT_DATA'; payload: AppState }
    | { type: 'RESET' };

interface OrderContextType {
    orders: Order[];
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    warning: string | null;
    login: (pin: string) => boolean;
    logout: () => void;
    initialize: (pin: string) => void;
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'auditHistory'>) => void;
    updateStatus: (id: string, status: OrderStatus) => void;
    updateOrder: (order: Order) => void;
    deleteOrder: (id: string) => void;
    exportData: () => string;
    importData: (json: string) => void;
    factoryReset: () => void;
    isInitialized: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const initialState: AppState = {
    orders: [],
    version: 1,
    lastBackup: Date.now()
};

function orderReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'INIT_DATA':
        case 'IMPORT_DATA':
            return action.payload;
        case 'ADD_ORDER':
            // Prevent duplicates from Realtime
            if (state.orders.some(o => o.id === action.payload.id)) return state;
            return { ...state, orders: [action.payload, ...state.orders] };
        case 'UPDATE_ORDER':
            return {
                ...state,
                orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o)
            };
        case 'UPDATE_STATUS':
            return {
                ...state,
                orders: state.orders.map(o =>
                    o.id === action.payload.id ? { ...o, status: action.payload.status, updatedAt: Date.now() } : o
                )
            };
        case 'DELETE_ORDER':
            return {
                ...state,
                orders: state.orders.filter(o => o.id !== action.payload)
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const { validateTransition, createAuditLog } = useOrderStateMachine();

    // Initial Check (Local Storage)
    useEffect(() => {
        const initCheck = () => {
            const init = StorageService.isInitialized();
            setIsInitialized(init);
            if (init && StorageService.isAuthenticated()) {
                try {
                    const data = StorageService.load();
                    if (data) {
                        dispatch({ type: 'INIT_DATA', payload: data });
                        setIsAuthenticated(true);
                    }
                } catch (e) {
                    setError("Failed to load session data");
                }
            }
            setIsLoading(false);
        };
        initCheck();
    }, []);

    // Save Effect (Local Backup)
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            try {
                const result = StorageService.save(state);
                if (result.warning) setWarning(result.warning);
                else setWarning(null);
            } catch (e: any) {
                if (e.type === 'QUOTA_EXCEEDED') setWarning("Storage Full! Cannot save.");
                else setError("Save failed");
            }
        }
    }, [state, isAuthenticated, isLoading]);

    // Realtime Subscription (Supabase)
    useEffect(() => {
        if (!isAuthenticated) return;

        console.log("Subscribing to Supabase Realtime...");
        const channel = supabase
            .channel('realtime-orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload: any) => { // Type as any for simplicity or generic RealtimePostgresChangesPayload
                    console.log('Realtime change:', payload);

                    if (payload.eventType === 'INSERT') {
                        // Normalize DB payload to App Order type if needed. 
                        // Assuming columns match exactly or strict mode is off.
                        const newOrder = payload.new as Order;
                        dispatch({ type: 'ADD_ORDER', payload: newOrder });
                        // Notification
                        toast.success(`New Order: ${newOrder.customerName}`, {
                            description: `Total: $${newOrder.totalAmount}`,
                            duration: 5000,
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedOrder = payload.new as Order;
                        dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
                    } else if (payload.eventType === 'DELETE') {
                        dispatch({ type: 'DELETE_ORDER', payload: payload.old.id });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated]);

    const login = (pin: string) => {
        if (StorageService.login(pin)) {
            try {
                const data = StorageService.load();
                if (data) dispatch({ type: 'INIT_DATA', payload: data });
                setIsAuthenticated(true);
                return true;
            } catch (e) {
                setError("Login success but load failed");
                return false;
            }
        }
        return false;
    };

    const logout = () => {
        StorageService.logout();
        setIsAuthenticated(false);
        dispatch({ type: 'RESET' });
    };

    const initialize = (pin: string) => {
        StorageService.initialize(pin);
        setIsInitialized(true);
        setIsAuthenticated(true);
    };

    const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'auditHistory'>) => {
        const newOrder: Order = {
            ...orderData,
            id: uuidv4(),
            totalAmount: orderData.totalAmount || 0,
            shippingMethod: orderData.shippingMethod || 'PICKUP',
            createdAt: Date.now(), // Store as number locally
            updatedAt: Date.now(),
            auditHistory: [createAuditLog("CREATED", undefined, "Order Created")]
        };
        dispatch({ type: 'ADD_ORDER', payload: newOrder });
    };

    const updateStatus = (id: string, status: OrderStatus) => {
        const order = state.orders.find(o => o.id === id);
        if (!order) return;

        try {
            validateTransition(order.status, status);
            const audit = createAuditLog("STATUS_CHANGE", order.status, status);
            const history = order.auditHistory || [];

            const updatedOrder = {
                ...order,
                status,
                auditHistory: [...history, audit]
            };

            dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
        } catch (e: any) {
            setError(e.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const updateOrder = (updatedOrder: Order) => {
        const oldOrder = state.orders.find(o => o.id === updatedOrder.id);
        if (oldOrder) {
            const history = updatedOrder.auditHistory || [];
            const audit = createAuditLog("EDITED", "Previous Version", "Updated Details");
            updatedOrder.auditHistory = [...history, audit];
            updatedOrder.updatedAt = Date.now();
            dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
        }
    };

    const deleteOrder = (id: string) => {
        dispatch({ type: 'DELETE_ORDER', payload: id });
    };

    const exportData = () => {
        return StorageService.exportData();
    };

    const importData = (json: string) => {
        StorageService.importData(json);
        const data = StorageService.load();
        if (data) dispatch({ type: 'IMPORT_DATA', payload: data });
    };

    const factoryReset = () => {
        StorageService.factoryReset();
    };

    return (
        <OrderContext.Provider value={{
            orders: state.orders,
            isAuthenticated,
            isInitialized,
            isLoading,
            error,
            warning,
            login,
            logout,
            initialize,
            addOrder,
            updateStatus,
            updateOrder,
            deleteOrder,
            exportData,
            importData,
            factoryReset
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
