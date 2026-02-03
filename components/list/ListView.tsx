"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { Experience } from "@/lib/data/types"
import CategoryFilters from "@/components/map/CategoryFilters"
import FormatFilters from "@/components/map/FormatFilters"
import { useUI } from "@/components/ui/UIContext"
import { Heart } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

type Props = {
  onSelect: (exp: Experience) => void
}

export default function ListView({ onSelect }: Props) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [activeCategories, setActiveCategories] = useState<string[]>([
    "gastro", "bienestar", "aventura", "cultura", "estancias",
  ])
  const [activeFormats, setActiveFormats] = useState<("solo" | "duo")[]>([
    "solo", "duo",
  ])

  const { favorites, toggleFavorite } = useUI()

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  function toggleCategory(key: string) {
    setActiveCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function toggleFormat(format: "solo" | "duo") {
    setActiveFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    )
  }

  const filtered = useMemo(() => {
    const sorted = experiences
      .filter(exp =>
        activeCategories.includes(exp.category) &&
        activeFormats.includes(exp.format)
      )
      .sort((a, b) => a.title.localeCompare(b.title))

    const groups: Record<string, Experience[]> = {}
    sorted.forEach(exp => {
      if (!groups[exp.category]) groups[exp.category] = []
      groups[exp.category].push(exp)
    })

    const result: Experience[] = []
    const cats = Object.keys(groups)
    let remaining = true

    while (remaining) {
      remaining = false
      for (const c of cats) {
        if (groups[c]?.length) {
          result.push(groups[c].shift()!)
          remaining = true
        }
      }
    }

    return result
  }, [experiences, activeCategories, activeFormats])

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* FILTRES */}
      <div style={{
        position: "sticky",
        top: 0,
        background: "#fff",
        padding: "12px 12px 8px",
        zIndex: 10,
      }}>
        <CategoryFilters active={activeCategories} onToggle={toggleCategory} />
        <div style={{ marginTop: 8 }}>
          <FormatFilters active={activeFormats} onToggle={toggleFormat} />
        </div>
      </div>

      {/* LISTE */}
      <div style={{ padding: "0 12px" }}>
        {filtered.map(exp => {
          const isFav = favorites.includes(exp.id)

          return (
            <div
              key={exp.id}
              onClick={() => onSelect(exp)}
              style={{
                display: "flex",
                marginBottom: 10,
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {/* Bande catégorie */}
              <div style={{
                width: 6,
                background: categoryColors[exp.category],
              }} />

              {/* IMAGE */}
              <img
                src={exp.image || "/images/placeholder.jpg"}
                alt={exp.title}
                style={{
                  width: 160,
                  height: 160,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />

              {/* CONTENU */}
              <div style={{
                flex: 1,
                padding: "14px 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                {/* TITRE */}
                <strong style={{
                  fontSize: 18,
                  lineHeight: 1.25,
                }}>
                  {exp.title}
                </strong>

                {/* ZONE */}
                <div style={{ fontSize: 15, opacity: 0.6 }}>
                  {exp.zone}
                </div>

                {/* LIGNE BAS (format + coeur) */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 6,
                }}>
                  <div style={{ fontSize: 15 }}>
                    {exp.format === "duo" ? "Para dos" : "Para uno"}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(exp.id)
                    }}
                    style={{ background: "none", border: "none" }}
                  >
                    <Heart
                      size={22}
                      strokeWidth={2}
                      color={isFav ? "#ff4d8d" : "#bbb"}
                      fill={isFav ? "#ff4d8d" : "none"}
                    />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
