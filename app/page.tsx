import { auth, signIn, signOut } from "@/auth";
import { getActiveProducts } from "@/app/actions/products";
import { getActiveAnnouncements } from "@/app/actions/announcements";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const products = await getActiveProducts();
  const announcements = await getActiveAnnouncements();

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Nav (Ideally move to a layout component later, but keeping simple here for now) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
            Sweet's
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/faq" className="text-sm font-medium text-gray-700 hover:text-black">
              Q&A
            </Link>
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
                <Link href="/orders" className="text-sm font-medium text-gray-700 hover:text-black">
                  My Orders
                </Link>
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

      <main>
        {/* Hero Section */}
        <section className="relative bg-gray-900 text-white py-24 sm:py-32">
          <div className="absolute inset-0 overflow-hidden">
            {/* Hero Backgound Image would go here */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Handcrafted Sweets, <br /> Made with Love.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              Pre-order premium desserts for your special moments.
              Baked fresh on weekends, delivered with care.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <a href="#products" className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Order Now
              </a>
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-lg border ${ann.pinned ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex items-start gap-3">
                    {ann.pinned && <span className="text-lg">📌</span>}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{ann.title}</h3>
                      <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Product Grid */}
        <section id="products" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Latest Creations</h2>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available at the moment. Please check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-gray-50 border-t py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Sweet's Shoing Web. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
