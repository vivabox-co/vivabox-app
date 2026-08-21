"use client"

import { useState } from "react"
import {
  X,
  ChevronDown,
  Zap,
  Landmark,
  Leaf,
  Heart,
  Users,
  User,
  MapPin,
  Home,
  TreePine,
  Shuffle,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { Category, Format, ActivityKey } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { getActivityIcon } from "@/lib/map/getActivityIcon"
import { activityLabel } from "@/lib/map/activityLabels"
import { categoryLabel } from "@/lib/map/categoryLabels"

/* ================= TYPES ================= */

export type ActivityFilterGroup = {
  category: Category
  activities: ActivityKey[]
}

type Props = {
  open: boolean
  onClose: () => void
  resultCount: number
  onReset: () => void

  activityFilters: ActivityFilterGroup[]
  activeActivities: ActivityKey[]
  toggleActivity: (id: ActivityKey) => void

  cities?: string[]
  activeCities: string[]
  toggleCity: (c: string) => void

  activeFormats: Format[]
  toggleFormat: (f: Format) => void

  ambianceOptions?: string[]
  activeAmbiances?: string[]
  toggleAmbiance: (a: string) => void

  indoorState: "indoor" | "outdoor" | "any"
  setIndoorState: (v: "indoor" | "outdoor" | "any") => void
}

// Fallback si l'appelant ne calcule pas la liste depuis le catalogue réel
// (voir lib/product/buildAmbianceFilters.ts, utilisé sur /mapa).
const DEFAULT_AMBIANCE_OPTIONS = ["adrenalina", "cultural", "relax", "romántico", "social"]

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const AMBIANCE_ICONS: Record<string, LucideIcon> = {
  adrenalina: Zap,
  cultural: Landmark,
  relax: Leaf,
  romántico: Heart,
  social: Users,
}

const FORMAT_ICONS: Record<Format, LucideIcon> = {
  solo: User,
  duo: Users,
}

const INDOOR_ICONS: Record<"any" | "indoor" | "outdoor", LucideIcon> = {
  any: Shuffle,
  indoor: Home,
  outdoor: TreePine,
}

/* ================= COMPONENT ================= */

export default function FiltersDrawer({
  open,
  onClose,
  resultCount,
  onReset,
  activityFilters,
  activeActivities,
  toggleActivity,
  cities = [],
  activeCities,
  toggleCity,
  activeFormats,
  toggleFormat,
  ambianceOptions = DEFAULT_AMBIANCE_OPTIONS,
  activeAmbiances = [],
  toggleAmbiance,
  indoorState,
  setIndoorState,
}: Props) {
  if (!open) return null

  // activeFormats part de [solo, duo] (tout sélectionné = aucune
  // restriction, même convention que activeCategories côté carte) — contrairement
  // à activeActivities/activeCities/activeAmbiances où c'est le tableau vide qui
  // veut dire "aucune restriction". Ne compter les formats que s'ils diffèrent
  // de ce défaut, sinon le badge affiche "2" avant même que l'utilisateur touche
  // quoi que ce soit.
  const ALL_FORMATS_COUNT = 2
  const activeCount =
    activeActivities.length +
    activeCities.length +
    (activeFormats.length < ALL_FORMATS_COUNT ? activeFormats.length : 0) +
    activeAmbiances.length +
    (indoorState !== "any" ? 1 : 0)

  return (
    <>
      <Backdrop onClick={onClose} />

      <div style={drawerStyle}>
        <Header onClose={onClose} />

        {/* ================= CATEGORÍA ================= */}
        <MainSection title="Categoría">
          {activityFilters.map(group => (
            <CategorySubSection
              key={group.category}
              category={group.category}
              activities={group.activities}
              activeActivities={activeActivities}
            >
              {group.activities.map(act => (
                <ActivityChip
                  key={act}
                  active={activeActivities.includes(act)}
                  onClick={() => toggleActivity(act)}
                  icon={getActivityIcon(act)}
                  color={categoryColors[group.category]}
                >
                  {activityLabel(act)}
                </ActivityChip>
              ))}
            </CategorySubSection>
          ))}
        </MainSection>

        <MainSection title="Estilo">
          {ambianceOptions.map(a => (
            <Chip key={a} active={activeAmbiances.includes(a)} onClick={() => toggleAmbiance(a)} icon={AMBIANCE_ICONS[a] ?? Sparkles}>
              {capitalize(a)}
            </Chip>
          ))}
        </MainSection>

        <MainSection title="Personas">
          {(["solo","duo"] as Format[]).map(f => (
            <Chip key={f} active={activeFormats.includes(f)} onClick={() => toggleFormat(f)} icon={FORMAT_ICONS[f]}>
              {f === "solo" ? "Para uno" : "Para dos"}
            </Chip>
          ))}
        </MainSection>

        <MainSection title="Ciudad">
          {cities.map(city => (
            <Chip key={city} active={activeCities.includes(city)} onClick={() => toggleCity(city)} icon={MapPin}>
              {city}
            </Chip>
          ))}
        </MainSection>

        <MainSection title="Ambiente">
          {(["any","indoor","outdoor"] as const).map(v => (
            <Chip key={v} active={indoorState === v} onClick={() => setIndoorState(v)} icon={INDOOR_ICONS[v]}>
              {v === "any" ? "Indiferente" : v === "indoor" ? "Bajo techo" : "Al aire libre"}
            </Chip>
          ))}
        </MainSection>

        <Footer resultCount={resultCount} activeCount={activeCount} onReset={onReset} onClose={onClose} />
      </div>
    </>
  )
}

/* ================= CATEGORY LOGIC ================= */

// Le header de catégorie n'est plus un toggle de filtre : c'est un simple
// en-tête qui déplie la liste d'activités. L'inclusion/exclusion d'une
// catégorie entière reste gérée par la légende en haut de la carte
// (activeCategories) — avoir un deuxième contrôle ici, sur un état
// différent (activeActivities), créait un filtre "tout ou rien" qui
// écrasait silencieusement les autres catégories. Voir filterExperiences.ts :
// le filtre d'activité ne restreint désormais que la catégorie où
// l'utilisateur a explicitement choisi des activités.
function CategorySubSection({
  category,
  activities,
  activeActivities,
  children
}: {
  category: Category
  activities: ActivityKey[]
  activeActivities: ActivityKey[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const color = categoryColors[category]
  const selectedCount = activities.filter(a => activeActivities.includes(a)).length

  return (
    <div style={{ width: "100%", marginBottom: 10 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...mainBtnStyle,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <span>
          <span style={{ color }}>{categoryLabel(category)}</span>
          {selectedCount > 0 && (
            <span style={{ marginLeft: 6, fontWeight: 600, opacity: 0.7 }}>
              · {selectedCount}
            </span>
          )}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}>
          Ver actividades
          <ChevronDown
            size={16}
            style={{ transition: "transform 0.15s ease", transform: open ? "rotate(180deg)" : "none" }}
          />
        </span>
      </button>

      {open && <div style={sectionBox}>{children}</div>}
    </div>
  )
}

/* ================= UI ================= */

const drawerStyle: React.CSSProperties = {
  position: "fixed",
  top: 10,
  left: 10,
  bottom: 10,
  width: "calc(82% - 10px)",
  background: "#fff",
  zIndex: 1500,
  padding: 20,
  overflowY: "auto",
  borderRadius: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
}

function Backdrop({ onClick }: { onClick: () => void }) {
  return <div onClick={onClick} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", backdropFilter: "blur(3px)", zIndex: 1400 }} />
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
      <h2 style={{ margin: 0 }}>Filtros</h2>
      <button onClick={onClose} style={{ background: "none", border: "none" }}>
        <X size={22} />
      </button>
    </div>
  )
}

function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => setOpen(!open)} style={mainBtnStyle}>
        {title}
        <ChevronDown
          size={18}
          style={{ transition: "transform 0.15s ease", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      {open && <div style={sectionBox}>{children}</div>}
    </div>
  )
}

const mainBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #E4D5C3",
  background: "#fff",
  color: "#5c4a36",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: 700,
  fontSize: 15,
}

const sectionBox: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 14,
  background: "#fff",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
}

function ActivityChip({ children, active, onClick, icon, iconAlt, color }: any) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: 20,
      border: active ? `2px solid ${color}` : "1px solid #E4D5C3",
      background: active ? color : "#fff",
      color: active ? "#fff" : "#5c4a36",
    }}>
      <img src={icon} alt="" width={18} height={18} />
      {children}
    </button>
  )
}

function Chip({ children, active, onClick, icon: Icon }: any) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: 20,
      border: active ? "2px solid #111" : "1px solid #E4D5C3",
      background: active ? "#111" : "#fff",
      color: active ? "#fff" : "#5c4a36",
    }}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

function Footer({ resultCount, activeCount, onReset, onClose }: any) {
  return (
    <div style={footerWrap}>
      {activeCount > 0 && <div style={{ fontSize: 13 }}>Filtros activos: <strong>{activeCount}</strong></div>}
      <button onClick={onReset} style={resetBtn}>Limpiar filtros</button>
      <button onClick={onClose} style={ctaBtn}>Mostrar {resultCount} experiencias</button>
    </div>
  )
}

const footerWrap: React.CSSProperties = {
  position: "sticky",
  bottom: 0,
  marginTop: 30,
  padding: "18px 0 10px",
  background: "linear-gradient(to top, #fff 85%, rgba(255,255,255,0))",
  display: "flex",
  flexDirection: "column",
  gap: 10,
}

const resetBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 14,
  border: "1px solid #E4D5C3",
  background: "#fff",
  color: "#5c4a36",
  fontWeight: 600,
}

const ctaBtn: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  borderRadius: 16,
  border: "none",
  background: "#152F40",
  color: "#fff",
  fontWeight: 700,
}
