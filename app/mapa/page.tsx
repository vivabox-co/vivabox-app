"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import {
  Experience,
  Category,
  Format,
  ActivityKey,
} from "@/lib/data/types"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { filterExperiences } from "@/lib/product/filterExperiences"
import { buildActivityFilters } from "@/lib/product/buildActivityFilters"
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
  const { selectedExperience, setSelectedExperience, drawerOpen, setDrawerOpen } =
    useUI()

  /* ================= FILTER STATE ================= */

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [experiences, setExperiences] = useState<Experience[]>([])

  const [activeActivities, setActiveActivities] = useState<ActivityKey[]>([])
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

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  /* ================= AVAILABLE CITIES ================= */

  const availableCities = useMemo(() => {
    const set = new Set<string>()
    experiences.forEach((exp) => exp.city && set.add(exp.city))
    return Array.from(set).sort()
  }, [experiences])

  /* ================= DYNAMIC ACTIVITY FILTERS ================= */

  const activityFilters = useMemo(
    () => buildActivityFilters(experiences),
    [experiences]
  )

  /* ================= CENTRAL FILTER ENGINE ================= */

  const filterResult = useMemo(() => {
    return filterExperiences(experiences, {
      categories: activeCategories,
      formats: activeFormats,
      cities: activeCities,
      ambiances: activeAmbiances,
      indoorState,
      activities: activeActivities,
    })
  }, [
    experiences,
    activeCategories,
    activeFormats,
    activeCities,
    activeAmbiances,
    indoorState,
    activeActivities,
  ])

  const filteredExperiences = filterResult.filteredExperiences

  /* ================= RESET ================= */

  const resetFilters = () => {
    setActiveActivities([])
    setActiveCategories(["gastro", "bienestar", "aventura", "cultura", "estancias"])
    setActiveFormats(["solo", "duo", "familia"])
    setActiveCities([])
    setActiveAmbiances([])
    setIndoorState("any")
  }

  /* ================= UI ================= */

  return (
    <>
      <div className={drawerOpen ? "mapa-content blurred" : "mapa-content"}>
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

        <MapView
          activeCategories={activeCategories}
          activeFormats={activeFormats}
          activeCities={activeCities}
          activeAmbiances={activeAmbiances}
          indoorState={indoorState}
          activeActivities={activeActivities}
          onSelect={(exp: Experience) => {
            setSelectedExperience(exp)
            setDrawerOpen(true)
          }}
        />
      </div>

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

      <FiltersDrawer
  open={filtersOpen}
  onClose={() => setFiltersOpen(false)}
  resultCount={filteredExperiences.length}
  onReset={resetFilters}
  activityFilters={activityFilters}

  activeActivities={activeActivities}
  setActiveActivities={setActiveActivities}   // ✅ AJOUTER
  toggleActivity={(id: ActivityKey) =>
    setActiveActivities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  cities={availableCities}
  activeCities={activeCities}
  toggleCity={(c: string) =>
    setActiveCities(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  activeFormats={activeFormats}
  toggleFormat={(f: Format) =>
    setActiveFormats(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }

  activeAmbiances={activeAmbiances}
  toggleAmbiance={(a: string) =>
    setActiveAmbiances(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    )
  }

  indoorState={indoorState}
  setIndoorState={setIndoorState}
/>
    </>
  )
}
