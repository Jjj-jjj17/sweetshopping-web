"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Security: Allowed MIME types (explicit whitelist, no SVG)
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

// Security: Max upload size (default 5MB, configurable via env)
const MAX_UPLOAD_BYTES = (() => {
    const v = process.env.UPLOAD_MAX_BYTES;
    const n = v ? Number(v) : 5 * 1024 * 1024;
    return Number.isFinite(n) && n > 0 ? n : 5 * 1024 * 1024;
})();

export async function uploadImage(file: File): Promise<string> {
    // Validation: Must have file
    if (!file) {
        throw new Error("No file provided");
    }

    // Validation: Size check BEFORE reading buffer
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("File too large");
    }

    // Validation: Type whitelist (rejects SVG explicitly)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        throw new Error("Invalid file type");
    }

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
