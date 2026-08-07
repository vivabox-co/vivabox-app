"use client"
import { useState, useEffect } from "react"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"

type Props = {
  onClose: () => void
  onSelect: (payload: { dates: string[] }) => void
  initialDates?: string[]
}

export default function DatePickerModal({
  onClose,
  onSelect,
  initialDates = []
}: Props) {

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates)

  useEffect(() => {
    setSelectedDates(initialDates)
  }, [initialDates])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentMonth.getFullYear()
  const monthIndex = currentMonth.getMonth()
  const monthName = currentMonth.toLocaleString("es-CO", { month: "long" })

  const firstDay = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const blanks = Array.from({ length: (firstDay + 6) % 7 })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function changeMonth(offset: number) {
    const d = new Date(currentMonth)
    d.setMonth(d.getMonth() + offset)
    setCurrentMonth(d)
  }

  function toggleDate(day: number) {
    const d = new Date(year, monthIndex, day)
    if (d < today) return

    const iso = d.toISOString().split("T")[0]

    setSelectedDates(prev => {
      if (prev.includes(iso)) return prev.filter(date => date !== iso)
      if (prev.length >= 3) return prev
      return [...prev, iso]
    })
  }

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"]

  return (
    <>
      <style>{styleTag}</style>

      <div style={overlay} onClick={onClose}>
        <div style={modal} onClick={e => e.stopPropagation()}>

          {/* HEADER */}
          <div style={header}>
            <button onClick={() => changeMonth(-1)} style={navBtn}>‹</button>
            <div style={monthLabel}>{monthName} {year}</div>
            <button onClick={() => changeMonth(1)} style={navBtn}>›</button>
          </div>

          {/* WEEK DAYS */}
          <div style={weekRow}>
            {weekDays.map((d, i) => (
              <div key={`wd-${i}`} style={weekDay}>{d}</div>
            ))}
          </div>

          {/* CALENDAR GRID */}
          <div style={grid}>
            {blanks.map((_, i) => <div key={`b-${i}`} />)}

            {days.map(day => {
              const fullDate = new Date(year, monthIndex, day)
              const isPast = fullDate < today
              const iso = fullDate.toISOString().split("T")[0]
              const isSelected = selectedDates.includes(iso)

              return (
                <button
                  key={`${year}-${monthIndex}-${day}`}
                  disabled={isPast}
                  onClick={() => toggleDate(day)}
                  style={{
                    ...dayCell,
                    opacity: isPast ? 0.25 : 1,
                    background: isSelected ? "#111" : "transparent",
                    color: isSelected ? "#fff" : "#111",
                    transform: isSelected ? "scale(1.12)" : "scale(1)",
                    boxShadow: isSelected ? "0 10px 22px rgba(0,0,0,0.28)" : "none",
                    transition: "all .22s cubic-bezier(.2,.8,.4,1)",
                    animation: isSelected ? "pulse .35s ease" : "none",
                    cursor: isPast ? "default" : "pointer",
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* STABLE INFO + CHIPS */}
          <div style={stableZone}>
            <div style={stableHeaderRow}>
              <div style={stableTitle}>Tus días elegidos</div>
              <div style={stableHint}>
                {selectedDates.length === 0 && "Elige uno o varios días"}
                {selectedDates.length === 1 && "Puedes añadir otros días"}
              </div>
            </div>

            <div style={chipsRow}>
              {selectedDates.map(d => (
                <div key={d} style={chipItem}>
                  {formatLocalDate(d, { day: "numeric", month: "short" })}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              if (selectedDates.length === 0) return
              onSelect({ dates: selectedDates })
              onClose()
            }}
            style={ctaBtn}
          >
            Elegir estos días
          </button>

        </div>
      </div>
    </>
  )
}

/* ---------- STYLES ---------- */

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 2000,
}

const modal = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: "28px 28px 0 0",
  padding: "24px 20px 32px",
}

const header = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }
const navBtn = { background: "#F3F3F3", border: "none", width: 38, height: 38, borderRadius: 14, fontSize: 22, cursor: "pointer" }
const monthLabel = { fontSize: 18, fontWeight: 600, textTransform: "capitalize" as const }
const weekRow = { display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 10 }
const weekDay = { textAlign: "center" as const, fontSize: 12, opacity: .5 }
const grid = { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }
const dayCell = { height: 46, borderRadius: 16, border: "none", fontSize: 14, fontWeight: 500 }

const stableZone = {
  marginTop: 20,
  minHeight: 80,
  padding: 14,
  borderRadius: 16,
  background: "#F7F5F2",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between"
}

const stableHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}

const stableTitle = { fontSize: 12, opacity: 0.6 }
const stableHint = { fontSize: 12, opacity: 0.5, textAlign: "right" as const, minWidth: 140 }

const chipsRow = { display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 10 }

const chipItem = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#fff",
  fontSize: 13,
  fontWeight: 500,
  animation: "fadeIn .25s ease"
}

const ctaBtn = {
  marginTop: 24,
  width: "100%",
  padding: 16,
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  border: "none"
}

const styleTag = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.16); }
  100% { transform: scale(1.12); }
}
`
