"use client"

import { Format } from "@/lib/data/types"
import { Users } from "lucide-react"

type Props = {
  active: Format[]
  onToggle: (format: Format) => void
}

const options: { key: Format; label: string }[] = [
  { key: "solo", label: "Para uno" },
  { key: "duo", label: "Para dos" },
  { key: "familia", label: "En familia" },
]

export default function FormatFilters({ active, onToggle }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "4px 0",
      }}
    >
      {options.map((f) => {
        const isActive = active.includes(f.key)

        return (
          <button
            key={f.key}
            onClick={() => onToggle(f.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 13,
              borderRadius: 18,
              cursor: "pointer",
              border: "none",
              whiteSpace: "nowrap",
              fontWeight: 500,
              background: isActive ? "#111" : "#F2F2F2",
              color: isActive ? "white" : "#444",
              boxShadow: isActive
                ? "0 4px 10px rgba(0,0,0,0.15)"
                : "none",
              transition: "all 0.2s ease",
            }}
          >
            <Users size={14} />
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
