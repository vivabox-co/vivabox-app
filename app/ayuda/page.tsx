"use client"

import { MessageCircle, Phone, Clock, CalendarX, Info } from "lucide-react"
import { getWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/constants/contact"

export default function AyudaPage() {
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
        <h3 style={{ marginTop: 0 }}>Hablar con Mariana</h3>
        <p style={{ color: "#666" }}>
          Si tienes dudas o necesitas apoyo, nuestro equipo está listo.
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
        <Row icon={CalendarX} text="Si tu plan cambia, podemos ayudarte a reagendar." />

        <button
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
      </Card>

      {/* DUDAS */}
      <Card>
        <h3 style={{ marginTop: 0 }}>Dudas frecuentes</h3>
        <Row icon={Clock} text="Confirmaciones tardan máximo 48h." />
        <Row icon={Info} text="Recibirás instrucciones antes de tu experiencia." />
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
