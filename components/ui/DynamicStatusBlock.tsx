"use client"

import { BookingStatus } from "./BookingTimeline"

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
  actionPending?: boolean
}

export default function DynamicStatusBlock({ status, onAction, reviewed, actionPending }: Props) {
  // "alternative_proposed" n'a pas d'entrée ici : sa décision est intégrée
  // dans l'étape active de BookingTimeline (voir activeContent dans
  // seguimiento/[bookingId]/page.tsx) plutôt que dupliquée dans ce bloc —
  // d'où le Partial et le garde `if (!block) return null` juste après.
  const content: Partial<Record<
    BookingStatus,
    { title: string; text: string; actions?: { key: StatusAction; label: string }[] }
  >> = {
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
      text: "Tu reserva fue cancelada. Puedes esperar a que te contactemos o elegir otra experiencia ahora mismo.",
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
            return (
              // Toujours le CTA principal : chaque statut de `content`
              // ci-dessus n'expose au plus qu'une seule action ici (les cas
              // à choix multiples, comme "alternative_proposed", vivent dans
              // l'étape active de BookingTimeline, pas dans ce bloc) — donc
              // jamais de variante secondaire à distinguer visuellement.
              <button
                key={action.key}
                onClick={() => onAction(action.key)}
                disabled={actionPending}
                style={{
                  padding: "9px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: "#152F40",
                  color: "white",
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
