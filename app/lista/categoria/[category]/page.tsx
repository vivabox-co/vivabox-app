"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Experience, Category } from "@/lib/data/types"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import BottomSheet from "@/components/ui/BottomSheet"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import { useUI } from "@/components/ui/UIContext"
import { ArrowLeft } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

export default function CategoryPage() {
  const params = useParams()
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category
  const category = categoryParam as Category

  const router = useRouter()
  const { selectedExperience, setSelectedExperience, drawerOpen, setDrawerOpen } = useUI()

  const [experiences, setExperiences] = useState<Experience[]>([])

  /* ---------- FILTER STATE ---------- */
  const [formatFilter, setFormatFilter] = useState<"all" | "solo" | "duo" | "familia">("all")
  const [durationFilter, setDurationFilter] = useState<"all" | "corta" | "larga">("all")
  const [indoorFilter, setIndoorFilter] = useState<"all" | "indoor" | "outdoor">("all")
  const [sortBy, setSortBy] = useState<"popular" | "shortest">("popular")

  useEffect(() => { fetchExperiences().then(setExperiences) }, [])

  const filtered = useMemo(() => {
    let list = experiences.filter(e => e.category === category)

    if (formatFilter !== "all") list = list.filter(e => e.format === formatFilter)
    if (durationFilter !== "all") list = list.filter(e => e.durationType === durationFilter)
    if (indoorFilter !== "all") list = list.filter(e => e.environment === indoorFilter)

    // tri simple basé sur type durée
    if (sortBy === "shortest") {
      const order = { corta: 1, media: 2, larga: 3 }
      list = [...list].sort((a, b) =>
        (order[a.durationType || "media"] ?? 2) -
        (order[b.durationType || "media"] ?? 2)
      )
    }

    return list
  }, [experiences, category, formatFilter, durationFilter, indoorFilter, sortBy])

  function selectExperience(exp: Experience) {
    setSelectedExperience(exp)
    setDrawerOpen(true)
  }

  return (
    <>
      <div style={{ paddingBottom: 120 }}>

        {/* HEADER */}
        <div style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 1000,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #eee"
        }}>
          <ArrowLeft onClick={() => router.back()} style={{ cursor: "pointer" }} />
          <div style={{
            width: 6,
            height: 22,
            borderRadius: 4,
            background: categoryColors[category]
          }} />
          <h1 style={{ fontSize: 20, fontWeight: 650 }}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h1>
        </div>

        {/* FILTER BAR */}
        <div style={{ display: "flex", gap: 10, padding: "12px 16px", overflowX: "auto" }}>
          <FilterChip label="Para uno" active={formatFilter === "solo"} onClick={() => setFormatFilter(formatFilter === "solo" ? "all" : "solo")} />
          <FilterChip label="Para dos" active={formatFilter === "duo"} onClick={() => setFormatFilter(formatFilter === "duo" ? "all" : "duo")} />
          <FilterChip label="Corto" active={durationFilter === "corta"} onClick={() => setDurationFilter(durationFilter === "corta" ? "all" : "corta")} />
          <FilterChip label="Largo" active={durationFilter === "larga"} onClick={() => setDurationFilter(durationFilter === "larga" ? "all" : "larga")} />
          <FilterChip label="Interior" active={indoorFilter === "indoor"} onClick={() => setIndoorFilter(indoorFilter === "indoor" ? "all" : "indoor")} />
          <FilterChip label="Exterior" active={indoorFilter === "outdoor"} onClick={() => setIndoorFilter(indoorFilter === "outdoor" ? "all" : "outdoor")} />
          <FilterChip label="Más corto" active={sortBy === "shortest"} onClick={() => setSortBy(sortBy === "shortest" ? "popular" : "shortest")} />
        </div>

        {/* LIST */}
        <div style={{ padding: "16px" }}>
          {filtered.map(exp => (
            <CategoryCard key={exp.id} exp={exp} onClick={() => selectExperience(exp)} />
          ))}
        </div>
      </div>

      <BottomSheet open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selectedExperience && (
          <ExperienceExploreMeta
            exp={selectedExperience}
            onChoose={() => {
              setDrawerOpen(false)
              router.push("/reservar/fechas")
            }}
          />
        )}
      </BottomSheet>
    </>
  )
}

/* ---------- CHIP ---------- */
function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      padding: "8px 14px",
      borderRadius: 20,
      fontSize: 14,
      fontWeight: 500,
      whiteSpace: "nowrap",
      cursor: "pointer",
      background: active ? "#111" : "#f3f3f3",
      color: active ? "#fff" : "#333",
      transition: "all .2s"
    }}>
      {label}
    </div>
  )
}

/* ---------- CARD ---------- */
function CategoryCard({ exp, onClick }: { exp: Experience; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: "flex",
      gap: 14,
      marginBottom: 20,
      cursor: "pointer"
    }}>
      <img src={exp.image} style={{
        width: 120,
        height: 120,
        borderRadius: 14,
        objectFit: "cover"
      }} />

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{exp.title}</div>
        <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>
          {exp.duration} · {exp.format}
        </div>
        <div style={{ fontSize: 14, marginTop: 8, fontWeight: 500 }}>
          Disponible para reservar
        </div>
      </div>
    </div>
  )
}
