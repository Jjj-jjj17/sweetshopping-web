import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Use Portal if possible, but for simplicity in app router just rendering here is often fine if high enough z-index.
    // I'll stick to direct render with fixed position for simplicity and robustness in V1.

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={cn("bg-background border rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col", className)}
                role="dialog"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};
