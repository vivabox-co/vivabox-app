"use client"

import { usePathname } from "next/navigation"
import { useRef } from "react"
import VivaboxLoader from "./VivaboxLoader"
import { useMinDisplayTime } from "./useMinDisplayTime"
import { useUI } from "./UIContext"

// Next's own loading.tsx only covers server-render time, which this app
// clears in a few ms — too fast to ever see the brand loader complete, and
// it has no visibility into client-side data fetches at all. This overlay
// re-shows on every route change and stays up until BOTH: one full fill lap
// has played (matches the hold-end in globals.css) AND the destination page
// has reported itself ready via usePageReady — whichever takes longer.
const MIN_VISIBLE_MS = 1130

// Le parcours d'activation (formulaire -> écran "activé") est une seule
// démarche pour la personne, pas une suite d'écrans distincts : on
// n'anime qu'à l'arrivée sur ce groupe (depuis l'extérieur, ou premier
// chargement) et à la sortie vers /mapa — jamais entre ses propres étapes.
const ACTIVATION_FLOW_PATHS = ["/activar", "/activacion-completa"]

function isInActivationFlow(pathname: string) {
  return ACTIVATION_FLOW_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))
}

export default function RouteLoaderOverlay() {
  const pathname = usePathname()
  const prevPathnameRef = useRef<string | null>(null)
  const prevPathname = prevPathnameRef.current
  prevPathnameRef.current = pathname

  const isInternalActivationHop =
    prevPathname !== null &&
    isInActivationFlow(prevPathname) &&
    isInActivationFlow(pathname)

  if (isInternalActivationHop) return null

  // Remounted on every route change so its internal min-display timer
  // restarts from zero for the new page.
  return <Overlay key={pathname} />
}

function Overlay() {
  const { pageReady } = useUI()
  const done = useMinDisplayTime(pageReady, MIN_VISIBLE_MS)

  if (done) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <VivaboxLoader size={72} />
    </div>
  )
}
