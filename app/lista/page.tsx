"use client"

import { Experience } from "@/lib/data/types"
import BottomSheet from "@/components/ui/BottomSheet"
import ListView from "@/components/list/ListView"
import { useUI } from "@/components/ui/UIContext"

export default function ListaPage() {
  const {
    selectedExperience,
    setSelectedExperience,
    drawerOpen,
    setDrawerOpen,
  } = useUI()

  return (
    <>
      <ListView
        onSelect={(exp: Experience) => {
          setSelectedExperience(exp)
          setDrawerOpen(true)
        }}
      />

      <BottomSheet
        open={drawerOpen}
        experience={selectedExperience}
        onClose={() => {
          setDrawerOpen(false)
        }}
      >
        {selectedExperience && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div
              style={{
                height: 180,
                background: "#eee",
                flexShrink: 0,
              }}
            >
              <img
                src={selectedExperience.image || "/images/placeholder.jpg"}
                alt={selectedExperience.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
              }}
            >
              <h2>{selectedExperience.title}</h2>
              <p>{selectedExperience.vivanote}</p>

              <div style={{ marginTop: 16, fontSize: 14 }}>
                <strong>Formato:</strong>{" "}
                {selectedExperience.format === "duo"
                  ? "Para dos"
                  : "Para uno"}
              </div>

              <div style={{ marginTop: 4, fontSize: 14 }}>
                <strong>Duración:</strong> {selectedExperience.duration}
              </div>

              <div style={{ marginTop: 4, fontSize: 14 }}>
                <strong>Zona:</strong> {selectedExperience.zone}
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}
