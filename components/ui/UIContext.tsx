"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Experience } from "@/lib/data/types"
import { NavGroup } from "@/lib/utils/getNavGroup"

export type SelectedExperience = Experience | null

type UIContextType = {
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void

  activeExperience: SelectedExperience
  setActiveExperience: (exp: SelectedExperience) => void

  selectedExperience: SelectedExperience
  setSelectedExperience: (exp: SelectedExperience) => void

  // Brouillon de réservation (fechas + personas choisies à l'étape 1, voir
  // app/reservar/fechas/page.tsx) — persisté en sessionStorage comme
  // selectedExperience ci-dessus, pour survivre à la navigation vers l'étape
  // 2 (app/reservar/fechas/confirmar) et à un éventuel retour en arrière.
  reservationDates: string[]
  setReservationDates: (dates: string[]) => void
  reservationExtraPeople: number
  setReservationExtraPeople: (n: number) => void
  clearReservationDraft: () => void

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

  // Vrai entre l'appel à beginRouteTransition() (au clic, avant router.push)
  // et le moment où la route de destination a effectivement atterri (voir
  // RouteLoaderOverlay, qui le repasse à false dès que le pathname change).
  // Sans ça, l'overlay ne se redéclenche qu'une fois le pathname changé —
  // trop tard, puisque l'App Router ne le change qu'une fois la nouvelle
  // route déjà chargée — ce qui laisse un blanc pendant le chargement.
  pendingTransition: boolean
  setPendingTransition: (v: boolean) => void

  // Renseigné uniquement quand la nav actuelle et la destination sont dans le
  // même groupe (voir getNavGroup) — BottomNav est le seul appelant qui le
  // passe, car c'est le seul cas où on peut garantir ça sans connaître le
  // pathname de destination (voir RouteLoaderOverlay). Reste non-null tant
  // que l'overlay est affiché, pas seulement le temps du pendingTransition
  // (voir Overlay dans RouteLoaderOverlay.tsx) : c'est ce qui garde la nav
  // visible pendant tout le chargement, pas juste la première phase.
  pendingNavGroup: NavGroup | null
  setPendingNavGroup: (v: NavGroup | null) => void
  beginRouteTransition: (group?: NavGroup) => void
}

const UIContext = createContext<UIContextType | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeExperience, setActiveExperience] = useState<SelectedExperience>(null)

  // selectedExperience pilote /reservar/fechas : sans persistance, un refresh
  // sur cette route perd l'expérience choisie et atterrit sur un écran vide
  // (voir app/reservar/fechas/page.tsx). On la sauvegarde en sessionStorage
  // (portée à l'onglet/session courant, pas un choix qui doit survivre
  // indéfiniment comme les favoris). La restauration se fait dans
  // l'initialiseur (lazy useState), pas dans un useEffect : FechasPage
  // redirige vers /mapa dès son propre useEffect si selectedExperience est
  // encore null, et les effects des enfants s'exécutent avant ceux du
  // UIProvider (ancêtre) — un useEffect ici arriverait trop tard.
  const [selectedExperience, setSelectedExperienceState] = useState<SelectedExperience>(() => {
    if (typeof window === "undefined") return null
    const saved = sessionStorage.getItem("vivabox_selected_experience")
    return saved ? JSON.parse(saved) : null
  })

  function setSelectedExperience(exp: SelectedExperience) {
    setSelectedExperienceState(exp)
    if (exp) {
      sessionStorage.setItem("vivabox_selected_experience", JSON.stringify(exp))
    } else {
      sessionStorage.removeItem("vivabox_selected_experience")
    }
    // Choisir une expérience (nouvelle ou relancée depuis /mapa, /lista,
    // /favoritos...) démarre un nouveau parcours de réservation : un
    // brouillon fechas/personas laissé par un choix précédent n'a plus de
    // raison de préremplir celui-ci.
    clearReservationDraft()
  }

  const [reservationDates, setReservationDatesState] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const saved = sessionStorage.getItem("vivabox_reservation_dates")
    return saved ? JSON.parse(saved) : []
  })

  function setReservationDates(dates: string[]) {
    setReservationDatesState(dates)
    if (dates.length > 0) {
      sessionStorage.setItem("vivabox_reservation_dates", JSON.stringify(dates))
    } else {
      sessionStorage.removeItem("vivabox_reservation_dates")
    }
  }

  const [reservationExtraPeople, setReservationExtraPeopleState] = useState<number>(() => {
    if (typeof window === "undefined") return 0
    const saved = sessionStorage.getItem("vivabox_reservation_extra_people")
    return saved ? Number(saved) || 0 : 0
  })

  function setReservationExtraPeople(n: number) {
    setReservationExtraPeopleState(n)
    sessionStorage.setItem("vivabox_reservation_extra_people", String(n))
  }

  function clearReservationDraft() {
    setReservationDatesState([])
    setReservationExtraPeopleState(0)
    sessionStorage.removeItem("vivabox_reservation_dates")
    sessionStorage.removeItem("vivabox_reservation_extra_people")
  }

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string[] | null>(null)

  const [hideNav, setHideNav] = useState(false)

  const [pageReady, setPageReady] = useState(true)
  const [pendingTransition, setPendingTransition] = useState(false)
  const [pendingNavGroup, setPendingNavGroup] = useState<NavGroup | null>(null)

  function beginRouteTransition(group?: NavGroup) {
    setPageReady(false)
    setPendingTransition(true)
    setPendingNavGroup(group ?? null)
  }

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

        reservationDates,
        setReservationDates,
        reservationExtraPeople,
        setReservationExtraPeople,
        clearReservationDraft,

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

        pendingTransition,
        setPendingTransition,

        pendingNavGroup,
        setPendingNavGroup,
        beginRouteTransition,
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