"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return `/uploads/${fileName}`;
}
