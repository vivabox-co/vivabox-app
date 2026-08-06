"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import BookingTimeline, { BookingStatus } from "@/components/ui/BookingTimeline"
import DynamicStatusBlock from "@/components/ui/DynamicStatusBlock"
import ExperienceSummaryCard from "@/components/list/ExperienceSummaryCard"
import { useUI } from "@/components/ui/UIContext"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { Booking } from "@/lib/data/types/booking"
import { Experience } from "@/lib/data/types"

export default function SeguimientoPage() {
  const { bookingId } = useParams() as { bookingId: string }
  const [booking, setBooking] = useState<Booking | null>(null)
  const [realExperience, setRealExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { setActiveExperience, setHideNav } = useUI()
  const router = useRouter()

  // Masquer/monther la navigation (inchangé)
  useEffect(() => {
    setHideNav(false)
    return () => setHideNav(false)
  }, [setHideNav])

  // Charger la réservation depuis l'API
  useEffect(() => {
    const sessionToken = sessionStorage.getItem("vb_session")
    if (!sessionToken) {
      router.replace("/activar")
      return
    }

    fetch(`/api/booking/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBooking(data.data)
        } else {
          setError(data.error || "BOOKING_NOT_FOUND")
        }
      })
      .catch(err => {
        console.error("Error fetching booking:", err)
        setError("NETWORK_ERROR")
      })
      .finally(() => setLoading(false))
  }, [bookingId, router])

  // Charger l'expérience complète à partir du snapshot ou de l'experienceId
  useEffect(() => {
    if (!booking?.experienceId) return
    fetchExperiences().then(list => {
      const found = list.find(e => e.id === booking.experienceId)
      if (found) setRealExperience(found)
    })
  }, [booking])

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        Cargando...
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div style={{ padding: 24, minHeight: "100vh", background: "#FAF8F5" }}>
        <h2>No se pudo cargar la reserva</h2>
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

  const status: BookingStatus = booking.status
  const exp = booking.experienceSnapshot

  const badgeMap: Record<string, string | null> = {
    requested: "En preparación",
    waiting_provider: "Coordinando",
    confirmed: "Reservado",
    done: null,
  }

  return (
    <div style={{ padding: "16px 16px 120px", background: "#FAF8F5", minHeight: "100vh" }}>
      <h1 style={{ marginTop: 6, marginBottom: 4, fontSize: 24, fontWeight: 600 }}>
        Todo se está organizando para ti
      </h1>
      <p style={{ marginBottom: 18, color: "#666", fontSize: 14 }}>
        Estamos coordinando con el lugar.
      </p>

      <div style={{ marginBottom: 18 }}>
        <ExperienceSummaryCard
          title={exp.title}
          location={exp.zone}
          image={exp.image}
          date={booking.date}
          format={realExperience?.format}
          time={booking.time}
          category={exp.category}
          badge={badgeMap[status]}
          onClick={() => {
            if (realExperience) {
              setActiveExperience(realExperience)
              router.push("/experiencia")
            }
          }}
        />
      </div>

      <BookingTimeline
        status={status}
        category={exp.category}
        // Les contrôles de dev ne sont plus nécessaires car les statuts viennent du backend
        onNext={undefined}
        onPrev={undefined}
      />

      <div style={{ marginTop: 28 }}>
        <DynamicStatusBlock status={status} />
      </div>

      <div style={{
        marginTop: 32,
        padding: 16,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
      }}>
        <p style={{ marginBottom: 6, fontWeight: 500 }}>
          Ese día vas a estar aquí.
        </p>
        <p style={{ color: "#666", fontSize: 14 }}>
          Un momento que ya tiene fecha.
        </p>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ fontSize: 13, color: "#777" }}>
          ¿Tienes una duda? Estamos aquí.
        </span>
      </div>
    </div>
  )
}