"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Experience, Category, ActivityKey } from "@/lib/data/types"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import { filterExperiences } from "@/lib/product/filterExperiences"
import { buildActivityFilters } from "@/lib/product/buildActivityFilters"
import BottomSheet from "@/components/ui/BottomSheet"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import FiltersDrawer from "@/components/filters/FiltersDrawer"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, Heart, Clock, Users } from "lucide-react"
import { categoryColors } from "@/lib/map/categoryColors"

export default function ListaPage() {
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const {
    selectedExperience,
    setSelectedExperience,
    drawerOpen,
    setDrawerOpen,
    favorites,
    toggleFavorite,
    isFavorite
  } = useUI()

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeActivities, setActiveActivities] = useState<ActivityKey[]>([])

  useEffect(() => { fetchExperiences().then(setExperiences) }, [])

  const activityFilters = useMemo(() => buildActivityFilters(experiences), [experiences])

  const { filteredExperiences } = filterExperiences(experiences, {
    categories: ["gastro","bienestar","aventura","cultura","estancias"],
    formats: ["solo","duo","familia"],
    cities: [],
    ambiances: [],
    indoorState: "any",
    searchText: searchQuery,
    activities: activeActivities,
  })

  const grouped = useMemo(() => {
    const map: Record<Category, Experience[]> = {
      gastro: [], bienestar: [], aventura: [], cultura: [], estancias: []
    }
    filteredExperiences.forEach(e => map[e.category].push(e))
    return map
  }, [filteredExperiences])

  function selectExperience(exp: Experience) {
    setSelectedExperience(exp)
    setDrawerOpen(true)
  }

  return (
    <>
      <div ref={wrapperRef} style={{ minHeight: "100vh", background: "linear-gradient(180deg,#F8FAFC 0%,#F1F5F9 100%)" }}>

        {/* SEARCH */}
        <div style={{ position:"sticky", top:0, zIndex:1000, background:"#ffffffdd", backdropFilter:"blur(10px)", padding:"12px", display:"flex", gap:10 }}>
          <button onClick={()=>setFiltersOpen(true)} style={{ padding:"10px 14px", borderRadius:20, border:"none", background:"#111", color:"#fff", fontWeight:600 }}>
            Filtros
          </button>

          <div style={{ flex:1, display:"flex", alignItems:"center", background:"#EEF2F6", borderRadius:20, padding:"0 12px" }}>
            <Search size={16} color="#666" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar experiencias..."
              style={{ border:"none", background:"transparent", outline:"none", padding:"10px", flex:1 }}
            />
          </div>
        </div>

        {/* SECTIONS */}
        <div style={{ paddingBottom:90 }}>
          {Object.entries(grouped).map(([category, items]) =>
            items.length > 0 && (
              <section key={category} style={{ marginBottom:18 }}>

                <div style={{ padding:"0 20px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:6, height:22, borderRadius:4, background:categoryColors[category] }} />
                    <h2 style={{ fontSize:18, fontWeight:650 }}>{category.charAt(0).toUpperCase()+category.slice(1)}</h2>
                  </div>
                  <ArrowRight size={18} opacity={0.4}/>
                </div>

                <div style={{ display:"flex", gap:12, overflowX:"auto", padding:"0 20px" }}>
                  {items.map((exp, i) => (
                    <ExperienceCard
                      key={exp.id}
                      exp={exp}
                      popular={i < 2}
                      isFav={isFavorite(exp.id)}
                      onFav={()=>toggleFavorite(exp.id)}
                      onClick={()=>selectExperience(exp)}
                    />
                  ))}
                </div>

              </section>
            )
          )}
        </div>
      </div>

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
                setDrawerOpen(false)
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
        onClose={()=>setFiltersOpen(false)}
        resultCount={filteredExperiences.length}
        onReset={()=>{}}
        activityFilters={activityFilters}
        activeActivities={activeActivities}
        setActiveActivities={setActiveActivities}
        toggleActivity={(id)=>setActiveActivities(p=>p.includes(id)?p.filter(a=>a!==id):[...p,id])}
        cities={[]} activeCities={[]} toggleCity={()=>{}}
        activeFormats={[]} toggleFormat={()=>{}}
        activeAmbiances={[]} toggleAmbiance={()=>{}}
        indoorState="any" setIndoorState={()=>{}}
      />
    </>
  )
}

/* CARD */

function ExperienceCard({ exp, onClick, popular, isFav, onFav }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        minWidth:210,
        borderRadius:20,
        overflow:"hidden",
        background:"#FFFFFFE6",
        backdropFilter:"blur(8px)",
        border:"1px solid rgba(255,255,255,0.4)",
        boxShadow:"0 8px 24px rgba(0,0,0,0.06)",
        cursor:"pointer"
      }}
    >
      <div style={{ position:"relative" }}>
        <img src={exp.image} style={{ width:"100%", height:140, objectFit:"cover" }} />

        {popular && (
          <div style={{ position:"absolute", top:8, left:8, background:"#fff", padding:"4px 8px", borderRadius:12, fontSize:12, fontWeight:600 }}>
            Popular
          </div>
        )}

        <div
          onClick={(e)=>{ e.stopPropagation(); onFav() }}
          style={{
            position:"absolute",
            top:10,
            right:10,
            width:36,
            height:36,
            borderRadius:"50%",
            background:"rgba(255,255,255,0.9)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
            backdropFilter:"blur(6px)"
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

      <div style={{ padding:"10px 12px 14px" }}>
        <div style={{ fontWeight:600, fontSize:14 }}>{exp.title}</div>
        <div style={{ fontSize:12, opacity:0.6, marginTop:6, display:"flex", gap:10 }}>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={13}/> {exp.duration}</span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Users size={13}/> {exp.format}</span>
        </div>
      </div>
    </div>
  )
}
