"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"

const MAX_DATES = 3

type Props = {
  onClose: () => void
  onSelect: (payload: { dates: string[] }) => void
  initialDates?: string[]
  categoryColor?: string
}

export default function DatePickerModal({
  onClose,
  onSelect,
  initialDates = [],
  categoryColor = "#111",
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

  // Taper une date déjà choisie ne la retire pas : elle devient la préférée
  // (déplacée en tête). La suppression se fait explicitement via le "x" du
  // résumé, pour que "changer de préférée" et "retirer" restent deux gestes
  // distincts et non ambigus.
  function selectDate(iso: string) {
    setSelectedDates(prev => {
      if (prev.includes(iso)) {
        if (prev[0] === iso) return prev
        return [iso, ...prev.filter(date => date !== iso)]
      }
      if (prev.length >= MAX_DATES) return prev
      return [...prev, iso]
    })
  }

  function removeDate(iso: string) {
    setSelectedDates(prev => prev.filter(date => date !== iso))
  }

  function toggleDate(day: number) {
    const d = new Date(year, monthIndex, day)
    if (d < today) return
    selectDate(d.toISOString().split("T")[0])
  }

  function confirm() {
    if (selectedDates.length === 0) return
    onSelect({ dates: selectedDates })
    onClose()
  }

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"]

  return (
    <>
      <style>{styleTag}</style>

      <div style={overlay} onClick={onClose}>
        <div style={modal} onClick={e => e.stopPropagation()}>

          <div style={sheetTitleWrap}>
            <div style={sheetTitle}>¿Qué fechas te funcionarían?</div>
            <div style={sheetSubtitle}>La primera que elijas será tu fecha preferida.</div>
          </div>

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
              const isPreferred = selectedDates[0] === iso
              const isAlternative = !isPreferred && selectedDates.includes(iso)

              return (
                <button
                  key={`${year}-${monthIndex}-${day}`}
                  disabled={isPast}
                  onClick={() => toggleDate(day)}
                  style={{
                    ...dayCell,
                    ...dayCellRoleStyle(isPreferred, isAlternative, categoryColor),
                    opacity: isPast ? 0.25 : 1,
                    transition: "all .2s cubic-bezier(.2,.8,.4,1)",
                    cursor: isPast ? "default" : "pointer",
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* STABLE INFO + RESUMEN */}
          <div style={stableZone}>
            <div style={stableTitle}>Tus fechas · {selectedDates.length} de {MAX_DATES}</div>

            {selectedDates.length === 0 ? (
              <div style={stableEmptyHint}>Elige una o varias fechas</div>
            ) : (
              <div style={summaryRow}>
                {selectedDates.map((d, i) => (
                  <div key={d} style={summaryChipRow}>
                    <span style={i === 0 ? summaryChipStrong(categoryColor) : summaryChip}>
                      {formatLocalDate(d, { day: "numeric", month: "short" })}
                    </span>
                    <button
                      onClick={() => removeDate(d)}
                      style={i === 0 ? chipRemoveBtnStrong : chipRemoveBtn}
                      aria-label="Quitar fecha"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div style={footerRow}>
            <button onClick={onClose} style={cancelBtn}>Cancelar</button>
            <button
              onClick={confirm}
              disabled={selectedDates.length === 0}
              style={{
                ...useBtn,
                opacity: selectedDates.length === 0 ? 0.4 : 1,
                cursor: selectedDates.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Usar estas fechas →
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

/* ---------- UI ---------- */

function dayCellRoleStyle(isPreferred: boolean, isAlternative: boolean, categoryColor: string): React.CSSProperties {
  if (isPreferred) {
    return {
      background: "#111",
      color: "#fff",
      border: "none",
      boxShadow: `0 0 0 2px ${categoryColor}`,
    }
  }
  if (isAlternative) {
    return {
      background: "#F3F1EC",
      color: "#111",
      border: "none",
      boxShadow: "none",
    }
  }
  return {
    background: "transparent",
    color: "#111",
    border: "none",
    boxShadow: "none",
  }
}

const summaryChip: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#F3F1EC",
  color: "#444",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
  animation: "fadeIn .2s ease",
}

const summaryChipStrong = (color: string): React.CSSProperties => ({
  ...summaryChip,
  background: "#111",
  boxShadow: `0 0 0 2px ${color}`,
  color: "#fff",
  fontWeight: 600,
})

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
  padding: "22px 20px 24px",
}

const sheetTitleWrap = { marginBottom: 12 }
const sheetTitle = { fontSize: 17, fontWeight: 700, color: "#111" }
const sheetSubtitle = { fontSize: 13, color: "#888", marginTop: 3, lineHeight: 1.35 }

const header = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }
const navBtn = { background: "#F3F3F3", border: "none", width: 34, height: 34, borderRadius: 12, fontSize: 20, cursor: "pointer" }
const monthLabel = { fontSize: 16, fontWeight: 600, textTransform: "capitalize" as const }
const weekRow = { display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }
const weekDay = { textAlign: "center" as const, fontSize: 12, opacity: .5 }
const grid = { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }
const dayCell = { height: 44, borderRadius: 14, border: "none", fontSize: 14, fontWeight: 500 }

const stableZone = {
  marginTop: 14,
  padding: 12,
  borderRadius: 16,
  background: "#F7F5F2",
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
}

const stableTitle = { fontSize: 12, fontWeight: 600, opacity: 0.7 }
const stableEmptyHint = { fontSize: 12, opacity: 0.5 }

const summaryRow = { display: "flex", flexWrap: "wrap" as const, gap: 8 }
const summaryChipRow = { display: "flex", alignItems: "center", gap: 4 }

const chipRemoveBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  background: "transparent",
  color: "#999",
  cursor: "pointer",
  padding: 0,
}

const chipRemoveBtnStrong = {
  ...chipRemoveBtn,
  color: "rgba(255,255,255,0.7)",
}

const footerRow = { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, gap: 12 }

const cancelBtn = {
  background: "transparent",
  border: "none",
  color: "#666",
  fontSize: 14,
  fontWeight: 500,
  padding: "12px 6px",
  cursor: "pointer",
}

const useBtn = {
  padding: "13px 20px",
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  border: "none",
  whiteSpace: "nowrap" as const,
}

const styleTag = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
`
