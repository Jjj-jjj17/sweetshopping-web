import { ResolvingMetadata, Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailView from './ProductDetailView';

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    props: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await props.params;
    const id = params.id

    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

    const previousImages = (await parent).openGraph?.images || []

    return {
        title: product ? `${product.name} | SweetShop` : 'SweetShop Dessert',
        description: product?.description || 'Fresh handmade desserts.',
        openGraph: {
            title: product ? product.name : 'SweetShop',
            description: product?.description || 'Order online now!',
            images: product?.image_url ? [product.image_url, ...previousImages] : previousImages,
        },
    }
}

export default async function Page(props: Props) {
    const params = await props.params;
    return <ProductDetailView id={params.id} />;
}
