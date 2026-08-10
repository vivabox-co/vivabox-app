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
      className="category-legend"
      style={{
        pointerEvents: "auto",
        ...style,
      }}
    >
      <div className="category-legend-row">{topRow.map(renderButton)}</div>
      <div className="category-legend-row">{bottomRow.map(renderButton)}</div>
    </div>
  )

  function renderButton(cat: Category) {
    const isActive = activeCategories.includes(cat)
    const color = categoryColors[cat]
    const label = cat === "gastro" ? "Gastro" : categoryLabel(cat)

    return (
      <button
        key={cat}
        className="category-pill"
        onClick={() => handleClick(cat)}
        style={{
          background: color,
          opacity: isActive ? 1 : 0.28,
        }}
      >
        {label}
      </button>
    )
  }
}
