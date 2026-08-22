"use client"

import { BookingStatus } from "./BookingTimeline"

// "accept_alternative"/"keep_searching"/"talk_to_vivabox" répondent à une
// date alternative proposée par le lugar (status "alternative_proposed") :
// accepter, ou refuser sans annuler (même dossier, nouvelle recherche) avec
// un accès direct à l'aide humaine — voir seguimiento/[bookingId]/page.tsx.
// "choose_new_experience" reste la sortie ultime (annulation réelle), aussi
// utilisée pour écarter un refus déjà définitif (status "rejected").
export type StatusAction =
  | "leave_review"
  | "accept_alternative"
  | "keep_searching"
  | "talk_to_vivabox"
  | "choose_new_experience"

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
    { title: string; text: string; actions?: { key: StatusAction; label: string; variant?: "primary" | "secondary" }[] }
  >> = {
    requested: {
      title: "¿Qué sigue?",
      text: "No necesitas hacer nada por ahora. Nosotros nos encargamos de la confirmación.",
    },

    waiting_provider: {
      title: "¿Qué sigue?",
      text: "No necesitas hacer nada por ahora. Nosotros nos encargamos de la confirmación.",
    },

    searching_alternative: {
      title: "¿Qué sigue?",
      text: "No necesitas hacer nada por ahora. Seguimos buscando otra fecha para tu experiencia y te avisaremos apenas la tengamos.",
    },

    confirmed: {
      title: "¿Qué sigue?",
      text: "Ya quedó agendado. Nosotros te avisamos si hay algo más que necesites saber antes del día.",
    },

    // La timeline (voir BookingTimeline) raconte déjà comment on est arrivé
    // à l'annulation — ce bloc ne répète pas la nouvelle, il tourne la page :
    // "Buscar otra experiencia" est l'action principale (retour au catalogue
    // compatible avec le Vivabox, jamais une nouvelle réservation créée
    // automatiquement), "Hablar con Vivabox" reste secondaire.
    rejected: {
      title: "¿Qué quieres hacer ahora?",
      text: "Puedes elegir otra experiencia y volver a reservar con tu Vivabox.",
      actions: [
        { key: "choose_new_experience", label: "Buscar otra experiencia", variant: "primary" },
        { key: "talk_to_vivabox", label: "Hablar con Vivabox", variant: "secondary" },
      ],
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
              // Par défaut CTA principal (pas de `variant` fourni) ; seul
              // "rejected" expose aujourd'hui une 2e action ("Hablar con
              // Vivabox") en secondaire — les autres cas à choix multiples
              // (ex. "alternative_proposed") vivent dans l'étape active de
              // BookingTimeline, pas dans ce bloc.
              <button
                key={action.key}
                onClick={() => onAction(action.key)}
                disabled={actionPending}
                style={{
                  padding: "9px 16px",
                  borderRadius: 999,
                  border: action.variant === "secondary" ? "1px solid #D8D2C7" : "none",
                  background: action.variant === "secondary" ? "transparent" : "#152F40",
                  color: action.variant === "secondary" ? "#333" : "white",
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
