"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Experience, Category, Format } from "@/lib/data/types"
import BottomSheet from "@/components/ui/BottomSheet"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import FiltersDrawer from "@/components/filters/FiltersDrawer"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
})

export default function MapaPage() {
  const router = useRouter()

  const {
    selectedExperience,
    setSelectedExperience,
    drawerOpen,
    setDrawerOpen,
  } = useUI()

  /* =========================
     🎛 FILTER STATE (REAL PRODUCT)
  ========================= */

  const [filtersOpen, setFiltersOpen] = useState(false)

  const [activeCategories, setActiveCategories] = useState<Category[]>([
    "gastro",
    "bienestar",
    "aventura",
    "cultura",
    "estancias",
  ])

  const [activeFormats, setActiveFormats] = useState<Format[]>([
    "solo",
    "duo",
    "familia",
  ])

  const [activeCities, setActiveCities] = useState<string[]>([])
  const [activeAmbiances, setActiveAmbiances] = useState<string[]>([])
  const [indoorState, setIndoorState] =
    useState<"indoor" | "outdoor" | "any">("any")

  /* =========================
     🔁 TOGGLE HELPERS
  ========================= */

  const toggleArray = <T,>(
    value: T,
    list: T[],
    setter: (v: T[]) => void
  ) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  /* =========================
     🧱 UI
  ========================= */

  return (
    <>
      {/* MAIN MAP AREA */}
      <div className={drawerOpen ? "mapa-content blurred" : "mapa-content"}>

        {/* 🔥 FILTER BUTTON */}
        <button
          onClick={() => setFiltersOpen(true)}
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

        {/* 🗺 MAP */}
        <MapView
          activeCategories={activeCategories}
          activeFormats={activeFormats}
          activeCities={activeCities}
          activeAmbiances={activeAmbiances}
          indoorState={indoorState}
          onSelect={(exp: Experience) => {
            setSelectedExperience(exp)
            setDrawerOpen(true)
          }}
        />
      </div>

      {/* =========================
         📦 EXPERIENCE DRAWER
      ========================= */}
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

      {/* =========================
         🧩 FILTERS LEFT DRAWER (80%)
      ========================= */}
      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}

        cities={["Bogotá", "Medellín", "Cartagena"]}
        activeCities={activeCities}
        toggleCity={(c) => toggleArray(c, activeCities, setActiveCities)}

        activeCategories={activeCategories}
        toggleCategory={(c) => toggleArray(c, activeCategories, setActiveCategories)}

        activeFormats={activeFormats}
        toggleFormat={(f) => toggleArray(f, activeFormats, setActiveFormats)}

        activeAmbiances={activeAmbiances}
        toggleAmbiance={(a) => toggleArray(a, activeAmbiances, setActiveAmbiances)}

        indoorState={indoorState}
        setIndoorState={setIndoorState}
      />
    </>
  )
}
