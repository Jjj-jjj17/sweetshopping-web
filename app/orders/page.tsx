import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/api/auth/signin?callbackUrl=/orders");
    }

    const orders = await prisma.order.findMany({
        where: {
            email: session.user.email, // Link by email as per plan
        },
        orderBy: { createdAt: 'desc' },
        include: {
            variants: {
                include: { product: true }
            }
        }
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                    &larr; Back to Shop
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Link href="/" className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold hover:bg-pink-600 transition">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 hover:border-pink-200 transition">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Order #{order.orderNo}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-sm font-bold rounded-full 
                                            ${order.status === 'PENDING_CONFIRMATION' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-50 text-blue-700'}`}>
                                            {order.status.replace("_", " ")}
                                        </span>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="text-sm font-bold text-pink-500 hover:text-pink-700 underline"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Total</span>
                                        <span className="font-bold text-gray-900">${order.totalAmount.toString()}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {order.variants.length} item(s): {order.variants.map(v => v.product.name).join(", ")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
