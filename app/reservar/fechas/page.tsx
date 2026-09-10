"use client"

import { useEffect, useState } from "react"
import { useUI, usePageReady } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Check, ArrowRight, ChevronDown, CalendarPlus } from "lucide-react"
import DatePickerModal from "@/components/ui/DatePickerModal"
import PhotoGallery from "@/components/ui/PhotoGallery"
import BrandRibbon from "@/components/ui/BrandRibbon"
import BrandDots from "@/components/ui/BrandDots"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"
import { categoryColors } from "@/lib/map/categoryColors"

const MAX_DATES = 3

// Pas encore de source de disponibilité par prestador/fecha (voir
// lib/data/types.ts::Experience — aucun champ horario) : ces créneaux restent
// génériques pour tout le catalogue, comme avant le retrait du picker
// d'horaire (voir historique de ce fichier). Le jour où une vraie dispo par
// prestador existe, c'est ce tableau qu'il faudra remplacer par une source
// dynamique.
const ALL_HOURS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00",
]

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

export default function FechasPage() {
  const {
    selectedExperience,
    setHideNav,
    reservationDates: selectedDates,
    setReservationDates: setSelectedDates,
    reservationExtraPeople: extraPeople,
    setReservationExtraPeople: setExtraPeople,
    reservationHours: hours,
    setReservationHours: setHours,
    beginRouteTransition,
  } = useUI()
  const router = useRouter()

  // Fecha dont le menu d'heure est ouvert (null = tous fermés) — un seul menu
  // à la fois, comme l'ancien openHourSheet retiré en 19908cb.
  const [openHourMenu, setOpenHourMenu] = useState<string | null>(null)

  // Calendrier remonté ici (plutôt que local à FechasCard) pour que la popup
  // "1 seule fecha" ci-dessous puisse le rouvrir directement depuis son
  // bouton "Elegir más fechas".
  const [openCalendar, setOpenCalendar] = useState(false)

  // Avertissement affiché au clic sur "Continuar" quand une seule fecha est
  // choisie — le max est 3 mais rien n'empêchait avant de foncer avec une
  // seule, ce qui réduit les chances que le prestador puisse confirmer.
  const [showOneDateWarning, setShowOneDateWarning] = useState(false)

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

  const isFormComplete = selectedDates.length > 0
  const datesMaxed = selectedDates.length >= MAX_DATES

  // La cantidad de base viene del producto (format), pas d'un choix libre —
  // seul le nombre de personnes EN PLUS (si l'expérience le permet) est
  // ajustable, sans plafond : chaque personne extra passe par validation du
  // prestador et implique un coût additionnel (géré hors app).
  const baseCapacity = exp.format === "duo" || exp.format === "solo o duo" ? 2 : 1
  const extraAllowed = !!exp.extraPeopleOption?.allowed
  const totalPeople = baseCapacity + extraPeople

  const photos = [exp.image, ...(exp.gallery || [])].filter(
    (src, i, arr) => !!src && arr.indexOf(src) === i
  )

  function handleContinue() {
    if (!isFormComplete) return
    if (selectedDates.length === 1) {
      setShowOneDateWarning(true)
      return
    }
    beginRouteTransition()
    router.push("/reservar/fechas/confirmar")
  }

  function handleContinueAnyway() {
    setShowOneDateWarning(false)
    beginRouteTransition()
    router.push("/reservar/fechas/confirmar")
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

        <BrandRibbon />

        <h1 style={pageTitle}>¿Cuándo te gustaría ir?</h1>

        <p style={{ ...intro, paddingBottom: 2 }}>
          Elige hasta 3 fechas. <strong style={introStrong}>Nosotros coordinamos.</strong>
        </p>

        <BrandDots style={{ justifyContent: "center", margin: "18px 0 0" }} />

        {/* ---------- FECHAS ---------- */}
        <FechasCard
          categoryColor={categoryColor}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          datesMaxed={datesMaxed}
          openCalendar={openCalendar}
          setOpenCalendar={setOpenCalendar}
        />

        {/* ---------- HORA PREFERIDA (por fecha, opcional) ---------- */}
        {selectedDates.length > 0 && (
          <section style={section}>
            <h2 style={sectionTitle}>
              <Clock size={17} style={sectionTitleIcon} />
              Hora preferida
            </h2>
            <p style={sectionDescription}>
              Opcional: dinos a qué hora te viene mejor cada fecha. Confirmamos disponibilidad con el lugar.
            </p>

            {openHourMenu && (
              <div style={hourMenuOverlay} onClick={() => setOpenHourMenu(null)} />
            )}

            {selectedDates.map((d) => (
              <div key={d} style={hourDateRow}>
                <span style={hourDateLabel}>{formatDateChip(d)}</span>
                <div style={{ ...hourFieldWrap, ...(openHourMenu === d ? hourFieldWrapOpen : {}) }}>
                  <button
                    type="button"
                    onClick={() => setOpenHourMenu(openHourMenu === d ? null : d)}
                    style={hourTrigger}
                  >
                    {hours[d] || "Sin preferencia"}
                    <ChevronDown size={14} />
                  </button>

                  {openHourMenu === d && (
                    <div style={hourMenuAnchor}>
                      <div className="vb-hide-scrollbar" style={hourMenu}>
                        <div
                          style={{ ...hourMenuItem, ...(!hours[d] ? hourMenuItemActive : {}) }}
                          onClick={() => { setHours({ ...hours, [d]: "" }); setOpenHourMenu(null) }}
                        >
                          Sin preferencia
                        </div>
                        {ALL_HOURS.map((h) => (
                          <div
                            key={h}
                            style={{ ...hourMenuItem, ...(hours[d] === h ? hourMenuItemActive : {}) }}
                            onClick={() => { setHours({ ...hours, [d]: h }); setOpenHourMenu(null) }}
                          >
                            {h}
                          </div>
                        ))}
                      </div>
                      <div style={hourMenuFade} />
                    </div>
                  )}
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
                  onClick={() => setExtraPeople(Math.max(0, extraPeople - 1))}
                  disabled={extraPeople === 0}
                  style={{ ...extraBtn, opacity: extraPeople === 0 ? 0.3 : 1 }}
                >
                  −
                </button>
                <span style={extraCount}>
                  {extraPeople === 0 ? "Sin personas extra" : `${extraPeople} persona${extraPeople > 1 ? "s" : ""} extra`}
                </span>
                <button onClick={() => setExtraPeople(extraPeople + 1)} style={extraBtn}>
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
          onClick={handleContinue}
          disabled={!isFormComplete}
          className="vb-btn-primary"
          style={{
            ...cta,
            opacity: isFormComplete ? 1 : 0.4,
            cursor: isFormComplete ? "pointer" : "not-allowed"
          }}
        >
          Continuar
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {showOneDateWarning && (
        <OneDateWarningModal
          categoryColor={categoryColor}
          onAddMore={() => { setShowOneDateWarning(false); setOpenCalendar(true) }}
          onContinueAnyway={handleContinueAnyway}
          onClose={() => setShowOneDateWarning(false)}
        />
      )}
    </>
  )
}

/* ---------- POPUP "1 SOLA FECHA" ---------- */

function OneDateWarningModal({
  categoryColor,
  onAddMore,
  onContinueAnyway,
  onClose,
}: {
  categoryColor: string
  onAddMore: () => void
  onContinueAnyway: () => void
  onClose: () => void
}) {
  return (
    <div style={warnOverlay} onClick={onClose}>
      <div style={warnModal} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...warnIconWrap, background: `${categoryColor}1A`, color: categoryColor }}>
          <CalendarPlus size={22} />
        </div>

        <h3 style={warnTitle}>¿Solo una fecha?</h3>
        <p style={warnBody}>
          Con una sola opción, si el prestador no tiene disponibilidad ese día tendremos que
          volver a contactarte. Elegir 2 o 3 fechas nos ayuda a confirmar tu reserva más rápido.
        </p>

        <button onClick={onAddMore} className="vb-btn-primary" style={warnPrimaryBtn}>
          Elegir más fechas
        </button>
        <button onClick={onContinueAnyway} style={warnSecondaryBtn}>
          Continuar con 1 fecha
        </button>
      </div>
    </div>
  )
}

/* ---------- FECHAS CARD (+ modal) ---------- */

function FechasCard({
  categoryColor,
  selectedDates,
  setSelectedDates,
  datesMaxed,
  openCalendar,
  setOpenCalendar,
}: {
  categoryColor: string
  selectedDates: string[]
  setSelectedDates: (dates: string[]) => void
  datesMaxed: boolean
  openCalendar: boolean
  setOpenCalendar: (open: boolean) => void
}) {
  return (
    <>
      <section
        style={{ ...sectionPrimary, marginTop: 20, cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
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
              <button onClick={(e) => { e.stopPropagation(); setOpenCalendar(true) }} style={inlineTextLink}>
                Editar fechas →
              </button>
            )}
          </div>
        </div>

        <p style={sectionDescription}>
          Dinos hasta {MAX_DATES} fechas que te funcionen.
        </p>

        {selectedDates.length > 0 && (
          <div style={dateChipsRow}>
            {selectedDates.map((d, i) => (
              <span key={d} style={dateChipStyle(i === 0, categoryColor)}>
                {formatDateChip(d)}
              </span>
            ))}
          </div>
        )}

        {!datesMaxed && (
          <button onClick={(e) => { e.stopPropagation(); setOpenCalendar(true) }} style={inlineTextLink}>
            {selectedDates.length === 0 ? "+ Elegir fechas" : "+ Elegir otra fecha"}
          </button>
        )}
      </section>

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
  aspectRatio: "16 / 9",
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

const pageTitle: React.CSSProperties = {
  margin: "20px 20px 0",
  fontSize: 24,
  fontWeight: 700,
  color: "#152F40",
  letterSpacing: -0.3,
  lineHeight: 1.25,
}

const intro: React.CSSProperties = {
  padding: "10px 20px 8px",
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

const dateChipsRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }

// Ces chips ne sont plus des tabs cliquables : uniquement un rappel visuel
// des fechas choisies. La fecha preferida (index 0) garde son anneau de
// couleur catégorie, seul signal encore porté par ce composant.
const dateChipStyle = (isPreferred: boolean, color: string): React.CSSProperties => ({
  padding: "9px 15px",
  borderRadius: 999,
  background: isPreferred ? "#152F40" : "#F7F5F2",
  color: isPreferred ? "#fff" : "#666",
  fontSize: 13,
  fontWeight: isPreferred ? 600 : 500,
  whiteSpace: "nowrap",
  boxShadow: isPreferred ? `0 0 0 2px ${color}` : "none",
})

const hourDateRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
}

const hourDateLabel: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#444" }

// Encapsule le bouton + son menu : ancre le popover (position absolute) et
// reste au-dessus de hourMenuOverlay (voir ci-dessous) pour que le clic sur
// le bouton d'une autre fecha bascule directement le menu sans passer par un
// premier clic qui ne ferait que fermer l'overlay.
const hourFieldWrap: React.CSSProperties = { position: "relative", zIndex: 16 }

// Quand son menu est ouvert, une fecha passe devant les fechas suivantes
// (même zIndex 16 sinon) : sur 3 fechas rapprochées, le popover d'une des
// premières déborderait visuellement sous la rangée du dessous sans ça.
const hourFieldWrapOpen: React.CSSProperties = { zIndex: 20 }

const hourTrigger: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 12px",
  borderRadius: 12,
  border: "1px solid #E5E2DB",
  background: "#fff",
  color: "#333",
  fontSize: 13.5,
  fontWeight: 500,
  cursor: "pointer",
}

// Clic n'importe où en dehors du menu pour le refermer — transparent, sous
// hourFieldWrap (zIndex 16) mais au-dessus du reste de la page.
const hourMenuOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 15,
}

const hourMenuAnchor: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 6px)",
  width: 150,
}

// Scrollbar masquée (voir .vb-hide-scrollbar dans globals.css, même pattern
// que .hero-gallery-track) — le fondu ci-dessous signale qu'il reste des
// heures à faire défiler plutôt que de laisser un bord coupé net.
const hourMenu: React.CSSProperties = {
  maxHeight: 180,
  overflowY: "auto",
  background: "#fff",
  border: "1px solid #D8D5CE",
  borderRadius: 12,
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
}

const hourMenuItem: React.CSSProperties = {
  padding: "9px 12px",
  fontSize: 13,
  fontWeight: 500,
  color: "#444",
  cursor: "pointer",
}

const hourMenuItemActive: React.CSSProperties = {
  background: "#F7F5F2",
  color: "#152F40",
  fontWeight: 600,
}

const hourMenuFade: React.CSSProperties = {
  position: "absolute",
  left: 1,
  right: 1,
  bottom: 1,
  height: 22,
  background: "linear-gradient(to bottom, rgba(255,255,255,0), #fff)",
  borderRadius: "0 0 12px 12px",
  pointerEvents: "none",
}

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

const warnOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 2000,
}

const warnModal: React.CSSProperties = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: "28px 28px 0 0",
  padding: "28px 24px 32px",
  textAlign: "center",
}

const warnIconWrap: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
}

const warnTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 19,
  fontWeight: 700,
  color: "#152F40",
  letterSpacing: -0.2,
}

const warnBody: React.CSSProperties = {
  margin: "10px 0 22px",
  fontSize: 14,
  color: "#666",
  lineHeight: 1.5,
}

const warnPrimaryBtn: React.CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 14,
  background: "#152F40",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
}

const warnSecondaryBtn: React.CSSProperties = {
  width: "100%",
  padding: 14,
  marginTop: 10,
  borderRadius: 14,
  background: "transparent",
  color: "#8f8f8f",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
}

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
  gap: 8,
}
