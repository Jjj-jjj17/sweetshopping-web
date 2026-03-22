import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

const DEFAULTS: Record<string, string> = {
  shipping_title: '配送與付款說明',
  shipping_delivery: '目前僅提供 7-ELEVEN 店到店取貨。結帳時請填寫您方便取貨的門市名稱與地址，商品備妥後將盡快出貨，取貨期限為到店後 7 天。',
  shipping_payment: '目前僅接受貨到付款。取貨時於門市以現金支付即可，無需事先轉帳。',
  shipping_time: '訂單確認後 1–3 個工作天內出貨。如遇假日或大量訂單，可能略有延遲，敬請見諒。',
  shipping_contact: '如有任何問題，歡迎透過 Instagram 或電話聯繫，我們將盡快回覆。',
}

export default async function ShippingPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase.from('site_content').select('key, value')
  const c: Record<string, string> = { ...DEFAULTS }
  data?.forEach(row => { if (row.value) c[row.key] = row.value })

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1D1D1F', marginBottom: '8px' }}>
        {c.shipping_title}
      </h1>
      <p style={{ fontSize: '15px', color: '#6E6E73', marginBottom: '40px' }}>
        Shipping & Payment Info
      </p>

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
