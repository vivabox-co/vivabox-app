"use client"

import { BookingStatus } from "./BookingTimeline"

// Seule "leave_review" reste une action directe ici : c'est la seule étape
// qui n'appartient qu'à Seguimiento (pas de doublon avec Ayuda, qui
// concentre déjà WhatsApp et le changement de date — voir /ayuda).
export type StatusAction = "leave_review"

type Props = {
  status: BookingStatus
  onAction: (action: StatusAction) => void
  reviewed?: boolean
}

export default function DynamicStatusBlock({ status, onAction, reviewed }: Props) {
  const content: Record<
    BookingStatus,
    { title: string; text: string; actions?: { key: StatusAction; label: string }[] }
  > = {
    requested: {
      title: "¿Qué sigue?",
      text: "No necesitas hacer nada por ahora. Nosotros nos encargamos de la confirmación.",
    },

    waiting_provider: {
      title: "¿Qué sigue?",
      text: "No necesitas hacer nada por ahora. Nosotros nos encargamos de la confirmación.",
    },

    confirmed: {
      title: "¿Qué sigue?",
      text: "Ya quedó agendado. Nosotros te avisamos si hay algo más que necesites saber antes del día.",
    },

    rejected: {
      title: "¿Qué sigue?",
      text: "Estamos buscando otra opción para ti. Te contactaremos pronto para coordinar una nueva fecha.",
    },

    done: reviewed
      ? {
          title: "¡Gracias por tu opinión!",
          text: "Ya recibimos tu comentario. Nos ayuda a seguir mejorando cada experiencia.",
        }
      : {
          title: "¿Cómo te fue?",
          text: "Tu opinión ayuda a otros a descubrir experiencias que valen la pena.",
          actions: [{ key: "leave_review", label: "Dejar opinión" }],
        },
  }

  const block = content[status]
  if (!block) return null

  return (
    <div
      style={{
        marginTop: 34,
        padding: 22,
        borderRadius: 24,
        background: "#F6F2EC",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h4
        style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {block.title}
      </h4>

      <p
        style={{
          fontSize: 14,
          color: "#5f5f5f",
          lineHeight: "1.5",
          marginBottom: 14,
        }}
      >
        {block.text}
      </p>

      {block.actions && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {block.actions.map((action) => (
            <button
              key={action.key}
              onClick={() => onAction(action.key)}
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                border: "none",
                background: "#222",
                color: "white",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
