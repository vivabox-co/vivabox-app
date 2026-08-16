"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Clock, Phone, CheckCircle } from "lucide-react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { useUI } from "@/components/ui/UIContext"

export default function ExperienciaPage() {
  const { activeExperience } = useUI()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [experience, setExperience] = useState<any>(activeExperience)
  const [error, setError] = useState(false)

  /* Charger la réservation complète depuis l'API — le localStorage ne
     contient que l'id (voir confirmacion/page.tsx), pas experienceId. */
  useEffect(() => {
    const stored = localStorage.getItem("currentBooking")
    if (!stored) {
      setError(true)
      return
    }
    const { id } = JSON.parse(stored)

    fetch(`/api/booking/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBooking(data.data)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
  }, [])

  /* Charger la vraie expérience (sauf si déjà fournie via le contexte
     UI par la page de seguimiento) */
  useEffect(() => {
    if (activeExperience || !booking?.experienceId) return

    fetchExperiences().then((list) => {
      const found = list.find((e) => e.id === booking.experienceId)
      if (found) setExperience(found)
    })
  }, [booking, activeExperience])

  /* Erreur : réservation introuvable */
  if (error) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        <h2>No se pudo cargar tu experiencia</h2>
        <p>Por favor, intenta de nuevo más tarde o contacta con soporte.</p>
        <button
          onClick={() => router.push("/mapa")}
          style={{
            marginTop: 16,
            padding: "10px 20px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 12,
          }}
        >
          Volver al mapa
        </button>
      </div>
    )
  }

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
