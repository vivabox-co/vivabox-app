"use client"
import { useState } from "react"

type Props = {
  onClose: () => void
  onSelect: (payload: {
    date: string
    dateFlex: number
  }) => void
}

export default function DatePickerModal({ onClose, onSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dateFlex, setDateFlex] = useState<number>(1)

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
    setSelectedDay(null)
  }

  function handleSelect(day: number) {
    const d = new Date(year, monthIndex, day)
    if (d < today) return

    setSelectedDay(day)

    setTimeout(() => {
      onSelect({
        date: d.toISOString().split("T")[0],
        dateFlex,
      })
      onClose()
    }, 150)
  }

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"]

  return (
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
            const isSelected = selectedDay === day

            return (
              <button
                key={`${year}-${monthIndex}-${day}`}
                disabled={isPast}
                onClick={() => handleSelect(day)}
                style={{
                  ...dayCell,
                  opacity: isPast ? 0.25 : 1,
                  background: isSelected ? "#111" : "transparent",
                  color: isSelected ? "#fff" : "#111",
                  transform: isSelected ? "scale(1.15)" : "scale(1)",
                  boxShadow: isSelected ? "0 10px 22px rgba(0,0,0,0.28)" : "none",
                  transition: "all .18s cubic-bezier(.2,.8,.4,1)",
                  cursor: isPast ? "default" : "pointer",
                }}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* DATE FLEXIBILITY */}
        <div style={flexWrap}>
          <div style={flexTitle}>Si no está disponible ese día…</div>
          <div style={chipRow}>
            <Chip label="Exacto" value={0} current={dateFlex} set={setDateFlex} />
            <Chip label="±1 día" value={1} current={dateFlex} set={setDateFlex} />
            <Chip label="±2 días" value={2} current={dateFlex} set={setDateFlex} />
            <Chip label="±7 días" value={7} current={dateFlex} set={setDateFlex} />
          </div>
        </div>

      </div>
    </div>
  )
}

/* ---------- CHIP BUTTON ---------- */
function Chip({ label, value, current, set }: any) {
  const active = current === value
  return (
    <button
      onClick={() => set(value)}
      style={{
        padding: "10px 14px",
        borderRadius: 20,
        border: active ? "2px solid #111" : "1px solid #ddd",
        background: active ? "#111" : "#fff",
        color: active ? "#fff" : "#111",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
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

const flexWrap = { marginTop: 22, paddingTop: 18, borderTop: "1px solid #eee" }
const flexTitle = { fontSize: 14, fontWeight: 600, marginBottom: 12 }
const chipRow = { display: "flex", flexWrap: "wrap" as const, gap: 8 }
