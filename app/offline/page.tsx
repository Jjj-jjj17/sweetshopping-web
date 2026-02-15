"use client";

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
    return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4 text-center p-4">
            <div className="bg-secondary/30 p-6 rounded-full">
                <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">You are offline</h1>
            <p className="text-muted-foreground max-w-sm">
                It seems you have lost internet connection.
                Don't worry, check your Wi-Fi and try again.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
    );
}
