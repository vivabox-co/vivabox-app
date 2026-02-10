"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  onClose: () => void
  onConfirm: (time: string) => void
}

export default function TimePickerModal({ onClose, onConfirm }: Props) {
  const hours = Array.from({ length: 13 }, (_, i) =>
    (i + 8).toString().padStart(2, "0")
  ) // 08 → 20

  const [hour, setHour] = useState("12")

  function handleConfirm() {
    onConfirm(`${hour}:00`)
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={drawer} onClick={(e) => e.stopPropagation()}>
        <h3 style={title}>Elegí una hora</h3>

        <div style={pickerRow}>
          <HourWheel values={hours} selected={hour} setSelected={setHour} />

          <div style={minuteFixed}>
            00
          </div>
        </div>

        <button onClick={handleConfirm} style={confirmBtn}>
          Confirmar hora
        </button>
      </div>
    </div>
  )
}

/* ---------- HOUR WHEEL ---------- */

function HourWheel({ values, selected, setSelected }: any) {
  const ref = useRef<HTMLDivElement>(null)
  const itemHeight = 64
  const containerHeight = 192
  const spacerHeight = containerHeight / 2 - itemHeight / 2

  let scrollTimeout: any = null

  function snapToCenter() {
    const el = ref.current
    if (!el) return

    const center = el.scrollTop + el.clientHeight / 2
    const index = Math.round((center - spacerHeight) / itemHeight - 0.5)

    const newValue = values[index]
    if (newValue) {
      setSelected(newValue)

      const offset =
        index * itemHeight +
        spacerHeight -
        el.clientHeight / 2 +
        itemHeight / 2

      el.scrollTo({
        top: offset,
        behavior: "smooth"
      })
    }
  }

  function handleScroll() {
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      snapToCenter()
    }, 80)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const index = values.indexOf(selected)
    const offset =
      index * itemHeight +
      spacerHeight -
      el.clientHeight / 2 +
      itemHeight / 2

    el.scrollTo({ top: offset })
  }, [])

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflowY: "scroll",
        scrollBehavior: "smooth",
        scrollbarWidth: "none"
      }}
    >
      {/* spacer haut */}
      <div style={{ height: spacerHeight }} />

      {values.map((v: string) => (
        <div
          key={v}
          style={{
            height: itemHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 700,
            color: selected === v ? "#111" : "#bbb",
            transition: "color .2s"
          }}
        >
          {v}
        </div>
      ))}

      {/* spacer bas */}
      <div style={{ height: spacerHeight }} />
    </div>
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
  zIndex: 3000,
}

const drawer = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: "28px 28px 0 0",
  padding: "28px 20px 34px",
  boxShadow: "0 -12px 40px rgba(0,0,0,0.12)",
  textAlign: "center" as const,
}

const title = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 24,
}

const pickerRow = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 28,
  marginBottom: 32,
}

const minuteFixed = {
  fontSize: 48,
  fontWeight: 700,
  width: 80,
}

const wheelWrapper = {
  position: "relative" as const,
  height: 190,
  width: 110,
  overflow: "hidden",
}

const centerLine = {
  position: "absolute" as const,
  top: "50%",
  left: 0,
  right: 0,
  height: 64,
  transform: "translateY(-50%)",
  borderTop: "2px solid #111",
  borderBottom: "2px solid #111",
  pointerEvents: "none" as const,
}

const wheel = {
  height: "100%",
  overflowY: "scroll" as const,
  scrollbarWidth: "none" as const,
}

const wheelItem = {
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 46,
  fontWeight: 600,
}

const confirmBtn = {
  width: "100%",
  padding: 16,
  borderRadius: 14,
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
}
