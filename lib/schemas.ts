import { z } from 'zod';
import { Order, AuditLog, OrderItem, AppState, Product } from '@/types';

// Regex for phone validation (basic international or local format)
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

export const OrderStatusSchema = z.enum([
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED',
    'CANCELLED',
]);

export const StockStatusSchema = z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']);

export const AuditLogSchema: z.ZodType<AuditLog> = z.object({
    id: z.string().uuid(),
    timestamp: z.number(),
    action: z.string().min(1),
    previousValue: z.string().optional(),
    newValue: z.string().optional(),
    user: z.string().default("Admin"),
});

export const ProductSchema: z.ZodType<Product> = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.number().min(0),
    image_url: z.string().optional(),
    stock_status: StockStatusSchema,
    is_active: z.boolean(),
    created_at: z.string(),
});

export const OrderItemSchema: z.ZodType<OrderItem> = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Item name is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
    price: z.number().optional(),
    notes: z.string().optional(),
});

export const OrderSchema: z.ZodType<Order> = z.object({
    id: z.string().uuid(),
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerPhone: z.string().regex(phoneRegex, "Invalid phone number format"),
    customerEmail: z.string().email().optional().or(z.literal('')),
    shippingMethod: z.enum(['PICKUP', 'DELIVERY', '7-11']),
    sevenElevenAddress: z.string().optional(),
    sevenElevenStoreId: z.string().optional(),
    items: z.array(OrderItemSchema).min(1, "At least one item is required"),
    specialRequests: z.string(),
    status: OrderStatusSchema,
    totalAmount: z.number().min(0),
    createdAt: z.union([z.number(), z.string()]),
    updatedAt: z.union([z.number(), z.string()]),
    auditHistory: z.array(AuditLogSchema).optional(),
});

export const AppStateSchema: z.ZodType<AppState> = z.object({
    orders: z.array(OrderSchema),
    version: z.number(),
    lastBackup: z.number(),
});
