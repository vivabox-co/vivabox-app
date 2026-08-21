"use client"

import { Experience } from "@/lib/data/types"
import { Heart } from "lucide-react"
import { formatDuration } from "@/lib/format/duration"

type Props = {
  exp?: Experience | null
  onClick: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function ListCard({
  exp,
  onClick,
  isFavorite,
  onToggleFavorite,
}: Props) {
  // 🔒 Protection contre données non chargées
  if (!exp) return null

  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: 18,
        borderRadius: 22,
        overflow: "hidden",
        background: "#FFFFFF",
        boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-3px)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "translateY(0)")
      }
    >
      {/* IMAGE */}
      <div style={{ position: "relative" }}>
        <img
          src={exp.image}
          alt={exp.title}
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
          }}
        />

        {/* ❤️ FAVORI */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
            transition: "transform 0.15s ease",
          }}
        >
          <Heart
            size={18}
            strokeWidth={2}
            fill={isFavorite ? "#ff4d6d" : "none"}
            color={isFavorite ? "#ff4d6d" : "#777"}
          />
        </button>
      </div>

      {/* CONTENU */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1.3,
            marginBottom: 6,
            color: "#152F40",
          }}
        >
          {exp.title}
        </div>

        {exp.subtitle && (
          <div
            style={{
              fontSize: 14,
              color: "#6b6b6b",
              marginBottom: 8,
              lineHeight: 1.4,
            }}
          >
            {exp.subtitle}
          </div>
        )}

        <div
          style={{
            fontSize: 13,
            color: "#8a8a8a",
            marginBottom: 4,
          }}
        >
          {exp.zone}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#8a8a8a",
          }}
        >
          {formatDuration(exp.duration)}
        </div>
      </div>
    </div>
  )
}
