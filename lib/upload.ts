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

// Security: Allowed extensions (fallback when file.type is empty)
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

// Security: Max upload size (default 5MB, configurable via env)
const MAX_UPLOAD_BYTES = (() => {
    const v = process.env.UPLOAD_MAX_BYTES;
    const n = v ? Number(v) : 5 * 1024 * 1024;
    return Number.isFinite(n) && n > 0 ? n : 5 * 1024 * 1024;
})();

/**
 * Get file extension from filename (lowercase, with dot)
 */
function getExtension(filename: string): string {
    const idx = filename.lastIndexOf(".");
    return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

export async function uploadImage(file: File): Promise<string> {
    // Validation: Must have file
    if (!file) {
        throw new Error("No file provided");
    }

    // Validation: Size check BEFORE reading buffer
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error("File too large");
    }

    // Extract extension for fallback validation
    const ext = getExtension(file.name);

    // Always reject SVG regardless of how it's submitted
    if (ext === ".svg" || file.type === "image/svg+xml") {
        throw new Error("Invalid file type");
    }

    // Validation: Type whitelist with extension fallback
    if (file.type && file.type.length > 0) {
        // Primary: MIME type is present, use whitelist
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
            throw new Error("Invalid file type");
        }
    } else {
        // Fallback: MIME type is missing, use extension whitelist
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            throw new Error("Invalid file type");
        }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Storage: Files saved to <project>/public/uploads/
    // Return path is relative URL: /uploads/<filename>
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
    const fileName = `${uuidv4()}-${sanitizedName}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Return web-accessible path (served by Next.js from public/)
    return `/uploads/${fileName}`;
}
