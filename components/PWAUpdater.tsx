"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function PWAUpdater() {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            // @ts-ignore - workbox is injected by next-pwa
            window.workbox !== undefined
        ) {
            // @ts-ignore
            const wb = window.workbox;

            const promptNewVersionAvailable = () => {
                toast("New version available", {
                    action: {
                        label: "Refresh",
                        onClick: () => {
                            wb.addEventListener("controlling", () => {
                                window.location.reload();
                            });
                            wb.messageSkipWaiting();
                        }
                    },
                    duration: Infinity
                });
            };

            wb.addEventListener("waiting", promptNewVersionAvailable);
            wb.register();
        }
    }, []);

    return null;
}
