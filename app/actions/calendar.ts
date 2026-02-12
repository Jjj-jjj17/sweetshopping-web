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

// Toggle a date's open/close status with return-to-default logic
export async function toggleProductionDate(dateStr: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    // Parse date strictly as UTC/Local YYYY-MM-DD to avoid shifts
    // We expect "YYYY-MM-DD" string
    const date = new Date(dateStr);

    // Check default rule (Weekend = Open)
    const day = date.getDay();
    const isDefaultOpen = day === 0 || day === 6; // Sun=0, Sat=6

    // Find existing override
    const existing = await prisma.productionDate.findUnique({
        where: { date: date }
    });

    // Current State
    const isCurrentlyOpen = existing ? existing.enabled : isDefaultOpen;
    const targetState = !isCurrentlyOpen;

    if (targetState === isDefaultOpen) {
        // Targeted state matches default, so we can clean up the override
        if (existing) {
            await prisma.productionDate.delete({
                where: { date: date }
            });
        }
    } else {
        // Targeted state is different from default, enforce override
        await prisma.productionDate.upsert({
            where: { date: date },
            update: {
                enabled: targetState,
                createdBy: session.user.email,
                reason: targetState ? "Opened by Admin" : "Closed by Admin"
            },
            create: {
                date: date,
                enabled: targetState,
                createdBy: session.user.email,
                reason: targetState ? "Opened by Admin" : "Closed by Admin"
            }
        });
    }

    revalidatePath("/admin/calendar");
}
