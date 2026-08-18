"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Phone, CalendarX, ChevronDown } from "lucide-react"
import { getWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/constants/contact"
import RescheduleModal from "@/components/ui/RescheduleModal"
import { Booking } from "@/lib/data/types/booking"

const FAQS = [
  {
    question: "¿Cuándo se confirma mi experiencia?",
    answer: "Normalmente confirmamos en menos de 48 horas.",
  },
  {
    question: "¿Qué pasa si no pueden confirmar la fecha?",
    answer: "Te contactaremos para buscar otra opción contigo.",
  },
  {
    question: "¿Dónde veo las instrucciones?",
    answer: "Cuando tu experiencia esté confirmada, aparecerán en \"Tu experiencia\".",
  },
  {
    question: "¿Puedo cambiar la fecha?",
    answer: "Sí. Escríbenos y te ayudamos a solicitar el cambio.",
  },
]

export default function AyudaPage() {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Reprend la réservation active (même logique que /experiencia) pour
  // pouvoir brancher "Solicitar cambio" sur le flux de reprogrammation déjà
  // existant, sans avoir à redemander l'identité de la réservation ici.
  useEffect(() => {
    const stored = localStorage.getItem("currentBooking")
    const bookingId = stored ? JSON.parse(stored).id : null
    if (!bookingId) return

    fetch(`/api/booking/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setBooking(data.data)
      })
      .catch(() => {})
  }, [])

  // La reprogramación solo tiene sentido mientras la reserva sigue en
  // "requested" en base — una vez confirmada/rechazada/vivida, solo queda
  // escribir por WhatsApp (el backend rechazaría igual la solicitud).
  const canReschedule = booking?.status === "requested"

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
          ¿Tienes una pregunta o necesitas ayuda con tu experiencia?
        </p>

        {/* PRIMARY */}
        <button
          onClick={() => window.open(getWhatsAppLink("Hola, necesito ayuda con mi Vivabox."), "_blank")}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "#111",
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

        {/* SECONDARY */}
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

      {/* CAMBIOS */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Cambiar fecha</h3>
        <Row icon={CalendarX} text="Si tus planes cambiaron, podemos ayudarte a solicitar una nueva fecha." />

        {canReschedule ? (
          <button
            onClick={() => setShowReschedule(true)}
            style={{
              marginTop: 12,
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
            Solicitar cambio
          </button>
        ) : (
          <button
            onClick={() => window.open(getWhatsAppLink("Hola, quisiera cambiar la fecha de mi experiencia."), "_blank")}
            style={{
              marginTop: 12,
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
            Escribirnos para cambiarla
          </button>
        )}
      </Card>

      {/* FAQ */}
      <Card>
        <h3 style={{ marginTop: 0, marginBottom: 4 }}>Preguntas frecuentes</h3>
        {FAQS.map((faq, i) => {
          const open = openFaq === i
          return (
            <div
              key={faq.question}
              style={{
                borderTop: i > 0 ? "1px solid #EFEBE5" : "none",
                paddingTop: i > 0 ? 12 : 8,
                paddingBottom: 12,
              }}
            >
              <button
                onClick={() => setOpenFaq(open ? null : i)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#222",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {faq.question}
                <ChevronDown
                  size={16}
                  style={{
                    flexShrink: 0,
                    transition: "transform 0.2s ease",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    color: "#999",
                  }}
                />
              </button>
              {open && (
                <p style={{ margin: "8px 0 0", color: "#666", fontSize: 14, lineHeight: 1.5 }}>
                  {faq.answer}
                </p>
              )}
            </div>
          )
        })}
      </Card>

      {showReschedule && booking && (
        <RescheduleModal
          bookingId={booking.id}
          onClose={() => setShowReschedule(false)}
          onSuccess={({ date, time }) => {
            setBooking((prev) => (prev ? { ...prev, date, time } : prev))
          }}
        />
      )}
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

function Row({ icon: Icon, text }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 8,
        color: "#555",
        alignItems: "center",
      }}
    >
      <Icon size={16} />
      <span>{text}</span>
    </div>
  )
}
