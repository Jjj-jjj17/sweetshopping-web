import Link from "next/link";
import { getAllAnnouncements, toggleAnnouncementActive, toggleAnnouncementPinned, deleteAnnouncement } from "@/app/actions/announcements";

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
    const announcements = await getAllAnnouncements();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                <Link
                    href="/admin/announcements/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                >
                    + New Announcement
                </Link>
            </div>

            {announcements.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No announcements yet. Create your first one!
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pinned</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {announcements.map((ann) => (
                                <tr key={ann.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{ann.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{ann.content.substring(0, 50)}...</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={async () => {
                                            "use server";
                                            await toggleAnnouncementActive(ann.id);
                                        }}>
                                            <button
                                                type="submit"
                                                className={`px-2 py-1 text-xs font-bold rounded ${ann.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {ann.active ? "Active" : "Inactive"}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={async () => {
                                            "use server";
                                            await toggleAnnouncementPinned(ann.id);
                                        }}>
                                            <button
                                                type="submit"
                                                className={`px-2 py-1 text-xs font-bold rounded ${ann.pinned ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {ann.pinned ? "📌 Pinned" : "—"}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {ann.startAt && <div>From: {new Date(ann.startAt).toLocaleDateString()}</div>}
                                        {ann.endAt && <div>Until: {new Date(ann.endAt).toLocaleDateString()}</div>}
                                        {!ann.startAt && !ann.endAt && <span className="text-gray-400">Always</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link
                                            href={`/admin/announcements/${ann.id}/edit`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <form
                                            action={async () => {
                                                "use server";
                                                await deleteAnnouncement(ann.id);
                                            }}
                                            className="inline"
                                        >
                                            <button
                                                type="submit"
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                onClick={(e) => {
                                                    if (!confirm("Delete this announcement?")) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
