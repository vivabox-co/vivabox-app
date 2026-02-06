"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Experience, Category } from "@/lib/data/types"
import BottomSheet from "@/components/ui/BottomSheet"
import CategoryFilters from "@/components/map/CategoryFilters"
import FormatFilters from "@/components/map/FormatFilters"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"

const MapView = dynamic(
  () => import("@/components/map/MapView"),
  { ssr: false }
)

export default function MapaPage() {
  const router = useRouter()

  const {
    selectedExperience,
    setSelectedExperience,
    drawerOpen,
    setDrawerOpen,
  } = useUI()

  const [activeCategories, setActiveCategories] = useState<Category[]>([
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

  /* Detect mobile */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function toggleCategory(key: Category) {
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
        {/* 🔥 BOUTON FILTRES MOBILE */}
        {isMobile && !filtersOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setFiltersOpen(true)
            }}
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 1100,
              padding: "10px 16px",
              borderRadius: 22,
              border: "none",
              background: "#111",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            }}
          >
            Filtros
          </button>
        )}

        {/* FILTRES PANEL */}
        {(!isMobile || filtersOpen) && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 14,
              left: 0,
              right: 0,
              zIndex: 1100,
              padding: "0 14px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <CategoryFilters active={activeCategories} onToggle={toggleCategory} />
            <FormatFilters active={activeFormats} onToggle={toggleFormat} />

            {/* 🔥 BOUTON FERMER MOBILE */}
            {isMobile && (
              <button
                onClick={() => setFiltersOpen(false)}
                style={{
                  marginTop: 6,
                  alignSelf: "center",
                  background: "#eee",
                  border: "none",
                  borderRadius: 16,
                  padding: "6px 14px",
                  fontSize: 12,
                }}
              >
                Cerrar filtros
              </button>
            )}
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

      {/* BOTTOM SHEET UNIQUE */}
      <BottomSheet open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selectedExperience && (
          <ExperienceExploreMeta
            exp={selectedExperience}
            onChoose={() => {
              setDrawerOpen(false)
              router.push("/reservar/fechas")
            }}
          />
        )}
      </BottomSheet>
    </>
  )
}
