"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error("Uncaught Error in Boundary", { error: error.message, stack: errorInfo.componentStack });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        We apologize for the inconvenience. The error has been logged.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Reload Application
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
