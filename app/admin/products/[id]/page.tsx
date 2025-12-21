import { createProduct, getProduct, updateProduct } from "@/app/actions/products";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductFormPage({ params }: PageProps) {
    const { id } = await params;
    const isNew = id === "new";
    let product = null;

    if (!isNew) {
        product = await getProduct(id);
        if (!product) {
            return (
                <div>Product not found</div>
            )
        }
    }

    // Handle server action logic via wrapper to capture FormData + ID
    async function saveAction(formData: FormData) {
        "use server";
        if (isNew) {
            await createProduct(formData);
        } else {
            await updateProduct(id, formData);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{isNew ? "Create Product" : `Edit: ${product?.name}`}</h1>
                <Link href="/admin/products" className="text-gray-500 hover:text-gray-800">Cancel</Link>
            </div>

            <form action={saveAction} className="bg-white p-6 rounded shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                        name="name"
                        defaultValue={product?.name}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-black focus:border-black"
                        required
                        placeholder="e.g. Chocolate Cake"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        defaultValue={product?.description}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-black focus:border-black"
                        required
                        rows={4}
                        placeholder="Delicious ingredients..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {product && product.images && product.images.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500">
                            Current images: {product.images.length} (Upload new one to add)
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (TWD)</label>
                        <input
                            name="price"
                            type="number"
                            defaultValue={Number(product?.price) || 0}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                            min="0"
                        />
                    </div>

                    <div className="flex items-center h-full pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                name="active"
                                type="checkbox"
                                defaultChecked={product ? product.active : true}
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <span className="text-sm font-medium text-gray-700">Available for Sale</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                    <Link href="/admin/products" className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</Link>
                    <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                        {isNew ? "Create Product" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
