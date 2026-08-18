"use client"

import { BookingStatus } from "./BookingTimeline"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"

// "accept_alternative"/"choose_new_experience" répondent à une date
// alternative proposée par le lugar (status "alternative_proposed") ;
// "choose_new_experience" sert aussi de sortie pour un refus sec
// (status "rejected"), pour ne pas laisser le bénéficiaire dans une
// impasse — voir seguimiento/[bookingId]/page.tsx pour le handler.
export type StatusAction = "leave_review" | "accept_alternative" | "choose_new_experience"

type Props = {
  status: BookingStatus
  onAction: (action: StatusAction) => void
  reviewed?: boolean
  proposedDate?: string | null
  proposedMoment?: string | null
  proposedHour?: string | null
  actionPending?: boolean
}

export default function DynamicStatusBlock({ status, onAction, reviewed, proposedDate, proposedMoment, proposedHour, actionPending }: Props) {
  const proposedDateLabel = proposedDate ? formatLocalDate(proposedDate, { dateStyle: "long" }) : null
  const proposedWhen = [proposedDateLabel, proposedMoment ? (proposedHour ? `${proposedMoment} (~${proposedHour})` : proposedMoment) : null]
    .filter(Boolean)
    .join(" · ")

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

    alternative_proposed: {
      title: "Te proponemos otra fecha",
      text: proposedWhen
        ? `El lugar no tenía disponible tu fecha original, pero puede recibirte el ${proposedWhen}.`
        : "El lugar no tenía disponible tu fecha original, pero propuso otra opción.",
      actions: [
        { key: "accept_alternative", label: "Aceptar esta fecha" },
        { key: "choose_new_experience", label: "Prefiero otra experiencia" },
      ],
    },

    confirmed: {
      title: "¿Qué sigue?",
      text: "Ya quedó agendado. Nosotros te avisamos si hay algo más que necesites saber antes del día.",
    },

    rejected: {
      title: "¿Qué sigue?",
      text: "No pudimos coordinar esta experiencia. Puedes esperar a que te contactemos o elegir otra ahora mismo.",
      actions: [{ key: "choose_new_experience", label: "Elegir otra experiencia" }],
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
          {block.actions.map((action) => {
            const secondary = action.key === "choose_new_experience"
            return (
              <button
                key={action.key}
                onClick={() => onAction(action.key)}
                disabled={actionPending}
                style={{
                  padding: "9px 16px",
                  borderRadius: 999,
                  border: secondary ? "1px solid #D8D2C7" : "none",
                  background: secondary ? "transparent" : "#222",
                  color: secondary ? "#333" : "white",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: actionPending ? "default" : "pointer",
                  opacity: actionPending ? 0.6 : 1,
                }}
              >
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
