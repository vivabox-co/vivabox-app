"use client";

type Props = {
  active: ("solo" | "duo")[];
  onToggle: (format: "solo" | "duo") => void;
};

export default function FormatFilters({ active, onToggle }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      {[
        { key: "solo", label: "Para uno" },
        { key: "duo", label: "Para dos" },
      ].map((f) => {
        const isActive = active.includes(f.key as any);

        return (
          <button
            key={f.key}
            onClick={() => onToggle(f.key as any)}
            style={{
              padding: "6px 10px",
              fontSize: 13,
              borderRadius: 16,
              cursor: "pointer",
              border: "none",
              background: isActive ? "#111" : "#f1f1f1",
              color: isActive ? "white" : "#333",
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
