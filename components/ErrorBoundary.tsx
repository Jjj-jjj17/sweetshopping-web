"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-xl border border-red-200 text-center space-y-4">
                        <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-red-900">Something went wrong</h2>
                        <p className="text-sm text-red-700">
                            {this.state.error?.message || "An unexpected error occurred in the kitchen dashboard."}
                        </p>
                        <div className="pt-2">
                            <Button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.reload();
                                }}
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                Reload Application
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            If this persists, please Export your data from settings (if accessible) or contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
