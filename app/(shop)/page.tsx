import { createClient } from '@supabase/supabase-js';
import ShopHomeClient from './ShopHomeClient';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch products and site_content in parallel
    const [productsRes, contentRes] = await Promise.all([
        supabase
            .from('products')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false }),
        supabase
            .from('site_content')
            .select('key, value'),
    ]);

    const products = productsRes.data;
    const siteContent: Record<string, string> = {};
    contentRes.data?.forEach(row => {
        if (row.value) siteContent[row.key] = row.value;
    });

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <ShopHomeClient
                initialProducts={(products as Product[]) || []}
                siteContent={siteContent}
            />
        </Suspense>
    );
}
