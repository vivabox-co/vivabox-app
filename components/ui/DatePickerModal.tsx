"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"

const MAX_DATES = 3

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

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"]
  const alternativeDates = selectedDates.slice(1)

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
                    ...dayCellRoleStyle(isPreferred, isAlternative),
                    opacity: isPast ? 0.25 : 1,
                    transition: "all .22s cubic-bezier(.2,.8,.4,1)",
                    animation: isPreferred ? "pulse .35s ease" : "none",
                    cursor: isPast ? "default" : "pointer",
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* STABLE INFO + RESUMEN */}
          <div style={{ ...stableZone, minHeight: selectedDates.length === 0 ? "auto" : undefined }}>
            <div style={stableTitle}>Tus fechas · {selectedDates.length} de {MAX_DATES}</div>

            {selectedDates.length === 0 ? (
              <div style={stableEmptyHint}>Elige una o varias fechas</div>
            ) : (
              <div style={summaryCol}>
                <DateGroup label="Preferida" dates={[selectedDates[0]]} strong onRemove={removeDate} />
                {alternativeDates.length > 0 && (
                  <DateGroup label="Alternativas" dates={alternativeDates} onRemove={removeDate} />
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              if (selectedDates.length === 0) return
              onSelect({ dates: selectedDates })
              onClose()
            }}
            disabled={selectedDates.length === 0}
            style={{
              ...ctaBtn,
              opacity: selectedDates.length === 0 ? 0.4 : 1,
              cursor: selectedDates.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Usar estas fechas
          </button>

        </div>
      </div>
    </>
  )
}

/* ---------- UI ---------- */

function DateGroup({ label, dates, strong, onRemove }: { label: string; dates: string[]; strong?: boolean; onRemove: (iso: string) => void }) {
  return (
    <div>
      <div style={summaryLabel}>{label}</div>
      <div style={chipsRow}>
        {dates.map(d => (
          <div key={d} style={strong ? chipItemStrong : chipItem}>
            {formatLocalDate(d, { day: "numeric", month: "short" })}
            <button
              onClick={() => onRemove(d)}
              style={strong ? chipRemoveBtnStrong : chipRemoveBtn}
              aria-label="Quitar fecha"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function dayCellRoleStyle(isPreferred: boolean, isAlternative: boolean): React.CSSProperties {
  if (isPreferred) {
    return {
      background: "#111",
      color: "#fff",
      transform: "scale(1.12)",
      boxShadow: "0 10px 22px rgba(0,0,0,0.28)",
    }
  }
  if (isAlternative) {
    return {
      background: "#EAE6DD",
      color: "#111",
      border: "1.5px solid #111",
      transform: "scale(1.04)",
      boxShadow: "none",
    }
  }
  return {
    background: "transparent",
    color: "#111",
    transform: "scale(1)",
    boxShadow: "none",
  }
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

const sheetTitleWrap = { marginBottom: 18 }
const sheetTitle = { fontSize: 18, fontWeight: 700, color: "#111" }
const sheetSubtitle = { fontSize: 13, color: "#888", marginTop: 4, lineHeight: 1.4 }

const header = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }
const navBtn = { background: "#F3F3F3", border: "none", width: 38, height: 38, borderRadius: 14, fontSize: 22, cursor: "pointer" }
const monthLabel = { fontSize: 18, fontWeight: 600, textTransform: "capitalize" as const }
const weekRow = { display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 10 }
const weekDay = { textAlign: "center" as const, fontSize: 12, opacity: .5 }
const grid = { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }
const dayCell = { height: 46, borderRadius: 16, border: "none", fontSize: 14, fontWeight: 500 }

const stableZone = {
  marginTop: 20,
  padding: 14,
  borderRadius: 16,
  background: "#F7F5F2",
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
}

const stableTitle = { fontSize: 12, fontWeight: 600, opacity: 0.7 }
const stableEmptyHint = { fontSize: 12, opacity: 0.5 }

const summaryCol = { display: "flex", flexDirection: "column" as const, gap: 10 }
const summaryLabel = { fontSize: 11, opacity: 0.55, marginBottom: 6 }

const chipsRow = { display: "flex", flexWrap: "wrap" as const, gap: 8 }

const chipItem = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 10px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid #E5E2DB",
  color: "#111",
  fontSize: 13,
  fontWeight: 500,
  animation: "fadeIn .25s ease"
}

const chipItemStrong = {
  ...chipItem,
  background: "#111",
  border: "1px solid #111",
  color: "#fff",
  fontWeight: 600,
}

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

const ctaBtn = {
  marginTop: 24,
  width: "100%",
  padding: 16,
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  border: "none",
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
