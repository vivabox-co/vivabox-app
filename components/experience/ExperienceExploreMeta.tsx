"use client"

import { Fragment, useState } from "react"
import { Experience } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { categoryLabel } from "@/lib/map/categoryLabels"
import { formatLabel } from "@/lib/map/formatLabels"
import { formatDuration } from "@/lib/format/duration"
import { getExperiencePhotos } from "@/lib/data/getExperiencePhotos"
import { useUI } from "@/components/ui/UIContext"
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
  const { isFavorite, toggleFavorite } = useUI()
  const [activePhoto, setActivePhoto] = useState(0)

  if (!exp) return null

  const fav = isFavorite(exp.id)
  const color = categoryColors[exp.category] || "#333"
  const photos = getExperiencePhotos(exp)

  // Datos rápidos: solo los que existan, escaneables en una fila.
  const quickFacts = [
    (exp.city || exp.zone) && { icon: MapPin, text: exp.city || exp.zone },
    formatDuration(exp.duration) && { icon: Clock, text: formatDuration(exp.duration)! },
    formatLabel(exp.format) && { icon: Users, text: formatLabel(exp.format)! },
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[]

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* HERO IMAGE */}
      <div style={heroWrap}>
        <div
          className="hero-gallery-track"
          style={heroTrack}
          onScroll={(e) => {
            const el = e.currentTarget
            const idx = Math.round(el.scrollLeft / el.clientWidth)
            setActivePhoto(idx)
          }}
        >
          {photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${exp.title} ${i + 1}`}
              style={heroImg}
            />
          ))}
        </div>

        {/* 🏷 CATEGORY BADGE */}
        <div style={{ ...categoryBadge, background: color }}>
          {categoryLabel(exp.category)}
        </div>

        {/* 🤍 FAVORITE BUTTON */}
        <button
          style={favButton}
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(exp.id)
          }}
        >
          <Heart
            size={20}
            color={fav ? "#E11D48" : "#333"}
            fill={fav ? "#E11D48" : "transparent"}
          />
        </button>

        {/* 🔘 DOTS */}
        {photos.length > 1 && (
          <div style={dotsWrap}>
            {photos.map((_, i) => (
              <div
                key={i}
                style={{
                  ...dot,
                  background:
                    i === activePhoto
                      ? "#fff"
                      : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "16px" }}>
        {/* TITLE */}
        <h2 style={titleStyle}>{exp.title}</h2>
        {exp.subtitle && <p style={subtitleStyle}>{exp.subtitle}</p>}
        {exp.shortDescription && <p style={desc}>{exp.shortDescription}</p>}

        {/* DATOS RÁPIDOS: una fila horizontal, iconos pequeños */}
        {quickFacts.length > 0 && (
          <div style={quickFactsRow}>
            {quickFacts.map((fact, i) => (
              <Fragment key={i}>
                {i > 0 && <span style={quickFactSep}>·</span>}
                <span style={quickFactItem}>
                  <fact.icon size={14} strokeWidth={2} />
                  {fact.text}
                </span>
              </Fragment>
            ))}
          </div>
        )}

        {/* SECCIONES: cada una solo aparece si hay contenido real */}
        {exp.vivanote && (
          <Section icon={Sparkles} title="Qué vas a vivir">
            <p style={p}>{exp.vivanote}</p>
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

function Section({ icon: Icon, title, children }: any) {
  return (
    <div style={{ marginTop: 26 }}>
      <div style={sectionTitle}>
        <Icon size={15} strokeWidth={2} />
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

const heroTrack: React.CSSProperties = {
  display: "flex",
  width: "100%",
  height: "100%",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
}

const heroImg: React.CSSProperties = {
  flex: "0 0 100%",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  scrollSnapAlign: "center",
}

const dotsWrap: React.CSSProperties = {
  position: "absolute",
  bottom: 12,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  gap: 6,
}

const dot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  transition: "background 0.15s ease",
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
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  cursor: "pointer",
}

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
  marginBottom: 8,
  color: "#111",
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.25,
  color: "#111",
}

const subtitleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 15,
  fontWeight: 500,
  color: "#666",
}

const desc: React.CSSProperties = {
  marginTop: 8,
  color: "#444",
  lineHeight: 1.5,
}

const quickFactsRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
  fontSize: 14,
  color: "#444",
}

const quickFactItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
}

const quickFactSep: React.CSSProperties = {
  color: "#ccc",
}

const p: React.CSSProperties = { margin: 0, color: "#444" }
