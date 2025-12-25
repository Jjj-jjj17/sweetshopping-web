/**
 * Payment Reminder Cron API
 * 
 * Phase 1 Approach:
 * - This endpoint is called by an external cron service (e.g., Vercel Cron, cron-job.org)
 * - Runs every hour (recommended) or at ~20h mark
 * - Finds unpaid orders created 18-24 hours ago and sends reminders
 * 
 * Security:
 * - Protected by CRON_SECRET env var
 * - Returns 401 if secret doesn't match
 * 
 * Usage:
 * - Set up external cron to call: POST /api/cron/payment-reminder
 * - Include header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentReminderEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
    // 1. Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
        console.warn('[Cron] Unauthorized payment reminder attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Find unpaid orders in the reminder window (18-24 hours old)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const eighteenHoursAgo = new Date(now.getTime() - 18 * 60 * 60 * 1000);

    try {
        // Find orders that:
        // - Are still in PENDING_CONFIRMATION or PENDING_PAYMENT (unpaid)
        // - Were created between 18-24 hours ago
        const unpaidOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ['PENDING_CONFIRMATION', 'PENDING_PAYMENT']
                },
                createdAt: {
                    gte: twentyFourHoursAgo,
                    lte: eighteenHoursAgo
                },
                email: {
                    not: null
                }
            },
            include: {
                variants: {
                    include: {
                        product: true
                    }
                }
            }
        });

        console.log(`[Cron] Found ${unpaidOrders.length} orders for payment reminder`);

        const results = [];

        for (const order of unpaidOrders) {
            try {
                await sendPaymentReminderEmail({
                    orderNo: order.orderNo,
                    customerName: order.customerName,
                    email: order.email!,
                    totalAmount: Number(order.totalAmount),
                    items: order.variants.map(v => ({
                        productName: v.product?.name || 'Unknown Product',
                        quantity: v.quantity
                    }))
                });

                results.push({ orderNo: order.orderNo, status: 'sent' });
            } catch (emailError) {
                console.error(`[Cron] Failed to send reminder for ${order.orderNo}:`, emailError);
                results.push({ orderNo: order.orderNo, status: 'failed', error: String(emailError) });
            }
        }

        return NextResponse.json({
            success: true,
            processed: unpaidOrders.length,
            results
        });

    } catch (error) {
        console.error('[Cron] Payment reminder job failed:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// Also allow GET for health checks
export async function GET(request: NextRequest) {
    return NextResponse.json({
        endpoint: 'payment-reminder',
        method: 'POST with Authorization: Bearer <CRON_SECRET>',
        description: 'Sends payment reminders for unpaid orders (18-24h old)'
    });
}
