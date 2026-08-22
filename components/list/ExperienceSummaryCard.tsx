import { MapPin, Users } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"
import { formatLabel } from "@/lib/map/formatLabels"
import { Format } from "@/lib/data/types"

type Props = {
  title: string
  subtitle?: string
  location?: string
  format?: Format
  image?: string
  date?: string
  time?: string
  category: string
  badge?: string | null
  onClick?: () => void
}

export default function ExperienceSummaryCard({
  title,
  subtitle,
  location,
  format,
  image,
  date,
  time,
  category,
  badge,
  onClick,
}: Props) {
  const safeImage = image || "/images/placeholder.jpg"
  const hasDate = Boolean(date && time)

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        background: "#FFFFFF",
        borderRadius: 28,
        boxShadow: "0 6px 22px rgba(0,0,0,0.05)",
        overflow: "hidden",
        marginBottom: 26,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* 🎯 IMAGE VERTICALE IMMERSIVE */}
      <div
        style={{
          width: 120,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <img
          src={safeImage}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderLeft: `6px solid ${categoryColors[category] || "#ddd"}`,
          }}
        />
      </div>

      {/* 🧠 CONTENU */}
      <div style={{ padding: 22, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 21, fontWeight: 600, lineHeight: 1.25 }}>
          {title}
        </h3>

        {subtitle && (
          <p style={{ margin: "6px 0 12px", fontSize: 14, color: "#6b6b6b" }}>
            {subtitle}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#666" }}>
              <MapPin size={14} />
              {location}
            </div>
          )}

          {format && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#666" }}>
              <Users size={14} />
              {formatLabel(format)}
            </div>
          )}
        </div>

        {badge && (
  <div
    style={{
      marginTop: 16,
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
      background: badge === "Reservado" ? "#E6F6EC" : badge === "Cancelada" ? "#FDECEA" : "#F1EFEA",
      color: badge === "Reservado" ? "#1F7A4D" : badge === "Cancelada" ? "#B42318" : "#444",
      border: badge === "Reservado" ? "1px solid #B7E4C7" : "none",
      boxShadow: badge === "Reservado" ? "0 0 0 1px rgba(31,122,77,0.04)" : "none",
      transition: "all 0.25s ease",
    }}
  >
    {badge}
  </div>
)}

        {hasDate && (
          <div
            style={{
              marginTop: 12,
              display: "inline-block",
              background: "#F3EFEA",
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {date} · {time}
          </div>
        )}
      </div>
    </div>
  )
}
