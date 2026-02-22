import { createClient } from '@supabase/supabase-js';
import ShopHomeClient from './ShopHomeClient';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function ShopPage() {
    // Use anon key for public access
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch products server-side
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
    }

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <ShopHomeClient initialProducts={(products as Product[]) || []} />
        </Suspense>
    );
}
