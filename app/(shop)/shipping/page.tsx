import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

export default async function ShippingPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase.from('site_content').select('key, value')
  const c: Record<string, string> = {}
  data?.forEach(row => { c[row.key] = row.value })

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1D1D1F', marginBottom: '40px' }}>{c.shipping_title}</h1>
      {[
        { emoji: '📦', title: '配送方式', key: 'shipping_delivery' },
        { emoji: '💵', title: '付款方式', key: 'shipping_payment' },
        { emoji: '⏱', title: '出貨時間', key: 'shipping_time' },
        { emoji: '📞', title: '聯絡我們', key: 'shipping_contact' },
      ].map(section => (
        <section key={section.key} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', marginBottom: '12px' }}>{section.emoji} {section.title}</h2>
          <p style={{ fontSize: '15px', color: '#424245', lineHeight: '1.7' }}>{c[section.key]}</p>
        </section>
      ))}
    </div>
  )
}
