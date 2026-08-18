"use client"

import { useState } from "react"
import { Calendar, Sunrise, Sun, Sunset, X } from "lucide-react"
import DatePickerModal from "./DatePickerModal"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"

type Moment = "morning" | "afternoon" | "night"

const MOMENTS: { value: Moment; label: string; icon: React.ReactNode }[] = [
  { value: "morning", label: "Mañana", icon: <Sunrise size={16} /> },
  { value: "afternoon", label: "Tarde", icon: <Sun size={16} /> },
  { value: "night", label: "Noche", icon: <Sunset size={16} /> },
]

type Props = {
  bookingId: string
  onClose: () => void
  onSuccess: (data: { date: string; time: string }) => void
}

export default function RescheduleModal({ bookingId, onClose, onSuccess }: Props) {
  const [date, setDate] = useState<string | null>(null)
  const [moment, setMoment] = useState<Moment | null>(null)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = !!date && !!moment && !submitting

  async function handleSubmit() {
    if (!date || !moment) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/booking/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, moment }),
      })
      const data = await res.json()

      if (data.success) {
        const timeMatch = data.data?.message?.match(/Horario:\s*([^·]+)/)
        onSuccess({ date: data.data?.requested_date ?? date, time: timeMatch ? timeMatch[1].trim() : "" })
        onClose()
      } else {
        setError("No pudimos actualizar tus fechas. Intenta de nuevo.")
      }
    } catch (err) {
      console.error("Error rescheduling booking:", err)
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div style={overlay} onClick={onClose}>
        <div style={modal} onClick={(e) => e.stopPropagation()}>
          <div style={header}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Cambiar fecha</h3>
            <button onClick={onClose} style={closeBtn}>
              <X size={18} />
            </button>
          </div>

          <p style={hint}>
            Elige una nueva fecha y momento del día. Volveremos a coordinar con el lugar.
          </p>

          <button onClick={() => setOpenCalendar(true)} style={dateBtn}>
            <Calendar size={16} />
            {date ? formatLocalDate(date, { day: "numeric", month: "long" }) : "Elegir fecha"}
          </button>

          <div style={chipsRow}>
            {MOMENTS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMoment(m.value)}
                style={{ ...chip, ...(moment === m.value ? chipActive : {}) }}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {error && <p style={errorText}>{error}</p>}

          <button onClick={handleSubmit} disabled={!canSubmit} style={{ ...submitBtn, opacity: canSubmit ? 1 : 0.4 }}>
            {submitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {openCalendar && (
        <DatePickerModal
          initialDates={date ? [date] : []}
          onClose={() => setOpenCalendar(false)}
          onSelect={(payload) => setDate(payload.dates[0] ?? null)}
        />
      )}
    </>
  )
}

/* ---------- STYLES ---------- */

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 2000,
}

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: "28px 28px 0 0",
  padding: "24px 20px 32px",
}

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

const closeBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "#F3F3F3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

const hint: React.CSSProperties = { fontSize: 13, color: "#777", marginTop: 10, marginBottom: 18, lineHeight: 1.4 }

const dateBtn: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #E5E2DB",
  background: "#F7F5F2",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  textTransform: "capitalize",
}

const chipsRow: React.CSSProperties = { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }

const chip: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#333",
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  cursor: "pointer",
}

const chipActive: React.CSSProperties = {
  border: "2px solid #111",
  background: "#111",
  color: "#fff",
}

const errorText: React.CSSProperties = { color: "#B42318", fontSize: 13, marginTop: 14 }

const submitBtn: React.CSSProperties = {
  marginTop: 24,
  width: "100%",
  padding: 16,
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
}
