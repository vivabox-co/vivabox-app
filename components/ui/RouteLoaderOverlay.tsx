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
  const { navigating, setNavigating } = useUI()
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
    // Once the URL has actually changed, the manual "navigating" kick (see
    // beginNavigation) has done its job of covering the pre-navigation gap —
    // hand back off to the normal per-pathname remount below.
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      setNavigating(false)
    }
    prevPathnameRef.current = pathname
  }, [pathname, setNavigating])

  if (isInternalActivationHop) return null

  // While `navigating` is true (a CTA called beginNavigation right before
  // router.push), keep the same overlay instance mounted under a stable key
  // so it covers the gap between the click and usePathname() catching up —
  // otherwise the sheet-close and the URL change leave a blank moment.
  // Once the pathname changes, remount is keyed on it as before so its
  // internal reveal check restarts fresh for the new page.
  return <Overlay key={navigating ? "navigating" : pathname} />
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
