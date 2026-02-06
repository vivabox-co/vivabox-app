"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { MapPin, Clock, Users } from "lucide-react"

type Props = {
  exp: Experience
  onChoose: () => void
}

export default function ExperienceSheet({ exp, onChoose }: Props) {
  const color = categoryColors[exp.category] || "#ddd"

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* IMAGE HERO */}
      <div style={{ position: "relative", height: 220 }}>
        <img
          src={exp.image}
          alt={exp.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* BADGE CATÉGORIE */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: color,
            color: "white",
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {exp.category}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ padding: 18, paddingBottom: 120 }}>
        <h2 style={{ marginBottom: 8 }}>{exp.title}</h2>

        {/* META */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14, color: "#555", fontSize: 14 }}>
          <Meta icon={MapPin} text={exp.zone} />
          <Meta icon={Clock} text={exp.duration} />
          <Meta icon={Users} text={exp.format} />
        </div>

        {/* VIVANOTE */}
        <p style={{ lineHeight: 1.6, color: "#555" }}>{exp.vivanote}</p>
      </div>

      {/* CTA FIXE */}
      <div className="sheet-footer">
        <button className="cta-button" onClick={onChoose}>
          Elegir esta experiencia
        </button>
      </div>
    </div>
  )
}

function Meta({ icon: Icon, text }: any) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <Icon size={16} />
      <span>{text}</span>
    </div>
  )
}
