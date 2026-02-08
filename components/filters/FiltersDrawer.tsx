"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Category, Format, ActivityKey } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { getActivityIcon } from "@/lib/map/getActivityIcon"

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
  setActiveActivities: (v: ActivityKey[]) => void
  toggleActivity: (id: ActivityKey) => void

  cities?: string[]
  activeCities: string[]
  toggleCity: (c: string) => void

  activeFormats: Format[]
  toggleFormat: (f: Format) => void

  activeAmbiances?: string[]
  toggleAmbiance: (a: string) => void

  indoorState: "indoor" | "outdoor" | "any"
  setIndoorState: (v: "indoor" | "outdoor" | "any") => void
}

/* ================= COMPONENT ================= */

export default function FiltersDrawer({
  open,
  onClose,
  resultCount,
  onReset,
  activityFilters,
  activeActivities,
  setActiveActivities,
  toggleActivity,
  cities = [],
  activeCities,
  toggleCity,
  activeFormats,
  toggleFormat,
  activeAmbiances = [],
  toggleAmbiance,
  indoorState,
  setIndoorState,
}: Props) {
  if (!open) return null

  const activeCount =
    activeActivities.length +
    activeCities.length +
    activeFormats.length +
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
              setActiveActivities={setActiveActivities}
            >
              {group.activities.map(act => (
                <ActivityChip
                  key={act}
                  active={activeActivities.includes(act)}
                  onClick={() => toggleActivity(act)}
                  icon={getActivityIcon(act)}
                  color={categoryColors[group.category]}
                >
                  {formatActivityLabel(act)}
                </ActivityChip>
              ))}
            </CategorySubSection>
          ))}
        </MainSection>

        <MainSection title="Estilo">
          {["relax","adrenalina","romántico","social"].map(a => (
            <Chip key={a} active={activeAmbiances.includes(a)} onClick={() => toggleAmbiance(a)}>
              {a}
            </Chip>
          ))}
        </MainSection>

        <MainSection title="Personas">
          {(["solo","duo","familia"] as Format[]).map(f => (
            <Chip key={f} active={activeFormats.includes(f)} onClick={() => toggleFormat(f)}>
              {f === "solo" ? "Para uno" : f === "duo" ? "Para dos" : "En familia"}
            </Chip>
          ))}
        </MainSection>

        <MainSection title="Ciudad">
          {cities.map(city => (
            <Chip key={city} active={activeCities.includes(city)} onClick={() => toggleCity(city)}>
              {city}
            </Chip>
          ))}
        </MainSection>

        <MainSection title="Ambiente">
          {(["any","indoor","outdoor"] as const).map(v => (
            <Chip key={v} active={indoorState === v} onClick={() => setIndoorState(v)}>
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

function CategorySubSection({
  category,
  activities,
  activeActivities,
  setActiveActivities,
  children
}: {
  category: Category
  activities: ActivityKey[]
  activeActivities: ActivityKey[]
  setActiveActivities: (v: ActivityKey[]) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const color = categoryColors[category]

  const allActive = activities.every(a => activeActivities.includes(a))
  const someActive = activities.some(a => activeActivities.includes(a))

  function toggleCategory() {
    if (allActive) {
      setActiveActivities(activeActivities.filter(a => !activities.includes(a)))
    } else {
      setActiveActivities(Array.from(new Set([...activeActivities, ...activities])))
    }
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={toggleCategory}
        style={{
          ...mainBtnStyle,
          background: allActive ? color : someActive ? `${color}22` : "#F8F8F8",
          border: `1px solid ${color}33`,
          color: allActive ? "#fff" : color,
        }}
      >
        {categoryLabel(category)}
        <span>{allActive ? "✓" : someActive ? "•" : "+"}</span>
      </button>

      <button onClick={() => setOpen(!open)} style={{ fontSize: 12, color: "#777", background:"none", border:"none", margin:"6px 4px" }}>
        {open ? "Ocultar actividades" : "Ver actividades"}
      </button>

      {open && <div style={sectionBox}>{children}</div>}
    </div>
  )
}

/* ================= UI ================= */

const drawerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "82%",
  height: "100%",
  background: "#fff",
  zIndex: 1500,
  padding: 20,
  overflowY: "auto",
  boxShadow: "8px 0 40px rgba(0,0,0,0.25)",
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
        <span style={{ fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={sectionBox}>{children}</div>}
    </div>
  )
}

const mainBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #E5E5E5",
  background: "#F8F8F8",
  display: "flex",
  justifyContent: "space-between",
  fontWeight: 700,
  fontSize: 15,
}

const sectionBox: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 14,
  background: "#FAFAFA",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
}

function ActivityChip({ children, active, onClick, icon, color }: any) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: 20,
      border: active ? `2px solid ${color}` : "1px solid #ddd",
      background: active ? color : "#f2f2f2",
      color: active ? "#fff" : "#333",
    }}>
      <img src={icon} width={18} height={18} />
      {children}
    </button>
  )
}

function Chip({ children, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 20,
      border: active ? "2px solid #111" : "1px solid #ddd",
      background: active ? "#111" : "#f2f2f2",
      color: active ? "#fff" : "#333",
    }}>
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
  border: "1px solid #E2E2E2",
  background: "#F6F6F6",
  fontWeight: 600,
}

const ctaBtn: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  borderRadius: 16,
  border: "none",
  background: "#111",
  color: "#fff",
  fontWeight: 700,
}

function categoryLabel(cat: Category) {
  return { gastro:"Gastronomía", bienestar:"Bienestar", aventura:"Aventura", cultura:"Cultura", estancias:"Estancias" }[cat]
}

function formatActivityLabel(key: ActivityKey) {
  return key.replace(/_/g," ")
}
