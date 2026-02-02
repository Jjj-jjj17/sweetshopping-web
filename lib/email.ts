import { Resend } from 'resend';
import { Order } from '@/types';

// Initialize Resend with API Key from Environment Variable
// If key is missing, we log to console (Dev Mode)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendOrderConfirmation(order: Order) {
    if (!resend) {
        console.log("RESEND_API_KEY not found. Skipping email sending.");
        console.log("Would send email to:", order.customerEmail);
        return { success: false, error: 'No API Key' };
    }

    if (!order.customerEmail) return { success: false, error: 'No Email Provided' };

    try {
        const { data, error } = await resend.emails.send({
            from: 'SweetShop <orders@yourdomain.com>',
            to: [order.customerEmail],
            subject: `Order Confirmation #${order.id.slice(0, 8)}`,
            html: `
                <h1>Thank you for your order, ${order.customerName}!</h1>
                <p>We have received your order and are preparing it.</p>
                
                <h2>Order Details</h2>
                <ul>
                    ${order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
                </ul>
                
                <p><strong>Total: $${order.totalAmount}</strong></p>
                <p>Shipping: ${order.shippingMethod}</p>
                ${order.shippingMethod === '7-11' ? `<p>Store: ${order.sevenElevenStoreId} - ${order.sevenElevenAddress}</p>` : ''}
                
                <p>You will be notified when it ships!</p>
            `,
        });

        if (error) {
            console.error(error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (e) {
        console.error("Email failed:", e);
        return { success: false, error: e };
    }
}
