"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { MapPin, Clock, Users } from "lucide-react"

type Props = {
  exp: Experience
  onChoose: () => void
}

export default function ExperienceExploreMeta({ exp, onChoose }: Props) {
  const color = categoryColors[exp.category] || "#ddd"

  return (
    <div style={{ paddingBottom: 140 }}>
      {/* IMAGE + BADGE */}
      <div style={{ position: "relative" }}>
        <img
          src={exp.image}
          alt={exp.title}
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 999,
            background: color,
            color: "white",
          }}
        >
          {exp.category}
        </div>
      </div>

      {/* TITRE */}
      <div style={{ padding: "16px 16px 8px" }}>
        <h2 style={{ margin: 0 }}>{exp.title}</h2>
      </div>

      {/* META */}
      <div style={{ padding: "0 16px 14px", lineHeight: 1.6 }}>
        <InfoRow icon={MapPin} value={exp.zone} />
        <InfoRow icon={Clock} value={exp.duration} />
        <InfoRow icon={Users} value={exp.format} />
      </div>

      {/* NOTE */}
      <div style={{ padding: "0 16px", color: "#555" }}>
        {exp.vivanote}
      </div>

      {/* CTA FIXE EN BAS */}
      <div className="sheet-footer">
        <button className="cta-button" onClick={onChoose}>
          Elegir esta experiencia
        </button>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, value }: any) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <Icon size={16} />
      <span>{value}</span>
    </div>
  )
}
