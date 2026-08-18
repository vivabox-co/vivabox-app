"use client"

import { useEffect, useState } from "react"
import { MapPin, Calendar, Clock, Phone, CheckCircle } from "lucide-react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { getWhatsAppLink } from "@/lib/constants/contact"

export default function ExperienciaPage() {
  const [booking, setBooking] = useState<any>(null)
  const [experience, setExperience] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("currentBooking")
    if (stored) setBooking(JSON.parse(stored))
  }, [])

  /* Charger la vraie expérience */
  useEffect(() => {
    if (!booking?.experienceId) return

    fetchExperiences().then((list) => {
      const found = list.find((e) => e.id === booking.experienceId)
      if (found) setExperience(found)
    })
  }, [booking])

  /* Sécurité */
  if (!booking || !experience) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        Cargando experiencia...
      </div>
    )
  }

  const isConfirmed =
    booking.status === "confirmed" || booking.status === "done"

  // 🔥 id = nom du prestataire
  const providerName = experience.id

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
      <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 18 }}>
        <img
          src={experience.image}
          alt={experience.title}
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
        <h2 style={{ marginTop: 0 }}>{experience.title}</h2>

        {/* 🔥 PRESTATAIRE visible seulement après confirmation */}
        {isConfirmed && (
          <div style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>
            Prestador: {providerName}
          </div>
        )}

        <InfoRow icon={MapPin} value={experience.zone} />
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
        <p style={{ margin: 0, color: "#555" }}>{experience.vivanote}</p>
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
          onClick={() => window.open(getWhatsAppLink(`Hola, tengo una pregunta sobre "${experience.title}".`), "_blank")}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 14,
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            border: "none",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <Phone size={16} />
          Hablar con Mariana
        </button>
      </div>
    </div>
  )
}

/* ---------- UI PARTS ---------- */

function InfoRow({ icon: Icon, value }: any) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, color: "#555" }}>
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
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, color: "#555" }}>
      <CheckCircle size={16} />
      <span>{children}</span>
    </div>
  )
}
