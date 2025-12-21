"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CartItem } from "@/lib/cart"; // Type only
import { isValidOrderDate, validateCartBusinessRules, MIN_ORDER_SUBTOTAL } from "@/lib/business";
import { OrderState, validateTransition } from "@/lib/orderStateMachine";

// Placeholder functions removed - using imported versions from @/lib/business

const orderSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    deliveryMethod: z.enum(["SEVEN_ELEVEN", "POST_OFFICE"]),
    // Optional store fields
    storeId: z.string().optional(),
    storeName: z.string().optional(),
    storeAddress: z.string().optional(),
    // Optional delivery details (for POST)
    deliveryDetails: z.string().optional(),
    date: z.string().refine((val) => isValidOrderDate(new Date(val)), {
        message: "Invalid date selected (Must be weekend >= 14 days away)",
    }),
});

export async function placeOrder(cartItems: any[], formData: FormData) {
    const session = await auth();
    if (!session?.user) {
        return { error: "You must be logged in to place an order." };
    }

    const getFormDataString = (key: string) => {
        const value = formData.get(key);
        return typeof value === "string" && value.length > 0 ? value : undefined;
    };

    const rawData = {
        name: formData.get("name"), // Required fields will fail in Zod if null, which is fine/handled but we can clean them too
        phone: formData.get("phone"),
        deliveryMethod: formData.get("deliveryMethod"),
        storeId: getFormDataString("storeId"),
        storeName: getFormDataString("storeName"),
        storeAddress: getFormDataString("storeAddress"),
        deliveryDetails: getFormDataString("deliveryDetails"),
        date: formData.get("date"),
    };

    const validation = orderSchema.safeParse(rawData);
    if (!validation.success) {
        return { error: validation.error.flatten() };
    }

    // 1. Validate Business Rules (Server-Side)
    // We need to reconstruct the cart items with mostly the same structure for the validator
    // (In a real app, we should fetch prices/names from DB *before* validation to ensure data integrity,
    // but for the business logic check (Qty), using the passed cart is a first step, then we verify price below).
    const businessError = validateCartBusinessRules(cartItems);
    if (businessError) {
        return { error: businessError.message }; // Return simple string error for now, or object
    }

    // 2. Validate Delivery Specifics
    if (validation.data.deliveryMethod === "SEVEN_ELEVEN") {
        if (!validation.data.storeName || !validation.data.storeAddress) {
            return { error: "Please enter the convenience store name and full address before placing your order." };
        }
    } else if (validation.data.deliveryMethod === "POST_OFFICE") {
        if (!validation.data.deliveryDetails) return { error: "Please provide a shipping address." };
    }

    // 3. Verification: Re-fetch prices from DB to prevent tampering
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.active) {
            return { error: `Product ${item.name} is no longer available.` };
        }

        const price = Number(product.price);
        totalAmount += price * item.quantity;

        orderItemsData.push({
            productId: product.id,
            quantity: item.quantity,
            // price: price, // REMOVED: Not in schema (use unitPrice)
            // customizationDetails: JSON.stringify(item.customization), // REMOVED: Not in schema (use customization)
            variantKey: item.variantKey, // Map to schema field
            unitPrice: price,            // Map to schema field
            lineAmount: price * item.quantity, // Map to schema field
            customization: item.customization // Map to schema field (Json)
        });
    }

    // Double check Subtotal again with REAL DB prices
    if (totalAmount <= MIN_ORDER_SUBTOTAL) {
        return { error: `Order subtotal must exceed NT$${MIN_ORDER_SUBTOTAL}.` };
    }

    // Create Order
    const order = await prisma.order.create({
        data: {
            // user: { connect: { id: session.user.id } }, // REMOVED: Schema does not have user relation yet
            orderNo: `ORD-${Date.now()}`, // Simple ID generation
            status: "PENDING_CONFIRMATION", // Fixed Enum
            totalQty: cartItems.reduce((sum: any, i: any) => sum + i.quantity, 0), // Schema required
            totalAmount,
            fulfillmentDate: new Date(validation.data.date),
            deliveryMethod: validation.data.deliveryMethod,

            // Conditional Fields
            storeName: validation.data.storeName,
            storeCode: validation.data.storeId,
            storeAddress: validation.data.storeAddress,

            // Mapping generic deliveryDetails to postal if needed
            postalAddress1: validation.data.deliveryMethod === "POST_OFFICE" ? validation.data.deliveryDetails : undefined,

            customerName: validation.data.name,
            phone: validation.data.phone,

            variants: { // Correct relation name
                create: orderItemsData
            }
        }
    });

    // TODO: Send email notification?

    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id };
}

export async function updateOrderStatus(formData: FormData) {
    // 1. ADMIN Permission Check (Server-enforced)
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }

    const orderId = formData.get("orderId") as string;
    const newStatus = formData.get("newStatus") as string;
    const adminNote = formData.get("adminNote") as string | null;

    if (!orderId || !newStatus) {
        throw new Error("Missing required fields: orderId and newStatus");
    }

    // 2. Fetch current order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new Error("Order not found");
    }

    const currentStatus = order.status as OrderState;
    const targetStatus = newStatus as OrderState;

    // 3. Validate State Transition (CORE ENFORCEMENT)
    const validation = validateTransition(currentStatus, targetStatus);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // 4. Apply Update
    await prisma.order.update({
        where: { id: orderId },
        data: { status: targetStatus }
    });

    // 5. Audit Log (Required for all state changes)
    await prisma.auditLog.create({
        data: {
            action: "ORDER_STATUS_TRANSITION",
            entityType: "ORDER",
            entityId: orderId,
            actorUserId: session.user.id,
            oldValue: { status: currentStatus, orderNo: order.orderNo } as any,
            newValue: { status: targetStatus, note: adminNote } as any,
        }
    });

    // 6. Revalidate UI
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
}

