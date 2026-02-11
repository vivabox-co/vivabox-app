"use client"

import { categories } from "@/lib/map/categoryLabels"
import { categoryColors } from "@/lib/map/categoryColors"
import { Category } from "@/lib/data/types"   // ✅ TYPE OFFICIEL

type Props = {
  active: Category[]                 // ✅ PLUS string[]
  onToggle: (key: Category) => void  // ✅ PLUS string
}

export default function CategoryFilters({
  active,
  onToggle,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "4px 0",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {categories.map((cat) => {
        const isActive = active.includes(cat.key as Category)

        return (
          <button
            key={cat.key}
            onClick={() => onToggle(cat.key as Category)}
            style={{
              padding: "7px 14px",
              fontSize: 13,
              borderRadius: 18,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: "none",
              fontWeight: 500,
              background: isActive
                ? categoryColors[cat.key as Category]
                : "#F2F2F2",
              color: isActive ? "white" : "#444",
              boxShadow: isActive
                ? "0 4px 10px rgba(0,0,0,0.15)"
                : "none",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
