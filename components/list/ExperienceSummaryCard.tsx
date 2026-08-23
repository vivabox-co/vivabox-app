import { MapPin, Users } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"
import { formatLabel } from "@/lib/map/formatLabels"
import { formatLocalDate } from "@/lib/utils/formatLocalDate"
import { Format } from "@/lib/data/types"

type Props = {
  title: string
  subtitle?: string
  location?: string
  format?: Format
  image?: string
  date?: string
  time?: string
  // Jusqu'à 3 dates réellement demandées (voir Booking.requestedDates) —
  // repli pour afficher au moins des dates (sans heure) quand `time` ne
  // contient pas de préférence horaire structurée (ex. "Sin hora preferida").
  requestedDates?: string[] | null
  // Titre au-dessus des créneaux ("Fechas propuestas" avant confirmation,
  // "Fecha" une fois confirmée/vécue) — voir seguimiento/[bookingId]/page.tsx.
  datesHeading?: string
  category: string
  badge?: string | null
  onClick?: () => void
}

type Slot = { label: string; hour: string | null }

// `time` est construit côté API en repliant les préférences horaires par
// date dans une chaîne texte du type "Mié 26 ago.: 13:00, 14:00; Jue 27
// ago.: 09:00" (voir buildHorarioMessage dans app/reservar/fechas/page.tsx
// et le regex d'extraction dans /api/booking/[bookingId]). On la reparse ici
// en petits créneaux "26 AGO · 13:00" plutôt que de jamais l'afficher brute.
const SEGMENT_RE = /^\S+\s+(\d{1,2})\s+([^:]+):\s*(.+)$/
const MONTH_RE = /[a-zà-ÿ]+/i

function parseSlots(time?: string, requestedDates?: string[] | null): Slot[] {
  const slots: Slot[] = []

  if (time) {
    for (const segment of time.split(";").map(s => s.trim()).filter(Boolean)) {
      const match = segment.match(SEGMENT_RE)
      if (!match) continue
      const [, day, monthPart, hoursStr] = match
      const monthMatch = monthPart.match(MONTH_RE)
      const label = monthMatch ? `${day} ${monthMatch[0].slice(0, 3).toUpperCase()}` : day
      for (const hour of hoursStr.split(",").map(h => h.trim()).filter(Boolean)) {
        slots.push({ label, hour })
      }
    }
  }

  if (slots.length > 0) return slots.slice(0, 3)

  // Repli : aucune préférence horaire structurée (ex. "Sin hora preferida
  // (flexible)") — on montre au moins les vraies dates demandées, sans heure.
  if (requestedDates?.length) {
    return requestedDates.slice(0, 3).map(iso => ({
      label: formatLocalDate(iso, { day: "numeric", month: "short" }).replace(".", "").toUpperCase(),
      hour: null,
    }))
  }

  return []
}

const STATUS_DOT_COLOR: Record<string, string> = {
  Reservado: "#1F7A4D",
  Cancelada: "#B42318",
}

const STATUS_TEXT_COLOR: Record<string, string> = {
  Reservado: "#1F7A4D",
  Cancelada: "#B42318",
}

export default function ExperienceSummaryCard({
  title,
  subtitle,
  location,
  format,
  image,
  date,
  time,
  requestedDates,
  datesHeading = "Fechas propuestas",
  category,
  badge,
  onClick,
}: Props) {
  const safeImage = image || "/images/placeholder.jpg"
  const slots = parseSlots(time, requestedDates)
  const hasMeta = Boolean(location || format)

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        background: "#FFFFFF",
        borderRadius: 22,
        boxShadow: "0 6px 22px rgba(0,0,0,0.05)",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* PHOTO : occupe toute la hauteur de la card (align stretch par
          défaut du flex parent), largeur fixe et réduite pour rester
          horizontale plutôt qu'un long rectangle vertical. */}
      <div style={{ width: 104, position: "relative", flexShrink: 0 }}>
        <img
          src={safeImage}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderLeft: `5px solid ${categoryColors[category] || "#ddd"}`,
          }}
        />
      </div>

      {/* CONTENU */}
      <div style={{ padding: "13px 15px", flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.22, color: "#1a1a1a" }}>
          {title}
        </h3>

        {subtitle && (
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#6b6b6b", lineHeight: 1.3 }}>
            {subtitle}
          </p>
        )}

        {hasMeta && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 5,
              fontSize: 12,
              color: "#767676",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {location && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, overflow: "hidden", textOverflow: "ellipsis" }}>
                <MapPin size={11} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{location}</span>
              </span>
            )}
            {location && format && <span style={{ color: "#ccc" }}>·</span>}
            {format && (
              <span style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                <Users size={11} />
                {formatLabel(format)}
              </span>
            )}
          </div>
        )}

        {badge && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: STATUS_DOT_COLOR[badge] ?? "#C9971C",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: STATUS_TEXT_COLOR[badge] ?? "#555",
              }}
            >
              {badge}
            </span>
          </div>
        )}

        {slots.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                color: "#9a9a9a",
                marginBottom: 4,
              }}
            >
              {datesHeading}
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                paddingBottom: 1,
              }}
            >
              {slots.map((slot, i) => (
                <span
                  key={i}
                  style={{
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    padding: "4px 9px",
                    borderRadius: 8,
                    background: "#F3EFEA",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#333",
                  }}
                >
                  {slot.label}
                  {slot.hour && <> · {slot.hour}</>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
