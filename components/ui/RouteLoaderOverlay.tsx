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

// Seules ces deux transitions ont déjà leur propre animation de glissement
// de carte, codée directement dans la page de départ (voir handleContinue
// dans app/activar/page.tsx et goToActivacionCompleta dans
// app/activar/datos/page.tsx) : le loader générique y serait redondant.
// Toute AUTRE arrivée sur une page de ce parcours — premier chargement,
// retour depuis /mapa ou ailleurs, retour en arrière en cours de route —
// n'a pas cette animation dédiée et doit donc avoir son tour complet du
// loader générique, comme n'importe quelle autre page.
const SUPPRESSED_ACTIVATION_HOPS: [string, string][] = [
  ["/activar", "/activar/datos"],
  ["/activar/datos", "/activacion-completa"],
]

function isSuppressedActivationHop(prevPathname: string, pathname: string) {
  return SUPPRESSED_ACTIVATION_HOPS.some(([from, to]) => prevPathname === from && pathname === to)
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
    isSuppressedActivationHop(prevPathnameRef.current, pathname)

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

// Hauteur exacte de .bottom-nav (app/globals.css) — doit rester synchronisée
// avec elle pour que le trou laissé au bas de l'overlay épouse la nav sans
// laisser de bande blanche ni la recouvrir partiellement.
const BOTTOM_NAV_HEIGHT = "calc(56px + env(safe-area-inset-bottom))"

function Overlay() {
  const { pageReady, pendingTransition, pendingNavGroup, setPendingNavGroup } = useUI()
  const done = useLoaderReveal(pageReady)
  const hidden = done && !pendingTransition

  // pendingNavGroup doit rester true tout le long du chargement (pas
  // seulement le temps de pendingTransition, qui retombe dès que le pathname
  // change — voir plus haut) pour que la nav reste visible jusqu'à ce que
  // l'overlay se referme réellement. On ne le remet à null qu'ici, au moment
  // où il disparaît pour de bon.
  useEffect(() => {
    if (hidden && pendingNavGroup) setPendingNavGroup(null)
  }, [hidden, pendingNavGroup, setPendingNavGroup])

  if (hidden) return null

  // Renseigné uniquement par BottomNav (voir UIContext), pour les
  // transitions garanties same-group (mapa/lista/favoritos entre elles,
  // seguimiento/experiencia/ayuda entre elles) : dans ce cas la nav reste
  // visible (mais figée, voir BottomNav) au lieu d'être recouverte.
  const keepNavVisible = pendingNavGroup !== null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: keepNavVisible ? BOTTOM_NAV_HEIGHT : 0,
        // Above every other layered UI element in the app (topbars, bottom
        // nav, drawers, modals — RecoOverlay was the previous highest at
        // 3000): this overlay is meant to cover the ENTIRE screen while a
        // route loads, so it must outrank all of them, not just some.
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <VivaboxLoader size={86} />
    </div>
  )
}
