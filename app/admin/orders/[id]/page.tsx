import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/orders";
import { OrderState, STATE_LABELS, getValidNextStates, isTerminalState } from "@/lib/orderStateMachine";

export const dynamic = 'force-dynamic';

// Next.js 15+ compatible: params is a Promise
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            variants: {
                include: { product: true }
            }
        }
    });

    // Fetch Status History (Audit Logs)
    const auditLogs = await prisma.auditLog.findMany({
        where: {
            entityType: "ORDER",
            entityId: id
        },
        orderBy: { createdAt: 'desc' }
    });

    const paymentReminderSent = auditLogs.some(log => log.action === 'PAYMENT_REMINDER_SENT');

    if (!order) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="text-gray-500 hover:text-gray-900">&larr; Back</Link>
                    <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNo}</h1>
                </div>
                <div>
                    <span className={`px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full 
                        ${order.status === 'PENDING_CONFIRMATION' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'}`}>
                        {order.status.replace("_", " ")}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Order Items</h2>
                        <ul className="space-y-4">
                            {order.variants.map((item) => (
                                <li key={item.id} className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-gray-900">{item.product.name}</div>
                                        <div className="text-sm text-gray-500">
                                            Qty: {item.quantity} × ${item.unitPrice.toString()}
                                        </div>
                                        {/* Display customization if any */}
                                        {item.customization && Object.keys(item.customization as object).length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                                                <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(item.customization, null, 2)}</pre>
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        ${item.lineAmount.toString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 font-bold text-lg">
                            <span>Subtotal</span>
                            <span>${order.totalAmount.toString()}</span>
                        </div>
                    </div>

                    {/* Timeline & History */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Order History</h2>
                        <div className="space-y-4">
                            {auditLogs.length === 0 ? (
                                <p className="text-gray-500 text-sm">No history recorded.</p>
                            ) : (
                                <ol className="relative border-l border-gray-200 ml-2">
                                    {auditLogs.map((log) => (
                                        <li key={log.id} className="mb-6 ml-4">
                                            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                            <time className="mb-1 text-xs font-normal text-gray-400">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </time>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {log.action.replace(/_/g, " ")}
                                            </h3>
                                            <p className="mb-1 text-xs font-normal text-gray-500">
                                                by {log.actorUserId || 'System'}
                                            </p>
                                            {/* Show change details if relevant */}
                                            {log.newValue && (log.newValue as any).status && (
                                                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                    Status changed to: <strong>{(log.newValue as any).status}</strong>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </div>

                    {/* Customer & Delivery */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Delivery Details</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Method</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-semibold">{order.deliveryMethod}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Requested Date</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                                    {new Date(order.fulfillmentDate).toLocaleDateString()}
                                </dd>
                            </div>

                            {order.deliveryMethod === 'SEVEN_ELEVEN' && (
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Store Pickup Info</dt>
                                    <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                        <p><span className="font-bold">Store:</span> {order.storeName || "N/A"} ({order.storeCode || "No Code"})</p>
                                        <p><span className="font-bold">Address:</span> {order.storeAddress || "N/A"}</p>
                                    </dd>
                                </div>
                            )}

                            {order.deliveryMethod === 'POST_OFFICE' && (
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                        {order.postalAddress1 || "N/A"}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Customer</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-gray-500">Name</div>
                                <div className="font-medium">{order.customerName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Phone</div>
                                <div className="font-medium">{order.phone}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Email</div>
                                <div className="font-medium">{order.email || "N/A"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Email Status */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Email Status</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Order Confirmation</span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">SENT</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Payment Reminder</span>
                                {paymentReminderSent ? (
                                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">SENT</span>
                                ) : (
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">NOT SENT</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Management */}
                    <div className="bg-white rounded shadow p-6 border-t-4 border-blue-500">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>

                        {/* Current Status */}
                        <div className="mb-4">
                            <span className="text-sm text-gray-500">Current:</span>
                            <span className={`ml-2 px-3 py-1 text-sm font-bold rounded-full 
                                ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-50 text-blue-700'}`}>
                                {STATE_LABELS[order.status as OrderState] || order.status}
                            </span>
                        </div>

                        {/* Valid Next Actions */}
                        {isTerminalState(order.status as OrderState) ? (
                            <p className="text-gray-500 text-sm italic">This order is finalized. No further status changes allowed.</p>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 mb-3">Available Actions:</p>
                                {getValidNextStates(order.status as OrderState).map((nextState) => (
                                    <form key={nextState} action={updateOrderStatus} className="inline-block mr-2 mb-2">
                                        <input type="hidden" name="orderId" value={order.id} />
                                        <input type="hidden" name="newStatus" value={nextState} />
                                        <button
                                            type="submit"
                                            className={`px-4 py-2 rounded font-bold text-sm transition
                                                ${nextState === 'CANCELLED'
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            → {STATE_LABELS[nextState]}
                                        </button>
                                    </form>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
