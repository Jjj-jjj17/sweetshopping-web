'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

const selectOptions: Record<string, { value: string; label: string }[]> = {
  holiday_mode: [
    { value: 'auto', label: '🗓 自動（依日期排程）' },
    { value: 'manual', label: '🎛 手動指定' },
  ],
  holiday_manual: [
    { value: 'none', label: '— 關閉特效' },
    { value: 'spring', label: '🧧 春節' },
    { value: 'valentine', label: '💝 情人節' },
    { value: 'mooncake', label: '🌕 中秋節' },
    { value: 'halloween', label: '👻 萬聖節' },
    { value: 'christmas', label: '❄️ 聖誕節' },
    { value: 'newyear', label: '🎆 跨年' },
  ],
}

const inputStyle = { width: '100%', padding: '10px 14px', fontSize: '15px', color: '#1D1D1F', backgroundColor: '#F5F5F7', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontFamily: 'inherit', boxSizing: 'border-box' as const }

export default function ContentPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [items, setItems] = useState<{ key: string; label: string; value: string }[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('site_content').select('*').order('key').then(({ data }) => {
      if (data) setItems(data)
    })
  }, [])

  async function handleSave(key: string, value: string) {
    setSaving(key)
    await supabase.from('site_content').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const isSelect = (key: string) => ['holiday_mode', 'holiday_manual'].includes(key)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1D1D1F', marginBottom: '8px' }}>網站內容管理</h1>
      <p style={{ fontSize: '15px', color: '#6E6E73', marginBottom: '40px' }}>直接編輯文字後點儲存，前台即時更新</p>

      {items.map(item => (
        <div key={item.key} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            {item.label}
          </label>

          {isSelect(item.key) ? (
            <select
              value={item.value}
              onChange={e => {
                const updated = items.map(i => i.key === item.key ? { ...i, value: e.target.value } : i)
                setItems(updated)
                handleSave(item.key, e.target.value)
              }}
              style={inputStyle}
            >
              {selectOptions[item.key].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <>
              <textarea
                defaultValue={item.value}
                rows={item.value.length > 100 ? 4 : 2}
                onBlur={e => {
                  const updated = items.map(i => i.key === item.key ? { ...i, value: e.target.value } : i)
                  setItems(updated)
                }}
                style={{ ...inputStyle, resize: 'vertical' as const }}
              />
              <button
                onClick={() => handleSave(item.key, items.find(i => i.key === item.key)?.value || '')}
                style={{ marginTop: '8px', padding: '8px 20px', backgroundColor: saved === item.key ? '#34C759' : '#FF6B6B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                {saving === item.key ? '儲存中...' : saved === item.key ? '✓ 已儲存' : '儲存'}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
