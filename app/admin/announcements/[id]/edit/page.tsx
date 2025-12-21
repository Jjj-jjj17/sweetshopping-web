import Link from "next/link";
import { getAnnouncementById, updateAnnouncement } from "@/app/actions/announcements";
import { redirect, notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const announcement = await getAnnouncementById(id);

    if (!announcement) {
        notFound();
    }

    async function handleUpdate(formData: FormData) {
        "use server";
        await updateAnnouncement(formData);
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
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Announcement</h1>

                <form action={handleUpdate} className="space-y-6">
                    <input type="hidden" name="id" value={announcement.id} />

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Title *</label>
                        <input
                            name="title"
                            required
                            defaultValue={announcement.title}
                            className="w-full border border-gray-300 rounded p-2 text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Content *</label>
                        <textarea
                            name="content"
                            required
                            rows={5}
                            defaultValue={announcement.content}
                            className="w-full border border-gray-300 rounded p-2 text-gray-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">Start Date</label>
                            <input
                                type="date"
                                name="startAt"
                                defaultValue={announcement.startAt?.toISOString().split('T')[0] || ''}
                                className="w-full border border-gray-300 rounded p-2 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">End Date</label>
                            <input
                                type="date"
                                name="endAt"
                                defaultValue={announcement.endAt?.toISOString().split('T')[0] || ''}
                                className="w-full border border-gray-300 rounded p-2 text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="pinned"
                                value="true"
                                defaultChecked={announcement.pinned}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-900">Pin to top</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="active"
                                value="true"
                                defaultChecked={announcement.active}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-900">Active</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
