"use client"

import { useState, useEffect } from "react"
import { useUI, usePageReady } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Sunrise, Sun, Sunset, Check } from "lucide-react"
import DatePickerModal from "@/components/ui/DatePickerModal"
import PhotoGallery from "@/components/ui/PhotoGallery"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"
import { categoryColors } from "@/lib/map/categoryColors"

type Moment = "morning" | "afternoon" | "night" | null

const MAX_DATES = 3

const MOMENT_LABEL: Record<"morning" | "afternoon" | "night", string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
}

const HOUR_RANGES: Record<"morning" | "afternoon" | "night", string[]> = {
  morning: ["08:00", "09:00", "10:00", "11:00"],
  afternoon: ["12:00", "13:00", "14:00", "15:00", "16:00"],
  night: ["17:00", "18:00", "19:00", "20:00"],
}

export default function FechasPage() {
  const { selectedExperience, setSelectedTime, setHideNav } = useUI()
  const router = useRouter()

  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [openCalendar, setOpenCalendar] = useState(false)
  const [momentBlock, setMomentBlock] = useState<Moment>(null)
  const [preferredHour, setPreferredHour] = useState<string | null>(null)
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

  const isFormComplete = selectedDates.length > 0 && !!momentBlock
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

  function selectMoment(value: Moment) {
    setMomentBlock(value)
    setPreferredHour(null)
  }

  async function handleSubmit() {
    // Validation
    if (!momentBlock) return
    if (selectedDates.length === 0) return

    const finalTime: string[] = [momentBlock]
    setSelectedTime(finalTime)

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
          mensaje: preferredHour
            ? `Horario: ${MOMENT_LABEL[momentBlock]} (~${preferredHour})`
            : `Horario: ${MOMENT_LABEL[momentBlock]}`
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
                <span key={d} style={i === 0 ? dateChipPreferred(categoryColor) : dateChipAlt}>
                  {formatLocalDate(d, { day: "numeric", month: "short" })}
                </span>
              ))}
            </div>
          )}

          {!datesMaxed && (
            <button onClick={() => setOpenCalendar(true)} style={inlineTextLink}>
              {selectedDates.length === 0 ? "+ Elegir fechas" : "+ Elegir otra fecha"}
            </button>
          )}
        </section>

        {/* ---------- MOMENTO DEL DÍA ---------- */}
        <section style={section}>
          <h2 style={sectionTitle}>
            <Clock size={17} style={sectionTitleIcon} />
            Momento del día
          </h2>
          <p style={sectionDescription}>Elige cuándo te gustaría hacerlo. El lugar nos confirma la hora.</p>

          <div style={chipsRow}>
            <MomentChip icon={<Sunrise size={15} />} label="Mañana" value="morning" momentBlock={momentBlock} setMomentBlock={selectMoment} color={categoryColor} />
            <MomentChip icon={<Sun size={15} />} label="Tarde" value="afternoon" momentBlock={momentBlock} setMomentBlock={selectMoment} color={categoryColor} />
            <MomentChip icon={<Sunset size={15} />} label="Noche" value="night" momentBlock={momentBlock} setMomentBlock={selectMoment} color={categoryColor} />
          </div>

          {momentBlock && (
            <div style={hourSection}>
              <span style={hourHint}>¿Tienes una hora preferida? · Opcional</span>
              <div style={chipsRow}>
                {HOUR_RANGES[momentBlock].map(h => (
                  <HourChip
                    key={h}
                    label={h}
                    active={preferredHour === h}
                    color={categoryColor}
                    onClick={() => setPreferredHour(p => (p === h ? null : h))}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

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
            setSelectedDates(payload.dates)
            setOpenCalendar(false)
          }}
        />
      )}
    </>
  )
}

/* ---------- UI ---------- */

function MomentChip({ icon, label, value, momentBlock, setMomentBlock, color }: any) {
  const active = momentBlock === value
  return (
    <button onClick={() => setMomentBlock(value)} style={momentChipStyle(active)}>
      {active && <span style={accentDot(color)} />}
      {icon}{label}
    </button>
  )
}

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

const dateChipPreferred = (color: string): React.CSSProperties => ({
  padding: "9px 15px",
  borderRadius: 999,
  background: "#152F40",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: `0 0 0 2px ${color}`,
  whiteSpace: "nowrap",
})

const dateChipAlt: React.CSSProperties = {
  padding: "9px 15px",
  borderRadius: 999,
  background: "#F7F5F2",
  color: "#666",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
}

const hourSection: React.CSSProperties = { marginTop: 14 }

const hourHint: React.CSSProperties = { fontSize: 12, color: "#8f8f8f", display: "block", marginBottom: 10 }

const accentDot = (color: string): React.CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: color,
  display: "inline-block",
  flexShrink: 0,
})

const momentChipStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: active ? "1.5px solid #152F40" : "1px solid #E5E2DB",
  background: active ? "#152F40" : "#fff",
  color: active ? "#fff" : "#444",
  fontWeight: active ? 600 : 400,
  fontSize: 14,
  display: "flex",
  gap: 6,
  alignItems: "center",
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
