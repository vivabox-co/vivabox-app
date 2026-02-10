import { categoryColors } from "@/lib/map/categoryColors"

type Props = {
  title: string
  subtitle?: string
  location?: string
  format?: string
  image?: string
  date?: string
  time?: string
  category: string
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
  onClick,
}: Props) {

  const safeImage = image || "/images/placeholder.jpg"
  const safeLocation = location || ""
  const safeFormat = format || ""
  const hasDate = date && time

  return (
    <div
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        marginBottom: 24,
        borderLeft: `6px solid ${categoryColors[category] || "#ddd"}`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)"
          e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.08)"
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ display: "flex" }}>
        {/* IMAGE */}
        <div style={{ width: 130, minHeight: 150 }}>
          <img
            src={safeImage}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* TEXTE */}
        <div style={{ padding: 16, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: "1.2",
              fontWeight: 600,
            }}
          >
            {title}
          </h3>

          {subtitle && (
            <p
              style={{
                margin: "6px 0 10px",
                fontSize: 14,
                color: "#6b6b6b",
              }}
            >
              {subtitle}
            </p>
          )}

          {safeLocation && (
            <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
              {safeLocation}
            </div>
          )}

          {safeFormat && (
            <div
              style={{
                fontSize: 13,
                color: "#888",
                marginBottom: 10,
                textTransform: "capitalize",
              }}
            >
              {safeFormat}
            </div>
          )}

          {/* PILULE DATE */}
          {hasDate && (
            <div
              style={{
                display: "inline-block",
                background: "#F3EFEA",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                color: "#333",
              }}
            >
              {date} · {time}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
