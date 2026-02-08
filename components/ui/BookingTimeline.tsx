"use client"

import { Check, X } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

export type BookingStatus =
  | "requested"
  | "waiting_provider"
  | "confirmed"
  | "rejected"
  | "done"

const steps = [
  { key: "requested", label: "Recibimos tu solicitud" },
  { key: "waiting_provider", label: "Estamos coordinando tu experiencia" },
  { key: "confirmed", label: "Fecha confirmada" },
  { key: "done", label: "Todo listo para disfrutar" },
]

type Props = {
  status: BookingStatus
  category: string
}

export default function BookingTimeline({ status, category }: Props) {
  const color = categoryColors[category] || "#111"
  const currentIndex = steps.findIndex((s) => s.key === status)

  return (
    <div style={{ marginTop: 30 }}>
      <h3 style={{ fontSize: 18, marginBottom: 20 }}>Estado de tu reserva</h3>

      {status === "rejected" && (
        <div style={{
          padding: "10px 14px",
          background: "#FDECEA",
          color: "#B42318",
          borderRadius: 12,
          marginBottom: 18,
          fontSize: 14,
        }}>
          <X size={14} style={{ marginRight: 6 }} />
          No pudimos confirmar la fecha solicitada. Te ayudaremos a encontrar una alternativa.
        </div>
      )}

      {steps.map((step, i) => {
        const reached = i <= currentIndex

        return (
          <div key={step.key} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: reached ? color : "#E8E3DC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {reached && <Check size={12} color="white" />}
            </div>

            <div style={{ color: reached ? "#111" : "#999" }}>
              {step.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
