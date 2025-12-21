import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateDeposit } from "@/lib/business";
import { notFound } from "next/navigation";

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch order to get total amount
    const order = await prisma.order.findUnique({
        where: { id: id }
    });

    if (!order) {
        notFound();
    }

    const deposit = calculateDeposit(Number(order.totalAmount));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Received!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you, {order.customerName}. Your Order ID is <span className="font-mono text-black font-bold">{order.orderNo}</span>.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 text-left">
                    <h3 className="font-bold text-blue-900 mb-2">Next Step: Pay Deposit</h3>
                    <p className="text-sm text-blue-800 mb-1">
                        Total Amount: <span className="font-mono">${Number(order.totalAmount)}</span>
                    </p>
                    <p className="text-lg font-bold text-blue-900 mb-3">
                        Required Deposit (30%): <span className="font-mono">${deposit}</span>
                    </p>
                    <p className="text-xs text-blue-600">
                        Please transfer the deposit to confirm your production slot.
                        <br />
                        <strong>Bank:</strong> 822 (CTBC) <br />
                        <strong>Account:</strong> 123-456-7890
                    </p>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                        We will contact you via phone/email to confirm details once the deposit is verified.
                    </p>

                    <Link href="/" className="block w-full bg-black text-white py-2 rounded hover:bg-gray-800 font-bold">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
