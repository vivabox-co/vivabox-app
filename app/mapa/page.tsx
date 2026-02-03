"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Experience } from "../../lib/data/types"
import BottomSheet from "../../components/ui/BottomSheet"
import CategoryFilters from "../../components/map/CategoryFilters"
import FormatFilters from "../../components/map/FormatFilters"
import { useUI } from "../../components/ui/UIContext"

const MapView = dynamic(
  () => import("../../components/map/MapView"),
  { ssr: false }
)

export default function MapaPage() {
  const {
    selectedExperience,
    setSelectedExperience,
    drawerOpen,
    setDrawerOpen,
  } = useUI()

  const [activeCategories, setActiveCategories] = useState<string[]>([
    "gastro",
    "bienestar",
    "aventura",
    "cultura",
    "estancias",
  ])

  const [activeFormats, setActiveFormats] = useState<("solo" | "duo")[]>([
    "solo",
    "duo",
  ])

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  /* Responsive detection */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function toggleCategory(key: string) {
    setActiveCategories(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  function toggleFormat(format: "solo" | "duo") {
    setActiveFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    )
  }

  function closeFilters() {
    if (filtersOpen) setFiltersOpen(false)
  }

  return (
    <>
      <div
        className={drawerOpen ? "mapa-content blurred" : "mapa-content"}
        onClick={closeFilters}
      >
        {/* BOUTON FILTRES MOBILE */}
        {isMobile && !filtersOpen && (
          <button
            onClick={e => {
              e.stopPropagation()
              setFiltersOpen(true)
            }}
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 1000,
              padding: "9px 16px",
              borderRadius: 20,
              border: "none",
              background: "#111",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
          >
            Filtros
          </button>
        )}

        {/* FILTRES */}
        {(!isMobile || filtersOpen) && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 14,
              left: 0,
              right: 0,
              zIndex: 1000,
              padding: "0 14px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <CategoryFilters
              active={activeCategories}
              onToggle={toggleCategory}
            />
            <FormatFilters
              active={activeFormats}
              onToggle={toggleFormat}
            />
          </div>
        )}

        {/* MAP */}
        <MapView
          activeCategories={activeCategories}
          activeFormats={activeFormats}
          onSelect={(exp: Experience) => {
            setSelectedExperience(exp)
            setDrawerOpen(true)
          }}
        />
      </div>

      {/* DRAWER EXPERIENCE */}
      <BottomSheet
        open={drawerOpen}
        experience={selectedExperience}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedExperience && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* IMAGE HERO */}
            <div style={{ height: 200, flexShrink: 0, background: "#eee" }}>
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

            {/* INFOS */}
            <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
              <h2 style={{ marginBottom: 6 }}>{selectedExperience.title}</h2>
              <p style={{ opacity: 0.7 }}>{selectedExperience.vivanote}</p>

              <div style={{ marginTop: 18, fontSize: 14 }}>
                <strong>Formato:</strong>{" "}
                {selectedExperience.format === "duo" ? "Para dos" : "Para uno"}
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
