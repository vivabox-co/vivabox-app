"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Phone, CalendarX } from "lucide-react"
import { getWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/constants/contact"
import RescheduleModal from "@/components/ui/RescheduleModal"
import FaqAccordion from "@/components/ui/FaqAccordion"
import BrandDots from "@/components/ui/BrandDots"
import { getCurrentBookingId } from "@/lib/data/getCurrentBookingId"
import { Booking } from "@/lib/data/types/booking"
import { logout } from "@/lib/utils/logout"

const FAQS = [
  {
    question: "¿Cuándo se confirma mi experiencia?",
    answer:
      "Después de solicitar tu reserva, contactamos al lugar para confirmar la fecha y hora que elegiste. Te avisaremos apenas tengamos la confirmación.",
  },
  {
    question: "¿Qué significa “En espera de confirmación”?",
    answer:
      "Significa que ya recibimos tu solicitud y estamos esperando que el lugar confirme la fecha y hora. No necesitas hacer nada por ahora.",
  },
  {
    question: "¿Qué pasa si no pueden confirmar la fecha que elegí?",
    answer:
      "Si el lugar no puede confirmar la fecha que elegiste, te contactaremos para proponerte una alternativa disponible. Si la nueva fecha te funciona, la confirmaremos por ti.",
  },
  {
    question: "¿Qué pasa si necesito cambiar la fecha?",
    answer:
      "Si tus planes cambiaron, escríbenos lo antes posible. Revisaremos con el lugar si es posible cambiar la fecha. Los cambios dependen de la disponibilidad y de las condiciones de cada experiencia.",
  },
  {
    question: "¿Dónde veo las instrucciones de mi experiencia?",
    answer:
      "Cuando tu reserva esté confirmada, encontrarás toda la información que necesitas para disfrutarla: fecha, hora, lugar e instrucciones especiales.",
  },
  {
    question: "¿Qué hago si tengo un problema con mi reserva?",
    answer:
      "Escríbenos por WhatsApp y cuéntanos qué pasó. Revisaremos tu reserva y te ayudaremos con el siguiente paso.",
  },
  {
    question: "¿Qué debo hacer el día de mi experiencia?",
    answer:
      "Revisa el detalle de tu reserva en la app: ahí encontrarás el lugar, la hora y las indicaciones importantes para ese día. Solo preséntate a la hora acordada y disfruta.",
  },
  {
    question: "¿Qué pasa si no puedo asistir a mi reserva?",
    answer:
      "Escríbenos por WhatsApp lo antes posible y te contamos las opciones según tu reserva. Entre antes nos avises, más fácil será encontrar una alternativa.",
  },
]

export default function AyudaPage() {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)

  // Reprend la réservation active (même logique que /experiencia, y compris
  // le fallback serveur si le localStorage a été vidé par un logout) pour
  // pouvoir brancher "Solicitar cambio" sur le flux de reprogrammation déjà
  // existant, sans avoir à redemander l'identité de la réservation ici.
  useEffect(() => {
    let cancelled = false

    getCurrentBookingId().then((bookingId) => {
      if (cancelled || !bookingId) return

      fetch(`/api/booking/${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && data.success && data.data) setBooking(data.data)
        })
        .catch(() => {})
    })

    return () => {
      cancelled = true
    }
  }, [])

  // La reprogramación solo tiene sentido mientras la reserva sigue en
  // "requested" en base — una vez confirmada/rechazada/vivida, solo queda
  // escribir por WhatsApp (el backend rechazaría igual la solicitud).
  // "searching_alternative" es el mismo estado en base ("requested"), solo
  // que ya pasaron todas las fechas preferidas — ver /api/booking/[bookingId]
  // (GET) — así que también debe permitir reprogramar.
  const canReschedule = booking?.status === "requested" || booking?.status === "searching_alternative"

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

      {/* CAMBIOS */}
      <Card>
        <h3 style={{ marginTop: 0 }}>¿Necesitas cambiar la fecha?</h3>
        <Row
          icon={CalendarX}
          iconColor="#0294D2"
          text="Si tus planes cambiaron, puedes solicitar una nueva fecha para tu experiencia."
        />

        {canReschedule ? (
          <button
            className="vb-btn-primary"
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
            className="vb-btn-primary"
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
          onClick={() => window.open(getWhatsAppLink("Hola, necesito ayuda con mi Vivabox."), "_blank")}
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

function Row({ icon: Icon, text, iconColor }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 8,
        color: "#555",
        alignItems: "center",
      }}
    >
      <Icon size={24} strokeWidth={1.8} style={iconColor ? { color: iconColor, flexShrink: 0 } : { flexShrink: 0 }} />
      <span>{text}</span>
    </div>
  )
}
