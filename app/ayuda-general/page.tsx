"use client"

import { MessageCircle, Phone } from "lucide-react"
import { getWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/constants/contact"
import { logout } from "@/lib/utils/logout"
import FaqAccordion from "@/components/ui/FaqAccordion"
import BrandDots from "@/components/ui/BrandDots"

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
    question: "¿Mi reserva queda confirmada de inmediato?",
    answer:
      "No todavía. Cuando eliges una fecha y hora, enviamos tu solicitud al lugar para confirmar que puede recibirte. La mayoría de las reservas se confirman en menos de 48 horas; si se necesita más tiempo, te avisaremos apenas tengamos una respuesta. Mientras tanto, puedes ver el estado de tu solicitud dentro de la app.",
  },
  {
    question: "¿Qué pasa si la experiencia o la fecha que quiero no está disponible?",
    answer:
      "Si la fecha que elegiste no está disponible, el lugar nos lo hace saber y te proponemos una alternativa para que la revises. Si ninguna fecha te funciona, también puedes explorar otras experiencias disponibles con tu Vivabox.",
  },
  {
    question: "¿Puedo cambiar mi experiencia o mi reserva?",
    answer:
      "Puedes cambiar de experiencia mientras tu reserva no esté confirmada. Si lo que quieres es cambiar la fecha, puedes solicitarlo directamente desde la app mientras tu solicitud siga en trámite; si tu reserva ya está confirmada, escríbenos por WhatsApp y revisamos contigo las opciones disponibles con el lugar.",
  },
  {
    question: "¿Puedo ir acompañado? ¿Cuántas personas pueden participar?",
    answer:
      "Depende de la experiencia. Cada una indica cuántas personas están incluidas en tu regalo y si admite personas adicionales; podrás verlo antes de reservar en el detalle de la experiencia. Cuando se permite ir acompañado, las personas extra quedan sujetas a disponibilidad y a un costo adicional.",
  },
  {
    question: "¿Hay algún costo adicional?",
    answer:
      "Tu Vivabox cubre la experiencia y la cantidad de personas incluidas que se indican en cada experiencia. Si decides llevar personas adicionales, cuando la experiencia lo permite, esas personas sí tienen un costo adicional y quedan sujetas a disponibilidad del lugar.",
  },
  {
    question: "¿Qué pasa si necesito cancelar o no puedo asistir?",
    answer:
      "Escríbenos por WhatsApp lo antes posible y te contamos las opciones según la experiencia y el lugar reservado. Entre antes nos avises, más fácil será encontrar una alternativa.",
  },
  {
    question: "¿Hasta cuándo puedo usar mi Vivabox?",
    answer:
      "Tu Vivabox tiene una fecha de vigencia asociada a tu código de activación. Si tienes dudas sobre hasta cuándo puedes usarlo, escríbenos por WhatsApp y te confirmamos la vigencia exacta de tu regalo.",
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>Ayuda</h1>
        <BrandDots style={{ marginBottom: 0 }} />
      </div>

      {/* FAQ */}
      <h3 style={{ margin: "4px 4px 12px", fontSize: 19 }}>Preguntas frecuentes</h3>
      <Card>
        <FaqAccordion items={FAQS} />
      </Card>

      {/* CONTACTO — escalada al soporte, se muestra más liviana que la FAQ */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 18,
          marginTop: 8,
          marginBottom: 20,
          border: "1px solid #E7E2DC",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 4, fontSize: 16, fontWeight: 600, color: "#333" }}>
          ¿Necesitas ayuda?
        </h3>
        <p style={{ color: "#666", fontSize: 13.5 }}>
          ¿No encontraste la respuesta? Escríbenos y te ayudamos.
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
      </div>

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
