"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import VivaboxLoader from "./VivaboxLoader"
import { useLoaderReveal } from "./useLoaderReveal"
import { useUI } from "./UIContext"

// Next's own loading.tsx only covers server-render time, which this app
// clears in a few ms — too fast to ever see the brand loader complete, and
// it has no visibility into client-side data fetches at all. This overlay
// re-shows on every route change and only hides once the destination page
// has reported itself ready via usePageReady AND the loader's own animation
// is actually showing all 4 brand colors at once (checked against real
// computed opacity, not a guessed delay — see useLoaderReveal). If not
// ready yet, it keeps looping through the animation until it is.

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

  const isInternalActivationHop =
    prevPathnameRef.current !== null &&
    isInActivationFlow(prevPathnameRef.current) &&
    isInActivationFlow(pathname)

  // Writing the ref here (not during render, above) keeps the render function
  // pure — React/Next can invoke it more than once for the same logical pass
  // (dev double-invocation, hydration retries), and mutating a ref mid-render
  // let each extra call see a different prevPathname, causing exactly the kind
  // of server/client divergence that trips a hydration mismatch.
  useEffect(() => {
    prevPathnameRef.current = pathname
  }, [pathname])

  if (isInternalActivationHop) return null

  // Remounted on every route change so its internal reveal check restarts
  // fresh for the new page.
  return <Overlay key={pathname} />
}

function Overlay() {
  const { pageReady } = useUI()
  const containerRef = useRef<HTMLDivElement>(null)
  const done = useLoaderReveal(pageReady, containerRef)

  if (done) return null

  return (
    <div
      ref={containerRef}
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
