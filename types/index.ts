export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface AuditLog {
    id: string; // UUID
    timestamp: number;
    action: string;
    previousValue?: string;
    newValue?: string;
    user: string;
}

export interface Product {
    id: string; // UUID
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: number;
    is_available: boolean;
    created_at: string; // ISO String
    updated_at: string; // ISO String
}

export interface OrderItem {
    id?: string; // Product ID if linked
    name: string;
    quantity: number;
    price?: number; // Snapshot price
    notes?: string;
}

export interface Order {
    id: string; // UUID v4
    customerName: string; // Maps to customer_name in DB
    customerPhone: string;
    customerEmail?: string;
    shippingMethod: 'PICKUP' | 'DELIVERY' | '7-11';
    sevenElevenAddress?: string;
    sevenElevenStoreId?: string;
    items: OrderItem[];
    specialRequests: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: number | string; // Local is number, DB is string (handled via hydration)
    updatedAt: number | string;
    auditHistory?: AuditLog[]; // Optional in Cloud ver, kept for legacy/admin
}

export interface AppState {
    orders: Order[];
    version: number;
    lastBackup: number;
}
