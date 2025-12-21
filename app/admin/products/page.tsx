import { getProducts, deleteProduct } from "@/app/actions/products";
import Link from "next/link";

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                >
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded shadow text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-medium text-gray-500">Name</th>
                            <th className="p-4 font-medium text-gray-500">Price</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No products found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 font-medium">{product.name}</td>
                                    <td className="p-4">${Number(product.price).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {product.active ? "Active" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await deleteProduct(product.id);
                                            }}>
                                                <button type="submit" className="text-red-600 hover:underline">
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
