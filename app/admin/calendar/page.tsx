import Link from "next/link";
import AdminCalendarClient from "@/components/AdminCalendarClient";

export const dynamic = "force-dynamic";

export default function AdminCalendarPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Production Calendar</h1>
                <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
                    Back to Dashboard
                </Link>
            </div>

            <p className="text-gray-600">
                Manage your production availability here. <br />
                Click a date to toggle it. Use this to close on holidays or open on special weekdays.
            </p>

            <AdminCalendarClient />
        </div>
    );
}
