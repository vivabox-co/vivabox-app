"use client"

import { Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

export type BookingStatus =
  | "requested"
  | "waiting_provider"
  | "confirmed"
  | "rejected"
  | "done"

const steps = [
  { key: "requested", label: "Solicitud recibida", description: "Tu elección llegó correctamente." },
  { key: "waiting_provider", label: "Confirmando con el lugar", description: "Estamos verificando disponibilidad." },
  { key: "confirmed", label: "Fecha confirmada", description: "Te avisaremos cuando esté lista." },
  { key: "done", label: "Todo listo", description: "Ya puedes disfrutar." },
]

type Props = {
  status: BookingStatus
  category: string
  onNext?: () => void
  onPrev?: () => void
}

export default function BookingTimeline({ status, category, onNext, onPrev }: Props) {
  const color = categoryColors[category] || "#111"
  const currentIndex = steps.findIndex((s) => s.key === status)

  /* 🧠 TIMELINE GEOMETRY */
  const STEP_HEIGHT = 74
  const CIRCLE_SIZE = 22
  const CENTER_OFFSET = CIRCLE_SIZE / 2

  const lineHeight = (steps.length - 1) * STEP_HEIGHT + CENTER_OFFSET
  // currentIndex vaut -1 pour "rejected" (absent de `steps`, cf. encadré
  // rouge au-dessus) : on borne à 0 plutôt que de passer une hauteur
  // négative invalide en CSS.
  const progressHeight = Math.max(0, currentIndex * STEP_HEIGHT + CENTER_OFFSET)

  return (
    <div style={{ marginTop: 30 }}>
      
      {/* HEADER + ARROWS */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 22,
      }}>
        <h3 style={{ fontSize: 18, margin: 0 }}>
          Así va tu experiencia
        </h3>

        {(onNext || onPrev) && (
          <div style={{ display: "flex", gap: 8 }}>
            {onPrev && (
              <button onClick={onPrev} style={arrowBtn}>
                <ChevronLeft size={16} />
              </button>
            )}
            {onNext && (
              <button onClick={onNext} style={arrowBtn}>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {status === "rejected" && (
        <div style={errorBox}>
          <X size={14} />
          No pudimos confirmar la fecha solicitada. Te ayudaremos a encontrar una alternativa.
        </div>
      )}

      <div style={{ position: "relative", paddingLeft: 22 }}>

        {/* LIGNE FOND */}
        <div
          style={{
            position: "absolute",
            left: CENTER_OFFSET + 21,
            top: CENTER_OFFSET,
            height: lineHeight,
            width: 2,
            background: "#E8E3DC",
            zIndex: 0,
          }}
        />

        {/* LIGNE PROGRESSION */}
        <div
          style={{
            position: "absolute",
            left: CENTER_OFFSET + 21,
            top: CENTER_OFFSET,
            height: progressHeight,
            width: 2,
            background: color,
            zIndex: 1,
            transition: "height 0.4s ease",
          }}
        />

        {steps.map((step, i) => {
          const reached = i <= currentIndex

          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: STEP_HEIGHT - CIRCLE_SIZE,
                position: "relative",
              }}
            >
              {/* CERCLE */}
              <div
                style={{
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  borderRadius: "50%",
                  backgroundColor: reached ? color : "#E8E3DC",
                  border: reached ? "none" : "2px solid #E8E3DC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                {reached && <Check size={13} color="#FFF" />}
              </div>

              {/* LABEL + DESCRIPTION */}
              <div>
                <div style={{
                  color: reached ? "#111" : "#999",
                  fontWeight: reached ? 500 : 400,
                  lineHeight: 1.3,
                }}>
                  {step.label}
                </div>
                <div style={{
                  marginTop: 3,
                  fontSize: 13,
                  color: reached ? "#888" : "#bbb",
                  lineHeight: 1.4,
                }}>
                  {step.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* STYLES */

const arrowBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "1px solid #E5E2DB",
  background: "#FFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

const errorBox: React.CSSProperties = {
  padding: "10px 14px",
  background: "#FDECEA",
  color: "#B42318",
  borderRadius: 12,
  marginBottom: 18,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 6,
}
