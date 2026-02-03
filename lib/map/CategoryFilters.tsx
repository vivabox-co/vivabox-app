"use client";

import { categories } from "../../lib/map/categories";
import { categoryColors } from "../../lib/map/categoryColors";

type Props = {
  active: string[];
  onToggle: (key: string) => void;
};

export default function CategoryFilters({ active, onToggle }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        display: "flex",
        gap: 8,
        overflowX: "auto",
        zIndex: 1000,
      }}
    >
      {categories.map((cat) => {
        const isActive = active.includes(cat.key);

        return (
          <button
            key={cat.key}
            onClick={() => onToggle(cat.key)}
            style={{
              padding: "6px 10px",
              fontSize: 13,
              borderRadius: 16,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: "none",
              background: isActive
                ? categoryColors[cat.key]
                : "#f1f1f1",
              color: isActive ? "white" : "#333",
            }}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
