import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    // 1. Not authenticated
    if (!session?.user) {
        redirect("/api/auth/signin"); // Or custom login page
    }

    // 2. Not authorized (Role check)
    if (session.user.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p>You do not have permission to view this area.</p>
                <Link href="/" className="underline text-blue-600">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar Placeholder */}
            <aside className="w-64 bg-slate-900 text-white p-4">
                <h2 className="text-xl font-bold mb-8">Admin Console</h2>
                <nav className="flex flex-col gap-2">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-slate-800 rounded">Dashboard</Link>
                    <Link href="/admin/orders" className="p-2 hover:bg-slate-800 rounded">Orders</Link>
                    <Link href="/admin/products" className="p-2 hover:bg-slate-800 rounded">Products</Link>
                    <Link href="/admin/calendar" className="p-2 hover:bg-slate-800 rounded">Calendar</Link>
                    <Link href="/admin/announcements" className="p-2 hover:bg-slate-800 rounded">Announcements</Link>
                    <Link href="/" className="p-2 hover:bg-slate-800 rounded">Back to Site</Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-slate-50">
                {children}
            </main>
        </div>
    );
}
