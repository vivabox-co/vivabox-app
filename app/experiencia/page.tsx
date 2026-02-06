"use client"

import { useEffect, useState } from "react"
import { MapPin, Calendar, Clock, Phone, CheckCircle } from "lucide-react"

export default function ExperienciaPage() {
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("currentBooking")
    if (stored) setBooking(JSON.parse(stored))
  }, [])

  if (!booking) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        Cargando...
      </div>
    )
  }

  const exp = booking.experience

  return (
    <div
      style={{
        padding: "16px 16px 120px",
        background: "#FAF8F5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 16 }}>Tu experiencia</h1>

      {/* IMAGE */}
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 18,
        }}
      >
        <img
          src={exp.image}
          alt={exp.title}
          style={{ width: "100%", height: 200, objectFit: "cover" }}
        />
      </div>

      {/* INFO CARD */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>{exp.title}</h2>

        <InfoRow icon={MapPin} value={exp.zone} />
        <InfoRow icon={Calendar} value={booking.date} />
        <InfoRow icon={Clock} value={booking.time} />
      </div>

      {/* PREPARACIÓN */}
      <Section title="Antes de ir">
        <Bullet>Llega 10 minutos antes.</Bullet>
        <Bullet>Lleva ropa cómoda.</Bullet>
        <Bullet>Ten tu confirmación a mano.</Bullet>
      </Section>

      {/* VIVANOTE */}
      <Section title="Recomendación Vivabox">
        <p style={{ margin: 0, color: "#555" }}>{exp.vivanote}</p>
      </Section>

      {/* AYUDA */}
      <div
        style={{
          marginTop: 28,
          padding: 18,
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>¿Necesitas ayuda?</h3>
        <p style={{ color: "#666" }}>
          Nuestro equipo puede ayudarte con cualquier detalle.
        </p>
        <button
          style={{
            marginTop: 10,
            width: "100%",
            padding: 14,
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            border: "none",
            fontSize: 15,
          }}
        >
          <Phone size={16} style={{ marginRight: 6 }} />
          Hablar con Mariana
        </button>
      </div>
    </div>
  )
}

/* ---------- UI PARTS ---------- */

function InfoRow({ icon: Icon, value }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 6,
        color: "#555",
      }}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{value}</span>
    </div>
  )
}

function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  )
}

function Bullet({ children }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        marginBottom: 6,
        color: "#555",
      }}
    >
      <CheckCircle size={16} />
      <span>{children}</span>
    </div>
  )
}
