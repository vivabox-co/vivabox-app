"use client"

import { Category } from "@/lib/data/types"
import { categoryColors } from "@/lib/map/categoryColors"
import { categoryLabel } from "@/lib/map/categoryLabels"

type Props = {
  categories: Category[]
  activeCategories: Category[]
  onToggleCategory: (next: Category[]) => void
  style?: React.CSSProperties
}

export default function CategoryLegend({
  categories,
  activeCategories,
  onToggleCategory,
  style,
}: Props) {
  function handleClick(cat: Category) {
    const allActive = activeCategories.length === categories.length
    const isActive = activeCategories.includes(cat)

    // Tout actif → première sélection = exclusivité
    if (allActive) {
      onToggleCategory([cat])
      return
    }

    // Retirer une catégorie active
    if (isActive) {
      const next = activeCategories.filter(c => c !== cat)
      onToggleCategory(next.length > 0 ? next : categories)
      return
    }

    // Ajouter une catégorie
    onToggleCategory([...activeCategories, cat])
  }

  const topRow = categories.slice(0, 3)
  const bottomRow = categories.slice(3)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "center",
        pointerEvents: "auto",
        ...style,
      }}
    >
      {/* Ligne haute : 3 catégories */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
        }}
      >
        {topRow.map(renderButton)}
      </div>

      {/* Ligne basse : 2 catégories */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
        }}
      >
        {bottomRow.map(renderButton)}
      </div>
    </div>
  )

  function renderButton(cat: Category) {
    const isActive = activeCategories.includes(cat)
    const color = categoryColors[cat]
    const label = cat === "gastro" ? "Gastro" : categoryLabel(cat)

    return (
      <button
        key={cat}
        onClick={() => handleClick(cat)}
        style={{
          appearance: "none",
          border: "none",
          cursor: "pointer",

          padding: "6px 12px",
          borderRadius: 999,

          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1,

          background: color,
          color: "#fff",

          opacity: isActive ? 1 : 0.28,

          transition: "opacity 0.2s ease",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {label}
      </button>
    )
  }
}
