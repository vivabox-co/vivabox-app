"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Experience, Category, Format } from "@/lib/data/types"
import { fetchExperiences } from "@/lib/data/fetchExperiences"
import BottomSheet from "@/components/ui/BottomSheet"
import ListView from "@/components/list/ListView"
import ExperienceExploreMeta from "@/components/experience/ExperienceExploreMeta"
import FiltersDrawer from "@/components/filters/FiltersDrawer"
import { useUI } from "@/components/ui/UIContext"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { createPinIcon } from "@/lib/map/createPinIcon"
import { categoryColors } from "@/lib/map/categoryColors"

export default function ListaPage() {
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { selectedExperience, setSelectedExperience, drawerOpen, setDrawerOpen } = useUI()

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchExperiences().then(setExperiences)
  }, [])

  /* ---------------- CLOSE OUTSIDE ---------------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const query = searchQuery.toLowerCase().trim()

  /* 💡 AUTOCOMPLETE */
  const suggestions = useMemo(() => {
    if (!query) return []
    return experiences
      .filter(exp =>
        `${exp.title} ${exp.zone}`.toLowerCase().includes(query)
      )
      .slice(0, 6)
  }, [query, experiences])

  function selectExperience(exp: Experience) {
    setSelectedExperience(exp)
    setDrawerOpen(true)
    setShowSuggestions(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return

    if (e.key === "ArrowDown") {
      setHighlightIndex(prev => (prev + 1) % suggestions.length)
    }
    if (e.key === "ArrowUp") {
      setHighlightIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
    }
    if (e.key === "Enter") {
      selectExperience(suggestions[highlightIndex])
    }
  }

  /* ---------------- FILTRES ---------------- */
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeCategories, setActiveCategories] = useState<Category[]>(["gastro","bienestar","aventura","cultura","estancias"])
  const [activeFormats, setActiveFormats] = useState<Format[]>(["solo","duo","familia"])
  const [activeCities, setActiveCities] = useState<string[]>([])
  const [activeAmbiances, setActiveAmbiances] = useState<string[]>([])
  const [indoorState, setIndoorState] = useState<"indoor"|"outdoor"|"any">("any")

  const toggleArray = <T,>(value:T, list:T[], setter:(v:T[])=>void)=>
    setter(list.includes(value) ? list.filter(x=>x!==value) : [...list,value])

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className={drawerOpen ? "lista-content blurred" : "lista-content"} ref={wrapperRef}>

        {/* 🔥 TOP BAR */}
        <div style={{
          position:"sticky", top:0, zIndex:1000, background:"#fff",
          padding:"12px", display:"flex", gap:10
        }}>
          <button
            onClick={()=>setFiltersOpen(true)}
            style={{
              padding:"10px 14px", borderRadius:20, border:"none",
              background:"#111", color:"#fff", fontWeight:600
            }}
          >
            Filtros
          </button>

          {/* 🔍 SEARCH */}
          <div style={{
            flex:1, position:"relative", display:"flex", alignItems:"center",
            background:"#F3F3F3", borderRadius:20, padding:"0 12px"
          }}>
            <Search size={16} color="#666"/>
            <input
              value={searchQuery}
              onChange={(e)=>{
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={()=>setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar experiencias..."
              style={{
                border:"none", background:"transparent",
                outline:"none", padding:"10px", flex:1, fontSize:14
              }}
            />

            {/* 🔥 AUTOCOMPLETE DROPDOWN */}
            {showSuggestions && suggestions.length>0 && (
              <div style={{
                position:"absolute", top:"110%", left:0, right:0,
                background:"#fff", borderRadius:14,
                boxShadow:"0 10px 24px rgba(0,0,0,0.12)",
                overflow:"hidden", zIndex:50
              }}>
                {suggestions.map((exp,i)=>{
                  const color = categoryColors[exp.category]
                  const icon = createPinIcon(color, exp.activity_key, false)

                  return (
                    <div
                      key={exp.id}
                      onClick={()=>selectExperience(exp)}
                      style={{
                        padding:"10px 12px",
                        background:i===highlightIndex?"#F3EFEA":"#fff",
                        cursor:"pointer", display:"flex", gap:10, alignItems:"center"
                      }}
                    >
                      <img src={icon.options.iconUrl} width={18} height={18} />
                      <span>{exp.title}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* LIST VIEW */}
        <ListView
          searchQuery={searchQuery}
          activeCategories={activeCategories}
          activeFormats={activeFormats}
          activeCities={activeCities}
          activeAmbiances={activeAmbiances}
          indoorState={indoorState}
          onSelect={selectExperience}
        />
      </div>

      {/* EXPERIENCE DRAWER */}
      <BottomSheet open={drawerOpen} onClose={()=>setDrawerOpen(false)}>
        {selectedExperience && (
          <ExperienceExploreMeta
            exp={selectedExperience}
            onChoose={()=>{
              setDrawerOpen(false)
              router.push("/reservar/fechas")
            }}
          />
        )}
      </BottomSheet>

      {/* FILTERS DRAWER */}
      <FiltersDrawer
        open={filtersOpen}
        onClose={()=>setFiltersOpen(false)}
        cities={["Bogotá","Medellín","Cartagena"]}
        activeCities={activeCities}
        toggleCity={(c)=>toggleArray(c,activeCities,setActiveCities)}
        activeCategories={activeCategories}
        toggleCategory={(c)=>toggleArray(c,activeCategories,setActiveCategories)}
        activeFormats={activeFormats}
        toggleFormat={(f)=>toggleArray(f,activeFormats,setActiveFormats)}
        activeAmbiances={activeAmbiances}
        toggleAmbiance={(a)=>toggleArray(a,activeAmbiances,setActiveAmbiances)}
        indoorState={indoorState}
        setIndoorState={setIndoorState}
      />
    </>
  )
}
