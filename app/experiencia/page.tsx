"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Calendar, Clock, ChevronRight, Shirt, CloudSun, AlertCircle, Info, Users } from "lucide-react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { getExperiencePhotos } from "@/lib/data/getExperiencePhotos"
import { getCurrentBookingId } from "@/lib/data/getCurrentBookingId"
import { formatLabel } from "@/lib/map/formatLabels"
import { usePageReady } from "@/components/ui/UIContext"
import PhotoGallery from "@/components/ui/PhotoGallery"
import { Booking } from "@/lib/data/types/booking"
import { Experience } from "@/lib/data/types"

/* Construit la liste "Antes de ir" à partir des seuls champs réellement
   renseignés sur l'expérience — pas de conseils génériques inventés. Chaque
   nouveau champ produit (ex: futur "qué llevar") s'ajoute simplement ici. */
type PrepItem = { icon: typeof Clock; text: string }

function buildPreparationItems(experience: Experience | null, isConfirmed: boolean): PrepItem[] {
  if (!experience) return []
  const items: PrepItem[] = []

  if (experience.duration) items.push({ icon: Clock, text: `Duración: ${experience.duration}` })
  if (experience.clothingNote) items.push({ icon: Shirt, text: experience.clothingNote })
  if (experience.weatherNote) items.push({ icon: CloudSun, text: experience.weatherNote })
  experience.requirements?.forEach((r) => items.push({ icon: AlertCircle, text: r }))
  experience.importantToKnow?.forEach((i) => items.push({ icon: Info, text: i }))
  // El punto de encuentro solo se muestra una vez confirmada, igual que el
  // proveedor más abajo.
  if (isConfirmed && experience.meetingPointNote) {
    items.push({ icon: MapPin, text: experience.meetingPointNote })
  }

  return items
}

export default function ExperienciaPage() {
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)

  // "currentBooking" ne contient que l'id (voir confirmacion/page.tsx) — le
  // reste (statut, date, snapshot...) vient toujours de l'API, jamais du
  // localStorage, pour ne pas afficher une réservation périmée. Si ce
  // localStorage a été vidé (ex: logout puis reconnexion), getCurrentBookingId
  // le retrouve via la session côté serveur au lieu de nous faire échouer ici.
  useEffect(() => {
    let cancelled = false

    getCurrentBookingId().then((bookingId) => {
      if (cancelled) return
      if (!bookingId) {
        router.replace("/mapa")
        return
      }

      fetch(`/api/booking/${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return
          if (data.success && data.data) setBooking(data.data)
          else router.replace("/mapa")
        })
        .catch(() => {
          if (!cancelled) router.replace("/mapa")
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })

    return () => {
      cancelled = true
    }
  }, [router])

  /* Charger la vraie expérience (pour la vivanote, absente du snapshot) */
  useEffect(() => {
    if (!booking?.experienceId) return

    fetchExperiences().then((list) => {
      const found = list.find((e) => e.id === booking.experienceId)
      if (found) setExperience(found)
    })
  }, [booking])

  usePageReady(!loading)

  /* Sécurité */
  if (loading || !booking) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        Cargando experiencia...
      </div>
    )
  }

  const exp = booking.experienceSnapshot
  const isConfirmed =
    booking.status === "confirmed" || booking.status === "done"
  // La galerie complète vit sur l'Experience (fetchée à part), pas sur le
  // snapshot de la réservation — tant qu'elle n'est pas arrivée, on retombe
  // sur la seule image du snapshot pour ne pas laisser le hero vide.
  const photos = getExperiencePhotos(experience ?? { image: exp.image, gallery: undefined })
  const prepItems = buildPreparationItems(experience, isConfirmed)

  return (
    <div
      style={{
        padding: "16px 16px 120px",
        background: "#FAF8F5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 16 }}>Tu experiencia</h1>

      {/* GALERIE */}
      <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 18, aspectRatio: "16 / 9" }}>
        <PhotoGallery photos={photos} alt={exp.title} />
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

        {/* 🔥 PRESTATAIRE visible seulement après confirmation */}
        {isConfirmed && exp.providerName && (
          <div style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>
            Prestador: {exp.providerName}
          </div>
        )}

        <InfoRow icon={MapPin} value={exp.zone} />
        <InfoRow icon={Calendar} value={booking.date} />
        <InfoRow icon={Clock} value={booking.time} />
        {experience?.format && <InfoRow icon={Users} value={formatLabel(experience.format)} />}
      </div>

      {/* PREPARACIÓN — solo campos realmente disponibles en la experiencia */}
      {prepItems.length > 0 && (
        <Section title="Antes de ir">
          {prepItems.map((item, i) => (
            <Bullet key={i} icon={item.icon}>{item.text}</Bullet>
          ))}
        </Section>
      )}

      {/* VIVANOTE */}
      {experience?.vivanote && (
        <Section title="Una recomendación Vivabox">
          <p style={{ margin: 0, color: "#555" }}>{experience.vivanote}</p>
        </Section>
      )}

      <div style={{ marginTop: 8, textAlign: "center" }}>
        <Link
          href="/ayuda"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color: "#777",
            textDecoration: "none",
          }}
        >
          ¿Necesitas ayuda?
          <ChevronRight size={14} />
        </Link>
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

function Bullet({ icon: Icon, children }: any) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, color: "#555" }}>
      <Icon size={16} style={{ marginTop: 2, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  )
}
