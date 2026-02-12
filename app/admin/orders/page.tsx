import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: { status?: string; search?: string }
}) {
    // 1. Resolve params
    const statusTab = searchParams.status || 'needs_attention';
    const searchQuery = searchParams.search || '';

    // 2. Define Filters
    let statusFilter: Prisma.EnumOrderStatusFilter | undefined;

    switch (statusTab) {
        case 'needs_attention':
            statusFilter = {
                in: ['PENDING_CONFIRMATION', 'PENDING_PAYMENT', 'PENDING_RECONCILIATION', 'PAYMENT_CONFIRMED']
            };
            break;
        case 'production':
            statusFilter = { equals: 'IN_PRODUCTION' };
            break;
        case 'completed':
            statusFilter = { in: ['SHIPPED_OR_READY', 'COMPLETED'] };
            break;
        case 'cancelled':
            statusFilter = { equals: 'CANCELLED' };
            break;
        case 'all':
            statusFilter = undefined; // No filter
            break;
    }

    // 3. Define Search Condition
    const searchFilter = searchQuery ? {
        OR: [
            { orderNo: { contains: searchQuery, mode: 'insensitive' as const } },
            { customerName: { contains: searchQuery, mode: 'insensitive' as const } },
            { phone: { contains: searchQuery, mode: 'insensitive' as const } },
        ]
    } : {};

    // 4. Fetch Orders
    const orders = await prisma.order.findMany({
        where: {
            AND: [
                statusFilter ? { status: statusFilter } : {},
                searchFilter
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
            variants: {
                include: { product: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <div className="text-sm text-gray-500">Total: {orders.length}</div>
            </div>

            {/* Search and Filter UI */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
                {/* Search Bar */}
                <form className="flex gap-2">
                    <input
                        name="search"
                        defaultValue={searchQuery}
                        placeholder="Search by Order #, Name, Phone..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                    <input type="hidden" name="status" value={statusTab} />
                    <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700">
                        Search
                    </button>
                    {searchQuery && (
                        <Link href={`/admin/orders?status=${statusTab}`} className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md">
                            Clear
                        </Link>
                    )}
                </form>

                {/* Status Tabs */}
                <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
                    {[
                        { id: 'needs_attention', label: 'Needs Attention' },
                        { id: 'production', label: 'In Production' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'cancelled', label: 'Cancelled' },
                        { id: 'all', label: 'All Orders' },
                    ].map(tab => (
                        <Link
                            key={tab.id}
                            href={`/admin/orders?status=${tab.id}&search=${searchQuery}`}
                            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                                ${statusTab === tab.id
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No orders found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            #{order.orderNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-gray-500 text-xs">{order.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <ul className="list-disc pl-4">
                                                {order.variants.map((v) => (
                                                    <li key={v.id}>
                                                        {v.product?.name || "Unknown Product"} x {v.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ${order.totalAmount.toString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${['PENDING_CONFIRMATION', 'PENDING_PAYMENT'].includes(order.status) ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-50 text-blue-700'}`}>
                                                {order.status.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <Link href={`/admin/orders/${order.id}`} className="hover:underline">View</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
