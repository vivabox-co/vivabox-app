"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { MapPin, Clock, Users, Calendar } from "lucide-react"

type Props = {
  exp: Experience
  date?: string
  time?: string
}

export default function ExperienceBookedContent({ exp, date, time }: Props) {
  const color = categoryColors[exp.category] || "#ddd"

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 200,
          overflow: "hidden",
          borderRadius: 18,
          marginBottom: 18,
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

      {/* TITRE */}
      <div style={{ padding: "0 16px" }}>
        <h2 style={{ margin: "0 0 6px" }}>{exp.title}</h2>

        {/* DATE CONFIRMÉE */}
        {date && time && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "#F3EFEA",
              fontSize: 13,
              color: "#444",
              fontWeight: 500,
            }}
          >
            <Calendar size={14} />
            <span>{date}</span>
            <Clock size={14} />
            <span>{time}</span>
          </div>
        )}
      </div>

      {/* INFOS */}
      <div style={{ padding: "18px 16px", lineHeight: 1.6 }}>
        <InfoRow icon={MapPin} value={exp.zone} />
        <InfoRow icon={Clock} value={exp.duration} />
        <InfoRow icon={Users} value={exp.format} />
      </div>

      {/* NOTE */}
      <div style={{ padding: "0 16px", marginTop: 12 }}>
        <p style={{ color: "#555" }}>{exp.vivanote}</p>
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
