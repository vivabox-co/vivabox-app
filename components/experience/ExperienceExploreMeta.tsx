"use client"

import { Fragment, useState } from "react"
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
  Compass,
  CheckCircle2,
  UserCheck,
  Info,
  Heart,
  AlertTriangle,
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

  const includesRows = exp.includes || []

  // "Ideal para": combina los tags de audiencia con el mood/ambiente cuando existe.
  const idealChips = Array.from(
    new Set(
      [...(exp.idealFor || []), ...(exp.ambiance || [])]
        .map((t) => t.trim())
        .filter(Boolean)
    )
  )

  // requisitos/info_importante mezclan en una misma celda restricciones que
  // pueden descartar la experiencia (edad, licencia, salud) con recomendaciones
  // blandas (buena condición física, llevar abrigo). extractConstraints separa
  // las frases "no apto para.../mayor de X años/licencia" del resto, para
  // mostrarlas cerca del hero en vez de enterrarlas en Ten en cuenta.
  const { hard: hardFromRequirements, soft: softRequirements } = extractConstraints(exp.requirements)
  const { hard: hardFromImportant, soft: softImportant } = extractConstraints(exp.importantToKnow)
  const hardConstraints = [...hardFromRequirements, ...hardFromImportant]

  // badges_visibles trae hasta 3 claves por fila, pero varias duplican una
  // info que ya se muestra en otra sección (esfuerzo, entorno, incluye). Solo
  // vale la pena mostrar cerca del hero lo que no se dice en ningún otro
  // lado — máximo 2, nunca las 3 mecánicamente.
  const highlightBadges = (exp.badges || [])
    .filter((key) => !EXCLUDED_BADGE_KEYS.has(key))
    .map((key) => BADGE_LABELS[key] || humanizeBadgeKey(key))
    .slice(0, 2)

  // "Antes de elegir": datos prácticos reales, traducidos a lenguaje humano.
  const decisionItems: string[] = []
  if (exp.environment && ENVIRONMENT_LABEL[exp.environment]) {
    decisionItems.push(ENVIRONMENT_LABEL[exp.environment])
  }
  if (exp.effortLevel && EFFORT_LABEL[exp.effortLevel]) {
    decisionItems.push(EFFORT_LABEL[exp.effortLevel])
  }
  // El Sheet usa la convención "Influye: ..." / "No influye[: motivo]" en
  // nota_clima y nota_vestimenta. Un "No influye" es una nota real (alguien
  // lo verificó), pero no debe llegar al beneficiario: no cambia su
  // decisión, es el mismo ruido que un "no aplica".
  if (isRelevantNote(exp.weatherNote)) decisionItems.push(exp.weatherNote!)
  if (isRelevantNote(exp.clothingNote)) decisionItems.push(exp.clothingNote!)
  decisionItems.push(...softRequirements)
  decisionItems.push(...softImportant)

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

        {/* 1bis. RESTRICCIONES DURAS — lo único que puede impedir elegir esta
               experiencia (edad, licencia, salud). Cerca del hero, antes de
               cualquier texto editorial, para no descubrirlo tarde. */}
        {hardConstraints.length > 0 && (
          <div style={warnBlock}>
            {hardConstraints.map((text, i) => (
              <div key={i} style={warnItem}>
                <AlertTriangle size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        )}

        {/* 1ter. HIGHLIGHTS — hasta 2 claves de badges_visibles, ya
               filtradas de lo que duplica otra sección (ver EXCLUDED_BADGE_KEYS). */}
        {highlightBadges.length > 0 && (
          <div style={highlightRow}>
            {highlightBadges.map((label, i) => (
              <span key={i} style={highlightPill}>
                {label}
              </span>
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

        {/* 3. ASÍ SERÁ — descripcion_corta ya escrita para esto; no duplicar
               con un párrafo generado por categoría (ver isRelevantNote /
               historial: antes había aquí un texto plantilla por categoría,
               desconectado de shortDescription, mostrada dos veces). */}
        {exp.shortDescription && (
          <Section icon={Compass} title="Así será">
            <p style={vibeText}>{exp.shortDescription}</p>
          </Section>
        )}

        {/* 4. IDEAL SI... — chips ligeros */}
        {idealChips.length > 0 && (
          <Section icon={UserCheck} title="Ideal si...">
            <div style={chipsRow}>
              {idealChips.map((tag, i) => (
                <span key={i} style={chip(color)}>
                  {capitalize(tag)}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* 5. QUÉ INCLUYE — una línea compacta, con detalle opcional */}
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

        {/* 6. TEN EN CUENTA — info práctica, compacta, ya filtrada por relevancia */}
        {decisionItems.length > 0 && (
          <Section icon={Info} title="Ten en cuenta">
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
  bajo: "Esfuerzo bajo",
  medio: "Esfuerzo medio",
  alto: "Esfuerzo alto",
}

// Etiquetas humanas para las claves de badges_visibles observadas en el
// Sheet en producción (16 filas publicadas, agosto 2026). Una clave nueva
// que no esté aquí no rompe nada: humanizeBadgeKey() da un fallback legible.
const BADGE_LABELS: Record<string, string> = {
  nivel_basico: "No necesitas experiencia",
  en_montana: "En la montaña",
  con_animales: "Con animales",
  parrilla: "Con parrillada",
  en_silencio: "En silencio",
  sin_pantallas: "Sin pantallas",
  traje_bano: "Trae traje de baño",
  glamping: "Domo de glamping",
  en_naturaleza: "En plena naturaleza",
  desconexion: "Desconexión",
  vista_montana: "Vista a la montaña",
  cabana: "Cabaña",
  chimenea: "Chimenea",
  cocina_colombiana: "Cocina colombiana",
  ingredientes_locales: "Ingredientes locales",
  menu_degustacion: "Menú degustación",
  maridaje: "Con maridaje",
  taller_practico: "Taller práctico",
  cata_chocolate: "Cata de chocolate",
  cata_cafe: "Cata de café",
  reposteria: "Repostería",
  degustacion: "Degustación",
  preparas_tu_plato: "Preparas tu propio plato",
  con_chef: "Con chef",
}

// Claves que duplican una info ya visible en otra sección de la fiche —
// mostrarlas también como highlight sería repetir, no aportar.
const EXCLUDED_BADGE_KEYS = new Set([
  "esfuerzo_alto",   // ya en Ten en cuenta (EFFORT_LABEL)
  "esfuerzo_medio",
  "esfuerzo_bajo",
  "al_aire_libre",   // ya en Ten en cuenta (ENVIRONMENT_LABEL)
  "interior",
  "equipo_incluido", // ya en Qué incluye
  "equipo_seguridad",
  "guia_incluido",
  "brunch",          // ya en el título
])

function humanizeBadgeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
}

function isRelevantNote(note?: string): note is string {
  if (!note) return false
  return !/^no (influye|aplica)/i.test(note.trim())
}

// Detecta, dentro de una frase, una exclusión dura (puede impedir elegir la
// experiencia) frente a una recomendación blanda. Heurística de texto, no un
// campo estructurado: requisitos/info_importante en el Sheet mezclan ambos
// tipos en una misma celda sin marcador de severidad (ej. escalada: "Tener
// buena condición física. No apto para personas con vértigo o problemas
// cardíacos." — una frase blanda y una dura, sin separador semántico).
const HARD_CONSTRAINT_RE = /no apto|mayor de \d+|licencia/i

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function extractConstraints(items: string[] = []): { hard: string[]; soft: string[] } {
  const hard: string[] = []
  const soft: string[] = []
  items.forEach((item) => {
    splitSentences(item).forEach((sentence) => {
      if (HARD_CONSTRAINT_RE.test(sentence)) hard.push(sentence)
      else soft.push(sentence)
    })
  })
  return { hard, soft }
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
  color: "#152F40",
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.25,
  color: "#152F40",
}

const subtitleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 15,
  fontWeight: 500,
  color: "#666",
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

/* Restricciones duras — tono cálido, no alarmante (nunca rojo: ver
   Anti_Patterns.md, "colores agresivos = tensión") */

const warnBlock: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 6,
}

const warnItem: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "flex-start",
  padding: "8px 12px",
  background: "#FFF6E5",
  border: "1px solid #F3DDAE",
  borderRadius: 12,
  fontSize: 13,
  lineHeight: 1.4,
  color: "#6B4B12",
  fontWeight: 600,
}

/* Highlights (badges_visibles) — tono neutro, no compite con la categoría
   ni con el aviso de restricciones. */

const highlightRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
}

const highlightPill: React.CSSProperties = {
  display: "inline-flex",
  padding: "5px 12px",
  borderRadius: 20,
  background: "#F3EFEA",
  color: "#444",
  fontSize: 13,
  fontWeight: 600,
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
  color: "#152F40",
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

/* Así será */

const vibeText: React.CSSProperties = {
  margin: 0,
  fontSize: 14.5,
  lineHeight: 1.55,
  color: "#444",
}

/* Qué incluye / Ten en cuenta (línea compacta) */

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

/* Ideal si... (chips) */

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
