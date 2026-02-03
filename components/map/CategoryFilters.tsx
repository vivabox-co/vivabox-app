"use client";

import { categories } from "@/lib/map/categories";
import { categoryColors } from "@/lib/map/categoryColors";

type Props = {
  active: string[];
  onToggle: (key: string) => void;
};

export default function CategoryFilters({
  active,
  onToggle,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 1,
        padding: "4px 0",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {categories.map((cat) => {
        const isActive = active.includes(cat.key);

        return (
          <button
            key={cat.key}
            onClick={() => onToggle(cat.key)}
            style={{
              padding: "6px 12px",
              fontSize: 13,
              borderRadius: 16,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: "none",
              background: isActive
                ? categoryColors[cat.key]
                : "#f1f1f1",
              color: isActive ? "white" : "#333",
              transition: "background 0.15s ease",
              flexShrink: 0,
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
