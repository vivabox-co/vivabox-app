"use client"

import { BookingStatus } from "./BookingTimeline"

type Props = {
  status: BookingStatus
}

export default function DynamicStatusBlock({ status }: Props) {
  const content: Record<
    BookingStatus,
    { title: string; text: string; actions?: string[] }
  > = {
    requested: {
      title: "Recibimos tu solicitud",
      text: "Estamos empezando a coordinar tu experiencia para que todo salga perfecto.",
      actions: ["Cambiar fechas", "Hablar con Mariana"],
    },

    waiting_provider: {
      title: "Estamos gestionando todo por ti",
      text: "Estamos verificando disponibilidad con el lugar. Te avisamos máximo en 48h.",
      actions: ["Cambiar fechas", "Hablar con Mariana"],
    },

    confirmed: {
      title: "Tu experiencia está confirmada 🎉",
      text: "Pronto recibirás los detalles finales para que solo te preocupes por disfrutar.",
      actions: ["Ver detalles"],
    },

    rejected: {
      title: "No pudimos confirmar la fecha",
      text: "Te contactaremos para proponerte una alternativa que funcione mejor.",
      actions: ["Hablar con Mariana"],
    },

    done: {
      title: "¿Cómo te fue?",
      text: "Tu opinión ayuda a otros a elegir experiencias increíbles.",
      actions: ["Dejar opinión"],
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
          {block.actions.map((label) => (
            <button
              key={label}
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
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
