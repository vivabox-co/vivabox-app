'use client'

import Image from 'next/image'
import { MapPin, Users } from 'lucide-react'
import { Experience } from '@/lib/data/types'

type Props = {
  items: Experience[]
  onSelect: (exp: Experience) => void
}

/* ===== CATEGORY COLORS ===== */
const categoryColors: Record<string, string> = {
  gastro: '#F59E0B',
  bienestar: '#3B82F6',
  aventura: '#EF4444',
  cultura: '#8B5CF6',
  estancias: '#10B981',
}

/* ================= STYLES ================= */

const screenStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', // 👈 équilibre vertical
  padding: '28px 24px',
}

const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,

  /* 🔥 léger ancrage vers le haut
     pour éviter l’effet “setup trop centré” */
  transform: 'translateY(-4%)',
}

export default function Top3Screen({ items, onSelect }: Props) {
  return (
    <div style={screenStyle}>
      <div style={contentStyle}>
        {/* HEADER */}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          Nuestras sugerencias para ti
        </h3>

        {/* LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(exp => {
            const color = categoryColors[exp.category] ?? '#E5E7EB'

            return (
              <div
                key={exp.id}
                onClick={() => onSelect(exp)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 92,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.92)',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                {/* IMAGE + COLOR BAR */}
                <div
                  style={{
                    position: 'relative',
                    width: 92,
                    height: 92,
                    flexShrink: 0,
                  }}
                >
                  {/* COLOR STRIP */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 5,
                      height: '100%',
                      background: color,
                      zIndex: 2,
                    }}
                  />

                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* TEXT */}
                <div
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      lineHeight: 1.25,
                    }}
                  >
                    {exp.title}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      fontSize: 13,
                      opacity: 0.65,
                    }}
                  >
                    {exp.city && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} />
                        {exp.city}
                      </span>
                    )}

                    {exp.format && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} />
                        {exp.format}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
