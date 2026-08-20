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
// has reported itself ready via usePageReady AND at least one full lap of
// the brand animation has played (see useLoaderReveal).

// Waiting for `pathname` to actually change is too late for a click that
// triggers a heavier navigation (e.g. choosing an experience from a bottom
// sheet): the App Router only updates the pathname once the destination
// route has finished loading, so nothing would mask that loading gap.
// `pendingTransition` (set by useUI().beginRouteTransition, read below)
// forces this overlay to stay visible from the click onward, independently
// of the per-page reveal/done cycle below — it's cleared the moment the
// pathname actually changes, handing off to that normal cycle. Deliberately
// NOT part of Overlay's remount key: forcing a remount here raced against
// the reveal timer instead of just holding the same DOM open, which is what
// caused the loader to flash and drop back to the old page mid-navigation.

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
  const { pendingTransition, setPendingTransition } = useUI()
  const prevPathnameRef = useRef<string | null>(null)
  // Mirrors pendingTransition so the pathname-change effect below always
  // reads the latest value without needing it in its dependency array (which
  // would make the effect re-run on every toggle, not just on navigation).
  const pendingRef = useRef(pendingTransition)
  pendingRef.current = pendingTransition

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
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname && pendingRef.current) {
      setPendingTransition(false)
    }
    prevPathnameRef.current = pathname
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (isInternalActivationHop) return null

  // Remounted on every route change so its internal reveal check restarts
  // fresh for the new page.
  return <Overlay key={pathname} />
}

function Overlay() {
  const { pageReady, pendingTransition } = useUI()
  const done = useLoaderReveal(pageReady)

  if (done && !pendingTransition) return null

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
