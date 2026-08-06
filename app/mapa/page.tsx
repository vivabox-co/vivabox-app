"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

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

import RecoOverlay from "@/components/reco/RecoOverlay"
import CategoryLegend from "../../components/map/CategoryLegend"

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
})

const ALL_CATEGORIES: Category[] = [
  "gastro",
  "bienestar",
  "aventura",
  "cultura",
  "estancias",
]

export default function MapaPage() {
  const router = useRouter()
  const { selectedExperience, setSelectedExperience, drawerOpen, setDrawerOpen } =
    useUI()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [recoOpen, setRecoOpen] = useState(false)

  const [experiences, setExperiences] = useState<Experience[]>([])

  const [activeActivities, setActiveActivities] = useState<ActivityKey[]>([])
  const [activeCategories, setActiveCategories] =
    useState<Category[]>(ALL_CATEGORIES)
  const [activeFormats, setActiveFormats] = useState<Format[]>([
    "solo",
    "duo",
    "familia",
  ])
  const [activeCities, setActiveCities] = useState<string[]>([])
  const [activeAmbiances, setActiveAmbiances] = useState<string[]>([])
  const [indoorState, setIndoorState] =
    useState<"indoor" | "outdoor" | "any">("any")

  // 🔐 PROTECTED ROUTE: verificar sesión
  useEffect(() => {
    const sessionToken = sessionStorage.getItem("vb_session")
    if (!sessionToken) {
      router.replace("/activar")
    }
  }, [router])

  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  const availableCities = useMemo(() => {
    const set = new Set<string>()
    experiences.forEach(exp => exp.city && set.add(exp.city))
    return Array.from(set).sort()
  }, [experiences])

  const activityFilters = useMemo(
    () => buildActivityFilters(experiences),
    [experiences]
  )

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

  const resetFilters = () => {
    setActiveActivities([])
    setActiveCategories(ALL_CATEGORIES)
    setActiveFormats(["solo", "duo", "familia"])
    setActiveCities([])
    setActiveAmbiances([])
    setIndoorState("any")
  }

  return (
    <>
      <div className={drawerOpen ? "mapa-content blurred" : "mapa-content"}>

        {/* Top blur (zone UI) */}
<div
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 68,
    zIndex: 1100,
    pointerEvents: "none",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.85)",
  }}
/>
{/* Fade vers la map */}
<div
  style={{
    position: "absolute",
    top: 68,
    left: 0,
    right: 0,
    height: 43,
    zIndex: 1100,
    pointerEvents: "none",
    background:
      "linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0))",
  }}
/>


        {/* ================= TOP BAR CONTENT ================= */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            zIndex: 1200,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            pointerEvents: "auto",
          }}
        >
          {/* Filtros */}
          <button
            onClick={() => setFiltersOpen(true)}
            style={{
              padding: "10px 16px",
              borderRadius: 22,
              border: "none",
              background: "#111",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              cursor: "pointer",
            }}
          >
            Filtros
          </button>

          {/* Catégories */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CategoryLegend
              categories={ALL_CATEGORIES}
              activeCategories={activeCategories}
              onToggleCategory={setActiveCategories}
            />
          </div>

          {/* Logo */}
          <button
  onClick={() => setRecoOpen(true)}
  aria-label="Abrir recomendaciones Vivabox"
  style={{
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <Image
    src="/logo/LogoVivaboxSVG.svg"
    alt="Vivabox"
    width={42}
    height={42}
  />
</button>
        </div>

        {/* ================= MAP ================= */}
        <MapView
          activeCategories={activeCategories}
          activeFormats={activeFormats}
          activeCities={activeCities}
          activeAmbiances={activeAmbiances}
          indoorState={indoorState}
          activeActivities={activeActivities}
          onSelect={(exp: Experience) => {
            if (!exp?.id) return
            setSelectedExperience(exp)
            setDrawerOpen(true)
          }}
        />
      </div>

      {/* ================= BOTTOM SHEET ================= */}
      <BottomSheet
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        body={
          selectedExperience && (
            <ExperienceExploreMeta
              exp={selectedExperience}
              onChoose={() => {
                setDrawerOpen(false)
                router.push("/reservar/fechas")
              }}
            />
          )
        }
        footer={
          selectedExperience && (
            <button
              className="cta-button"
              onClick={() => {
                if (!selectedExperience?.id) return
                setDrawerOpen(false)
                router.push("/reservar/fechas")
              }}
            >
              Elegir esta experiencia
            </button>
          )
        }
      />

      {/* ================= FILTERS DRAWER ================= */}
      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={filteredExperiences.length}
        onReset={resetFilters}
        activityFilters={activityFilters}
        activeActivities={activeActivities}
        setActiveActivities={setActiveActivities}
        toggleActivity={(id: ActivityKey) =>
          setActiveActivities(prev =>
            prev.includes(id)
              ? prev.filter(a => a !== id)
              : [...prev, id]
          )
        }
        cities={availableCities}
        activeCities={activeCities}
        toggleCity={(c: string) =>
          setActiveCities(prev =>
            prev.includes(c)
              ? prev.filter(x => x !== c)
              : [...prev, c]
          )
        }
        activeFormats={activeFormats}
        toggleFormat={(f: Format) =>
          setActiveFormats(prev =>
            prev.includes(f)
              ? prev.filter(x => x !== f)
              : [...prev, f]
          )
        }
        activeAmbiances={activeAmbiances}
        toggleAmbiance={(a: string) =>
          setActiveAmbiances(prev =>
            prev.includes(a)
              ? prev.filter(x => x !== a)
              : [...prev, a]
          )
        }
        indoorState={indoorState}
        setIndoorState={setIndoorState}
      />

      {/* ================= RECO OVERLAY ================= */}
      <RecoOverlay
        open={recoOpen}
        onClose={() => setRecoOpen(false)}
      />
    </>
  )
}