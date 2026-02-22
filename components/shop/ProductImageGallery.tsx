"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductImageGallery({ images, name }: { images: string[], name: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center border">
                <ImageIcon className="h-16 w-16 text-muted-foreground opacity-30" />
            </div>
        );
    }

    const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="space-y-4">
            {/* Main Image View */}
            <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden border">
                <Image
                    src={images[currentIndex]}
                    alt={`${name} - Image ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                />

                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white text-black shadow-sm"
                            onClick={prev}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white text-black shadow-sm"
                            onClick={next}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 md:gap-4">
                    {images.map((url, idx) => (
                        <button
                            key={idx}
                            className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            onClick={() => setCurrentIndex(idx)}
                        >
                            <Image src={url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
