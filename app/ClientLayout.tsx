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
      const hasBooking = !!localStorage.getItem("currentBooking")

      const inBookingFlow =
        pathname.startsWith("/reservar/seguimiento") ||
        pathname.startsWith("/experiencia") ||
        pathname.startsWith("/ayuda") ||
        pathname === "/reservar/fechas/confirmacion"

      if (hasBooking && inBookingFlow) {
        const booking = JSON.parse(localStorage.getItem("currentBooking")!)
        router.replace(`/reservar/seguimiento/${booking.id}`)
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
