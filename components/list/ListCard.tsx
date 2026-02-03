"use client"

import { Experience } from "@/lib/data/types"
import { Heart } from "lucide-react"

type Props = {
  exp: Experience
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
  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: 14,
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-2px)")
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
            height: 170,
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
            top: 10,
            right: 10,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(4px)",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          <Heart
            size={18}
            strokeWidth={2}
            fill={isFavorite ? "#ff4d6d" : "none"}
            color={isFavorite ? "#ff4d6d" : "#888"}
          />
        </button>
      </div>

      {/* TEXT */}
      <div style={{ padding: 14 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {exp.title}
        </div>

        <div
          style={{
            fontSize: 13,
            opacity: 0.6,
          }}
        >
          {exp.zone}
        </div>
      </div>
    </div>
  )
}
