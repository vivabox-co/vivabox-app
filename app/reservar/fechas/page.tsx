"use client"

import { useState, useEffect } from "react"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Sunrise, Sun, Sunset, Check } from "lucide-react"
import DatePickerModal from "@/components/ui/DatePickerModal"
import PhotoGallery from "@/components/ui/PhotoGallery"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"

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

  const isFormComplete = selectedDates.length > 0 && !!momentBlock

  // Le premier choix est la fecha preferida, les suivants des alternativas —
  // conservés explicitement pour que l'ordre de priorité soit sans ambiguïté
  // jusqu'au payload envoyé à l'équipe de coordination.
  const preferredDate = selectedDates[0] ?? null
  const alternativeDates = selectedDates.slice(1)

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

        <p style={subtitle}>
          Elige hasta 3 fechas. <strong>Nosotros coordinamos.</strong>
        </p>

        <Card
          icon={<Calendar size={20} />}
          title="Fechas posibles"
          right={selectedDates.length > 0 ? `${selectedDates.length}/${MAX_DATES}` : undefined}
        >
          <p style={cardHint}>
            Danos hasta {MAX_DATES} fechas que te funcionen. Así podemos encontrar una opción más rápido.
          </p>

          {selectedDates.length > 0 && (
            <div style={dateSummaryCol}>
              <DateRoleGroup label="Preferida" dates={[preferredDate!]} strong />
              {alternativeDates.length > 0 && (
                <DateRoleGroup label="Alternativas" dates={alternativeDates} />
              )}
            </div>
          )}

          <button onClick={() => setOpenCalendar(true)} style={dateSlotEmpty}>
            + Elegir fechas
          </button>
        </Card>

        <Card icon={<Clock size={20} />} title="Horario">
          <p style={cardHint}>Elige cuándo te gustaría hacerlo. El lugar nos confirma la hora.</p>
          <div style={chipsRow}>
            <MomentChip icon={<Sunrise size={16} />} label="Mañana" value="morning" momentBlock={momentBlock} setMomentBlock={selectMoment} />
            <MomentChip icon={<Sun size={16} />} label="Tarde" value="afternoon" momentBlock={momentBlock} setMomentBlock={selectMoment} />
            <MomentChip icon={<Sunset size={16} />} label="Noche" value="night" momentBlock={momentBlock} setMomentBlock={selectMoment} />
          </div>

          {momentBlock && (
            <div style={hourSection}>
              <span style={cardHint}>¿Tienes una hora preferida? · Opcional</span>
              <div style={chipsRow}>
                {HOUR_RANGES[momentBlock].map(h => (
                  <button
                    key={h}
                    onClick={() => setPreferredHour(p => (p === h ? null : h))}
                    style={hourChipStyle(preferredHour === h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card icon={<Users size={20} />} title="Personas">
          <div style={personasRow}>
            <div>
              <div style={personasMain}>
                Para {totalPeople} {totalPeople === 1 ? "persona" : "personas"}
              </div>
              <div style={personasSub}>Incluido en tu regalo</div>
            </div>
            <Check size={18} color="#1E7A3B" />
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
              <div style={personasNote}>
                Sujeto a validación del lugar y a un costo adicional por persona.
                {exp.extraPeopleOption?.note ? ` ${exp.extraPeopleOption.note}` : ""}
              </div>
            </>
          )}
        </Card>

        <button onClick={handleSubmit} disabled={loading || !isFormComplete} style={{
          ...cta,
          opacity: loading ? 0.6 : isFormComplete ? 1 : 0.4,
          cursor: loading || !isFormComplete ? "not-allowed" : "pointer"
        }}>
          {loading ? "Creando reserva..." : "Continuar"}
        </button>
      </div>

      {openCalendar && (
        <DatePickerModal
          initialDates={selectedDates}
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

function Card({ icon, title, right, children }: any) {
  return (
    <div style={card}>
      <div style={cardHeader}>
        <div style={cardHeaderLeft}>{icon}<span>{title}</span></div>
        {right && <span style={cardHeaderRight}>{right}</span>}
      </div>
      {children}
    </div>
  )
}

function MomentChip({ icon, label, value, momentBlock, setMomentBlock }: any) {
  const active = momentBlock === value
  return (
    <button onClick={() => setMomentBlock(value)} style={{ ...chipStyle(active), display: "flex", gap: 6, alignItems: "center" }}>
      {icon}{label}
    </button>
  )
}

function DateRoleGroup({ label, dates, strong }: { label: string; dates: string[]; strong?: boolean }) {
  return (
    <div>
      <div style={dateRoleLabel}>{label}</div>
      <div style={chipsRow}>
        {dates.map(d => (
          <span key={d} style={strong ? dateRoleChipStrong : dateRoleChip}>
            {formatLocalDate(d, { day: "numeric", month: "short" })}
          </span>
        ))}
      </div>
    </div>
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
  background: "#111",
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
}

const subtitle: React.CSSProperties = { padding: 18, color: "#666" }

const card: React.CSSProperties = {
  margin: "0 18px 18px 18px",
  padding: 18,
  borderRadius: 18,
  background: "#F7F5F2",
}

const cardHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }
const cardHeaderLeft: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }
const cardHeaderRight: React.CSSProperties = { fontSize: 12, color: "#888" }

const cardHint: React.CSSProperties = { fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.4 }

const chipsRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" }

const hourSection: React.CSSProperties = { marginTop: 14 }

const hourChipStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: active ? "2px solid #111" : "1px solid #ddd",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#333",
  fontSize: 13,
})

const dateSummaryCol: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }

const dateRoleLabel: React.CSSProperties = { fontSize: 11, color: "#999", marginBottom: 6 }

const dateRoleChip: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#fff",
  border: "1px solid #E5E2DB",
  color: "#111",
  fontSize: 13,
  fontWeight: 500,
}

const dateRoleChipStrong: React.CSSProperties = {
  ...dateRoleChip,
  background: "#111",
  border: "1px solid #111",
  color: "#fff",
  fontWeight: 600,
}

const dateSlotEmpty: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "12px 16px",
  borderRadius: 14,
  background: "#fff",
  border: "1px dashed #bbb",
  color: "#666",
  fontSize: 13,
  cursor: "pointer",
  width: "100%",
}

const personasRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#fff",
  borderRadius: 14,
  padding: "12px 14px",
}

const personasMain: React.CSSProperties = { fontSize: 15, fontWeight: 600 }
const personasSub: React.CSSProperties = { fontSize: 12, color: "#888", marginTop: 2 }

const extraRow: React.CSSProperties = { marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }

const extraBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "1px solid #ddd",
  background: "#fff",
  fontSize: 18,
  fontWeight: 600,
  cursor: "pointer",
}

const extraCount: React.CSSProperties = { fontSize: 13, fontWeight: 500, minWidth: 130, textAlign: "center" }

const personasNote: React.CSSProperties = { marginTop: 10, fontSize: 11, color: "#999", textAlign: "center", minHeight: 14 }

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: active ? "2px solid #111" : "1px solid #ddd",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#333",
})

const cta: React.CSSProperties = {
  margin: "24px 18px 0 18px",
  width: "calc(100% - 36px)",
  padding: 16,
  borderRadius: 14,
  background: "#111",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  border: "none",
}
