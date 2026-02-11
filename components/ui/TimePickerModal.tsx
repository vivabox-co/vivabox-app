"use client"

import { useState, useRef, useEffect } from "react"

type Props = {
  onClose: () => void
  onConfirm: (times: string[]) => void
}

export default function TimePickerModal({ onClose, onConfirm }: Props) {
  const hours = Array.from({ length: 13 }, (_, i) =>
    (i + 8).toString().padStart(2, "0")
  )

  const [primaryHour, setPrimaryHour] = useState("12")
  const [secondaryHour, setSecondaryHour] = useState<string | null>(null)
  const [editingSecondary, setEditingSecondary] = useState(false)

  function handleConfirm() {
    const result = secondaryHour
      ? [`${primaryHour}:00`, `${secondaryHour}:00`]
      : [`${primaryHour}:00`]

    onConfirm(result)
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={drawer} onClick={(e) => e.stopPropagation()}>

        <h3 style={title}>Horario preferido</h3>

        <div style={primaryCard}>
          <div style={sectionLabel}>Principal</div>
          <div style={pickerWrapper}>
            <HourWheel
              values={hours}
              selected={primaryHour}
              setSelected={setPrimaryHour}
              blocked={secondaryHour}
            />
            <div style={minuteFixed}>00</div>
          </div>
        </div>

        {!secondaryHour && (
          <button style={addSecondBtn} onClick={() => setEditingSecondary(true)}>
            Añadir otra hora
          </button>
        )}

        {editingSecondary && !secondaryHour && (
          <div style={secondaryInline}>
            {hours.map(h => (
              <button
                key={h}
                onClick={() => {
                  if (h !== primaryHour) {
                    setSecondaryHour(h)
                    setEditingSecondary(false)
                  }
                }}
                style={secondaryOption}
              >
                {h}:00
              </button>
            ))}
          </div>
        )}

        {secondaryHour && (
          <div style={secondaryCompact}>
            <span style={secondaryLabel}>Alternativa</span>
            <div style={secondaryTime}>{secondaryHour}:00</div>
            <button onClick={() => setSecondaryHour(null)} style={removeBtn}>
              Quitar
            </button>
          </div>
        )}

        <button onClick={handleConfirm} style={confirmBtn}>
          Guardar horarios
        </button>

      </div>
    </div>
  )
}

/* ---------- WHEEL ---------- */

type WheelProps = {
  values: string[]
  selected: string
  setSelected: (v: string) => void
  blocked: string | null
}

function HourWheel({ values, selected, setSelected, blocked }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const itemHeight = 64
  const containerHeight = 192
  const spacerHeight = containerHeight / 2 - itemHeight / 2

  function snapToCenter() {
    const el = ref.current
    if (!el) return
    const center = el.scrollTop + el.clientHeight / 2
    const index = Math.round((center - spacerHeight) / itemHeight - 0.5)
    const newValue = values[index]

    if (newValue && newValue !== blocked) {
      setSelected(newValue)
      const offset = index * itemHeight + spacerHeight - el.clientHeight / 2 + itemHeight / 2
      el.scrollTo({ top: offset, behavior: "smooth" })
    }
  }

  function handleScroll() {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(snapToCenter, 80)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const index = values.indexOf(selected)
    const offset = index * itemHeight + spacerHeight - el.clientHeight / 2 + itemHeight / 2
    el.scrollTo({ top: offset })
  }, [selected])

  return (
    <div style={wheelWrapper}>
      <div style={centerLine} />
      <div ref={ref} onScroll={handleScroll} style={wheel}>
        <div style={{ height: spacerHeight }} />
        {values.map(v => (
          <div
            key={v}
            style={{
              ...wheelItem,
              color: v === blocked ? "#ddd" : selected === v ? "#111" : "#bbb",
            }}
          >
            {v}
          </div>
        ))}
        <div style={{ height: spacerHeight }} />
      </div>
    </div>
  )
}

/* ---------- STYLES ---------- */

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 3000 }
const drawer: React.CSSProperties = { width: "100%", maxWidth: 500, background: "#fff", borderRadius: "28px 28px 0 0", padding: "28px 20px 34px", textAlign: "center" }
const title: React.CSSProperties = { fontSize: 18, fontWeight: 600, marginBottom: 18 }

const primaryCard: React.CSSProperties = { padding: "18px 14px", borderRadius: 18, background: "#F7F5F2", marginBottom: 16 }
const sectionLabel: React.CSSProperties = { fontSize: 12, opacity: 0.6, marginBottom: 8 }
const pickerWrapper: React.CSSProperties = { display: "flex", justifyContent: "center", alignItems: "center", gap: 28 }
const minuteFixed: React.CSSProperties = { fontSize: 48, fontWeight: 700, width: 80 }

const addSecondBtn: React.CSSProperties = { margin: "14px auto", border: "2px solid #111", background: "#fff", padding: "8px 16px", borderRadius: 999, cursor: "pointer", fontWeight: 500 }

const secondaryInline: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 14 }
const secondaryOption: React.CSSProperties = { border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px", background: "#fff", cursor: "pointer", fontSize: 13 }

const secondaryCompact: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F7F5F2", padding: "10px 14px", borderRadius: 14, marginBottom: 14 }
const secondaryLabel: React.CSSProperties = { fontSize: 12, opacity: 0.5 }
const secondaryTime: React.CSSProperties = { fontSize: 16, fontWeight: 600 }
const removeBtn: React.CSSProperties = { fontSize: 12, background: "none", border: "none", color: "#888", cursor: "pointer" }

const confirmBtn: React.CSSProperties = { width: "100%", padding: 16, borderRadius: 14, border: "none", background: "#111", color: "#fff", fontSize: 16, fontWeight: 600 }

const wheelWrapper: React.CSSProperties = { position: "relative", height: 192, width: 110 }
const centerLine: React.CSSProperties = { position: "absolute", top: "50%", left: 0, right: 0, height: 64, transform: "translateY(-50%)", borderTop: "2px solid #111", borderBottom: "2px solid #111", pointerEvents: "none" }
const wheel: React.CSSProperties = { height: "100%", overflowY: "scroll", scrollbarWidth: "none" }
const wheelItem: React.CSSProperties = { height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 600 }
