"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import BookingTimeline, { BookingStatus } from "@/components/ui/BookingTimeline"
import DynamicStatusBlock, { StatusAction } from "@/components/ui/DynamicStatusBlock"
import BrandRibbon from "@/components/ui/BrandRibbon"
import BrandDots from "@/components/ui/BrandDots"
import ReviewModal from "@/components/ui/ReviewModal"
import ExperienceSummaryCard from "@/components/list/ExperienceSummaryCard"
import { useUI, usePageReady } from "@/components/ui/UIContext"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { buildCalendarLink } from "@/lib/utils/calendarLink"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"
import { formatApproxHour } from "@/lib/utils/formatApproxHour"
import { getWhatsAppLink } from "@/lib/constants/contact"
import { Booking } from "@/lib/data/types/booking"
import { Experience } from "@/lib/data/types"

// Délai de la mise en scène "requested" → "waiting_provider" (voir l'effet
// progressReveal plus bas), ancré sur booking.requestedSeenAt.
const PROGRESS_REVEAL_DELAY_MS = 6000

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
  // Ni "requested" ni un échec définitif : Vivabox continue à s'encargar de
  // esta reserva, on ne présente jamais ça comme "tu fecha no estaba
  // disponible" en gros titre.
  searching_alternative: {
    title: "Estamos buscando otra fecha para ti",
    subtitle: "La fecha que elegiste no estaba disponible. Estamos buscando otra opción para tu experiencia.",
  },
  alternative_proposed: { title: "Tenemos una nueva fecha para ti", subtitle: "La fecha que elegiste no estaba disponible, pero encontramos otra opción con el lugar." },
  confirmed: { title: "¡Tu experiencia está confirmada!", subtitle: "Ya tienes fecha y hora." },
  // Reste le texte "sûr" générique (pas de colonne cancellation_reason en
  // base) — voir CANCELLED_STEP dans BookingTimeline pour l'équivalent côté
  // timeline.
  rejected: { title: "Esta reserva fue cancelada", subtitle: "No pudimos encontrar una fecha que funcionara para esta experiencia." },
  done: { title: "Esperamos que la hayas disfrutado", subtitle: "Gracias por vivir esta experiencia con nosotros." },
}

// Contenu de l'étape active "Nueva fecha propuesta" de BookingTimeline
// (passé via `activeContent`, voir plus bas) : la proposition et la
// décision vivent entièrement dans cette étape plutôt que dans un bloc à
// part, pour que la timeline reste la seule source d'information sur l'état
// de la réservation. Prend un seul `proposal` aujourd'hui ; passer un
// tableau de plusieurs propositions plus tard n'impose aucun changement à
// BookingTimeline, seulement à ce composant.
function AlternativeProposalStep({
  proposal,
  onAccept,
  onReject,
  pending,
  error,
}: {
  proposal: { date: string | null; moment: string | null; hour: string | null }
  onAccept: () => void
  onReject: () => void
  pending: boolean
  error: string | null
}) {
  if (!proposal.date) return null
  const dateLabel = formatLocalDate(proposal.date, { weekday: "long", day: "numeric", month: "long" })
  // "alrededor de las" plutôt qu'un "~" technique, et arrondi à l'heure
  // pleine (voir formatApproxHour) : la disponibilité reste approximative,
  // pas besoin de la déguiser en heure précise ("07:39").
  const approxHour = proposal.hour ? formatApproxHour(proposal.hour) : null
  const whenLabel = [proposal.moment, approxHour ? `alrededor de las ${approxHour}` : null].filter(Boolean).join(" · ")

  return (
    <div>
      <div style={proposedCard}>
        <div style={proposedLabel}>Nueva fecha</div>
        <div style={proposedDate}>{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}</div>
        {whenLabel && <div style={proposedWhen}>{whenLabel}</div>}
      </div>

      <p style={stepQuestion}>¿Te funciona esta fecha?</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onAccept} disabled={pending} style={stepPrimaryBtn(pending)}>
          Sí, me funciona
        </button>
        <button onClick={onReject} disabled={pending} style={stepSecondaryBtn(pending)}>
          Prefiero otra fecha
        </button>
      </div>

      {error && (
        <p style={{ marginTop: 10, fontSize: 13, color: "#B42318" }}>{error}</p>
      )}
    </div>
  )
}

// Écran affiché quand le bénéficiaire refuse la date proposée : reste dans
// le MÊME dossier de réservation (pas d'annulation automatique). "Elegir
// otra experiencia" est volontairement en retrait (lien discret, pas un
// bouton) — c'est l'option ultime, pas le chemin normal.
function RejectAlternativeStep({
  onKeepSearching,
  onTalkToVivabox,
  onChooseNew,
  pending,
  error,
}: {
  onKeepSearching: () => void
  onTalkToVivabox: () => void
  onChooseNew: () => void
  pending: boolean
  error: string | null
}) {
  return (
    <div>
      <p style={stepQuestion}>Esta fecha no te funciona.</p>
      <p style={{ margin: "-4px 0 14px", fontSize: 14, color: "#666", lineHeight: 1.4 }}>
        Seguimos buscando otra opción para tu experiencia.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={onKeepSearching} disabled={pending} style={stepPrimaryBtn(pending)}>
          Buscar otra fecha
        </button>
        <button onClick={onTalkToVivabox} disabled={pending} style={stepSecondaryBtn(pending)}>
          Hablar con Vivabox
        </button>
      </div>

      <button
        onClick={onChooseNew}
        disabled={pending}
        style={{ ...stepLinkBtn(pending), marginTop: 12 }}
      >
        Elegir otra experiencia
      </button>

      {error && (
        <p style={{ marginTop: 10, fontSize: 13, color: "#B42318" }}>{error}</p>
      )}
    </div>
  )
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
  // Écran "Prefiero otra fecha" (voir RejectAlternativeStep) : affiché à la
  // place de la proposition tant que le bénéficiaire n'a pas choisi une des
  // trois options. Réinitialisé dès qu'on quitte "alternative_proposed"
  // (effet plus bas) pour ne pas le retrouver affiché sur une prochaine
  // proposition.
  const [showRejectOptions, setShowRejectOptions] = useState(false)
  // Piloté par booking.requestedSeenAt (voir l'effet plus bas), lui-même figé
  // côté serveur à la 1ère fois où GET /api/booking/[bookingId] a vu cette
  // réservation en "requested" — ancre la mise en scène "Disponibilidad con
  // el lugar" sur un instant réel plutôt que sur le temps passé en continu
  // sur cette page : que le bénéficiaire reste ici, aille sur /experiencia ou
  // /ayuda puis revienne, ça s'active au même instant dans tous les cas.
  const [progressReveal, setProgressReveal] = useState(false)

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
          // Miroir du statut dans localStorage : ClientLayout s'en sert pour
          // savoir si le blocage "retour" (vers /mapa, /lista, /favoritos,
          // /reservar/fechas) doit encore s'appliquer — il se lève dès que
          // la réservation est "rejected", pour ne pas coincer indéfiniment
          // un user qui veut repartir choisir une autre expérience.
          localStorage.setItem("currentBooking", JSON.stringify({ id: bookingId, status: data.data.status }))
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

  useEffect(() => {
    if (booking?.status !== "alternative_proposed") setShowRejectOptions(false)
  }, [booking?.status])

  // Charger l'expérience complète à partir du snapshot ou de l'experienceId
  useEffect(() => {
    if (!booking?.experienceId) return
    fetchExperiences().then(list => {
      const found = list.find(e => e.id === booking.experienceId)
      if (found) setRealExperience(found)
    })
  }, [booking])

  // Mise en scène : "requested" bascule visuellement vers "waiting_provider"
  // PROGRESS_REVEAL_DELAY_MS après booking.requestedSeenAt (figé côté
  // serveur, voir GET /api/booking/[bookingId]) pour donner une sensation de
  // progrès, même si le statut réel en base reste "requested" — le backend
  // n'a pas d'état "waiting_provider" à proprement parler, donc ce booléen ne
  // pilote que l'affichage (status ci-dessous), jamais la vraie donnée.
  // Ancré sur requestedSeenAt (instant serveur) plutôt que sur le montage de
  // ce composant : si le délai est déjà écoulé (ex. retour après être allé
  // sur /experiencia), on révèle immédiatement au lieu de relancer 6s.
  useEffect(() => {
    if (progressReveal || booking?.status !== "requested" || !booking.requestedSeenAt) return
    const remaining = PROGRESS_REVEAL_DELAY_MS - (Date.now() - new Date(booking.requestedSeenAt).getTime())
    if (remaining <= 0) {
      setProgressReveal(true)
      return
    }
    const t = setTimeout(() => setProgressReveal(true), remaining)
    return () => clearTimeout(t)
  }, [booking?.status, booking?.requestedSeenAt, progressReveal])

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

    // Concierge : ouvre WhatsApp directement, pas d'appel API — le dossier
    // de réservation n'est pas touché, c'est juste un canal d'aide humaine.
    if (action === "talk_to_vivabox") {
      window.open(
        getWhatsAppLink(`Hola, necesito ayuda con mi reserva (referencia ${bookingRef}).`),
        "_blank"
      )
      return
    }

    // "choose_new_experience" est déclenché depuis plusieurs écrans, mais
    // appelle l'API dans tous les cas (voir respond-alternative) :
    // - "alternative_proposed" (refus définitif après avoir vu l'écran
    //   "Podemos seguir buscando") : la réservation est encore active, on
    //   l'annule réellement — d'où la confirmation.
    // - "rejected" (booking déjà status "cancelled") : rien à annuler, mais
    //   on doit quand même la marquer "vue" côté API (→ "cancelled_seen")
    //   pour qu'elle arrête de réapparaître à chaque chargement de l'app
    //   (voir /api/codigo/context, dont la requête ignore "cancelled_seen").
    //   Pas de confirmation ici : il n'y a plus rien à perdre.
    if (action === "choose_new_experience" && booking?.status === "alternative_proposed") {
      if (!window.confirm("¿Elegir otra experiencia? Esta reserva se cancelará.")) return
    }

    setActionError(null)
    setActionPending(true)
    try {
      const apiAction =
        action === "accept_alternative" ? "accept" : action === "keep_searching" ? "keep_searching" : "cancel"
      const res = await fetch(`/api/booking/${bookingId}/respond-alternative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: apiAction }),
      })
      const data = await res.json()

      if (!data.success) {
        setActionError("No pudimos procesar tu respuesta. Intenta de nuevo o contáctanos.")
        return
      }

      if (action === "choose_new_experience") {
        // La réservation vient d'être marquée "cancelled_seen" côté API : ce
        // n'est plus "la" réservation en cours, donc plus rien à protéger —
        // on efface le miroir pour que ClientLayout cesse de bloquer un
        // retour arrière vers /mapa (sinon il resterait bloqué sur l'ancien
        // statut "rejected" jusqu'au prochain fetchBooking).
        localStorage.removeItem("currentBooking")
        // Navigation "dure" et non router.push : le middleware a très
        // probablement déjà redirigé /mapa vers cette même page de suivi un
        // peu plus tôt dans cette session (juste après la reconnexion, tant
        // que la réservation était encore "cancelled" et pas "cancelled_seen")
        // — le Router Cache du client a mémorisé ce résultat pour /mapa et le
        // rejouerait tel quel avec router.push, sans repasser par le
        // middleware qui verrait pourtant le nouveau statut. Même correctif
        // que app/activacion-completa/page.tsx (handleContinue).
        window.location.href = "/mapa"
      } else {
        setShowRejectOptions(false)
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
  const hideDates = status === "alternative_proposed" || status === "searching_alternative" || status === "rejected"

  const badgeMap: Record<string, string | null> = {
    requested: "Confirmando",
    waiting_provider: "Confirmando",
    searching_alternative: "Buscando otra fecha",
    alternative_proposed: "Nueva fecha propuesta",
    confirmed: "Reservado",
    rejected: "Cancelada",
    done: null,
  }

  const header = HEADER_COPY[status]
  const calendarLink = status === "confirmed" ? buildCalendarLink(booking.date, booking.time, exp.title) : ""
  // Affichage seulement : jamais l'ISO brut ("2026-08-26") dans la carte —
  // buildCalendarLink ci-dessus continue de recevoir booking.date tel quel.
  const displayDate = booking.date
    ? formatLocalDate(booking.date, { day: "numeric", month: "long" }).replace(/^./, c => c.toUpperCase())
    : booking.date

  return (
    <div style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <BrandRibbon />
      <div style={{ padding: "16px 16px 120px" }}>
        <BrandDots />
        <h1 style={{ marginTop: 0, marginBottom: 4, fontSize: 24, fontWeight: 600 }}>
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
          // La date/heure originale n'est plus affichée ici pour ces statuts :
          // pour "alternative_proposed", la nouvelle carte "Nueva fecha" juste
          // en dessous rendrait deux dates visibles en même temps ; pour
          // "searching_alternative", la date demandée est par définition déjà
          // passée (c'est ce qui déclenche cet état) — l'afficher laisserait
          // croire à une date encore valide ; pour "rejected", ce n'était
          // qu'une date demandée/intentée, jamais confirmée — l'afficher à
          // côté du badge "Cancelada" la ferait lire comme une date acquise.
          date={hideDates ? undefined : displayDate}
          format={realExperience?.format}
          time={hideDates ? undefined : booking.time}
          requestedDates={hideDates ? undefined : booking.requestedDates}
          datesHeading={status === "confirmed" || status === "done" ? "Fecha" : "Fechas propuestas"}
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

      {/* La timeline suit toujours directement la carte expérience, pour
          tous les statuts — c'est elle qui porte l'état de la réservation.
          Pour "alternative_proposed", la proposition et la décision sont
          intégrées dans son étape active via `activeContent` au lieu d'un
          bloc séparé (voir AlternativeProposalStep plus haut). */}
      <BookingTimeline
        status={status}
        category={exp.category}
        // Les contrôles de dev ne sont plus nécessaires car les statuts viennent du backend
        onNext={undefined}
        onPrev={undefined}
        activeContent={
          status === "alternative_proposed" ? (
            showRejectOptions ? (
              <RejectAlternativeStep
                onKeepSearching={() => handleAction("keep_searching")}
                onTalkToVivabox={() => handleAction("talk_to_vivabox")}
                onChooseNew={() => handleAction("choose_new_experience")}
                pending={actionPending}
                error={actionError}
              />
            ) : (
              <AlternativeProposalStep
                proposal={{ date: booking.proposedDate, moment: booking.proposedMoment, hour: booking.proposedHour }}
                onAccept={() => handleAction("accept_alternative")}
                onReject={() => setShowRejectOptions(true)}
                pending={actionPending}
                error={actionError}
              />
            )
          ) : undefined
        }
      />

      {status !== "alternative_proposed" && (
        <div style={{ marginTop: 28 }}>
          <DynamicStatusBlock
            status={status}
            onAction={handleAction}
            reviewed={reviewed}
            actionPending={actionPending}
          />
          {actionError && (
            <p style={{ marginTop: 10, fontSize: 13, color: "#B42318", textAlign: "center" }}>{actionError}</p>
          )}
        </div>
      )}

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
    </div>
  )
}

/* ---------- STYLES : carte "Nueva fecha" (alternative_proposed) ---------- */

const proposedCard: React.CSSProperties = {
  marginBottom: 18,
  padding: "20px 22px",
  borderRadius: 24,
  background: "#FFF6E9",
  border: "1px solid #F2DFB8",
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
}

const proposedLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "#8A5300",
  marginBottom: 6,
}

const proposedDate: React.CSSProperties = {
  fontSize: 21,
  fontWeight: 650,
  color: "#2E2212",
  lineHeight: 1.3,
}

const proposedWhen: React.CSSProperties = {
  marginTop: 4,
  fontSize: 14,
  color: "#8A5300",
}

const stepQuestion: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 15,
  fontWeight: 600,
  color: "#152F40",
}

// Mêmes styles que les boutons de DynamicStatusBlock (primaire plein/foncé,
// secondaire bordé/transparent) pour rester cohérent avec le reste de
// l'écran même si la décision vit maintenant dans l'étape active.
function stepPrimaryBtn(pending: boolean): React.CSSProperties {
  return {
    padding: "9px 16px",
    borderRadius: 999,
    border: "none",
    background: "#222",
    color: "white",
    fontSize: 13,
    fontWeight: 500,
    cursor: pending ? "default" : "pointer",
    opacity: pending ? 0.6 : 1,
  }
}

function stepSecondaryBtn(pending: boolean): React.CSSProperties {
  return {
    padding: "9px 16px",
    borderRadius: 999,
    border: "1px solid #D8D2C7",
    background: "transparent",
    color: "#333",
    fontSize: 13,
    fontWeight: 500,
    cursor: pending ? "default" : "pointer",
    opacity: pending ? 0.6 : 1,
  }
}

// Lien discret pour l'option ultime ("Elegir otra experiencia") : pas un
// bouton plein, pour ne pas rivaliser visuellement avec "Buscar otra fecha"
// / "Hablar con Vivabox", qui restent le chemin normal.
function stepLinkBtn(pending: boolean): React.CSSProperties {
  return {
    display: "block",
    padding: 0,
    border: "none",
    background: "none",
    color: "#888",
    fontSize: 13,
    fontWeight: 500,
    textDecoration: "underline",
    cursor: pending ? "default" : "pointer",
    opacity: pending ? 0.6 : 1,
  }
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
  background: "#152F40",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
}
