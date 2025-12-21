import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.email) {
        redirect("/api/auth/signin");
    }

    const { id } = await params;

    // Fetch order ONLY if it matches the session email
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            variants: {
                include: { product: true }
            }
        }
    });

    if (!order) {
        notFound();
    }

    // Security Check: Ensure the user owns this order
    // (Using lowercase comparison to be safe)
    if (order.email?.toLowerCase() !== session.user.email.toLowerCase()) {
        // Option 1: Generic 404 to avoid leaking existence
        notFound();
        // Option 2: Redirect to list (we'll stick to notFound for security)
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/orders" className="text-gray-500 hover:text-gray-900 font-medium">
                    &larr; Back to My Orders
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNo}</h1>
                        <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold rounded-full self-start md:self-auto
                        ${order.status === 'PENDING_CONFIRMATION' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-50 text-blue-700'}`}>
                        {order.status.replace("_", " ")}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* Items Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
                        <ul className="divide-y divide-gray-100">
                            {order.variants.map((item) => (
                                <li key={item.id} className="py-4 flex justify-between">
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">{item.product.name}</div>
                                        {item.customization && Object.keys(item.customization as object).length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded inline-block">
                                                <pre className="whitespace-pre-wrap font-sans">
                                                    {JSON.stringify(item.customization, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-gray-900 font-medium">
                                            {item.quantity} x ${item.unitPrice.toString()}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            Total: ${item.lineAmount.toString()}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
                            <div className="text-xl font-bold text-gray-900">
                                Total: ${order.totalAmount.toString()}
                            </div>
                        </div>
                    </div>

                    {/* Delivery & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Delivery Method</h3>
                            <p className="text-gray-700 font-medium bg-gray-50 p-3 rounded">
                                {order.deliveryMethod === 'SEVEN_ELEVEN' ? '7-11 Pickup' : 'Post Office'}
                            </p>

                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mt-4 mb-3">
                                {order.deliveryMethod === 'SEVEN_ELEVEN' ? 'Store Details' : 'Shipping Address'}
                            </h3>
                            <div className="text-gray-700 bg-gray-50 p-3 rounded text-sm">
                                {order.deliveryMethod === 'SEVEN_ELEVEN' ? (
                                    <>
                                        <p><span className="font-semibold">Store:</span> {order.storeName} ({order.storeCode})</p>
                                        <p><span className="font-semibold">Address:</span> {order.storeAddress}</p>
                                    </>
                                ) : (
                                    <p>{order.postalAddress1}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Customer Info</h3>
                            <div className="text-gray-700 bg-gray-50 p-3 rounded text-sm space-y-2">
                                <p><span className="font-semibold">Name:</span> {order.customerName}</p>
                                <p><span className="font-semibold">Email:</span> {order.email}</p>
                                <p><span className="font-semibold">Phone:</span> {order.phone}</p>
                            </div>

                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mt-4 mb-3">Requested Fulfillment</h3>
                            <div className="text-gray-700 bg-gray-50 p-3 rounded text-sm">
                                {new Date(order.fulfillmentDate).toDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
