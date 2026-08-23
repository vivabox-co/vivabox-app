"use client"

import { useState, useEffect } from "react"
import { useUI, usePageReady } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Sunrise, Sun, Sunset, Check } from "lucide-react"
import DatePickerModal from "@/components/ui/DatePickerModal"
import PhotoGallery from "@/components/ui/PhotoGallery"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"
import { categoryColors } from "@/lib/map/categoryColors"
import { MOMENT_LABEL } from "@/lib/utils/moment"

const MAX_DATES = 3

const PERIODS = ["morning", "afternoon", "night"] as const
type Period = (typeof PERIODS)[number]

const HOUR_RANGES: Record<Period, string[]> = {
  morning: ["08:00", "09:00", "10:00", "11:00"],
  afternoon: ["12:00", "13:00", "14:00", "15:00", "16:00"],
  night: ["17:00", "18:00", "19:00", "20:00"],
}

const PERIOD_ICON: Record<Period, React.ReactNode> = {
  morning: <Sunrise size={13} />,
  afternoon: <Sun size={13} />,
  night: <Sunset size={13} />,
}

// Pas de constante ES partagée pour les abréviations de jour dans le projet
// (DatePickerModal.tsx a le même souci et hardcode aussi localement) — Intl
// donne des résultats de casse/ponctuation qui varient selon l'environnement
// ICU, donc on fixe la liste ici plutôt que de dépendre de toLocaleDateString.
const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

function formatDateChip(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  const dateObj = new Date(y, m - 1, d)
  const weekday = WEEKDAY_SHORT[dateObj.getDay()]
  const monthShort = formatLocalDate(iso, { month: "short" })
  // L'année n'est affichée que si elle diffère de l'année en cours, pour ne
  // pas alourdir l'affichage sauf ambiguïté réelle (ex: fechas à cheval sur
  // un changement d'année).
  const yearSuffix = y !== new Date().getFullYear() ? ` ${y}` : ""
  return `${weekday} ${d} ${monthShort}${yearSuffix}`
}

// Le schéma bookings n'a pas de colonne dédiée aux préférences horaires par
// date (voir app/api/booking/route.ts) — replié dans le même champ `message`
// texte libre que l'ancien flow "Horario: <moment> (~HH:MM)" pour ne pas
// toucher au schéma partagé avec le site vitrine. On garde le préfixe
// "Horario:" (singulier) pour rester capturé par la regex d'extraction côté
// GET /api/booking/[bookingId] (`/Horario:\s*([^·]+)/`), et on évite tout "·"
// dans le contenu pour ne pas être tronqué par cette regex.
function buildHorarioMessage(dates: string[], preferences: Record<string, string[]>): string {
  const segments = dates
    .filter(d => (preferences[d]?.length ?? 0) > 0)
    .map(d => `${formatDateChip(d)}: ${preferences[d].join(", ")}`)

  if (segments.length === 0) return "Horario: Sin hora preferida (flexible)"
  return `Horario: ${segments.join("; ")}`
}

export default function FechasPage() {
  const { selectedExperience, setHideNav } = useUI()
  const router = useRouter()

  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [openCalendar, setOpenCalendar] = useState(false)
  // Préférences horaires par date ("2026-08-26": ["08:00", "09:00"]) — une
  // seule date est "active" à la fois côté UI pour ne pas empiler les 3
  // fechas verticalement, mais les sélections des autres dates sont
  // conservées dans cet objet en arrière-plan.
  const [datePreferences, setDatePreferences] = useState<Record<string, string[]>>({})
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [extraPeople, setExtraPeople] = useState(0)
  const [loading, setLoading] = useState(false) // 👈 pour l'appel API

  useEffect(() => {
    setHideNav(true)
    return () => setHideNav(false)
  }, [])

  // selectedExperience vient déjà de UIContext (aucun fetch au montage) :
  // la page est prête dès qu'elle est montée. Referme le loader plein écran
  // déclenché par beginRouteTransition() au clic sur "Elegir esta
  // experiencia" (voir app/mapa/page.tsx et RouteLoaderOverlay).
  usePageReady(true)

  // selectedExperience ne vit qu'en mémoire (jamais persisté) : un refresh, un
  // lien partagé ou un retour navigateur sur cette route l'efface. Avant, ça
  // laissait un écran blanc sans nav et sans issue (return null).
  useEffect(() => {
    if (!selectedExperience) {
      router.replace("/mapa")
    }
  }, [selectedExperience, router])

  if (!selectedExperience) {
    return (
      <div style={emptyStateWrap}>
        <p style={emptyStateText}>No hay ninguna experiencia seleccionada.</p>
        <button onClick={() => router.replace("/mapa")} style={emptyStateBtn}>
          Volver al mapa
        </button>
      </div>
    )
  }
  const exp = selectedExperience
  const categoryColor = categoryColors[exp.category] || "#111"

  // L'horario reste une préférence optionnelle (voir buildHorarioMessage) —
  // seule la présence d'au moins une fecha bloque le CTA.
  const isFormComplete = selectedDates.length > 0
  const datesMaxed = selectedDates.length >= MAX_DATES

  // Le premier choix est la fecha preferida (les suivants sont les
  // alternativas, implicites dans l'ordre de selectedDates) — conservé
  // explicitement pour que la priorité soit sans ambiguïté jusqu'au payload
  // envoyé à l'équipe de coordination.
  const preferredDate = selectedDates[0] ?? null

  // La cantidad de base viene del producto (format), pas d'un choix libre —
  // seul le nombre de personnes EN PLUS (si l'expérience le permet) est
  // ajustable, sans plafond : chaque personne extra passe par validation du
  // prestador et implique un coût additionnel (géré hors app).
  const baseCapacity = exp.format === "duo" ? 2 : 1
  const extraAllowed = !!exp.extraPeopleOption?.allowed
  const totalPeople = baseCapacity + extraPeople

  // TEMP: exp.gallery n'est pas encore rempli côté données (comme dans
  // DetailScreen.tsx), donc on complète avec 2 visuels de démo pour ne pas
  // avoir une galerie à une seule photo. À retirer une fois le catalogue
  // rempli avec de vraies photos additionnelles.
  const photos = [
    exp.image,
    ...(exp.gallery || []),
    "/image/image_activado1.jpg",
    "/image/image_welcome.webp",
  ].filter((src, i, arr) => !!src && arr.indexOf(src) === i)

  function toggleHour(date: string, hour: string) {
    setDatePreferences(prev => {
      const current = prev[date] ?? []
      const nextForDate = current.includes(hour)
        ? current.filter(h => h !== hour)
        : [...current, hour]
      return { ...prev, [date]: nextForDate }
    })
  }

  async function handleSubmit() {
    // Validation
    if (selectedDates.length === 0) return

    setLoading(true)

    try {
      // La session vit dans le cookie vb_session, envoyé automatiquement —
      // le middleware a déjà protégé cette route en amont.
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experienciaId: exp.id,
          fechaDeseada: preferredDate, // date principale (preferida), utilisée pour la confirmation/complétion
          fechasDeseadas: selectedDates, // preferida + alternativas, dans l'ordre de priorité
          cantidadPersonas: totalPeople,
          mensaje: buildHorarioMessage(selectedDates, datePreferences)
        })
      })

      const data = await response.json()

      if (data.success && data.bookingId) {
        router.push(`/reservar/fechas/confirmacion?bookingId=${data.bookingId}`)
      } else {
        console.error("Erreur création booking:", data.error)
        alert("No se pudo crear la reserva. Por favor, intenta de nuevo.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Network error:", error)
      alert("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <>
      <div style={pageWrap}>

        {/* 🔥 HERO IMMERSION — galería scrollable, comme dans DetailScreen */}
        <div style={heroWrapper}>
          <PhotoGallery
            photos={photos.length > 0 ? photos : ["/images/placeholder.jpg"]}
            alt={exp.title}
            dotsBottom={66}
          >
            <div style={heroGradient} />
            <div style={heroTitle}>{exp.title}</div>
          </PhotoGallery>
        </div>

        <p style={intro}>
          Elige hasta 3 fechas. <strong style={introStrong}>Nosotros coordinamos.</strong>
        </p>

        {/* ---------- FECHAS ---------- */}
        <section
          style={{ ...sectionPrimary, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          onClick={() => setOpenCalendar(true)}
        >
          <div style={sectionHeaderRow}>
            <h2 style={sectionTitle}>
              <Calendar size={17} style={sectionTitleIcon} />
              Fechas posibles
            </h2>
            <div style={sectionHeaderRight}>
              <span style={{ ...counterBadge, color: selectedDates.length > 0 ? categoryColor : "#999" }}>
                {selectedDates.length}/{MAX_DATES}
              </span>
              {datesMaxed && (
                <button onClick={() => setOpenCalendar(true)} style={inlineTextLink}>
                  Editar fechas →
                </button>
              )}
            </div>
          </div>

          <p style={sectionDescription}>
            Danos hasta {MAX_DATES} fechas que te funcionen. Así podemos encontrar una opción más rápido.
          </p>

          {selectedDates.length > 0 && (
            <div style={dateChipsRow}>
              {selectedDates.map((d, i) => (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveDate(d)
                  }}
                  style={dateChipStyle(d === activeDate, i === 0, categoryColor)}
                >
                  {formatDateChip(d)}
                </button>
              ))}
            </div>
          )}

          {!datesMaxed && (
            <button onClick={() => setOpenCalendar(true)} style={inlineTextLink}>
              {selectedDates.length === 0 ? "+ Elegir fechas" : "+ Elegir otra fecha"}
            </button>
          )}
        </section>

        {/* ---------- HORARIOS ---------- */}
        {selectedDates.length > 0 && activeDate && (
          <section style={section}>
            <h2 style={sectionTitle}>
              <Clock size={17} style={sectionTitleIcon} />
              Horarios que te funcionan
            </h2>
            <p style={sectionDescription}>Puedes elegir varios horarios para cada fecha.</p>

            <div style={activeDateLabelRow}>
              <span style={activeDateLabel}>{formatDateChip(activeDate)}</span>
              {(datePreferences[activeDate]?.length ?? 0) > 0 && (
                <span style={activeDateCount}>
                  {datePreferences[activeDate].length} seleccionado{datePreferences[activeDate].length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {PERIODS.map(period => (
              <div key={period} style={hourGroupBlock}>
                <span style={hourGroupLabel}>
                  {PERIOD_ICON[period]}
                  {MOMENT_LABEL[period]}
                </span>
                <div style={chipsRow}>
                  {HOUR_RANGES[period].map(h => (
                    <HourChip
                      key={h}
                      label={h}
                      active={(datePreferences[activeDate] ?? []).includes(h)}
                      color={categoryColor}
                      onClick={() => toggleHour(activeDate, h)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ---------- PERSONAS ---------- */}
        <section style={section}>
          <h2 style={sectionTitle}>
            <Users size={17} style={sectionTitleIcon} />
            Personas
          </h2>

          <div style={personasMainRow}>
            <span style={personasCount}>
              {totalPeople} {totalPeople === 1 ? "persona" : "personas"}
            </span>
            <span style={personasIncluded}>
              <Check size={13} color="#1E7A3B" />
              Incluido en tu regalo
            </span>
          </div>

          {extraAllowed && (
            <>
              <div style={extraRow}>
                <button
                  onClick={() => setExtraPeople(p => Math.max(0, p - 1))}
                  disabled={extraPeople === 0}
                  style={{ ...extraBtn, opacity: extraPeople === 0 ? 0.3 : 1 }}
                >
                  −
                </button>
                <span style={extraCount}>
                  {extraPeople === 0 ? "Sin personas extra" : `${extraPeople} persona${extraPeople > 1 ? "s" : ""} extra`}
                </span>
                <button onClick={() => setExtraPeople(p => p + 1)} style={extraBtn}>
                  +
                </button>
              </div>
              <p style={personasNote}>
                Las personas adicionales están sujetas a disponibilidad y costo adicional.
                {exp.extraPeopleOption?.note ? ` ${exp.extraPeopleOption.note}` : ""}
              </p>
            </>
          )}
        </section>

        <button
          onClick={handleSubmit}
          disabled={loading || !isFormComplete}
          className="vb-btn-primary"
          style={{
            ...cta,
            opacity: loading ? 0.6 : isFormComplete ? 1 : 0.4,
            cursor: loading || !isFormComplete ? "not-allowed" : "pointer"
          }}
        >
          {loading ? (
            <>
              <span className="vb-spinner-light" />
              Creando reserva...
            </>
          ) : (
            "Continuar →"
          )}
        </button>
      </div>

      {openCalendar && (
        <DatePickerModal
          initialDates={selectedDates}
          categoryColor={categoryColor}
          onClose={() => setOpenCalendar(false)}
          onSelect={(payload) => {
            const newDates = payload.dates
            setSelectedDates(newDates)
            // On garde les préférences des dates encore présentes ; celles
            // retirées du calendrier n'ont plus de raison d'exister.
            setDatePreferences(prev => {
              const next: Record<string, string[]> = {}
              for (const d of newDates) if (prev[d]) next[d] = prev[d]
              return next
            })
            setActiveDate(prev => (prev && newDates.includes(prev) ? prev : newDates[0] ?? null))
            setOpenCalendar(false)
          }}
        />
      )}
    </>
  )
}

/* ---------- UI ---------- */

function HourChip({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={hourChipStyle(active)}>
      {active && <span style={accentDot(color)} />}
      {label}
    </button>
  )
}

/* ---------- STYLES ---------- */

const pageWrap: React.CSSProperties = { paddingBottom: 120 }

const emptyStateWrap: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 18,
  padding: 24,
  textAlign: "center",
}

const emptyStateText: React.CSSProperties = { color: "#666", fontSize: 15 }

const emptyStateBtn: React.CSSProperties = {
  padding: "14px 24px",
  borderRadius: 14,
  background: "#152F40",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
}

const heroWrapper: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "40vh",
  overflow: "hidden",
}

const heroGradient: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "55%",
  background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
  pointerEvents: "none",
}

const heroTitle: React.CSSProperties = {
  position: "absolute",
  bottom: 18,
  left: 20,
  right: 20,
  color: "white",
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.2,
  pointerEvents: "none",
}

const intro: React.CSSProperties = {
  padding: "22px 20px 8px",
  fontSize: 19,
  lineHeight: 1.4,
  color: "#666",
  letterSpacing: -0.1,
}

const introStrong: React.CSSProperties = { color: "#111", fontWeight: 700 }

const section: React.CSSProperties = {
  margin: "16px 20px 0 20px",
  padding: 20,
  borderRadius: 20,
  border: "1px solid #ECEAE5",
  background: "#fff",
}

const sectionPrimary: React.CSSProperties = {
  ...section,
  marginTop: 20,
  border: "1px solid #D8D5CE",
}

const sectionHeaderRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 19,
  fontWeight: 700,
  color: "#152F40",
  letterSpacing: -0.2,
  margin: 0,
}

const sectionTitleIcon: React.CSSProperties = { color: "#999", flexShrink: 0 }

const sectionHeaderRight: React.CSSProperties = { display: "flex", alignItems: "baseline", gap: 12, flexShrink: 0 }

const counterBadge: React.CSSProperties = { fontSize: 13, fontWeight: 600 }

const sectionDescription: React.CSSProperties = { fontSize: 13, color: "#8f8f8f", lineHeight: 1.45, marginTop: 6, marginBottom: 12 }

const inlineTextLink: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "6px 0",
  color: "#111",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

const chipsRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" }

const dateChipsRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }

// Le chip navy/blanc marque la date "active" (celle dont les horarios sont
// affichés en dessous) ; l'anneau de couleur catégorie marque en plus la
// fecha preferida (index 0 de selectedDates), indépendamment de l'activité —
// les deux concepts sont distincts mais partagent le même langage visuel que
// le reste de l'app (voir momentChipStyle historique / DatePickerModal).
const dateChipStyle = (isActive: boolean, isPreferred: boolean, color: string): React.CSSProperties => ({
  padding: "9px 15px",
  borderRadius: 999,
  border: "none",
  background: isActive ? "#152F40" : "#F7F5F2",
  color: isActive ? "#fff" : "#666",
  fontSize: 13,
  fontWeight: isActive ? 600 : 500,
  whiteSpace: "nowrap",
  cursor: "pointer",
  boxShadow: isPreferred ? `0 0 0 2px ${color}` : "none",
})

const activeDateLabelRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 4,
}

const activeDateLabel: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "#152F40" }

const activeDateCount: React.CSSProperties = { fontSize: 12, color: "#8f8f8f", fontWeight: 500 }

const hourGroupBlock: React.CSSProperties = { marginTop: 14 }

const hourGroupLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: "#8f8f8f",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.3,
}

const accentDot = (color: string): React.CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: color,
  display: "inline-block",
  flexShrink: 0,
})

const hourChipStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: active ? "1.5px solid #152F40" : "1px solid #E5E2DB",
  background: active ? "#152F40" : "#fff",
  color: active ? "#fff" : "#555",
  fontWeight: active ? 600 : 400,
  fontSize: 13,
  display: "flex",
  gap: 6,
  alignItems: "center",
})

const personasMainRow: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 6,
}

const personasCount: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: "#111" }

const personasIncluded: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  color: "#666",
}

const extraRow: React.CSSProperties = { marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }

const extraBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "1px solid #E5E2DB",
  background: "#fff",
  fontSize: 17,
  fontWeight: 600,
  cursor: "pointer",
}

const extraCount: React.CSSProperties = { fontSize: 13, fontWeight: 500, minWidth: 130, textAlign: "center", color: "#444" }

const personasNote: React.CSSProperties = { marginTop: 10, fontSize: 11, color: "#999", textAlign: "center", lineHeight: 1.4 }

const cta: React.CSSProperties = {
  margin: "28px 20px 0 20px",
  width: "calc(100% - 40px)",
  padding: 16,
  borderRadius: 14,
  background: "#152F40",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
}
