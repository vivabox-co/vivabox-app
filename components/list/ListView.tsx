"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { Experience, Category, Format } from "@/lib/data/types"
import { useUI } from "@/components/ui/UIContext"
import { Heart } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

type Props = {
  onSelect: (exp: Experience) => void
  activeCategories: Category[]
  activeFormats: Format[]
  activeCities: string[]
  activeAmbiances: string[]
  indoorState: "indoor" | "outdoor" | "any"
  searchQuery: string   // 🔥 vient maintenant du haut (ListaPage)
}

export default function ListView({
  onSelect,
  activeCategories,
  activeFormats,
  activeCities = [],
  activeAmbiances = [],
  indoorState = "any",
  searchQuery,
}: Props) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const { favorites, toggleFavorite } = useUI()

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  const query = searchQuery.toLowerCase().trim()

  /* 🔥 MOTEUR FILTRAGE UNIQUE VIVABOX */
  const filtered = useMemo(() => {
    return experiences.filter((exp) => {
      if (!activeCategories.includes(exp.category)) return false
      if (!activeFormats.includes(exp.format)) return false
      if (activeCities.length && !activeCities.includes(exp.zone)) return false
      if (activeAmbiances.length && !exp.ambiance?.some(a => activeAmbiances.includes(a))) return false
      if (indoorState !== "any" && exp.environment !== indoorState) return false

      if (query) {
        const haystack =
          `${exp.title} ${exp.zone} ${exp.shortDescription ?? ""} ${exp.vivanote ?? ""}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }

      return true
    })
  }, [experiences, activeCategories, activeFormats, activeCities, activeAmbiances, indoorState, query])

  /* 🔁 Alternance catégories Vivabox */
  const ordered = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    const groups: Record<string, Experience[]> = {}

    sorted.forEach((exp) => {
      if (!groups[exp.category]) groups[exp.category] = []
      groups[exp.category].push(exp)
    })

    const order: Category[] = ["gastro","bienestar","aventura","cultura","estancias"]
    const result: Experience[] = []

    let remaining = true
    while (remaining) {
      remaining = false
      for (const cat of order) {
        if (groups[cat]?.length) {
          result.push(groups[cat].shift()!)
          remaining = true
        }
      }
    }

    return result
  }, [filtered])

  return (
    <div style={{ padding: "0 12px 90px" }}>
      {ordered.map((exp) => {
        const isFav = favorites.includes(exp.id)

        return (
          <div
            key={exp.id}
            onClick={() => onSelect(exp)}
            style={{
              display: "flex",
              marginBottom: 12,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {/* Bande catégorie */}
            <div style={{ width: 6, background: categoryColors[exp.category] }} />

            <img
              src={exp.image}
              alt={exp.title}
              style={{ width: 150, height: 150, objectFit: "cover" }}
            />

            <div style={{
              flex: 1,
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <strong style={{ fontSize: 17 }}>{exp.title}</strong>
              <div style={{ fontSize: 14, opacity: 0.65 }}>{exp.zone}</div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14 }}>
                  {exp.format === "duo"
                    ? "Para dos"
                    : exp.format === "familia"
                    ? "En familia"
                    : "Para uno"}
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
  )
}
