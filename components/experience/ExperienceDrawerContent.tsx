"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { MapPin, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUI } from "@/components/ui/UIContext"

type Props = {
  exp: Experience
}

export default function ExperienceDrawerContent({ exp }: Props) {
  const router = useRouter()
  const { setDrawerOpen } = useUI()
  const color = categoryColors[exp.category] || "#ddd"

  function handleChoose() {
    setDrawerOpen(false)
    router.push("/reservar/fechas")
  }

  return (
    <div style={{ paddingBottom: 120 }}>
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

      {/* TITLE */}
      <div style={{ padding: "16px 16px 6px" }}>
        <h2 style={{ margin: 0 }}>{exp.title}</h2>
      </div>

      {/* ICON INFOS */}
      <div style={{ padding: "0 16px", lineHeight: 1.8 }}>
        <InfoRow icon={MapPin} value={exp.zone} />
        <InfoRow icon={Clock} value={exp.duration} />
        <InfoRow icon={Users} value={exp.format} />
      </div>

      {/* NOTE */}
      <p style={{ padding: "12px 16px", opacity: 0.7 }}>
        {exp.vivanote}
      </p>

      {/* CTA */}
      <div className="sheet-footer">
        <button className="cta-button" onClick={handleChoose}>
          Elegir esta experiencia
        </button>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, value }: any) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <Icon size={16} />
      <span>{value}</span>
    </div>
  )
}
