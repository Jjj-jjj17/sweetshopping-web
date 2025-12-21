import { getProduct } from "@/app/actions/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";


interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;
    const product = await getProduct(id);
    const session = await auth();

    if (!product) {
        notFound();
    }

    // Convert Decimal to number for Client Component serialization
    const productForClient = {
        ...product,
        price: Number(product.price),
        // Ensure fields are passed correctly (Prisma might return them even if empty)
        fields: product.fields || []
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Reusing simplified header for now - ideally extract to Layout */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
                        Sweet's
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link href="/cart" className="text-sm font-medium text-gray-700 hover:text-black">
                            Cart
                        </Link>
                        {session ? (
                            <div className="flex items-center gap-4">
                                {session.user?.role === "ADMIN" && (
                                    <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600">
                                        Admin Dashboard
                                    </Link>
                                )}
                                <form action={async () => { "use server"; await signOut(); }}>
                                    <button className="text-sm font-medium text-gray-700 hover:text-red-600">
                                        Sign Out
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <form action={async () => { "use server"; await signIn("google"); }}>
                                <button className="text-sm font-medium text-gray-900 hover:underline">
                                    Sign In
                                </button>
                            </form>
                        )}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                {/* Breadcrumb replacement / Back link */}
                <div className="mb-8">
                    <Link href="/" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
                        &larr; Back to Shop
                    </Link>
                </div>

                <ProductDetailClient product={productForClient} />
            </main>
        </div>
    );
}
