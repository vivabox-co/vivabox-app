"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { MapPin, Clock, Users, Calendar } from "lucide-react"

export type BookingStatus =
  | "requested"
  | "waiting_provider"
  | "confirmed"
  | "rejected"
  | "done"

type Props = {
  exp?: Experience | null
  date?: string
  time?: string
  status?: BookingStatus
}

export default function ExperienceBookedContent({ exp, date, time, status }: Props) {
  if (!exp) return null

  const color = categoryColors[exp.category] || "#ddd"
  const isConfirmed = status === "confirmed" || status === "done"
  const providerName = exp.id || "—"

  return (
    <div>
      {/* IMAGE */}
      <div style={heroWrap}>
        <img
          src={exp.image || "/images/placeholder.jpg"}
          alt={exp.title}
          style={heroImg}
        />

        <div style={{ ...categoryBadge, background: color }}>
          {exp.category}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <h2 style={{ marginBottom: 4 }}>{exp.title}</h2>

        {/* PRESTATAIRE */}
        {isConfirmed && (
          <div style={providerStyle}>
            Prestador: {providerName}
          </div>
        )}

        {/* DATE */}
        {date && time && (
          <div style={datePill}>
            <Calendar size={14} />
            <span>{date}</span>
            <Clock size={14} />
            <span>{time}</span>
          </div>
        )}

        {/* DESCRIPTION */}
        {exp.shortDescription && (
          <p style={description}>{exp.shortDescription}</p>
        )}

        {/* INFOS révélées */}
        {isConfirmed ? (
          <div style={{ marginTop: 14 }}>
            <InfoRow icon={MapPin} value={exp.zone} />
            <InfoRow icon={Clock} value={exp.duration} />
            <InfoRow icon={Users} value={exp.format} />
          </div>
        ) : (
          <div style={pendingBox}>
            Te compartiremos los detalles exactos del lugar una vez confirmemos la fecha.
          </div>
        )}

        {/* INCLUDES */}
        {!!exp.includes?.length && (
          <Section title="Qué incluye">
            {exp.includes.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        )}

        {/* IMPORTANT */}
        {!!exp.importantToKnow?.length && (
          <Section title="A tener en cuenta">
            {exp.importantToKnow.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

/* ---------- UI PARTS ---------- */

function InfoRow({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>
  value?: string
}) {
  if (!value) return null
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <Icon size={16} />
      <span>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <div>•</div>
      <div>{text}</div>
    </div>
  )
}

/* ---------- STYLES ---------- */

const heroWrap: React.CSSProperties = {
  position: "relative",
  height: 200,
  overflow: "hidden",
  borderRadius: 18,
}

const heroImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
}

const categoryBadge: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  color: "white",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
}

const providerStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#555",
  fontWeight: 500,
  marginBottom: 6,
}

const datePill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  marginTop: 6,
  padding: "6px 12px",
  borderRadius: 999,
  background: "#F3EFEA",
  fontSize: 13,
  color: "#444",
  fontWeight: 500,
}

const description: React.CSSProperties = {
  marginTop: 12,
  color: "#444",
  lineHeight: 1.5,
}

const pendingBox: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: "#F3EFEA",
  fontSize: 13,
  color: "#555",
}
