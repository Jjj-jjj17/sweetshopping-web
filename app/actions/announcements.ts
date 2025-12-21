"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for announcement validation
const announcementSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    pinned: z.boolean().default(false),
    active: z.boolean().default(true),
    startAt: z.string().optional().nullable(),
    endAt: z.string().optional().nullable(),
});

// Helper: Ensure admin access
async function requireAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

// ============ READ (Public) ============

/**
 * Get all active announcements for public display
 * Filters: active=true, within date range (if set)
 * Sorts: pinned first, then by createdAt desc
 */
export async function getActiveAnnouncements() {
    const now = new Date();

    const announcements = await prisma.announcement.findMany({
        where: {
            active: true,
            OR: [
                { startAt: null },
                { startAt: { lte: now } }
            ],
            AND: [
                {
                    OR: [
                        { endAt: null },
                        { endAt: { gte: now } }
                    ]
                }
            ]
        },
        orderBy: [
            { pinned: 'desc' },
            { createdAt: 'desc' }
        ]
    });

    return announcements;
}

/**
 * Get all announcements (Admin only)
 */
export async function getAllAnnouncements() {
    await requireAdmin();

    return prisma.announcement.findMany({
        orderBy: [
            { pinned: 'desc' },
            { createdAt: 'desc' }
        ]
    });
}

/**
 * Get single announcement by ID (Admin only)
 */
export async function getAnnouncementById(id: string) {
    await requireAdmin();

    return prisma.announcement.findUnique({
        where: { id }
    });
}

// ============ CREATE ============

export async function createAnnouncement(formData: FormData) {
    await requireAdmin();

    const rawData = {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        pinned: formData.get("pinned") === "true",
        active: formData.get("active") !== "false", // Default to true
        startAt: formData.get("startAt") as string || null,
        endAt: formData.get("endAt") as string || null,
    };

    const validation = announcementSchema.safeParse(rawData);
    if (!validation.success) {
        throw new Error(validation.error.issues.map(e => e.message).join(", "));
    }

    await prisma.announcement.create({
        data: {
            title: rawData.title,
            content: rawData.content,
            pinned: rawData.pinned,
            active: rawData.active,
            startAt: rawData.startAt ? new Date(rawData.startAt) : null,
            endAt: rawData.endAt ? new Date(rawData.endAt) : null,
        }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
}

// ============ UPDATE ============

export async function updateAnnouncement(formData: FormData) {
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) throw new Error("Announcement ID is required");

    const rawData = {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        pinned: formData.get("pinned") === "true",
        active: formData.get("active") === "true",
        startAt: formData.get("startAt") as string || null,
        endAt: formData.get("endAt") as string || null,
    };

    const validation = announcementSchema.safeParse(rawData);
    if (!validation.success) {
        throw new Error(validation.error.issues.map(e => e.message).join(", "));
    }

    await prisma.announcement.update({
        where: { id },
        data: {
            title: rawData.title,
            content: rawData.content,
            pinned: rawData.pinned,
            active: rawData.active,
            startAt: rawData.startAt ? new Date(rawData.startAt) : null,
            endAt: rawData.endAt ? new Date(rawData.endAt) : null,
        }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
}

// ============ TOGGLE (Quick Actions) ============

export async function toggleAnnouncementActive(id: string) {
    await requireAdmin();

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new Error("Announcement not found");

    await prisma.announcement.update({
        where: { id },
        data: { active: !announcement.active }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
}

export async function toggleAnnouncementPinned(id: string) {
    await requireAdmin();

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new Error("Announcement not found");

    await prisma.announcement.update({
        where: { id },
        data: { pinned: !announcement.pinned }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
}

// ============ DELETE ============

export async function deleteAnnouncement(id: string) {
    await requireAdmin();

    await prisma.announcement.delete({
        where: { id }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/");
}
