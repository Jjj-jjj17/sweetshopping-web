import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const orderCount = await prisma.order.count();

    const revenueResult = await prisma.order.aggregate({
        _sum: { totalAmount: true }
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    const pendingCount = await prisma.order.count({
        where: { status: 'PENDING_CONFIRMATION' }
    });

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 font-medium">Total Orders</h3>
                    <p className="text-3xl font-bold text-gray-900">{orderCount}</p>
                </div>
                <div className="p-6 bg-white rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 font-medium">Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">${totalRevenue.toString()}</p>
                </div>
                <div className="p-6 bg-white rounded shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 font-medium">Pending Actions</h3>
                    <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                </div>
            </div>

            <div className="bg-white rounded shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
                    <Link href="/admin/orders" className="text-blue-600 hover:underline">View All Orders &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/admin/products/new" className="block p-4 border rounded hover:bg-gray-50 text-center text-blue-600 font-medium">
                        + Add New Product
                    </Link>
                    <Link href="/admin/orders" className="block p-4 border rounded hover:bg-gray-50 text-center text-blue-600 font-medium">
                        Manage Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}
