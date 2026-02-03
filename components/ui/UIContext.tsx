"use client"

import { createContext, useContext, useState } from "react"
import { Experience } from "@/lib/data/types"

export type SelectedExperience = Experience | null

type UIContextType = {
  // Drawer global
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void

  // Expérience affichée dans le drawer (map + liste)
  activeExperience: SelectedExperience
  setActiveExperience: (exp: SelectedExperience) => void

  // Expérience choisie pour réservation
  selectedExperience: SelectedExperience
  setSelectedExperience: (exp: SelectedExperience) => void

  // Masquer la bottom nav
  hideNav: boolean
  setHideNav: (v: boolean) => void

  // Favoris
  favorites: string[]
  toggleFavorite: (id: string) => void
}

const UIContext = createContext<UIContextType | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Drawer (map/list)
  const [activeExperience, setActiveExperience] =
    useState<SelectedExperience>(null)

  // Réservation (flow fechas)
  const [selectedExperience, setSelectedExperience] =
    useState<SelectedExperience>(null)

  const [hideNav, setHideNav] = useState(false)

  const [favorites, setFavorites] = useState<string[]>([])

  function toggleFavorite(id: string) {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
    )
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

        hideNav,
        setHideNav,

        favorites,
        toggleFavorite,
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
