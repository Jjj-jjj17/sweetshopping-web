'use client'
import { useEffect, useState } from 'react'

type Holiday = 'spring' | 'valentine' | 'halloween' | 'christmas' | 'newyear' | 'mooncake' | 'none'

function detectHoliday(): Holiday {
  const now = new Date()
  const m = now.getMonth() + 1
  const d = now.getDate()
  if ((m === 1 && d <= 20) || (m === 2 && d <= 5)) return 'spring'
  if (m === 2 && d >= 10 && d <= 14) return 'valentine'
  if (m === 9 && d >= 15 && d <= 20) return 'mooncake'
  if (m === 10 && d >= 25) return 'halloween'
  if (m === 12 && d >= 20 && d <= 26) return 'christmas'
  if ((m === 12 && d === 31) || (m === 1 && d === 1)) return 'newyear'
  return 'none'
}

const PARTICLES: Record<Holiday, { emoji: string; count: number; speed: number; size: string }[]> = {
  spring: [
    { emoji: '🧧', count: 8, speed: 6, size: '28px' },
    { emoji: '🏮', count: 5, speed: 8, size: '24px' },
    { emoji: '✨', count: 10, speed: 10, size: '16px' },
  ],
  valentine: [
    { emoji: '🤍', count: 6, speed: 7, size: '20px' },
    { emoji: '💝', count: 5, speed: 9, size: '26px' },
    { emoji: '🌸', count: 8, speed: 11, size: '18px' },
  ],
  halloween: [
    { emoji: '👻', count: 7, speed: 5, size: '36px' },
    { emoji: '🦇', count: 5, speed: 7, size: '22px' },
    { emoji: '🕷️', count: 4, speed: 9, size: '18px' },
  ],
  christmas: [
    { emoji: '❄️', count: 14, speed: 12, size: '18px' },
    { emoji: '⛄', count: 4, speed: 15, size: '28px' },
    { emoji: '🎄', count: 4, speed: 13, size: '22px' },
  ],
  newyear: [
    { emoji: '🎆', count: 6, speed: 6, size: '32px' },
    { emoji: '🎉', count: 8, speed: 8, size: '22px' },
    { emoji: '⭐', count: 10, speed: 10, size: '16px' },
  ],
  mooncake: [
    { emoji: '🌕', count: 3, speed: 20, size: '36px' },
    { emoji: '🐰', count: 5, speed: 12, size: '24px' },
    { emoji: '🏮', count: 6, speed: 10, size: '20px' },
  ],
  none: [],
}

interface Particle {
  id: number
  emoji: string
  x: number
  y: number
  size: string
  duration: number
  delay: number
  drift: number
  rotate: number
  holiday: Holiday
}

function generateParticles(holiday: Holiday): Particle[] {
  if (holiday === 'none') return []
  const result: Particle[] = []
  let id = 0
  PARTICLES[holiday].forEach(({ emoji, count, speed, size }) => {
    for (let i = 0; i < count; i++) {
      result.push({
        id: id++,
        emoji,
        x: Math.random() * 100,
        y: -10 - Math.random() * 30,
        size,
        duration: speed + Math.random() * 6,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 120,
        rotate: Math.random() * 360,
        holiday,
      })
    }
  })
  return result
}

export default function HolidayEffects({ mode, manualHoliday }: { mode: string; manualHoliday: string }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [holiday, setHoliday] = useState<Holiday>('none')

  useEffect(() => {
    const h: Holiday = mode === 'manual'
      ? (manualHoliday as Holiday)
      : detectHoliday()
    setHoliday(h)
    setParticles(generateParticles(h))
  }, [mode, manualHoliday])

  if (holiday === 'none' || particles.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-60px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rotate)); opacity: 0; }
        }
        @keyframes float {
          0% { transform: translateY(110vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          50% { transform: translateY(50vh) translateX(var(--drift)) rotate(180deg); }
          90% { opacity: 0.7; }
          100% { transform: translateY(-60px) translateX(calc(var(--drift) * 2)) rotate(360deg); opacity: 0; }
        }
        .holiday-particle {
          position: fixed;
          pointer-events: none;
          user-select: none;
          z-index: 9999;
          will-change: transform;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
        }
        .holiday-fall { animation: fall linear infinite; }
        .holiday-float { animation: float ease-in-out infinite; }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
        {particles.map(p => (
          <div
            key={p.id}
            className={`holiday-particle ${p.holiday === 'halloween' ? 'holiday-float' : 'holiday-fall'}`}
            style={{
              left: `${p.x}%`,
              top: p.holiday === 'halloween' ? '100%' : `${p.y}%`,
              fontSize: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--rotate': `${p.rotate}deg`,
              lineHeight: 1,
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        ))}
      </div>
    </>
  )
}
