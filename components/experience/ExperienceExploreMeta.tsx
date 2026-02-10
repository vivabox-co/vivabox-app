"use client"

import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import {
  MapPin,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Info,
  ShieldCheck,
  Heart,
} from "lucide-react"

type Props = {
  exp: Experience
  onChoose: () => void
}

export default function ExperienceExploreMeta({ exp }: Props) {
  if (!exp) return null

  const color = categoryColors[exp.category] || "#333"

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* HERO IMAGE */}
      <div style={heroWrap}>
        <img
          src={exp.image || "/images/placeholder.jpg"}
          alt={exp.title}
          style={heroImg}
        />

        {/* 🏷 CATEGORY BADGE */}
        <div style={{ ...categoryBadge, background: color }}>
          {exp.category}
        </div>

        {/* 🤍 FAVORITE BUTTON */}
        <button style={favButton}>
          <Heart size={20} />
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        {/* TITLE */}
        <h2 style={{ margin: 0 }}>{exp.title}</h2>

        {exp.shortDescription && (
          <p style={desc}>{exp.shortDescription}</p>
        )}

        {/* META */}
        <div style={{ marginTop: 14 }}>
          <InfoRow icon={MapPin} value={exp.zone} />
          <InfoRow icon={Clock} value={exp.duration} />
          <InfoRow icon={Users} value={exp.format} />
        </div>

        {/* SECTIONS */}
        {exp.vivanote && (
  <Section
    icon={() => (
      <img
        src="/logo/LogoVivaboxSVG.svg"
        alt="Vivabox"
        style={{
          width: 24,
          height: 24,
          objectFit: "contain",
        }}
      />
    )}
    title="Qué vas a vivir"
  >
    <p style={{ margin: 0 }}>{exp.vivanote}</p>
  </Section>
)}

        {exp.includes?.length ? (
          <Section icon={CheckCircle2} title="Qué incluye">
            {exp.includes.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        ) : null}

        {exp.idealFor?.length ? (
          <Section icon={UserCheck} title="Ideal para">
            {exp.idealFor.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        ) : null}

        {exp.importantToKnow?.length ? (
          <Section icon={Info} title="A tener en cuenta">
            {exp.importantToKnow.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </Section>
        ) : null}

        <Section icon={ShieldCheck} title="Cómo funciona con Vivabox">
          <p style={p}>
            Tú eliges fecha, confirmamos con el lugar y te avisamos cuando todo esté listo.
          </p>
        </Section>
      </div>
    </div>
  )
}

/* ================= UI PARTS ================= */

function InfoRow({ icon: Icon, value }: { icon: any; value?: string }) {
  if (!value) return null
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6, color: "#444" }}>
      <Icon size={16} />
      <span>{value}</span>
    </div>
  )
}

function Section({ icon: Icon, title, children }: any) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={sectionTitle}>
        <Icon size={16} />
        {title}
      </div>
      {children}
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6, color: "#444" }}>
      <div>•</div>
      <div>{text}</div>
    </div>
  )
}

/* ================= STYLES ================= */

const heroWrap: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: 220,
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: 16,
}

const heroImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
}

const categoryBadge: React.CSSProperties = {
  position: "absolute",
  top: 14,
  left: 14,
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
  color: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
}

const favButton: React.CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "white",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  cursor: "pointer",
}

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
  marginBottom: 8,
}

const desc: React.CSSProperties = {
  marginTop: 8,
  color: "#444",
  lineHeight: 1.5,
}

const p: React.CSSProperties = { margin: 0, color: "#444" }
