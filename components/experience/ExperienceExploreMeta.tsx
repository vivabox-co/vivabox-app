"use client"

import { Fragment } from "react"
import Image from "next/image"
import { Experience, EffortLevel, Environment } from "@/lib/data/types"
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
  Sparkles,
  CheckCircle2,
  UserCheck,
  Info,
  ShieldCheck,
  Heart,
  UtensilsCrossed,
  Wine,
  Coffee,
  Salad,
  Feather,
  Activity,
  Flame,
  Home,
  TreePine,
  Shuffle,
  ThermometerSun,
  Shirt,
  ListChecks,
  BellRing,
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
  const tint = hexToRgba(color, 0.08)
  const photos = getExperiencePhotos(exp)

  // Datos rápidos: solo los que existan, escaneables en una fila.
  const quickFacts = [
    (exp.city || exp.zone) && { icon: MapPin, text: exp.city || exp.zone },
    formatDuration(exp.duration) && { icon: Clock, text: formatDuration(exp.duration)! },
    formatLabel(exp.format) && { icon: Users, text: formatLabel(exp.format)! },
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[]

  // "Qué vas a vivir": lo que incluye la experiencia, convertido en highlights
  // visuales (icono + texto real, sin inventar contenido).
  const highlights = (exp.includes || []).slice(0, 4).map((text) => ({
    icon: pickIncludeIcon(text),
    text,
  }))

  const includesRows = exp.includes || []

  // "Ideal para": combina los tags de audiencia con el mood/ambiente cuando existe.
  const idealChips = Array.from(
    new Set(
      [...(exp.idealFor || []), ...(exp.ambiance || [])]
        .map((t) => t.trim())
        .filter(Boolean)
    )
  )

  // "Antes de elegir": solo datos prácticos que realmente existen en el modelo.
  const decisionRows: { key: string; icon: LucideIcon; content: React.ReactNode }[] = []

  if (exp.effortLevel && EFFORT_META[exp.effortLevel]) {
    decisionRows.push({
      key: "effort",
      icon: EFFORT_META[exp.effortLevel].icon,
      content: (
        <>
          <strong style={strongLabel}>Nivel de esfuerzo: </strong>
          {EFFORT_META[exp.effortLevel].label}
        </>
      ),
    })
  }
  if (exp.environment && ENVIRONMENT_META[exp.environment]) {
    decisionRows.push({
      key: "environment",
      icon: ENVIRONMENT_META[exp.environment].icon,
      content: (
        <>
          <strong style={strongLabel}>Ambiente: </strong>
          {ENVIRONMENT_META[exp.environment].label}
        </>
      ),
    })
  }
  if (exp.weatherNote) {
    decisionRows.push({ key: "weather", icon: ThermometerSun, content: exp.weatherNote })
  }
  if (exp.clothingNote) {
    decisionRows.push({ key: "clothing", icon: Shirt, content: exp.clothingNote })
  }
  ;(exp.requirements || []).forEach((text, i) =>
    decisionRows.push({ key: `req-${i}`, icon: ListChecks, content: text })
  )
  ;(exp.importantToKnow || []).forEach((text, i) =>
    decisionRows.push({ key: `imp-${i}`, icon: BellRing, content: text })
  )

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
        {/* 1. IDENTIDAD PRINCIPAL */}
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

        {/* 3. QUÉ VAS A VIVIR — highlights visuales */}
        {highlights.length > 0 && (
          <Section icon={Sparkles} title="Qué vas a vivir">
            <div style={highlightGrid}>
              {highlights.map((h, i) => (
                <div key={i} style={highlightCard}>
                  <div style={highlightIconWrap(tint)}>
                    <h.icon size={17} color={color} strokeWidth={2} />
                  </div>
                  <div style={highlightText}>{h.text}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 4. QUÉ INCLUYE — filas visuales en vez de bullets */}
        {includesRows.length > 0 && (
          <Section icon={CheckCircle2} title="Qué incluye">
            <div style={rowCard}>
              {includesRows.map((item, i) => (
                <div key={i} style={row(i === includesRows.length - 1)}>
                  <CheckCircle2 size={16} color={color} style={rowIcon} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 5. IDEAL PARA — chips */}
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

        {/* 6. ANTES DE ELEGIR — info práctica para decidir sin sorpresas */}
        {decisionRows.length > 0 && (
          <Section icon={Info} title="Antes de elegir">
            <div style={rowCard}>
              {decisionRows.map((r, i) => (
                <div key={r.key} style={row(i === decisionRows.length - 1)}>
                  <r.icon size={16} color="#8a8a8a" style={rowIcon} />
                  <span>{r.content}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 7. CÓMO FUNCIONA CON VIVABOX — flujo de 3 pasos */}
        <Section icon={ShieldCheck} title="Cómo funciona con Vivabox">
          <div style={stepsWrap}>
            <Step
              number={1}
              title="Elige tu fecha"
              text="Selecciona cuándo quieres vivirla."
              color={color}
            />
            <Step
              number={2}
              title="Confirmamos"
              text="Coordinamos con el lugar."
              color={color}
            />
            <Step
              number={3}
              title="Te avisamos"
              text="Te contamos cuando todo esté listo."
              color={color}
            />
          </div>
        </Section>
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

function Step({
  number,
  title,
  text,
  color,
}: {
  number: number
  title: string
  text: string
  color: string
}) {
  return (
    <div style={stepRow}>
      <div style={{ ...stepBadge, background: color }}>{number}</div>
      <div>
        <div style={stepTitle}>{title}</div>
        <div style={stepText}>{text}</div>
      </div>
    </div>
  )
}

/* ================= HELPERS ================= */

const EFFORT_META: Record<EffortLevel, { icon: LucideIcon; label: string }> = {
  suave: { icon: Feather, label: "Suave" },
  medio: { icon: Activity, label: "Medio" },
  intenso: { icon: Flame, label: "Intenso" },
}

const ENVIRONMENT_META: Record<Environment, { icon: LucideIcon; label: string }> = {
  indoor: { icon: Home, label: "Bajo techo" },
  outdoor: { icon: TreePine, label: "Al aire libre" },
  mixto: { icon: Shuffle, label: "Interior y exterior" },
}

const INCLUDE_ICON_RULES: [RegExp, LucideIcon][] = [
  [/bebida|trago|c[oó]ctel|vino|licor/i, Wine],
  [/caf[eé]/i, Coffee],
  [/vegetarian|vegan|dieta|opci[oó]n(es)?|proteína/i, Salad],
  [/men[uú]|entrada|plato|almuerzo|cena|comida|postre/i, UtensilsCrossed],
]

function pickIncludeIcon(text: string): LucideIcon {
  const match = INCLUDE_ICON_RULES.find(([re]) => re.test(text))
  return match ? match[1] : CheckCircle2
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
  marginTop: 26,
  paddingTop: 22,
  borderTop: "1px solid #EFEAE3",
}

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 600,
  fontSize: 15,
  marginBottom: 12,
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

const highlightGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
}

const highlightCard: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "14px 12px",
  borderRadius: 14,
  background: "#FAF7F3",
  border: "1px solid #EFE7DC",
}

function highlightIconWrap(tint: string): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: tint,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
}

const highlightText: React.CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.35,
  color: "#333",
  fontWeight: 500,
}

/* Qué incluye / Antes de elegir (filas) */

const rowCard: React.CSSProperties = {
  background: "#FAF7F3",
  borderRadius: 14,
  border: "1px solid #EFE7DC",
  overflow: "hidden",
}

function row(isLast: boolean): React.CSSProperties {
  return {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "12px 14px",
    borderBottom: isLast ? "none" : "1px solid #EFE7DC",
    fontSize: 14,
    color: "#444",
    lineHeight: 1.45,
  }
}

const rowIcon: React.CSSProperties = {
  flexShrink: 0,
  marginTop: 2,
}

const strongLabel: React.CSSProperties = {
  color: "#111",
  fontWeight: 600,
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
    padding: "7px 13px",
    borderRadius: 20,
    background: hexToRgba(color, 0.08),
    border: `1px solid ${hexToRgba(color, 0.35)}`,
    color: "#333",
    fontSize: 13,
    fontWeight: 600,
  }
}

/* Cómo funciona con Vivabox (pasos) */

const stepsWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
}

const stepRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
}

const stepBadge: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  flexShrink: 0,
}

const stepTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111",
}

const stepText: React.CSSProperties = {
  fontSize: 13,
  color: "#666",
  marginTop: 2,
}
