"use client"

import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

const steps = [
  "Recibimos tu solicitud",
  "Estamos coordinando tu experiencia",
  "Fecha confirmada",
  "Todo listo para disfrutar",
  "Cuéntanos cómo te fue",
]

type Props = {
  step: number
  setStep: (s: number) => void
  category: string
}

// 🔥 timestamps simulés
function generateTimes() {
  const base = new Date("2026-02-05T11:54:00")
  return steps.map((_, i) => {
    const d = new Date(base.getTime() + i * 74 * 60000)
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase()
    const day = d.getDate()
    const time = d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).toLowerCase()
    return { monthDay: `${month} ${day}`, time }
  })
}

export default function BookingTimeline({ step, setStep, category }: Props) {
  const color = categoryColors[category] || "#111"
  const times = generateTimes()

  const prev = () => setStep(Math.max(1, step - 1))
  const next = () => setStep(Math.min(5, step + 1))

  return (
    <div style={{ marginTop: 30, position: "relative" }}>
      {/* DEBUG NAV */}
      <div style={{ position: "absolute", right: 0, top: -8, opacity: 0.35 }}>
        <button onClick={prev}><ChevronLeft size={20} /></button>
        <button onClick={next}><ChevronRight size={20} /></button>
      </div>

      <h3 style={{ fontSize: 18, marginBottom: 20 }}>Progreso de tu reserva</h3>

      <div style={{ position: "relative" }}>
        {/* LIGNE CENTRÉE SUR LES POINTS */}
        <div
          style={{
            position: "absolute",
            left: 58 + 11 + 9, // 96 = date zone, +9 = centre du cercle 18px
            top: 0,
            bottom: 0,
            width: 2,
            background: "#E6E1D9",
          }}
        />

        {steps.map((label, i) => {
          const index = i + 1
          const completed = index < step
          const current = index === step
          const reached = index <= step
          const t = times[i]

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: 28,
              }}
            >
              {/* DATE À GAUCHE (UNIQUEMENT SI ÉTAPE ATTEINTE) */}
              <div style={{ width: 58, textAlign: "right", marginRight: 12 }}>
                {reached && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>
                      {t.monthDay}
                    </div>
                    <div style={{ fontSize: 11, color: "#999" }}>
                      {t.time}
                    </div>
                  </>
                )}
              </div>

              {/* POINT */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  marginRight: 14,
                  background: completed ? color : current ? "#fff" : "#E8E3DC",
                  border: current ? `2px solid ${color}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: current ? `0 0 0 4px ${color}20` : "none",
                  zIndex: 2,
                }}
              >
                {(completed || current) && (
    <Check
      size={12}
      strokeWidth={3}
      color={completed ? "white" : color}
    />
  )}
</div>
              {/* TEXTE */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: current ? 17 : 14,
                    fontWeight: current ? 700 : 500,
                    color: completed || current ? "#111" : "#9A9A9A",
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
