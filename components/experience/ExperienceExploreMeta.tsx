"use client"

import { Fragment, useState } from "react"
import Image from "next/image"
import { Experience, EffortLevel, Environment, Category } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { categoryLabel } from "@/lib/map/categoryLabels"
import { formatLabel } from "@/lib/map/formatLabels"
import { formatDuration } from "@/lib/format/duration"
import { getExperiencePhotos } from "@/lib/data/getExperiencePhotos"
import { useUI } from "@/components/ui/UIContext"
import PhotoGallery from "@/components/ui/PhotoGallery"
import {
  MapPin,
  Clock,
  Users,
  Compass,
  CheckCircle2,
  UserCheck,
  Info,
  Heart,
  type LucideIcon,
} from "lucide-react"

type Props = {
  exp: Experience
  onChoose: () => void
}

export default function ExperienceExploreMeta({ exp }: Props) {
  const { isFavorite, toggleFavorite } = useUI()

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

  const vibeParagraph = buildVibeParagraph(exp)
  const includesRows = exp.includes || []

  // "Ideal para": combina los tags de audiencia con el mood/ambiente cuando existe.
  const idealChips = Array.from(
    new Set(
      [...(exp.idealFor || []), ...(exp.ambiance || [])]
        .map((t) => t.trim())
        .filter(Boolean)
    )
  )

  // "Antes de elegir": datos prácticos reales, traducidos a lenguaje humano.
  const decisionItems: string[] = []
  if (exp.environment && ENVIRONMENT_LABEL[exp.environment]) {
    decisionItems.push(ENVIRONMENT_LABEL[exp.environment])
  }
  if (exp.effortLevel && EFFORT_LABEL[exp.effortLevel]) {
    decisionItems.push(EFFORT_LABEL[exp.effortLevel])
  }
  if (exp.weatherNote) decisionItems.push(exp.weatherNote)
  if (exp.clothingNote) decisionItems.push(exp.clothingNote)
  decisionItems.push(...(exp.requirements || []))
  decisionItems.push(...(exp.importantToKnow || []))

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* HERO IMAGE */}
      <div style={heroWrap}>
        <PhotoGallery photos={photos} alt={exp.title}>
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
        </PhotoGallery>
      </div>

      <div style={{ padding: "16px" }}>
        {/* 1. CABECERA */}
        <h2 style={titleStyle}>{exp.title}</h2>
        {exp.subtitle && <p style={subtitleStyle}>{exp.subtitle}</p>}
        {exp.shortDescription && <p style={desc}>{exp.shortDescription}</p>}

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

        {/* 2. LA ELEGIMOS — recomendación editorial de Vivabox */}
        {exp.vivanote && (
          <div style={curatedBlock(color)}>
            <Image
              src="/logo/LogoVivaboxSVG.svg"
              alt=""
              width={26}
              height={26}
              style={curatedLogo}
            />
            <div>
              <div style={curatedTitle}>La elegimos porque...</div>
              <p style={curatedQuote}>«{exp.vivanote}»</p>
            </div>
          </div>
        )}

        {/* 3. QUÉ VAS A VIVIR — un párrafo editorial corto, sin cards */}
        {vibeParagraph && (
          <Section icon={Compass} title="Qué vas a vivir">
            <p style={vibeText}>{vibeParagraph}</p>
          </Section>
        )}

        {/* 4. QUÉ INCLUYE — una línea compacta, con detalle opcional */}
        {includesRows.length > 0 && (
          <Section icon={CheckCircle2} title="Qué incluye">
            <CompactList
              items={includesRows}
              visibleCount={4}
              moreLabel="Ver detalles +"
              lessLabel="Ver menos −"
              color={color}
            />
          </Section>
        )}

        {/* 5. IDEAL PARA — chips ligeros */}
        {idealChips.length > 0 && (
          <Section icon={UserCheck} title="Ideal para">
            <div style={chipsRow}>
              {idealChips.map((tag, i) => (
                <span key={i} style={chip(color)}>
                  {capitalize(tag)}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* 6. ANTES DE ELEGIR — info práctica, compacta */}
        {decisionItems.length > 0 && (
          <Section icon={Info} title="Antes de elegir">
            <CompactList
              items={decisionItems}
              visibleCount={3}
              moreLabel="Ver información +"
              lessLabel="Ver menos −"
              color={color}
            />
          </Section>
        )}
      </div>
    </div>
  )
}

/* ================= UI PARTS ================= */

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={sectionWrap}>
      <div style={sectionTitle}>
        <Icon size={15} strokeWidth={2} />
        {title}
      </div>
      {children}
    </div>
  )
}

function CompactList({
  items,
  visibleCount,
  moreLabel,
  lessLabel,
  color,
}: {
  items: string[]
  visibleCount: number
  moreLabel: string
  lessLabel: string
  color: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (items.length === 0) return null

  const visible = items.slice(0, visibleCount)
  const rest = items.slice(visibleCount)

  return (
    <>
      <p style={compactLine}>{visible.join(" · ")}</p>
      {expanded && rest.length > 0 && (
        <p style={compactLineMuted}>{rest.join(" · ")}</p>
      )}
      {rest.length > 0 && (
        <button
          type="button"
          style={{ ...moreLink, color }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </>
  )
}

/* ================= HELPERS ================= */

const ENVIRONMENT_LABEL: Record<Environment, string> = {
  indoor: "Interior",
  outdoor: "Al aire libre",
  mixto: "Interior y exterior",
}

const EFFORT_LABEL: Record<EffortLevel, string> = {
  suave: "Suave",
  medio: "Medio",
  intenso: "Intenso",
}

// "Qué vas a vivir": frase editorial corta compuesta a partir de datos reales
// (categoría, mood/ambiente, entorno, nivel de esfuerzo) — nunca texto libre
// inventado ni una repetición literal de la descripción o la nota Vivabox.
const VIBE_OPENER: Record<Category, string> = {
  gastro: "Una experiencia gastronómica pensada para disfrutar sin afán",
  bienestar: "Un espacio pensado para desconectar y cuidarte",
  aventura: "Una experiencia activa para salir de la rutina",
  cultura: "Una experiencia pensada para dejarte sorprender",
  estancias: "Una pausa pensada para desconectar del ritmo diario",
}

const ENV_VIBE_PHRASE: Record<Environment, string> = {
  indoor: "en un espacio interior",
  outdoor: "al aire libre",
  mixto: "entre interior y exterior",
}

const EFFORT_VIBE_PHRASE: Record<EffortLevel, string> = {
  suave: "a un ritmo suave",
  medio: "con energía moderada",
  intenso: "a toda intensidad",
}

function buildVibeParagraph(exp: Experience): string | null {
  const opener = VIBE_OPENER[exp.category]
  if (!opener) return null

  const mood = exp.ambiance?.[0]
  const clause = mood
    ? `con un ambiente ${mood.toLowerCase()}`
    : exp.environment
    ? ENV_VIBE_PHRASE[exp.environment]
    : exp.effortLevel
    ? EFFORT_VIBE_PHRASE[exp.effortLevel]
    : null

  return clause ? `${opener}, ${clause}.` : `${opener}.`
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
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

const sectionWrap: React.CSSProperties = {
  marginTop: 22,
  paddingTop: 18,
  borderTop: "1px solid #EFEAE3",
}

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
  fontSize: 15,
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

/* La elegimos */

function curatedBlock(color: string): React.CSSProperties {
  return {
    marginTop: 22,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: "16px",
    background: hexToRgba(color, 0.06),
    borderLeft: `3px solid ${color}`,
    borderRadius: "4px 14px 14px 4px",
  }
}

const curatedLogo: React.CSSProperties = {
  flexShrink: 0,
  marginTop: 2,
}

const curatedTitle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: "#111",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 6,
}

const curatedQuote: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.55,
  color: "#333",
  fontStyle: "italic",
}

/* Qué vas a vivir */

const vibeText: React.CSSProperties = {
  margin: 0,
  fontSize: 14.5,
  lineHeight: 1.55,
  color: "#444",
}

/* Qué incluye / Antes de elegir (línea compacta) */

const compactLine: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.5,
  color: "#444",
}

const compactLineMuted: React.CSSProperties = {
  ...compactLine,
  marginTop: 6,
  color: "#777",
}

const moreLink: React.CSSProperties = {
  display: "inline-block",
  background: "none",
  border: "none",
  padding: 0,
  marginTop: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

/* Ideal para (chips) */

const chipsRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
}

function chip(color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    padding: "5px 12px",
    borderRadius: 20,
    border: `1px solid ${hexToRgba(color, 0.35)}`,
    color: "#333",
    fontSize: 13,
    fontWeight: 600,
  }
}
