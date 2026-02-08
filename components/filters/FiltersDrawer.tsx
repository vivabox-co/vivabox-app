"use client"

import { X } from "lucide-react"
import { Category, Format } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"

type Props = {
  open: boolean
  onClose: () => void

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

  return (
    <>
      {/* BACKDROP BLUR 5% */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(3px)",
          zIndex: 1400,
        }}
      />

      {/* DRAWER 80% */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "80%",
          height: "100%",
          background: "#fff",
          zIndex: 1500,
          padding: 20,
          overflowY: "auto",
          boxShadow: "8px 0 40px rgba(0,0,0,0.25)",
          animation: "slideIn 0.28s ease-out",
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Filtros</h2>
          <button onClick={onClose} style={{ border: "none", background: "none" }}>
            <X size={22} />
          </button>
        </div>

        {/* CIUDAD */}
        <Section title="Ciudad">
          {cities.map(city => (
            <Chip key={city} active={activeCities.includes(city)} onClick={() => toggleCity(city)}>
              {city}
            </Chip>
          ))}
        </Section>

        {/* CATEGORÍA */}
        <Section title="Categoría">
          {activeCategories.map(() => null)}
          {(["gastro","bienestar","aventura","cultura","estancias"] as Category[]).map(cat => (
            <Chip
              key={cat}
              active={activeCategories.includes(cat)}
              onClick={() => toggleCategory(cat)}
              color={categoryColors[cat]}
            >
              {cat}
            </Chip>
          ))}
        </Section>

        {/* FORMATO */}
        <Section title="Formato">
          {(["solo","duo","familia"] as Format[]).map(f => (
            <Chip key={f} active={activeFormats.includes(f)} onClick={() => toggleFormat(f)}>
              {f}
            </Chip>
          ))}
        </Section>

        {/* AMBIENTE */}
        <Section title="Ambiente">
          {["relax","adrenalina","romántico","social"].map(a => (
            <Chip key={a} active={activeAmbiances.includes(a)} onClick={() => toggleAmbiance(a)}>
              {a}
            </Chip>
          ))}
        </Section>

        {/* INDOOR OUTDOOR */}
        <Section title="Indoor / Outdoor">
          {["any","indoor","outdoor"].map(v => (
            <Chip key={v} active={indoorState === v} onClick={() => setIndoorState(v as any)}>
              {v}
            </Chip>
          ))}
        </Section>
      </div>
    </>
  )
}

/* ---------- UI PARTS ---------- */

function Section({ title, children }: any) {
  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  )
}

function Chip({ children, active, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 20,
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        background: active ? color || "#111" : "#f1f1f1",
        color: active ? "white" : "#333",
      }}
    >
      {children}
    </button>
  )
}
