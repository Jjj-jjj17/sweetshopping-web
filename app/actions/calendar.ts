"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Fetch settings for a given month range
// Start and End should be strings in YYYY-MM-DD format or Date objects
export async function getProductionDates(start: Date, end: Date) {
    const dates = await prisma.productionDate.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        }
    });
    return dates;
}

// Toggle a date's open/close status
export async function toggleProductionDate(dateStr: string, isEnabled: boolean, reason?: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const date = new Date(dateStr);

    // Upsert: Create if not exists, Update if exists
    await prisma.productionDate.upsert({
        where: {
            date: date
        },
        update: {
            enabled: isEnabled,
            reason: reason,
            createdBy: session.user.email
        },
        create: {
            date: date,
            enabled: isEnabled,
            reason: reason,
            createdBy: session.user.email
        }
    });

    revalidatePath("/admin/calendar");
}
