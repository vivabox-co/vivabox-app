"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import BookingTimeline, { BookingStatus } from "@/components/ui/BookingTimeline"
import DynamicStatusBlock, { StatusAction } from "@/components/ui/DynamicStatusBlock"
import ReviewModal from "@/components/ui/ReviewModal"
import ExperienceSummaryCard from "@/components/list/ExperienceSummaryCard"
import { useUI, usePageReady } from "@/components/ui/UIContext"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { buildCalendarLink } from "@/lib/utils/calendarLink"
import { Booking } from "@/lib/data/types/booking"
import { Experience } from "@/lib/data/types"

// Statuts "en confirmación" (requested/waiting_provider) partagent le même
// message : côté beneficiario, il n'y a rien à distinguer avant que le
// lugar confirme réellement — un seul texte "todo está bajo control" évite
// de laisser croire à une étape intermédiaire actionnable.
const CONFIRMING_HEADER = {
  title: "Estamos confirmando tu experiencia",
  subtitle: "Estamos coordinando con el lugar. Te avisaremos apenas esté confirmada.",
}

const HEADER_COPY: Record<BookingStatus, { title: string; subtitle: string }> = {
  requested: CONFIRMING_HEADER,
  waiting_provider: CONFIRMING_HEADER,
  alternative_proposed: { title: "Te proponemos una nueva fecha", subtitle: "El lugar no pudo con la fecha original, pero tiene otra opción." },
  confirmed: { title: "¡Tu experiencia está confirmada!", subtitle: "Ya tienes fecha y hora." },
  rejected: { title: "Busquemos otra fecha juntos", subtitle: "No pudimos confirmar esta opción." },
  done: { title: "Esperamos que la hayas disfrutado", subtitle: "Gracias por vivir esta experiencia con nosotros." },
}

export default function SeguimientoPage() {
  const { bookingId } = useParams() as { bookingId: string }
  // Courte référence à donner en cas de contact — plus simple à échanger
  // avec le support que l'UUID complet.
  const bookingRef = bookingId?.slice(0, 8).toUpperCase()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [realExperience, setRealExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [actionPending, setActionPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  // Persisté par booking (voir l'effet plus bas) : lu ici de façon paresseuse
  // plutôt que dans un effet, pour ne pas rejouer un flash "requested" avant
  // que l'effet n'ait eu le temps de le corriger. Sûr côté hydratation : le
  // contenu réel (BookingTimeline) n'est de toute façon jamais rendu côté
  // serveur, `booking` restant `null` tant que le fetch client n'a pas
  // répondu (voir l'écran de chargement plus bas).
  const [progressReveal, setProgressReveal] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(`vb_seguimiento_reveal_${bookingId}`) === "1"
  })

  const { setActiveExperience, setHideNav } = useUI()
  const router = useRouter()

  // Masquer/monther la navigation (inchangé)
  useEffect(() => {
    setHideNav(false)
    return () => setHideNav(false)
  }, [setHideNav])

  usePageReady(!loading)

  // Charger la réservation depuis l'API (la session vit dans le cookie
  // vb_session, envoyé automatiquement — le middleware a déjà protégé
  // cette route en amont). Extrait en fonction réutilisable pour pouvoir
  // rafraîchir après une réponse à une date alternative (handleAction).
  const fetchBooking = useCallback(() => {
    return fetch(`/api/booking/${bookingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBooking(data.data)
          setError(null)
        } else {
          setError(data.error || "BOOKING_NOT_FOUND")
        }
      })
      .catch(err => {
        console.error("Error fetching booking:", err)
        setError("NETWORK_ERROR")
      })
  }, [bookingId])

  useEffect(() => {
    fetchBooking().finally(() => setLoading(false))
  }, [fetchBooking])

  // Charger l'expérience complète à partir du snapshot ou de l'experienceId
  useEffect(() => {
    if (!booking?.experienceId) return
    fetchExperiences().then(list => {
      const found = list.find(e => e.id === booking.experienceId)
      if (found) setRealExperience(found)
    })
  }, [booking])

  // Mise en scène : "requested" bascule visuellement vers "waiting_provider"
  // après quelques secondes pour donner une sensation de progrès, même si
  // le statut réel en base reste "requested" — le backend n'a pas d'état
  // "waiting_provider" (voir STATUS_MAP dans /api/booking/[bookingId]), donc
  // ce booléen ne pilote que l'affichage (status ci-dessous), jamais la
  // vraie donnée. Écrit dans localStorage pour qu'un aller-retour sur une
  // autre page ne fasse pas rejouer les 6 secondes à chaque fois : une fois
  // révélé, ça reste révélé pour cette réservation (lu au montage ci-dessus).
  useEffect(() => {
    if (!bookingId || progressReveal || booking?.status !== "requested") return
    const t = setTimeout(() => {
      localStorage.setItem(`vb_seguimiento_reveal_${bookingId}`, "1")
      setProgressReveal(true)
    }, 6000)
    return () => clearTimeout(t)
  }, [bookingId, booking?.status, progressReveal])

  // Une fois l'expérience vécue, on regarde si un avis a déjà été laissé
  // (pour afficher le message de remerciement plutôt que de redemander).
  useEffect(() => {
    if (booking?.status !== "done") return
    fetch(`/api/booking/${bookingId}/review`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setReviewed(true)
      })
      .catch(err => console.error("Error fetching review status:", err))
  }, [booking?.status, bookingId])

  async function handleAction(action: StatusAction) {
    if (action === "leave_review") {
      setShowReview(true)
      return
    }

    // "choose_new_experience" annule la réservation en cours (qu'elle vienne
    // d'un refus sec ou d'une alternative refusée) : le bénéficiaire perd
    // cette option pour de bon, donc on double-vérifie avant d'agir.
    if (action === "choose_new_experience") {
      if (!window.confirm("¿Elegir otra experiencia? Esta reserva se cancelará.")) return
    }

    setActionError(null)
    setActionPending(true)
    try {
      const res = await fetch(`/api/booking/${bookingId}/respond-alternative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action === "accept_alternative" ? "accept" : "decline" }),
      })
      const data = await res.json()

      if (!data.success) {
        setActionError("No pudimos procesar tu respuesta. Intenta de nuevo o contáctanos.")
        return
      }

      if (action === "choose_new_experience") {
        router.push("/mapa")
      } else {
        await fetchBooking()
      }
    } catch (err) {
      console.error("Error responding to alternative date:", err)
      setActionError("No pudimos procesar tu respuesta. Intenta de nuevo o contáctanos.")
    } finally {
      setActionPending(false)
    }
  }

  // États de chargement et d'erreur
  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#FAF8F5" }} />
  }

  if (error || !booking) {
    return (
      <div style={errorContainer}>
        <div style={errorCard}>
          <img src="/logo/LogoVivaboxSVG.svg" alt="Vivabox" style={errorLogo} />
          <h1 style={errorTitle}>No pudimos cargar tu reserva</h1>
          <p style={errorText}>Por favor, intenta de nuevo más tarde o contáctanos si el problema continúa.</p>
          <button onClick={() => router.push("/mapa")} style={errorButton}>
            Volver al mapa
          </button>
        </div>
      </div>
    )
  }

  const status: BookingStatus =
    booking.status === "requested" && progressReveal ? "waiting_provider" : booking.status
  const exp = booking.experienceSnapshot

  const badgeMap: Record<string, string | null> = {
    requested: "Confirmando",
    waiting_provider: "Confirmando",
    alternative_proposed: "Nueva fecha propuesta",
    confirmed: "Reservado",
    rejected: null,
    done: null,
  }

  const header = HEADER_COPY[status]
  const calendarLink = status === "confirmed" ? buildCalendarLink(booking.date, booking.time, exp.title) : ""

  return (
    <div style={{ padding: "16px 16px 120px", background: "#FAF8F5", minHeight: "100vh" }}>
      <h1 style={{ marginTop: 6, marginBottom: 4, fontSize: 24, fontWeight: 600 }}>
        {header.title}
      </h1>
      <p style={{ marginBottom: 18, color: "#666", fontSize: 14 }}>
        {header.subtitle}
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
        <DynamicStatusBlock
          status={status}
          onAction={handleAction}
          reviewed={reviewed}
          proposedDate={booking.proposedDate}
          proposedMoment={booking.proposedMoment}
          proposedHour={booking.proposedHour}
          actionPending={actionPending}
        />
        {actionError && (
          <p style={{ marginTop: 10, fontSize: 13, color: "#B42318", textAlign: "center" }}>{actionError}</p>
        )}
      </div>

      {calendarLink && (
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "9px 16px",
              borderRadius: 999,
              background: "#F3EFEA",
              color: "#333",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Añadir al calendario
          </a>
        </div>
      )}

      <div style={{ marginTop: 24, textAlign: "center" }}>
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
        <div style={{ marginTop: 6, fontSize: 11, color: "#aaa" }}>
          Referencia: {bookingRef}
        </div>
      </div>

      {showReview && (
        <ReviewModal
          bookingId={bookingId}
          onClose={() => setShowReview(false)}
          onSuccess={() => setReviewed(true)}
        />
      )}
    </div>
  )
}

/* ---------- STYLES (écran d'erreur, aligné sur app/error.tsx) ---------- */

const errorContainer: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 24px",
  background: "#FAF8F5",
  boxSizing: "border-box",
}

const errorCard: React.CSSProperties = {
  maxWidth: 420,
  width: "100%",
  background: "#fff",
  padding: "36px 24px 28px",
  borderRadius: 26,
  boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
  textAlign: "center",
}

const errorLogo: React.CSSProperties = {
  width: 72,
  height: "auto",
  display: "block",
  margin: "0 auto 24px",
}

const errorTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 650,
  lineHeight: 1.3,
  marginBottom: 12,
}

const errorText: React.CSSProperties = {
  fontSize: 15,
  opacity: 0.65,
  lineHeight: 1.5,
  marginBottom: 28,
}

const errorButton: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: 52,
  lineHeight: "52px",
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
}
