"use server";

import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";

// Schema for Product Validation
const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be >= 0"),
    active: z.coerce.boolean(),
    // Customization schema and images handled separately or via JSON parse if needed
});

async function checkAdmin() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

import { uploadImage } from "@/lib/upload";

export async function createProduct(formData: FormData) {
    await checkAdmin();

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        active: formData.get("active") === "on",
    };

    const validation = productSchema.safeParse(rawData);
    if (!validation.success) {
        return { error: validation.error.flatten() };
    }

    const imageFile = formData.get("image") as File;
    let imagePath = null;

    if (imageFile && imageFile.size > 0) {
        imagePath = await uploadImage(imageFile);
    }

    await prisma.product.create({
        data: {
            ...validation.data,
            images: imagePath ? {
                create: { url: imagePath, sortOrder: 0 }
            } : undefined
        },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
    await checkAdmin();

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        active: formData.get("active") === "on",
    };

    const validation = productSchema.safeParse(rawData);
    if (!validation.success) {
        return { error: validation.error.flatten() };
    }

    const imageFile = formData.get("image") as File;

    // Update basic fields
    await prisma.product.update({
        where: { id },
        data: validation.data,
    });

    // Handle new image upload (as additional image for now, or replace? MVP: Add)
    if (imageFile && imageFile.size > 0) {
        const imagePath = await uploadImage(imageFile);
        await prisma.productImage.create({
            data: {
                productId: id,
                url: imagePath,
                sortOrder: 0 // Logic to put at end could be added later
            }
        });
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath(`/products/${id}`); // Update Detail page
    redirect("/admin/products");
}

export async function deleteProduct(id: string) {
    await checkAdmin();
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    revalidatePath("/");
}

export async function getProducts() {
    //   await checkAdmin(); // Optional: public might need this too? No, this is admin action file.
    return await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: { images: true },
    });
}

export async function getProduct(id: string) {
    return await prisma.product.findUnique({
        where: { id },
        include: { images: true, fields: { include: { options: true } } },
    });
}

export async function getActiveProducts() {
    return await prisma.product.findMany({
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: { images: true },
    });
}
