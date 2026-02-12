"use client";

import { useState, useEffect } from "react";
import { toggleProductionDate, getProductionDates } from "@/app/actions/calendar";

interface ProductionDate {
    date: Date;
    enabled: boolean;
    reason: string | null;
}

export default function AdminCalendarClient() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [overrides, setOverrides] = useState<ProductionDate[]>([]);
    const [loading, setLoading] = useState(false);

    // Get current month details
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

    // Fetch data when month changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Fetch with some buffer (previous and next month useful for edge cases, but strict month is fine for grid)
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0);
            // Note: Server action needs to handle serialization if passing Dates directly, 
            // or we pass simpler structure. The server action I wrote accepts Date objects.
            // However, Next.js hydration prefers props serialization. 
            // Let's rely on the server action returning plain JSON-compatible objects if using a client wrapper,
            // or just call it directly.
            try {
                const data = await getProductionDates(start, end);
                setOverrides(data);
            } catch (e) {
                console.error("Failed to load calendar", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month]);

    const handleMonthChange = (offset: number) => {
        setCurrentDate(new Date(year, month + offset, 1));
    };

    const handleToggle = async (day: number) => {
        // Construct strict YYYY-MM-DD date string to avoid timezone issues
        // Create date object at NOON to be safe from shifts when formatting, or just string manipulation
        const targetDate = new Date(year, month, day, 12, 0, 0);
        const dateStr = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD

        // Re-parse for local logic
        const checkDate = new Date(dateStr);
        const dayOfWeek = checkDate.getDay();
        const isDefaultOpen = dayOfWeek === 0 || dayOfWeek === 6;

        // Check local state for override
        const existingIndex = overrides.findIndex(o => {
            const oDate = new Date(o.date).toISOString().split("T")[0];
            return oDate === dateStr;
        });
        const existing = existingIndex >= 0 ? overrides[existingIndex] : null;

        // Determine next state
        const isCurrentlyOpen = existing ? existing.enabled : isDefaultOpen;
        const targetState = !isCurrentlyOpen;

        // Optimistic Update
        const newOverrides = [...overrides];

        if (targetState === isDefaultOpen) {
            // Remove override if returning to default
            if (existingIndex >= 0) {
                newOverrides.splice(existingIndex, 1);
            }
        } else {
            // Add/Update override
            const newOverride = {
                date: new Date(dateStr), // Store as object for consistency with received props
                enabled: targetState,
                reason: targetState ? "Opened by Admin" : "Closed by Admin"
            };

            if (existingIndex >= 0) {
                newOverrides[existingIndex] = newOverride;
            } else {
                newOverrides.push(newOverride);
            }
        }

        setOverrides(newOverrides);

        try {
            await toggleProductionDate(dateStr);
        } catch (e) {
            console.error(e);
            alert("Failed to save changes");
            // Revert state
            setOverrides(overrides);
        }
    };

    // Calendar Grid Generation
    const grid = [];
    // Padding for start of month
    for (let i = 0; i < startDayOfWeek; i++) {
        grid.push(<div key={`pad-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
    }
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const override = overrides.find(o => new Date(o.date).toDateString() === dateObj.toDateString());

        // Determine status
        let isOpen = isWeekend; // Default
        if (override) isOpen = override.enabled;

        grid.push(
            <div
                key={day}
                onClick={() => handleToggle(day)}
                className={`h-32 border border-gray-200 p-2 relative cursor-pointer transition hover:opacity-80
                    ${isOpen ? 'bg-white' : 'bg-gray-100'} 
                    ${override ? (isOpen ? 'ring-2 ring-green-400 inset-0' : 'ring-2 ring-red-400 inset-0') : ''}
                `}
            >
                <div className={`font-bold ${isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{day}</div>
                <div className="mt-2 text-xs">
                    {isOpen ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Open</span>
                    ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">Closed</span>
                    )}
                </div>
                {override && (
                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 italic">
                        Manual
                    </div>
                )}
            </div>
        );
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => handleMonthChange(-1)} className="px-4 py-2 border rounded hover:bg-gray-50">&larr; Prev</button>
                <h2 className="text-xl font-bold">{monthNames[month]} {year}</h2>
                <button onClick={() => handleMonthChange(1)} className="px-4 py-2 border rounded hover:bg-gray-50">Next &rarr;</button>
            </div>

            <div className="grid grid-cols-7 gap-px mb-px">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center font-bold text-gray-500 py-2">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px border border-gray-200 bg-gray-200">
                {grid}
            </div>

            <div className="mt-4 flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300"></div> Default Open (Weekend)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div> Default Closed (Weekday)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 ring-2 ring-green-400 bg-white"></div> Forced Open
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 ring-2 ring-red-400 bg-gray-100"></div> Forced Closed
                </div>
            </div>
        </div>
    );
}
