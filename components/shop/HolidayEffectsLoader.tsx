'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import HolidayEffects from './HolidayEffects'

export default function HolidayEffectsLoader() {
  const [mode, setMode] = useState('auto')
  const [manualHoliday, setManualHoliday] = useState('none')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase
      .from('site_content')
      .select('key, value')
      .in('key', ['holiday_mode', 'holiday_manual'])
      .then(({ data }) => {
        if (data) {
          data.forEach(row => {
            if (row.key === 'holiday_mode') setMode(row.value)
            if (row.key === 'holiday_manual') setManualHoliday(row.value)
          })
        }
        setLoaded(true)
      })
  }, [])

  if (!loaded) return null

  return <HolidayEffects mode={mode} manualHoliday={manualHoliday} />
}
