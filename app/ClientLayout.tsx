"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import BottomNav from "@/components/ui/BottomNav"
import RouteLoaderOverlay from "@/components/ui/RouteLoaderOverlay"
import { useUI } from "@/components/ui/UIContext"
// Import pour effet de bord : démarre l'écoute de beforeinstallprompt dès le
// premier chargement de l'app (voir ce fichier) — sans ça, un event reçu
// avant que la personne n'atteigne /mapa serait manqué, car InstallAppCard
// n'est monté que sur cette route.
import "@/lib/pwa/deferredInstallPrompt"

// Pages où la nav doit être cachée dès le premier rendu — dérivé du pathname
// (disponible synchronement) plutôt que du seul hideNav du contexte, qui n'est
// mis à jour que par un useEffect de la page cible et arrive donc un cran trop
// tard (flash de la navbar le temps que l'effet se déclenche).
const HIDDEN_NAV_PATHS = ["/activar", "/activacion-completa", "/reservar/fechas", "/legal"]

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
    // Requis pour l'installabilité PWA (Chrome/Android n'affiche le prompt
    // "Ajouter à l'écran d'accueil" que si un service worker est enregistré).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }
  }, [])

  useEffect(() => {
    function handleBack() {
      const stored = localStorage.getItem("currentBooking")
      if (!stored) return

      // status vient du miroir écrit par /reservar/seguimiento (voir ce
      // fichier). Le blocage reste actif même en "rejected" (réservation
      // annulée) : la personne doit voir l'écran d'annulation et cliquer
      // elle-même sur "Elegir otra experiencia" (qui bascule le statut en
      // "cancelled_seen" côté API et met à jour ce miroir) avant qu'un
      // retour arrière puisse la faire sortir de /reservar/seguimiento.
      const booking = JSON.parse(stored)

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
