"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import BottomNav from "@/components/ui/BottomNav"
import RouteLoaderOverlay from "@/components/ui/RouteLoaderOverlay"
import { useUI } from "@/components/ui/UIContext"

// Pages où la nav doit être cachée dès le premier rendu — dérivé du pathname
// (disponible synchronement) plutôt que du seul hideNav du contexte, qui n'est
// mis à jour que par un useEffect de la page cible et arrive donc un cran trop
// tard (flash de la navbar le temps que l'effet se déclenche).
const HIDDEN_NAV_PATHS = ["/activar", "/activacion-completa", "/reservar/fechas"]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { hideNav } = useUI()

  const pathHidesNav = HIDDEN_NAV_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  useEffect(() => {
    // Safari iOS n'applique jamais les états CSS :active/:hover au tap tant
    // qu'aucun listener tactile n'est enregistré quelque part sur la page —
    // sans ça, l'effet de pression des boutons (.vb-btn-primary, etc.) ne se
    // déclenchait jamais sur iPhone. Listener no-op, jamais retiré : c'est le
    // correctif standard, censé vivre pour toute la durée de l'app.
    document.addEventListener("touchstart", () => {}, { passive: true })
  }, [])

  useEffect(() => {
    function handleBack() {
      const stored = localStorage.getItem("currentBooking")
      if (!stored) return

      // status vient du miroir écrit par /reservar/seguimiento (voir ce
      // fichier) — absent juste après la création de la réservation
      // (confirmacion n'écrit que l'id), donc jamais égal à "rejected" à ce
      // stade : le blocage reste actif tant qu'on n'a pas confirmé que la
      // réservation est refusée.
      const booking = JSON.parse(stored)
      if (booking.status === "rejected") return

      const inBookingFlow =
        pathname.startsWith("/reservar/seguimiento") ||
        pathname.startsWith("/experiencia") ||
        pathname.startsWith("/ayuda") ||
        pathname === "/reservar/fechas/confirmacion"

      if (inBookingFlow) {
        // router.push, pas replace : pousse une nouvelle entrée d'historique
        // au lieu de renommer l'entrée courante. Avec replace, chaque retour
        // grignotait une entrée jusqu'à finir par atteindre /mapa après assez
        // d'appuis — push restaure la profondeur à chaque interception, donc
        // le pointeur d'historique ne recule jamais sous ces pages, quel que
        // soit le nombre de tentatives.
        router.push(`/reservar/seguimiento/${booking.id}`)
      }
    }

    window.addEventListener("popstate", handleBack)
    return () => window.removeEventListener("popstate", handleBack)
  }, [pathname, router])

  return (
    <>
      <RouteLoaderOverlay />
      {children}
      {!hideNav && !pathHidesNav && <BottomNav />}
    </>
  )
}
