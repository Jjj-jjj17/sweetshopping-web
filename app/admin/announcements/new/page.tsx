import Link from "next/link";
import { createAnnouncement } from "@/app/actions/announcements";
import { redirect } from "next/navigation";

export default function NewAnnouncementPage() {
    async function handleCreate(formData: FormData) {
        "use server";
        await createAnnouncement(formData);
        redirect("/admin/announcements");
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/announcements" className="text-gray-500 hover:text-gray-900">
                    &larr; Back to Announcements
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">New Announcement</h1>

                <form action={handleCreate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Title *</label>
                        <input
                            name="title"
                            required
                            className="w-full border border-gray-300 rounded p-2 text-gray-900"
                            placeholder="Announcement title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Content *</label>
                        <textarea
                            name="content"
                            required
                            rows={5}
                            className="w-full border border-gray-300 rounded p-2 text-gray-900"
                            placeholder="Announcement content (supports markdown)"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Start Date (Optional)</label>
                            <input
                                type="date"
                                name="startAt"
                                className="w-full border border-gray-300 rounded p-2 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">End Date (Optional)</label>
                            <input
                                type="date"
                                name="endAt"
                                className="w-full border border-gray-300 rounded p-2 text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="pinned" value="true" className="w-4 h-4" />
                            <span className="text-sm font-medium text-gray-900">Pin to top</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" name="active" value="true" defaultChecked className="w-4 h-4" />
                            <span className="text-sm font-medium text-gray-900">Active</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700"
                    >
                        Create Announcement
                    </button>
                </form>
            </div>
        </div>
    );
}
