"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { MapPin, Clock, Users, CalendarCheck } from "lucide-react"

type Props = {
  exp: Experience
  date?: string
  time?: string
}

export default function ExperienceBookedContent({ exp, date, time }: Props) {
  const color = categoryColors[exp.category] || "#ddd"

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* IMAGE */}
      <div
        style={{
          width: "100%",
          height: 200,
          overflow: "hidden",
          borderRadius: 18,
          marginBottom: 18,
          position: "relative",
        }}
      >
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
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: color,
            color: "white",
          }}
        >
          {exp.category}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <h2 style={{ margin: 0 }}>{exp.title}</h2>

        {/* DATE CONFIRMÉE */}
        {date && time && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
              fontSize: 14,
              fontWeight: 600,
              color: "#1E7A3B",
            }}
          >
            <CalendarCheck size={16} />
            <span>{date} · {time}</span>
          </div>
        )}
      </div>

      {/* INFOS */}
      <div style={{ padding: "18px 16px", lineHeight: 1.6 }}>
        <InfoRow icon={MapPin} value={exp.zone} />
        <InfoRow icon={Clock} value={exp.duration} />
        <InfoRow icon={Users} value={exp.format} />
      </div>

      {/* VIVANOTE */}
      <div style={{ padding: "0 16px", marginTop: 12 }}>
        <h4>Recomendación Vivabox</h4>
        <p style={{ color: "#555" }}>{exp.vivanote}</p>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, value }: any) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
      <Icon size={16} />
      <span>{value}</span>
    </div>
  )
}
