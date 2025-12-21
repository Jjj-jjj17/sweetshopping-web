"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, CartItem } from "@/lib/cart";
import {
    getEarliestAvailableDate,
    isValidOrderDate,
    isDateAvailable, // Use new validator
    validateCartBusinessRules,
    calculateDeposit
} from "@/lib/business";
import { placeOrder } from "@/app/actions/orders";
import { getProductionDates } from "@/app/actions/calendar"; // Import Server Action
import { addMonths } from "date-fns";

export default function CheckoutPage() {
    const router = useRouter();
    // Force recompile: v5.0
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Calendar Data
    const [calendarOverrides, setCalendarOverrides] = useState<{ date: Date | string, enabled: boolean }[]>([]);

    // Checkout Form State
    const [date, setDate] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState("SEVEN_ELEVEN");
    const [policyAccepted, setPolicyAccepted] = useState(false);

    useEffect(() => {
        const items = getCart();
        if (items.length === 0) {
            router.push("/cart");
        }
        setCart(items);

        // Fetch Calendar Data (Next 3 months)
        const fetchCalendar = async () => {
            const today = new Date();
            const end = addMonths(today, 3);
            try {
                const dates = await getProductionDates(today, end);
                setCalendarOverrides(dates);
            } catch (e) {
                console.error("Failed to load calendar", e);
            }
        };
        fetchCalendar();

        setIsLoaded(true);
    }, [router]);

    const validationError = isLoaded ? validateCartBusinessRules(cart) : null;
    const isBusinessRuleValid = !validationError;

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const depositAmount = calculateDeposit(totalAmount);
    const earliestDate = getEarliestAvailableDate().toISOString().split("T")[0];

    // Helper to check validity using loaded overrides
    const checkDateValidity = (dateStr: string) => {
        if (!dateStr) return false;
        return isDateAvailable(new Date(dateStr), calendarOverrides);
    };

    async function handleSubmit(formData: FormData) {
        setError("");

        // Frontend Checks
        if (!isBusinessRuleValid) {
            setError(validationError?.message || "Invalid cart.");
            window.scrollTo(0, 0);
            return;
        }
        if (!policyAccepted) {
            setError("You must accept the policies to proceed.");
            return;
        }
        // Double check date
        if (!checkDateValidity(date)) {
            setError("Selected date is not available. Please choose a valid weekend or open date.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await placeOrder(cart, formData);

            if (result?.error) {
                if (typeof result.error === 'string') {
                    setError(result.error);
                } else {
                    // Handle Zod flattened error
                    const zodError = result.error as any;
                    let errorMessages: string[] = [];

                    if (zodError.fieldErrors) {
                        for (const [field, messages] of Object.entries(zodError.fieldErrors)) {
                            if (Array.isArray(messages) && messages.length > 0) {
                                errorMessages.push(`${field}: ${messages.join(", ")}`);
                            }
                        }
                    }

                    if (zodError.formErrors && Array.isArray(zodError.formErrors) && zodError.formErrors.length > 0) {
                        errorMessages.push(...zodError.formErrors);
                    }

                    if (errorMessages.length > 0) {
                        setError(errorMessages.join("\n"));
                    } else {
                        // Fallback if structure is unexpected
                        setError("Please check your inputs.");
                        console.error(result.error);
                    }
                }
            } else if (result?.success) {
                localStorage.removeItem("sweets_cart");
                router.push(`/orders/${result.orderId}/success`);
            }
        } catch (e) {
            console.error(e);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isLoaded) return <div className="p-8 text-center text-text-primary">Loading checkout...</div>;

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
                    <h1 className="text-xl font-bold text-text-primary">Checkout</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">

                {/* Business Rule Warnings */}
                {!isBusinessRuleValid && (
                    <div className="bg-red-50 border-l-4 border-error p-4 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {validationError?.message}
                                </p>
                                <button onClick={() => router.push('/cart')} className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-600">
                                    Return to Cart to Fix
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg mb-8 shadow-sm border border-gray-200">
                    <h2 className="font-bold text-lg mb-4 text-gray-900">Order Summary</h2>
                    <div className="flex justify-between text-base mb-2 text-gray-700">
                        <span>Total Items</span>
                        <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 mt-4 border-t border-gray-200 pt-4">
                        <span>Total Amount</span>
                        <span>${totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-blue-900 mt-2">
                        <span>Required Deposit (30%)</span>
                        <span>${depositAmount}</span>
                    </div>
                </div>

                <form action={handleSubmit} className="space-y-8">
                    {error && <div className="p-4 bg-red-100 text-red-700 rounded border border-red-200 font-medium">{error}</div>}

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl text-gray-900">Contact Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">Name</label>
                                <input name="name" required className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-black focus:border-black" placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">Phone</label>
                                <input name="phone" required className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-black focus:border-black" placeholder="0912-345-678" />
                            </div>
                        </div>
                    </div>

                    {/* Delivery */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl text-gray-900">Delivery Method</h3>
                        <div>
                            <select
                                name="deliveryMethod"
                                className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 font-medium focus:ring-2 focus:ring-black focus:border-black"
                                value={deliveryMethod}
                                onChange={(e) => setDeliveryMethod(e.target.value)}
                            >
                                <option value="SEVEN_ELEVEN">7-11 Convenience Store Pickup</option>
                                <option value="POST_OFFICE">Post Office / Courier</option>
                            </select>
                        </div>

                        {deliveryMethod === "SEVEN_ELEVEN" ? (
                            <div className="bg-gray-50 p-6 rounded border border-gray-200 space-y-4">
                                <label className="block text-base font-bold mb-2 text-gray-900">Store Information (Manual Input)</label>

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-gray-800">Store Name / Store ID (Optional)</label>
                                    <input
                                        name="storeName"
                                        required
                                        className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 focus:ring-black focus:border-black"
                                        placeholder="e.g. Taipei 101 Store (111001)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-gray-800">Store Address (Full)</label>
                                    <input
                                        name="storeAddress"
                                        required
                                        className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 focus:ring-black focus:border-black"
                                        placeholder="e.g. No. 7, Sec. 5, Xinyi Rd, Xinyi Dist, Taipei City"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">Postal Address</label>
                                <textarea
                                    name="deliveryDetails"
                                    required
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 focus:ring-black focus:border-black"
                                    rows={3}
                                    placeholder="Enter full shipping address..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Preferred Date */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl text-gray-900">Preferred Date</h3>
                        <p className="text-sm text-gray-600">
                            Lead time is {14} days. Production normally on weekends only, check specific dates.
                        </p>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-900">Date</label>
                            <input
                                type="date"
                                name="date"
                                required
                                min={earliestDate}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-gray-900 font-medium focus:ring-black focus:border-black"
                            />
                            {/* Detailed Feedback */}
                            {date && !checkDateValidity(date) && (
                                <div className="mt-2 text-red-700 font-bold text-sm bg-red-50 p-2 rounded">
                                    <p>Selected date is not available.</p>
                                    <p className="text-xs font-normal mt-1">Must be a Weekend (Sat/Sun) or a specially opened date, and at least 14 days in advance.</p>
                                    {/* Optional: Check if it's open but before lead time vs closed */}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                        <h3 className="font-bold text-xl text-gray-900">Policies & Agreements</h3>
                        <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 space-y-2 border border-gray-200">
                            <p><strong className="text-gray-900">Customization:</strong> No preview or trial drawing. No refunds for "different from imagination".</p>
                            <p><strong className="text-gray-900">Handmade Variance:</strong> Minor color/style variations are normal.</p>
                            <p><strong className="text-gray-900">Shipping:</strong> Damage during shipping is not refundable (compensation at discretion).</p>
                            <p><strong className="text-gray-900">Deposit:</strong> A 30% deposit is required to confirm the order.</p>
                        </div>
                        <div className="flex items-start gap-3 mt-4">
                            <input
                                type="checkbox"
                                id="policyCheck"
                                className="mt-1 h-5 w-5 text-black border-gray-300 rounded focus:ring-black"
                                checked={policyAccepted}
                                onChange={(e) => setPolicyAccepted(e.target.checked)}
                            />
                            <label htmlFor="policyCheck" className="text-base font-medium text-gray-900 cursor-pointer">
                                I have read and agree to the above policies.
                            </label>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting || !isBusinessRuleValid || !policyAccepted || (!!date && !checkDateValidity(date))}
                            className="w-full bg-black text-white p-4 rounded-lg font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            {isSubmitting ? "Placing Order..." : `Confirm Order (Deposit: $${depositAmount})`}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
