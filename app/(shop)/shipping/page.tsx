export default function ShippingPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1D1D1F', marginBottom: '8px' }}>
        配送與付款說明
      </h1>
      <p style={{ fontSize: '15px', color: '#6E6E73', marginBottom: '40px' }}>
        Shipping & Payment Info
      </p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', marginBottom: '12px' }}>
          📦 配送方式
        </h2>
        <p style={{ fontSize: '15px', color: '#424245', lineHeight: '1.7' }}>
          目前僅提供 <strong>7-ELEVEN 店到店取貨</strong>。結帳時請填寫您方便取貨的門市名稱與地址，商品備妥後將盡快出貨，取貨期限為到店後 7 天。
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', marginBottom: '12px' }}>
          💵 付款方式
        </h2>
        <p style={{ fontSize: '15px', color: '#424245', lineHeight: '1.7' }}>
          目前僅接受<strong>貨到付款</strong>。取貨時於門市以現金支付即可，無需事先轉帳。
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', marginBottom: '12px' }}>
          ⏱ 出貨時間
        </h2>
        <p style={{ fontSize: '15px', color: '#424245', lineHeight: '1.7' }}>
          訂單確認後 1–3 個工作天內出貨。如遇假日或大量訂單，可能略有延遲，敬請見諒。
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', marginBottom: '12px' }}>
          📞 聯絡我們
        </h2>
        <p style={{ fontSize: '15px', color: '#424245', lineHeight: '1.7' }}>
          如有任何問題，歡迎透過 Instagram 或電話聯繫，我們將盡快回覆。
        </p>
      </section>
    </div>
  )
}
