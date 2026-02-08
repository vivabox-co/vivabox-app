"use client"

type DurationType = "corta" | "larga"

type Props = {
  zones: string[]
  activeZones: string[]
  toggleZone: (z: string) => void

  ambiances: string[]
  activeAmbiances: string[]
  toggleAmbiance: (a: string) => void

  activeDurations: DurationType[]
  toggleDuration: (d: DurationType) => void
}

export default function AdvancedFilters({
  zones,
  activeZones,
  toggleZone,
  ambiances,
  activeAmbiances,
  toggleAmbiance,
  activeDurations,
  toggleDuration,
}: Props) {
  return (
    <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      
      {/* ZONAS */}
      <FilterRow
        title="Ciudad"
        items={zones}
        activeItems={activeZones}
        onToggle={toggleZone}
      />

      {/* AMBIENTE */}
      <FilterRow
        title="Ambiente"
        items={ambiances}
        activeItems={activeAmbiances}
        onToggle={toggleAmbiance}
      />

      {/* DURACIÓN */}
      <FilterRow
        title="Duración"
        items={["corta", "larga"]}
        activeItems={activeDurations}
        onToggle={toggleDuration}
      />
    </div>
  )
}

function FilterRow({ title, items, activeItems, onToggle }: any) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#555" }}>
        {title}
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {items.map((item: string) => {
          const active = activeItems.includes(item)

          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: active ? "#111" : "#f2f2f2",
                color: active ? "white" : "#444",
              }}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}
