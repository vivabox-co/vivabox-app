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
    question: "¿Cómo reservo una experiencia?",
    answer:
      "Explora las experiencias en Mapa o Lista, elige la que más te guste y selecciona tus fechas preferidas. Nosotros nos encargamos de solicitar la confirmación con el lugar.",
  },
  {
    question: "¿Qué pasa después de enviar mi solicitud?",
    answer:
      "Contactamos al lugar para confirmar la fecha y hora que elegiste. Te avisaremos apenas tengamos la confirmación.",
  },
  {
    question: "¿Puedo guardar experiencias para decidir más tarde?",
    answer:
      "Sí, toca el corazón en cualquier experiencia para guardarla en Favoritos y encontrarla fácilmente cuando quieras reservar.",
  },
  {
    question: "¿Puedo cambiar de experiencia antes de reservar?",
    answer:
      "Claro, puedes seguir explorando en Mapa o Lista y elegir otra experiencia en cualquier momento, hasta que envíes tu solicitud de reserva.",
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
          onClick={() => window.open(getWhatsAppLink("Hola, tengo una pregunta sobre Vivabox."), "_blank")}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#152F40",
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
            color: "#333",
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
