import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 1,           // Max size in MB
        maxWidthOrHeight: 1920, // Max width/height
        useWebWorker: true,
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Image compression failed:", error);
        throw error; // Let caller handle
    }
}
