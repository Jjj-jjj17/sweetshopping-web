/**
 * Mailer Module — Resend Integration
 * 
 * Phase 1 Transactional Emails:
 * 1) Order Confirmation (after order creation)
 * 2) Payment Reminder (~20h after order, if unpaid)
 * 3) Payment Received (when admin confirms payment)
 */

import { Resend } from 'resend';

// Lazy initialization to avoid build errors when API key is not set
let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Mailer] RESEND_API_KEY not set - emails will fail');
        }
        _resend = new Resend(process.env.RESEND_API_KEY || '');
    }
    return _resend;
}

// Configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;

// Bank transfer details (to be configured via env)
const BANK_NAME = process.env.BANK_NAME || '【請設定銀行名稱】';
const BANK_ACCOUNT = process.env.BANK_ACCOUNT || '【請設定銀行帳號】';
const BANK_HOLDER = process.env.BANK_HOLDER || '【請設定戶名】';

// Types
interface OrderEmailData {
    orderNo: string;
    customerName: string;
    email: string;
    totalAmount: number | string;
    items: Array<{
        productName: string;
        quantity: number;
    }>;
    createdAt?: Date;
}

/**
 * Send Order Confirmation Email
 * Trigger: Immediately after successful order creation
 */
export async function sendOrderConfirmationEmail(order: OrderEmailData) {
    if (!order.email) {
        console.error('[Mailer] No email address for order:', order.orderNo);
        return { success: false, error: 'No email address' };
    }

    const itemsSummary = order.items
        .map(item => `• ${item.productName} × ${item.quantity}`)
        .join('\n');

    const subject = `Order Confirmation – ${order.orderNo} – Action Required`;

    const text = `
Hi ${order.customerName},

Thank you for your order!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${order.orderNo}

Items:
${itemsSummary}

Total: NT$${order.totalAmount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please complete your payment within 24 HOURS.

Bank Transfer Details:
• Bank: ${BANK_NAME}
• Account: ${BANK_ACCOUNT}
• Account Holder: ${BANK_HOLDER}
• Amount: NT$${order.totalAmount}

⚠️ IMPORTANT: After payment, please REPLY to this email with the LAST 5 DIGITS of your bank transfer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEED TO MAKE CHANGES?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If any order information is incorrect, please reply to this email IMMEDIATELY before production begins.

Orders without payment within 24 hours will be automatically cancelled.

Thank you for choosing Sweet's!
— 香甜手作
`.trim();

    try {
        const result = await getResend().emails.send({
            from: EMAIL_FROM,
            to: order.email,
            replyTo: EMAIL_REPLY_TO,
            subject,
            text,
        });

        console.log('[Mailer] Order confirmation sent:', order.orderNo, result);
        return { success: true, data: result };
    } catch (error) {
        console.error('[Mailer] Failed to send order confirmation:', error);
        return { success: false, error };
    }
}

/**
 * Send Payment Reminder Email
 * Trigger: ~20 hours after order creation, only if unpaid
 */
export async function sendPaymentReminderEmail(order: OrderEmailData) {
    if (!order.email) {
        console.error('[Mailer] No email address for order:', order.orderNo);
        return { success: false, error: 'No email address' };
    }

    const subject = `Payment Reminder – Order ${order.orderNo} – 24h Deadline`;

    const text = `
Hi ${order.customerName},

This is a friendly reminder about your order.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${order.orderNo}
Total: NT$${order.totalAmount}

⏰ Your order will be CANCELLED if payment is not received within the 24-hour window.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank Transfer Details:
• Bank: ${BANK_NAME}
• Account: ${BANK_ACCOUNT}
• Account Holder: ${BANK_HOLDER}

After payment, please REPLY to this email with the LAST 5 DIGITS of your bank transfer.

If you've already paid, please ignore this reminder — we'll process your order shortly.

Thank you!
— 香甜手作
`.trim();

    try {
        const result = await getResend().emails.send({
            from: EMAIL_FROM,
            to: order.email,
            replyTo: EMAIL_REPLY_TO,
            subject,
            text,
        });

        console.log('[Mailer] Payment reminder sent:', order.orderNo, result);
        return { success: true, data: result };
    } catch (error) {
        console.error('[Mailer] Failed to send payment reminder:', error);
        return { success: false, error };
    }
}

/**
 * Send Payment Received Email
 * Trigger: When admin marks payment as confirmed
 */
export async function sendPaymentReceivedEmail(order: OrderEmailData) {
    if (!order.email) {
        console.error('[Mailer] No email address for order:', order.orderNo);
        return { success: false, error: 'No email address' };
    }

    const subject = `Payment Confirmed – Order ${order.orderNo}`;

    const text = `
Hi ${order.customerName},

Great news! We've received your payment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT CONFIRMED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${order.orderNo}
Amount Received: NT$${order.totalAmount}

✓ Payment Status: CONFIRMED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT'S NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your order will now enter production. 

Dispatch is expected within ~2 business days after production is complete. You'll receive shipping information once your order is on its way.

Thank you for your order!
— 香甜手作
`.trim();

    try {
        const result = await getResend().emails.send({
            from: EMAIL_FROM,
            to: order.email,
            replyTo: EMAIL_REPLY_TO,
            subject,
            text,
        });

        console.log('[Mailer] Payment received email sent:', order.orderNo, result);
        return { success: true, data: result };
    } catch (error) {
        console.error('[Mailer] Failed to send payment received email:', error);
        return { success: false, error };
    }
}
