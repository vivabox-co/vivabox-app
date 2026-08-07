"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import BottomNav from "@/components/ui/BottomNav"
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
    function handleBack() {
      const hasBooking = !!localStorage.getItem("currentBooking")

      const inBookingFlow =
        pathname.startsWith("/reservar/seguimiento") ||
        pathname.startsWith("/experiencia") ||
        pathname.startsWith("/ayuda")

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
      {children}
      {!hideNav && !pathHidesNav && <BottomNav />}
    </>
  )
}
