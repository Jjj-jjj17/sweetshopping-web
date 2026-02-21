"use client";

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/utils/imageCompression';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 3 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (images.length + files.length > maxImages) {
            alert(`You can only upload a maximum of ${maxImages} images.`);
            return;
        }

        setUploading(true);
        const newUrls: string[] = [];

        for (const file of files) {
            try {
                const compressed = await compressImage(file);
                const fileName = `${Date.now()}-${compressed.name}`;

                const { error } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, compressed);

                if (error) {
                    throw error;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);

                newUrls.push(publicUrl);
            } catch (err) {
                console.error("Upload failed", err);
                alert(`Failed to upload ${file.name}`);
            }
        }

        onChange([...images, ...newUrls]);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (indexToRemove: number) => {
        const newImages = images.filter((_, index) => index !== indexToRemove);
        onChange(newImages);
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === images.length - 1) return;

        const newImages = [...images];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className={`grid gap-4 ${images.length > 0 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {images.map((url, index) => (
                    <div key={url} className="relative group aspect-square rounded-md overflow-hidden bg-secondary border">
                        <Image src={url} alt={`Product Image ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {index > 0 && (
                                <Button type="button" size="icon" variant="secondary" className="h-8 w-8 text-xs bg-white text-black hover:bg-gray-200" onClick={() => moveImage(index, 'up')}>
                                    &larr;
                                </Button>
                            )}
                            <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={() => removeImage(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                            {index < images.length - 1 && (
                                <Button type="button" size="icon" variant="secondary" className="h-8 w-8 text-xs bg-white text-black hover:bg-gray-200" onClick={() => moveImage(index, 'down')}>
                                    &rarr;
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {images.length < maxImages && (
                    <div
                        className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors bg-background aspect-square"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                            multiple
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <>
                                <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                                <span className="text-sm font-medium">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Upload Image</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    ({images.length}/{maxImages})
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground">Max 5MB per image. Allowed formats: JPEG, PNG, WEBP.</p>
        </div>
    );
}
