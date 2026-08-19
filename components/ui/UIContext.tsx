"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Experience } from "@/lib/data/types"

export type SelectedExperience = Experience | null

type UIContextType = {
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void

  activeExperience: SelectedExperience
  setActiveExperience: (exp: SelectedExperience) => void

  selectedExperience: SelectedExperience
  setSelectedExperience: (exp: SelectedExperience) => void

  selectedDate: string | null
  setSelectedDate: (d: string | null) => void

  // ✅ CORRECTION : le setter accepte désormais null (cohérent avec l'état)
  selectedTime: string[] | null
  setSelectedTime: (time: string[] | null) => void

  hideNav: boolean
  setHideNav: (v: boolean) => void

  // ⭐ FAVORIS GLOBAUX
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean

  // Vrai une fois que la page courante a ses données prêtes à l'affichage
  // (voir usePageReady). Consommé par RouteLoaderOverlay pour savoir quand
  // masquer le loader plein écran.
  pageReady: boolean
  setPageReady: (v: boolean) => void
}

const UIContext = createContext<UIContextType | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeExperience, setActiveExperience] = useState<SelectedExperience>(null)
  const [selectedExperience, setSelectedExperience] = useState<SelectedExperience>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string[] | null>(null)

  const [hideNav, setHideNav] = useState(false)

  const [pageReady, setPageReady] = useState(true)

  // ⭐ FAVORIS PERSISTANTS
  const [favorites, setFavorites] = useState<string[]>([])

  // Charger au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("vivabox_favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  // Sauvegarder à chaque changement
  useEffect(() => {
    localStorage.setItem("vivabox_favorites", JSON.stringify(favorites))
  }, [favorites])

  function toggleFavorite(id: string) {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }

  function isFavorite(id: string) {
    return favorites.includes(id)
  }

  return (
    <UIContext.Provider
      value={{
        drawerOpen,
        setDrawerOpen,

        activeExperience,
        setActiveExperience,

        selectedExperience,
        setSelectedExperience,

        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,

        hideNav,
        setHideNav,

        favorites,
        toggleFavorite,
        isFavorite,

        pageReady,
        setPageReady,
      }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) {
    throw new Error("useUI must be used within UIProvider")
  }
  return ctx
}

// Pages avec un chargement de données async l'appellent avec leur condition
// "prêt" (ex: `usePageReady(!loading)`) pour que RouteLoaderOverlay reste
// affiché jusqu'à ce que le contenu réel soit là, pas seulement le temps
// d'un lap fixe. Le cleanup remet pageReady à true au démontage, pour ne
// jamais laisser le loader suivant bloqué par un fetch abandonné.
export function usePageReady(ready: boolean) {
  const { setPageReady } = useUI()

  useEffect(() => {
    setPageReady(ready)
    return () => setPageReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
}