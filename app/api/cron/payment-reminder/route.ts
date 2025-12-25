/**
 * Payment Reminder Cron API
 * 
 * Phase 1 Approach:
 * - Called by external cron service via POST /api/cron/payment-reminder
 * - Requires Authorization: Bearer <CRON_SECRET>
 * - Runs every hour to catch unpaid orders 18-24h old
 * 
 * Security:
 * - Returns 401 for all auth failures
 * - Logs generic errors only
 * - Deduplication via AuditLog (no re-sends)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPaymentReminderEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
    // 1. Hardened Auth Check
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    // Strict verification: must match exactly and secret must be present
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
        // Log generic failure, do NOT log the header or secret
        console.warn('[Cron] Unauthorized payment reminder attempt');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Find candidate orders (18-24 hours old, unpaid)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const eighteenHoursAgo = new Date(now.getTime() - 18 * 60 * 60 * 1000);

    try {
        const unpaidOrders = await prisma.order.findMany({
            where: {
                status: { in: ['PENDING_CONFIRMATION', 'PENDING_PAYMENT'] },
                createdAt: {
                    gte: twentyFourHoursAgo,
                    lte: eighteenHoursAgo
                },
                email: { not: null }
            },
            include: {
                variants: { include: { product: true } }
            }
        });

        console.log(`[Cron] Found ${unpaidOrders.length} candidate orders`);

        const results = [];

        for (const order of unpaidOrders) {
            try {
                // 3. Deduplication: Check AuditLog to see if already sent
                // This avoids schema changes (P0 conservative approach)
                const alreadySent = await prisma.auditLog.findFirst({
                    where: {
                        entityType: "ORDER",
                        entityId: order.id,
                        action: "PAYMENT_REMINDER_SENT"
                    }
                });

                if (alreadySent) {
                    console.log(`[Cron] Skipping ${order.orderNo} - reminder already sent`);
                    results.push({ orderNo: order.orderNo, status: 'skipped' });
                    continue;
                }

                // 4. Send Email
                const emailResult = await sendPaymentReminderEmail({
                    orderNo: order.orderNo,
                    customerName: order.customerName,
                    email: order.email!,
                    totalAmount: Number(order.totalAmount),
                    items: order.variants.map(v => ({
                        productName: v.product?.name || 'Unknown Product',
                        quantity: v.quantity
                    }))
                });

                if (emailResult.success) {
                    // 5. Record Sentinel in AuditLog
                    await prisma.auditLog.create({
                        data: {
                            action: "PAYMENT_REMINDER_SENT",
                            entityType: "ORDER",
                            entityId: order.id,
                            actorUserId: "SYSTEM", // System actor
                            oldValue: {},
                            newValue: { sentAt: new Date() }
                        }
                    });
                    results.push({ orderNo: order.orderNo, status: 'sent' });
                } else {
                    results.push({ orderNo: order.orderNo, status: 'failed', error: 'Email failed' });
                }

            } catch (innerError) {
                console.error(`[Cron] Error processing ${order.orderNo}:`, innerError);
                results.push({ orderNo: order.orderNo, status: 'failed', error: 'Processing error' });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (error) {
        console.error('[Cron] Payment reminder job failed:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
