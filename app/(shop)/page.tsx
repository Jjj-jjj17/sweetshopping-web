import { createClient } from '@supabase/supabase-js';
import ShopHomeClient from './ShopHomeClient';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function ShopPage() {
    console.log('=== SHOP PAGE SSR DEBUG ===')

    // CRITICAL: Use anon key for public access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    console.log('Supabase URL configured:', !!supabaseUrl)
    console.log('Anon key configured:', !!supabaseAnonKey)

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('Fetching products for anonymous users...')

    // Fetch products server-side
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

    console.log('Products fetch result:', {
        count: products?.length,
        error: error?.message,
    })

    if (error) {
        console.error('Products fetch error:', error);
    }

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <ShopHomeClient initialProducts={(products as Product[]) || []} />
        </Suspense>
    );
}
