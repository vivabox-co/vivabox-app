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
      title: "Fechas recibidas",
      text: "Ya tenemos tus fechas. Estamos empezando a coordinar con el lugar para que todo encaje perfectamente.",
      actions: ["Cambiar fechas", "Hablar con Mariana"],
    },

    waiting_provider: {
      title: "Coordinando con el lugar",
      text: "Estamos en contacto con el lugar para asegurar tu experiencia. Te avisamos apenas quede confirmada.",
      actions: ["Cambiar fechas", "Hablar con Mariana"],
    },

    confirmed: {
      title: "Fecha confirmada ✨",
      text: "Tu momento quedó agendado. Pronto podrás ver los detalles finales para ese día.",
      actions: ["Ver detalles"],
    },

    rejected: {
      title: "Busquemos otra fecha",
      text: "No pudimos confirmar esa opción, pero ya estamos viendo alternativas que funcionen mejor para ti.",
      actions: ["Hablar con Mariana"],
    },

    done: {
      title: "¿Cómo te fue?",
      text: "Tu opinión ayuda a otros a descubrir experiencias que valen la pena.",
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
