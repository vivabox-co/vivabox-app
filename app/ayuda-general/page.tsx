"use client"

import { MessageCircle, Phone } from "lucide-react"
import { getWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/constants/contact"
import { logout } from "@/lib/utils/logout"
import FaqAccordion from "@/components/ui/FaqAccordion"

// FAQ générique pour l'étape pré-réservation (avant qu'une réservation
// existe) : pas de contenu lié à "ma reserva" ici, voir app/ayuda/page.tsx
// pour la FAQ post-réservation.
const FAQS = [
  {
    question: "¿Cómo elijo y reservo mi experiencia?",
    answer:
      "Te mostramos todas las experiencias disponibles para tu Vivabox. Puedes explorar, guardar tus favoritas y elegir la que más te guste. Cuando estés listo, selecciona una fecha y envía tu solicitud de reserva.",
  },
  {
    question: "¿La fecha y hora que elijo quedan reservadas de una vez?",
    answer:
      "No todavía. Primero enviamos tu solicitud al proveedor para confirmar disponibilidad. Te avisaremos cuando tu reserva esté confirmada.",
  },
  {
    question: "¿Cuánto tarda en confirmarse mi reserva?",
    answer:
      "La mayoría de las reservas se confirman en menos de 48 horas. Si necesitamos más tiempo, te avisaremos.",
  },
  {
    question: "¿Puedo ir acompañado? ¿Cuántas personas pueden participar?",
    answer:
      "Cada experiencia tiene sus propias condiciones. Antes de reservar podrás ver cuántas personas pueden participar y si puedes ir acompañado.",
  },
  {
    question: "¿Qué pasa si la experiencia que quiero no está disponible?",
    answer:
      "No te preocupes. Puedes elegir otra fecha o explorar las demás experiencias disponibles con tu Vivabox.",
  },
  {
    question: "¿Puedo cambiar de experiencia?",
    answer:
      "Sí, mientras todavía no hayas confirmado una reserva. Puedes volver a explorar y elegir otra experiencia.",
  },
  {
    question: "¿Hay algún costo adicional?",
    answer:
      "Tu Vivabox cubre la experiencia indicada. Si alguna experiencia tiene condiciones o costos adicionales, te los mostraremos antes de que envíes tu solicitud.",
  },
]

export default function AyudaGeneralPage() {
  return (
    <div
      style={{
        padding: "16px 16px 120px",
        background: "#FAF8F5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 18 }}>Ayuda</h1>

      {/* CONTACTO */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Hablar con nosotros</h3>
        <p style={{ color: "#666" }}>
          ¿Tienes una pregunta antes de reservar? Estamos para ayudarte.
        </p>

        <button
          className="vb-btn-primary"
          onClick={() => window.open(getWhatsAppLink("Hola, tengo una pregunta sobre Vivabox."), "_blank")}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#075E54",
            color: "#fff",
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
        >
          <MessageCircle size={16} />
          Escribir por WhatsApp
        </button>

        <a
          className="vb-btn-primary"
          href={`tel:+${WHATSAPP_NUMBER}`}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#F3EFEA",
            color: "#333",
            border: "1px solid #E7E2DC",
            fontSize: 15,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
        >
          <Phone size={16} />
          Llamar
        </a>
      </Card>

      {/* FAQ */}
      <h3 style={{ margin: "4px 4px 12px", fontSize: 19 }}>Preguntas frecuentes</h3>
      <Card>
        <FaqAccordion items={FAQS} />
      </Card>

      {/* CUENTA */}
      <Card>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#F3EFEA",
            color: "#B42318",
            border: "1px solid #E7E2DC",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </Card>
    </div>
  )
}

/* ---------- UI ---------- */

function Card({ children }: any) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 18,
        marginBottom: 20,
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  )
}
