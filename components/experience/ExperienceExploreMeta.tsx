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

  // claves_eleccion trae hasta 3 claves curadas por fila (regla editorial
  // desde el 23/08/2026: solo lo que puede influir en la decisión, vacío si
  // no hay nada que valga la pena). El filtro EXCLUDED_BADGE_KEYS se
  // mantiene pese a la curación editorial: aunque el editor elija esa clave
  // a propósito, seguiría siendo una repetición visual de lo que ya se
  // muestra en Ten en cuenta / Qué incluye — el filtro protege el layout,
  // no la intención del editor. Máximo 2, nunca las 3 mecánicamente.
  const highlightBadges = (exp.badges || [])
    .filter((key) => !EXCLUDED_BADGE_KEYS.has(key))
    .map((key) => BADGE_LABELS[key] || humanizeBadgeKey(key))
    .slice(0, 2)

  // Si claves_eleccion tenía contenido pero todo terminó filtrado, puede ser
  // intencional (nada diferenciador para esta experiencia) o una fila que
  // aún no fue re-curada tras el cambio de regla editorial — el código no
  // puede distinguir los dos casos. Este warning ayuda en QA a detectar
  // filas a revisar, sin cambiar nada en la interfaz.
  if (process.env.NODE_ENV !== "production" && (exp.badges?.length ?? 0) > 0 && highlightBadges.length === 0) {
    console.warn(`⚠️ ${exp.id}: claves_eleccion (${exp.badges!.join("|")}) entièrement filtrée → 0 highlight affiché`)
  }

  // "Entorno y esfuerzo": datos estructurados (no texto libre), mostrados
  // como pastillas cortas separadas del resto — no tiene sentido mezclarlos
  // en la misma frase que una nota de clima de una línea completa.
  const factPills = [
    exp.environment && ENVIRONMENT_LABEL[exp.environment],
    exp.effortLevel && EFFORT_LABEL[exp.effortLevel],
  ].filter(Boolean) as string[]

  // "Antes de elegir": notas prácticas en texto libre, traducidas a lenguaje
  // humano. El Sheet usa la convención "Influye: ..." / "No influye[: motivo]"
  // en nota_clima y nota_vestimenta. Un "No influye" es una nota real (alguien
  // lo verificó), pero no debe llegar al beneficiario: no cambia su decisión,
  // es el mismo ruido que un "no aplica". Cuando SÍ influye, el prefijo
  // "Influye:" es solo la marca editorial para el filtro — nunca debe
  // imprimirse tal cual (stripInfluencePrefix lo quita antes de mostrar).
  const rawDecisionItems: string[] = []
  if (isRelevantNote(exp.weatherNote)) rawDecisionItems.push(stripInfluencePrefix(exp.weatherNote!))
  if (isRelevantNote(exp.clothingNote)) rawDecisionItems.push(stripInfluencePrefix(exp.clothingNote!))
  rawDecisionItems.push(...softRequirements)
  rawDecisionItems.push(...softImportant)

  // requisitos/info_importante y nota_clima/nota_vestimenta no se coordinan
  // entre sí en el Sheet: es común que la misma recomendación ("llevar ropa
  // abrigada") quede escrita dos veces con palabras distintas en dos
  // columnas. dedupeSimilar compara por solapamiento de palabras (no texto
  // exacto) para no repetir el mismo consejo dos veces en la ficha.
  const decisionItems = dedupeSimilar(rawDecisionItems)

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

        {/* 1ter. HIGHLIGHTS — hasta 2 claves de claves_eleccion, ya
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

        {/* 6. TEN EN CUENTA — datos estructurados (pastillas) separados de las
               notas en texto libre (lista apilada), ya deduplicadas. */}
        {(factPills.length > 0 || decisionItems.length > 0) && (
          <Section icon={Info} title="Ten en cuenta">
            {factPills.length > 0 && (
              <div style={{ ...chipsRow, marginBottom: decisionItems.length > 0 ? 10 : 0 }}>
                {factPills.map((label, i) => (
                  <span key={i} style={factPill}>
                    {label}
                  </span>
                ))}
              </div>
            )}
            {decisionItems.length > 0 && (
              <CompactList
                items={decisionItems}
                visibleCount={3}
                moreLabel="Ver información +"
                lessLabel="Ver menos −"
                color={color}
                layout="stacked"
              />
            )}
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
  layout = "inline",
}: {
  items: string[]
  visibleCount: number
  moreLabel: string
  lessLabel: string
  color: string
  // "inline": ítems cortos y homogéneos (ej. Qué incluye) → una sola frase
  // unida por "·". "stacked": ítems de largo dispar, una frase por línea —
  // necesario en Ten en cuenta, donde una pastilla de 2 palabras y una nota
  // completa no deben leerse como parte de la misma oración.
  layout?: "inline" | "stacked"
}) {
  const [expanded, setExpanded] = useState(false)

  if (items.length === 0) return null

  const visible = items.slice(0, visibleCount)
  const rest = items.slice(visibleCount)

  return (
    <>
      {layout === "stacked" ? (
        visible.map((item, i) => (
          <p key={i} style={compactLine}>
            • {item}
          </p>
        ))
      ) : (
        <p style={compactLine}>{visible.join(" · ")}</p>
      )}
      {expanded && rest.length > 0 && (
        layout === "stacked" ? (
          rest.map((item, i) => (
            <p key={i} style={compactLineMuted}>
              • {item}
            </p>
          ))
        ) : (
          <p style={compactLineMuted}>{rest.join(" · ")}</p>
        )
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

// Etiquetas humanas para las claves de claves_eleccion observadas en el
// Sheet en producción (16 filas publicadas, agosto 2026). Desde el
// 23/08/2026 la columna acepta también texto libre para un detalle puntual
// que no merece una clave permanente aquí (ej. "2 bebidas") — ese texto cae
// en el mismo fallback humanizeBadgeKey() que una clave todavía no
// registrada, y no rompe nada en ninguno de los dos casos.
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

// Fallback para una clave sin entrada en BADGE_LABELS: puede ser una clave
// snake_case todavía no registrada ("vista_al_lago" → "Vista al lago") o
// texto libre ya escrito en lenguaje humano ("2 bebidas" queda igual, solo
// se capitaliza la primera letra si hace falta).
function humanizeBadgeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
}

function isRelevantNote(note?: string): note is string {
  if (!note) return false
  return !/^no (influye|aplica)/i.test(note.trim())
}

// Quita el prefijo editorial "Influye: " (marca interna del Sheet para que
// isRelevantNote pueda filtrar) — no es lenguaje para el beneficiario.
function stripInfluencePrefix(note: string): string {
  return note.replace(/^\s*influye\s*:?\s*/i, "").trim()
}

const DEDUPE_STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "para", "al", "en", "con", "y", "o",
  "un", "una", "que", "se", "es", "si", "hay", "por", "del", "su", "tu",
  "lo", "más", "muy", "no", "sin", "llevar", "traer",
])

function wordsForCompare(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
  return new Set(
    normalized.split(/\s+/).filter((w) => w && !DEDUPE_STOPWORDS.has(w))
  )
}

function wordOverlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let common = 0
  a.forEach((w) => {
    if (b.has(w)) common++
  })
  return common / Math.min(a.size, b.size)
}

// requisitos/info_importante y nota_clima/nota_vestimenta se escriben en el
// Sheet sin coordinarse entre sí — la misma recomendación puede quedar
// redactada dos veces con palabras distintas. Se compara por solapamiento
// de palabras (no texto exacto) y se conserva la primera aparición: el
// orden ya prioriza nota_clima/nota_vestimenta (columnas dedicadas) sobre
// requisitos/info_importante (texto libre general).
const DEDUPE_SIMILARITY_THRESHOLD = 0.6

function dedupeSimilar(items: string[]): string[] {
  const kept: { text: string; words: Set<string> }[] = []
  items.forEach((item) => {
    const words = wordsForCompare(item)
    const isDuplicate = kept.some(
      (k) => wordOverlapRatio(k.words, words) >= DEDUPE_SIMILARITY_THRESHOLD
    )
    if (!isDuplicate) kept.push({ text: item, words })
  })
  return kept.map((k) => k.text)
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

/* Highlights (claves_eleccion) — tono neutro, no compite con la categoría
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

/* Ten en cuenta — pastillas de datos estructurados (entorno/esfuerzo) */

const factPill: React.CSSProperties = {
  display: "inline-flex",
  padding: "4px 11px",
  borderRadius: 20,
  background: "#F3EFEA",
  color: "#444",
  fontSize: 12.5,
  fontWeight: 600,
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
