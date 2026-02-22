import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function OrderConfirmationPage({
    params
}: {
    params: { id: string }
}) {
    console.log('=== ORDER CONFIRMATION PAGE ===')
    console.log('Raw params:', params)
    console.log('Order ID to fetch:', params.id)
    console.log('ID type:', typeof params.id)
    console.log('ID length:', params.id?.length)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('Supabase URL configured:', !!supabaseUrl)
    console.log('Supabase Key configured:', !!supabaseKey)

    const supabase = createClient(supabaseUrl!, supabaseKey!)

    console.log('Attempting to fetch order...')

    const { data: order, error, status, statusText } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()

    console.log('Fetch completed')
    console.log('Status:', status)
    console.log('Status Text:', statusText)
    console.log('Error:', error)
    console.log('Order data:', order ? 'Exists' : 'Null')

    if (error) {
        console.error('=== FETCH ERROR DETAILS ===')
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)

        // Show detailed debug page
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Order Fetch Failed (Debug Mode)
                    </h1>
                    <div className="space-y-2 text-sm text-foreground">
                        <p><strong>Order ID:</strong> {params.id}</p>
                        <p><strong>Status:</strong> {status}</p>
                        <p><strong>Error Code:</strong> {error.code}</p>
                        <p><strong>Error Message:</strong> {error.message}</p>
                        <p><strong>Details:</strong> {error.details}</p>
                        <p><strong>Hint:</strong> {error.hint}</p>
                    </div>
                    <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded text-xs overflow-auto">
                        {JSON.stringify({ error, params, status }, null, 2)}
                    </pre>
                    <div className="mt-6">
                        <Link href="/"><Button variant="outline">Back to Shop</Button></Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        console.error('No order returned but also no error')
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-red-600">
                        Order Not Found (Null Data)
                    </h1>
                    <p className="mt-4 text-foreground">Order ID: {params.id}</p>
                    <div className="mt-6">
                        <Link href="/"><Button variant="outline">Back to Shop</Button></Link>
                    </div>
                </div>
            </div>
        )
    }

    console.log('=== ORDER FETCH SUCCESS ===')
    console.log('Order customer:', order.customer_name)
    console.log('Order total:', order.total)

    // Render success page
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-2">
                        訂單已確認！
                    </h1>
                    <p className="text-muted-foreground">
                        訂單編號：{order.id}
                    </p>
                </div>

                <div className="bg-card border rounded-lg p-6 text-left shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">訂單詳情</h2>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong className="text-foreground">客戶姓名：</strong>{order.customer_name}</p>
                        <p><strong className="text-foreground">Email：</strong>{order.customer_email}</p>
                        <p><strong className="text-foreground">電話：</strong>{order.customer_phone}</p>
                        <p><strong className="text-foreground">取貨門市：</strong>{order.delivery_address}</p>
                        <p className="text-lg font-bold mt-4 text-primary">
                            總金額：${order.total}
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto">
                            繼續購物
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
