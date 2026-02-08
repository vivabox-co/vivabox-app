"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Category, Format, ActivityKey } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { getActivityIcon } from "@/lib/map/getActivityIcon"

type ActivityFilterGroup = {
  category: Category
  activities: ActivityKey[]
}

type Props = {
  open: boolean
  onClose: () => void
  resultCount: number
  onReset: () => void

  activityFilters: ActivityFilterGroup[]   // 🔥 dynamic from sheet
  activeActivities: ActivityKey[]
  toggleActivity: (id: ActivityKey) => void

  cities?: string[]
  activeCities: string[]
  toggleCity: (c: string) => void

  activeCategories: Category[]
  toggleCategory: (c: Category) => void

  activeFormats: Format[]
  toggleFormat: (f: Format) => void

  activeAmbiances?: string[]
  toggleAmbiance: (a: string) => void

  indoorState: "indoor" | "outdoor" | "any"
  setIndoorState: (v: "indoor" | "outdoor" | "any") => void
}

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
  activeCategories,
  toggleCategory,
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
        {/* HEADER */}
        <Header onClose={onClose} />

        {/* 🎯 ACTIVITIES BY CATEGORY */}
        {activityFilters.map(group => (
          <Section
            key={group.category}
            title={categoryLabel(group.category)}
            color={categoryColors[group.category]}
            defaultOpen
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
          </Section>
        ))}

        {/* OTHER FILTERS */}
        <Section title="Estilo" color="#666">
          {["relax","adrenalina","romántico","social"].map(a => (
            <Chip key={a} active={activeAmbiances.includes(a)} onClick={() => toggleAmbiance(a)}>
              {a}
            </Chip>
          ))}
        </Section>

        <Section title="Personas" color="#666">
          {(["solo","duo","familia"] as Format[]).map(f => (
            <Chip key={f} active={activeFormats.includes(f)} onClick={() => toggleFormat(f)}>
              {f === "solo" ? "Para uno" : f === "duo" ? "Para dos" : "En familia"}
            </Chip>
          ))}
        </Section>

        <Section title="Ciudad" color="#666">
          {cities.map(city => (
            <Chip key={city} active={activeCities.includes(city)} onClick={() => toggleCity(city)}>
              {city}
            </Chip>
          ))}
        </Section>

        <Section title="Ambiente" color="#666">
          {["any","indoor","outdoor"].map(v => (
            <Chip key={v} active={indoorState === v} onClick={() => setIndoorState(v as any)}>
              {v === "any" ? "Indiferente" : v === "indoor" ? "Bajo techo" : "Al aire libre"}
            </Chip>
          ))}
        </Section>

        <Footer
          resultCount={resultCount}
          activeCount={activeCount}
          onReset={onReset}
          onClose={onClose}
        />
      </div>
    </>
  )
}

/* ================= UI ================= */

const drawerStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "82%",
  height: "100%",
  background: "#fff",
  zIndex: 1500,
  padding: 20,
  overflowY: "auto" as const,
  boxShadow: "8px 0 40px rgba(0,0,0,0.25)",
}

function Backdrop({ onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.15)",
        backdropFilter: "blur(3px)",
        zIndex: 1400,
      }}
    />
  )
}

function Header({ onClose }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h2 style={{ margin: 0 }}>Filtros</h2>
      <button onClick={onClose} style={{ border: "none", background: "none" }}>
        <X size={22} />
      </button>
    </div>
  )
}

function Section({ title, children, color, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ marginTop: 22 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          fontSize: 15,
          fontWeight: 700,
          color,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          padding: "6px 0",
          cursor: "pointer",
        }}
      >
        {title}
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{children}</div>}
    </div>
  )
}

function Chip({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 20,
        border: active ? "2px solid #111" : "1px solid #ddd",
        background: active ? "#111" : "#f2f2f2",
        color: active ? "#fff" : "#333",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {children}
    </button>
  )
}

function ActivityChip({ children, active, onClick, icon, color }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 22,
        border: active ? `2px solid ${color}` : "1px solid #ddd",
        background: active ? color : "#f2f2f2",
        color: active ? "#fff" : "#333",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      <img src={icon} width={18} height={18} />
      {children}
    </button>
  )
}

function Footer({ resultCount, activeCount, onReset, onClose }: any) {
  return (
    <div style={{ position: "sticky", bottom: 0, background: "#fff", paddingTop: 20, marginTop: 30 }}>
      {activeCount > 0 && (
        <div style={{ fontSize: 13, marginBottom: 10 }}>Filtros activos: {activeCount}</div>
      )}
      <button onClick={onReset} style={{ width: "100%", padding: 12, marginBottom: 10 }}>
        Limpiar filtros
      </button>
      <button onClick={onClose} style={{ width: "100%", padding: 14, background: "#111", color: "#fff" }}>
        Mostrar {resultCount} experiencias
      </button>
    </div>
  )
}

/* ================= HELPERS ================= */

function categoryLabel(cat: Category) {
  return {
    gastro: "Gastronomía",
    bienestar: "Bienestar",
    aventura: "Aventura",
    cultura: "Cultura",
    estancias: "Estancias",
  }[cat]
}

function formatActivityLabel(key: string) {
  return key.replace(/_/g, " ")
}
