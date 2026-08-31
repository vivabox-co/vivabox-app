"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Heart, MapPin, Users, Clock, CheckCircle2 } from "lucide-react"

import { Experience, Category, ActivityKey } from "@/lib/data/types"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { filterExperiences } from "@/lib/product/filterExperiences"
import { buildActivityFilters } from "@/lib/product/buildActivityFilters"

import BottomSheet from "@/components/ui/BottomSheet"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import FiltersDrawer from "@/components/filters/FiltersDrawer"
import { useUI, usePageReady } from "@/components/ui/UIContext"

import { categoryColors } from "@/lib/map/categoryColors"
import { categoryLabel } from "@/lib/map/categoryLabels"
import { formatDuration } from "@/lib/format/duration"

import RecoOverlay from "@/components/reco/RecoOverlay"
import VivaboxLogo from "@/components/ui/VivaboxLogo"

/* ================= CONSTANTES UI ================= */

const LOGO_SAFE_SPACE = 56

const categoryOrder: Category[] = [
  "gastro",
  "aventura",
  "bienestar",
  "cultura",
  "estancias",
]

export default function ListaPage() {
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const {
    selectedExperience,
    setSelectedExperience,
    drawerOpen,
    setDrawerOpen,
    toggleFavorite,
    isFavorite,
    beginRouteTransition,
  } = useUI()

  const [recoOpen, setRecoOpen] = useState(false)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loadingExperiences, setLoadingExperiences] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeActivities, setActiveActivities] = useState<ActivityKey[]>([])

  const [logoBlinking, setLogoBlinking] = useState(false)
  const hasOpenedRecoRef = useRef(false)

  /* =====================================================
     💡 NUDGE — attire l'attention vers le logo (quiz reco)
     tant que la personne ne l'a pas encore ouvert : les 4
     couleurs du logo clignotent ensemble (4 pulsations
     lentes, ~2.8s) toutes les 15s — même comportement que /mapa
     ===================================================== */
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasOpenedRecoRef.current) return

      setLogoBlinking(true)
      setTimeout(() => setLogoBlinking(false), 2900)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchExperiences()
      .then(setExperiences)
      .finally(() => setLoadingExperiences(false))
  }, [])

  usePageReady(!loadingExperiences)

  const activityFilters = useMemo(
    () => buildActivityFilters(experiences),
    [experiences]
  )

  const { filteredExperiences } = filterExperiences(experiences, {
    categories: ["gastro", "bienestar", "aventura", "cultura", "estancias"],
    formats: ["solo", "duo"],
    cities: [],
    ambiances: [],
    indoorState: "any",
    searchText: searchQuery,
    activities: activeActivities,
  })

  const grouped = useMemo(() => {
    const map: Record<Category, Experience[]> = {
      gastro: [],
      bienestar: [],
      aventura: [],
      cultura: [],
      estancias: [],
    }
    filteredExperiences.forEach(e => map[e.category].push(e))
    return map
  }, [filteredExperiences])

  function selectExperience(exp: Experience) {
    if (!exp?.id) return
    setSelectedExperience(exp)
    setDrawerOpen(true)
  }

  return (
    <>
      <div
        ref={wrapperRef}
        style={{ minHeight: "100vh", background: "#F7F8FA", position: "relative" }}
      >
        {/* ================= LOGO VIVABOX (SANS ROND) ================= */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            // En dessous de .sheet-overlay (z-index 1500) quand le bottomsheet
            // est ouvert, pour que son backdrop-filter:blur floute le logo
            // aussi ; au-dessus sinon (doit rester cliquable par-dessus le
            // reste du contenu de la page).
            zIndex: drawerOpen ? 1400 : 2000,
            pointerEvents: "auto",
          }}
        >
          <button
            onClick={() => {
              hasOpenedRecoRef.current = true
              setRecoOpen(true)
            }}
            aria-label="Abrir recomendaciones Vivabox"
            style={{
              padding: 0,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VivaboxLogo width={50} height={50} blinking={logoBlinking} />
          </button>
        </div>

        {/* ================= SEARCH ================= */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "transparent",
            padding: `18px calc(18px + ${LOGO_SAFE_SPACE}px) 10px 10px`,
            display: "flex",
            gap: 7,
          }}
        >
          <button
            onClick={() => setFiltersOpen(true)}
            style={{
              padding: "10px 12px",
              borderRadius: 20,
              border: "none",
              background: "#152F40",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Filtros
          </button>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "#EEF2F6",
              borderRadius: 20,
              padding: "0 12px",
            }}
          >
            <Search size={16} color="#666" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar experiencias..."
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                padding: "10px",
                flex: 1,
              }}
            />
          </div>
        </div>

        {/* ================= SECTIONS ================= */}
        <div style={{ paddingBottom: 90 }}>
          {categoryOrder.map(category => {
            const items = grouped[category]
            if (!items.length) return null

            return (
              <section key={category} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    padding: "0 20px",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 6,
                        height: 22,
                        borderRadius: 4,
                        background: categoryColors[category],
                      }}
                    />
                    <h2 style={{ margin: 0 }}>
                      {categoryLabel(category)}
                    </h2>
                  </div>
                </div>

                <div style={{ padding: "6px 0 4px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      overflowX: "auto",
                      padding: "6px 20px 18px",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                    className="hide-scrollbar"
                  >
                    {items.map((exp, i) => (
                      <ExperienceCard
                        key={exp.id}
                        exp={exp}
                        popular={i < 2}
                        isFav={isFavorite(exp.id)}
                        onFav={() => toggleFavorite(exp.id)}
                        onClick={() => selectExperience(exp)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
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
                if (!selectedExperience?.id) return
                beginRouteTransition()
                router.push("/reservar/fechas")
              }}
            />
          )
        }
        footer={
          selectedExperience && (
            <button
              className="cta-button vb-btn-primary"
              onClick={() => {
                if (!selectedExperience?.id) return
                beginRouteTransition()
                router.push("/reservar/fechas")
              }}
            >
              Elegir esta experiencia
            </button>
          )
        }
      />

      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={filteredExperiences.length}
        onReset={() => {}}
        activityFilters={activityFilters}
        activeActivities={activeActivities}
        toggleActivity={id =>
          setActiveActivities(p =>
            p.includes(id) ? p.filter(a => a !== id) : [...p, id]
          )
        }
        cities={[]}
        activeCities={[]}
        toggleCity={() => {}}
        activeFormats={[]}
        toggleFormat={() => {}}
        activeAmbiances={[]}
        toggleAmbiance={() => {}}
        indoorState="any"
        setIndoorState={() => {}}
      />

      {/* ================= RECO OVERLAY ================= */}
      <RecoOverlay
        open={recoOpen}
        onClose={() => setRecoOpen(false)}
      />
    </>
  )
}

/* ================= CARD ================= */

/**
 * Dato decisivo de la card: prioriza duración; si no existe,
 * usa el primer elemento de `includes` (dato real de la experiencia,
 * nunca inventado).
 */
// Nombre de personnes réduit au seul chiffre pour la card Lista (espace
// restreint sur une seule ligne) — la fiche détail et les autres écrans
// gardent le libellé complet de formatLabel().
const FORMAT_COUNT: Record<string, string> = { solo: "1", duo: "2" }

function getKeyFact(exp: Experience): { icon: typeof Clock; text: string } | null {
  const duration = formatDuration(exp.duration)
  if (duration) {
    return { icon: Clock, text: duration }
  }

  const firstInclude = exp.includes?.find(item => item?.trim())
  if (firstInclude) {
    return { icon: CheckCircle2, text: `Incluye ${firstInclude.trim()}` }
  }

  return null
}

function ExperienceCard({ exp, onClick, popular, isFav, onFav }: any) {
  const keyFact = getKeyFact(exp)

  return (
    <div
      onClick={onClick}
      style={{
        width: 210,
        minWidth: 210,
        flexShrink: 0,
        borderRadius: 20,
        overflow: "hidden",
        background: "#FFFFFFE6",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={exp.image}
          style={{ width: "100%", height: 140, objectFit: "cover" }}
        />

        {popular && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#fff",
              padding: "4px 8px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Popular
          </div>
        )}

        <div
          onClick={e => {
            e.stopPropagation()
            onFav()
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Heart
            size={18}
            strokeWidth={2.4}
            color={isFav ? "#E11D48" : "#333"}
            fill={isFav ? "#E11D48" : "transparent"}
          />
        </div>
      </div>

      <div style={{ padding: "10px 12px 2px" }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{exp.title}</div>
        <div
          style={{
            fontSize: 12,
            opacity: 0.6,
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: 10,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {exp.city || exp.zone}
            </span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <Users size={13} /> {FORMAT_COUNT[exp.format]}
          </span>
          {keyFact && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <keyFact.icon size={13} /> {keyFact.text}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
