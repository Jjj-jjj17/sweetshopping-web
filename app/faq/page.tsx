import Link from "next/link";

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header (replicated from Home for now, ideally shared component) */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
                        Sweet's
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/cart" className="text-sm font-medium text-gray-700 hover:text-black">
                            Cart
                        </Link>
                        <Link href="/" className="text-sm font-medium text-gray-700 hover:text-black">
                            Back to Home
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions (Q&A)</h1>

                <div className="space-y-12">

                    {/* Product Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Product & Ingredients</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">What are your Meringues made of?</h3>
                                <p className="text-gray-600 mt-1">
                                    Our meringues are handcrafted using premium egg whites and sugar, cooked to a safe temperature (Swiss Meringue method).
                                    We rely on natural ingredients and minimal additives.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Are they vegetarian friendly?</h3>
                                <p className="text-gray-600 mt-1">
                                    Yes, they contain eggs (ovo-vegetarian) but no gelatin.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">How long do they last?</h3>
                                <p className="text-gray-600 mt-1">
                                    Please store in a cool, dry place. Meringues can last up to 2-3 weeks if kept in an airtight container away from humidity.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Ordering Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Ordering & Customization</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Is there a minimum order?</h3>
                                <div className="text-gray-600 mt-1">
                                    Yes. To ensure efficient production:
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li><strong>Per Design:</strong> Minimum 10 units.</li>
                                        <li><strong>Total Order:</strong> Minimum subtotal of NT$500.</li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Do you offer trial sketches for custom designs?</h3>
                                <p className="text-gray-600 mt-1">
                                    We do not provide trial sketches or previews. Our artists will create the design based on your reference, but please understand that
                                    handmade products will naturally have slight variations. We do not refund for "style preference" reasons.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">How do I confirm my order?</h3>
                                <p className="text-gray-600 mt-1">
                                    After placing your order, you must pay a <strong>30% deposit</strong> to secure your slot.
                                    We will contact you with payment details.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Section */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Shipping & Delivery</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Can I pick up my order?</h3>
                                <p className="text-gray-600 mt-1">
                                    Yes! We offer 7-11 Convenience Store Pickup. You can also choose Post Office delivery.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">What if my items arrive broken?</h3>
                                <p className="text-gray-600 mt-1">
                                    Meringues are fragile. We package them with extreme care, but we cannot guarantee zero damage during transit.
                                    <strong>Shipping damage is not refundable</strong>, though we may offer compensation in severe cases at our discretion.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            <footer className="bg-gray-50 border-t py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Sweet's Shoing Web. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
