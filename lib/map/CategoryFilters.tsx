"use client";

import { Category } from "@/lib/data/types";
import { categoryColors } from "@/lib/map/categoryColors";
import { categoryLabel } from "@/lib/map/categoryLabels";

type Props = {
  active: Category[];
  onToggle: (key: Category) => void;
};

const categoryOrder: Category[] = [
  "gastro",
  "bienestar",
  "aventura",
  "cultura",
  "estancias",
];

export default function CategoryFilters({ active, onToggle }: Props) {
  return (
    <div style={{
      position: "absolute",
      top: 12,
      left: 12,
      right: 12,
      display: "flex",
      gap: 8,
      overflowX: "auto",
      zIndex: 1000,
    }}>
      {categoryOrder.map((cat) => {
        const isActive = active.includes(cat);

        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            style={{
              padding: "6px 10px",
              fontSize: 13,
              borderRadius: 16,
              whiteSpace: "nowrap",
              cursor: "pointer",
              border: "none",
              background: isActive
                ? categoryColors[cat]
                : "#f1f1f1",
              color: isActive ? "white" : "#333",
            }}
          >
            {categoryLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}
